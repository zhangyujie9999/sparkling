// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import path from 'node:path';
import fg from 'fast-glob';
import fs from 'fs-extra';
import { loadAppConfig } from '../config';
import { MethodModuleConfig } from '../types';
import { relativeTo, toPosixPath } from '../utils/paths';
import { isVerboseEnabled, verboseLog } from '../utils/verbose';
import { ui } from '../utils/ui';

type GradleDsl = 'kotlin' | 'groovy';

const ANDROID_AUTOLINK_START = '// BEGIN SPARKLING AUTOLINK';
const ANDROID_AUTOLINK_END = '// END SPARKLING AUTOLINK';
const IOS_AUTOLINK_START = '# BEGIN SPARKLING AUTOLINK';
const IOS_AUTOLINK_END = '# END SPARKLING AUTOLINK';

export interface AutolinkOptions {
  cwd: string;
  configFile?: string;
  platform?: 'android' | 'ios' | 'all';
}

async function discoverModules(cwd: string): Promise<MethodModuleConfig[]> {
  if (!cwd || typeof cwd !== 'string') {
    console.warn(ui.warn('discoverModules: cwd must be a non-empty string'));
    return [];
  }

  const seen = new Map<string, MethodModuleConfig>();
  const searchRoots = [
    path.resolve(cwd, '..'),
    path.resolve(cwd, 'node_modules'),
  ];

  for (const root of searchRoots) {
    // Skip if root directory doesn't exist
    if (!fs.existsSync(root)) {
      continue;
    }

    if (isVerboseEnabled()) {
      verboseLog(`Scanning for module.config.json under ${root}`);
    }

    let matches: string[] = [];
    try {
      matches = await fg('**/module.config.json', {
        cwd: root,
        absolute: true,
        ignore: ['**/dist/**', '**/.turbo/**', '**/.rslib/**'],
      });
    } catch (error) {
      console.warn(ui.warn(`Failed to search for modules in ${root}: ${error instanceof Error ? error.message : String(error)}`));
      continue;
    }

    if (isVerboseEnabled()) {
      verboseLog(`Found ${matches.length} module config(s) under ${root}`);
    }

    for (const configPath of matches) {
      const moduleRoot = path.dirname(configPath);

      let config: Record<string, unknown>;
      try {
        config = fs.readJSONSync(configPath);
      } catch (error) {
        console.warn(ui.warn(`Failed to read module config at ${configPath}: ${error instanceof Error ? error.message : String(error)}`));
        continue;
      }

      // Validate config has required structure
      if (!config || typeof config !== 'object') {
        console.warn(ui.warn(`Invalid module config at ${configPath}: config must be an object`));
        continue;
      }

      const name: string = (typeof config.name === 'string' && config.name.trim())
        ? config.name.trim()
        : path.basename(moduleRoot);

      if (!name) {
        console.warn(ui.warn(`Invalid module config at ${configPath}: could not determine module name`));
        continue;
      }

      if (isVerboseEnabled()) {
        verboseLog(`Discovered method module "${name}" at ${moduleRoot}`);
      }

      const isNodeModule = moduleRoot.includes(`${path.sep}node_modules${path.sep}`);

      const androidConfig = config.android as Record<string, unknown> | undefined;
      const iosConfig = config.ios as Record<string, unknown> | undefined;

      const androidBuild = (androidConfig?.buildGradle && typeof androidConfig.buildGradle === 'string')
        ? path.resolve(moduleRoot, androidConfig.buildGradle)
        : resolveDefaultAndroidBuildGradle(moduleRoot);
      const iosPodspecPath = (iosConfig?.podspecPath && typeof iosConfig.podspecPath === 'string')
        ? path.resolve(moduleRoot, iosConfig.podspecPath)
        : path.resolve(moduleRoot, 'ios');

      const existing = seen.get(name);
      if (existing && existing.root.includes('node_modules') && !isNodeModule) {
        // Prefer workspace version over node_modules copy.
        seen.delete(name);
      } else if (existing) {
        continue;
      }

      seen.set(name, {
        name,
        root: moduleRoot,
        android: {
          packageName: typeof androidConfig?.packageName === 'string' ? androidConfig.packageName : undefined,
          className: typeof androidConfig?.className === 'string' ? androidConfig.className : undefined,
          projectDir: path.dirname(androidBuild),
          buildGradle: androidBuild,
        },
        ios: {
          moduleName: typeof iosConfig?.moduleName === 'string' ? iosConfig.moduleName : undefined,
          className: typeof iosConfig?.className === 'string' ? iosConfig.className : undefined,
          podspecPath: iosPodspecPath,
        },
      });
    }
  }

  return Array.from(seen.values());
}

function detectGradleDsl(filePath: string): GradleDsl {
  return filePath.endsWith('.kts') ? 'kotlin' : 'groovy';
}

function resolveAndroidSettingsFile(cwd: string): { path: string; dsl: GradleDsl } | null {
  const kts = path.resolve(cwd, 'android/settings.gradle.kts');
  const groovy = path.resolve(cwd, 'android/settings.gradle');
  if (fs.existsSync(kts)) return { path: kts, dsl: 'kotlin' };
  if (fs.existsSync(groovy)) return { path: groovy, dsl: 'groovy' };
  return null;
}

function resolveAndroidAppGradle(cwd: string): { path: string; dsl: GradleDsl } | null {
  const kts = path.resolve(cwd, 'android/app/build.gradle.kts');
  const groovy = path.resolve(cwd, 'android/app/build.gradle');
  if (fs.existsSync(kts)) return { path: kts, dsl: 'kotlin' };
  if (fs.existsSync(groovy)) return { path: groovy, dsl: 'groovy' };
  return null;
}

function resolveDefaultAndroidBuildGradle(moduleRoot: string): string {
  const kts = path.resolve(moduleRoot, 'android', 'build.gradle.kts');
  const groovy = path.resolve(moduleRoot, 'android', 'build.gradle');
  if (fs.existsSync(kts)) return kts;
  if (fs.existsSync(groovy)) return groovy;
  return kts;
}

function stripExistingAndroidIncludes(content: string, moduleNames: string[]): string {
  let updated = content;
  for (const name of moduleNames) {
    const includeRegex = new RegExp(`\\s*include\\(?\\s*['"]:(${name})['"]\\)?\\s*\\n?`, 'g');
    const projectDirRegex = new RegExp(`\\s*project\\(":${name}"\\)\\.projectDir\\s*=\\s*file\\([^\\n]+\\)\\s*\\n?`, 'g');
    updated = updated.replace(includeRegex, '');
    updated = updated.replace(projectDirRegex, '');
  }
  return updated;
}

function injectAndroidSettings(settingsPath: string, modules: MethodModuleConfig[], projectDir: string) {
  if (!fs.existsSync(settingsPath)) {
    console.warn(ui.warn(`Android settings not found at ${settingsPath}, skipping android autolink`));
    return;
  }

  const dsl = detectGradleDsl(settingsPath);
  let content = fs.readFileSync(settingsPath, 'utf8');
  content = content.replace(new RegExp(`${ANDROID_AUTOLINK_START}[\\s\\S]*?${ANDROID_AUTOLINK_END}\\s*`, 'm'), '');
  content = stripExistingAndroidIncludes(content, modules.map(m => m.name));

  if (!modules.length) {
    fs.writeFileSync(settingsPath, content);
    return;
  }

  const lines = modules.map(module => {
    const rel = relativeTo(projectDir, module.android?.projectDir ?? module.root);
    return `  "${module.name}" to file("${toPosixPath(rel)}")`;
  }).join(',\n');

  const ktsBlock = [
    ANDROID_AUTOLINK_START,
    'val sparklingAutolinkProjects = listOf<Pair<String, java.io.File>>(',
    lines,
    ')',
    'sparklingAutolinkProjects.forEach { (name, dir) ->',
    '    include(":$name")',
    '    project(":$name").projectDir = dir',
    '}',
    ANDROID_AUTOLINK_END,
  ].join('\n');

  const groovyLines = modules.map(module => {
    const rel = relativeTo(projectDir, module.android?.projectDir ?? module.root);
    return `  [name: "${module.name}", dir: file("${toPosixPath(rel)}")]`;
  }).join(',\n');

  const groovyBlock = [
    ANDROID_AUTOLINK_START,
    'def sparklingAutolinkProjects = [',
    groovyLines,
    ']',
    'sparklingAutolinkProjects.each { projectDef ->',
    '    include(":${projectDef.name}")',
    '    project(":${projectDef.name}").projectDir = projectDef.dir',
    '}',
    ANDROID_AUTOLINK_END,
  ].join('\n');

  const block = dsl === 'kotlin' ? ktsBlock : groovyBlock;

  fs.writeFileSync(settingsPath, `${content.trimEnd()}\n\n${block}\n`);
}

function findDependenciesBlock(content: string): { block: string; start: number; end: number } | null {
  const depIndex = content.indexOf('dependencies');
  if (depIndex === -1) return null;
  const braceStart = content.indexOf('{', depIndex);
  if (braceStart === -1) return null;
  let depth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = braceStart; i < content.length; i += 1) {
    const ch = content[i];
    const next = content[i + 1];

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }
    if (!inSingleQuote && !inDoubleQuote) {
      if (ch === '/' && next === '/') {
        inLineComment = true;
        i += 1;
        continue;
      }
      if (ch === '/' && next === '*') {
        inBlockComment = true;
        i += 1;
        continue;
      }
    }
    if (!inDoubleQuote && ch === '\'' && content[i - 1] !== '\\') {
      inSingleQuote = !inSingleQuote;
      continue;
    }
    if (!inSingleQuote && ch === '"' && content[i - 1] !== '\\') {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }
    if (inSingleQuote || inDoubleQuote) {
      continue;
    }

    if (ch === '{') {
      depth += 1;
    } else if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        return {
          block: content.slice(depIndex, i + 1),
          start: depIndex,
          end: i,
        };
      }
    }
  }

  return null;
}

function stripAndroidAutolinkBlock(content: string): string {
  const pattern = new RegExp(`\\n?[ \\t]*${ANDROID_AUTOLINK_START}[\\s\\S]*?${ANDROID_AUTOLINK_END}[ \\t]*\\n?`, 'gm');
  const cleaned = content.replace(pattern, '\n');
  return cleaned.replace(/\n{3,}/g, '\n\n');
}

function calculateBraceBalance(content: string): number {
  let balance = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTripleQuote = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < content.length; i += 1) {
    const ch = content[i];
    const next = content[i + 1];
    const next2 = content[i + 2];

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }
    if (inTripleQuote) {
      if (ch === '"' && next === '"' && next2 === '"') {
        inTripleQuote = false;
        i += 2;
      }
      continue;
    }
    if (inSingleQuote) {
      if (ch === '\'' && content[i - 1] !== '\\') {
        inSingleQuote = false;
      }
      continue;
    }
    if (inDoubleQuote) {
      if (ch === '"' && content[i - 1] !== '\\') {
        inDoubleQuote = false;
      }
      continue;
    }

    if (ch === '/' && next === '/') {
      inLineComment = true;
      i += 1;
      continue;
    }
    if (ch === '/' && next === '*') {
      inBlockComment = true;
      i += 1;
      continue;
    }
    if (ch === '"' && next === '"' && next2 === '"') {
      inTripleQuote = true;
      i += 2;
      continue;
    }
    if (ch === '\'' && content[i - 1] !== '\\') {
      inSingleQuote = true;
      continue;
    }
    if (ch === '"' && content[i - 1] !== '\\') {
      inDoubleQuote = true;
      continue;
    }

    if (ch === '{') {
      balance += 1;
    } else if (ch === '}') {
      balance -= 1;
    }
  }

  return balance;
}

function normalizeBraceBalance(content: string): string {
  const balance = calculateBraceBalance(content);
  if (balance === 0) {
    return content;
  }

  if (balance < 0) {
    let adjusted = content;
    let extraClosings = Math.abs(balance);
    while (extraClosings > 0) {
      const lastBrace = adjusted.lastIndexOf('}');
      if (lastBrace === -1) break;
      adjusted = `${adjusted.slice(0, lastBrace)}${adjusted.slice(lastBrace + 1)}`;
      extraClosings -= 1;
    }

    return adjusted;
  }

  // If we are missing closing braces, append them using a best-effort indent
  const lines = content.split('\n');
  let indent = '';
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    if (lines[i].trim()) {
      const match = lines[i].match(/^[ \t]*/);
      indent = match ? match[0] : '';
      break;
    }
  }

  const closings: string[] = [];
  let remaining = balance;
  let currentIndent = indent;
  while (remaining > 0) {
    closings.push(`${currentIndent}}`);
    currentIndent = currentIndent.length >= 4 ? currentIndent.slice(0, currentIndent.length - 4) : '';
    remaining -= 1;
  }

  return `${content.trimEnd()}\n${closings.join('\n')}\n`;
}

function injectAndroidDependencies(appGradlePath: string, modules: MethodModuleConfig[]) {
  if (!fs.existsSync(appGradlePath)) {
    console.warn(ui.warn(`Android app gradle not found at ${appGradlePath}, skipping android dependency autolink`));
    return;
  }

  const dsl = detectGradleDsl(appGradlePath);
  let content = fs.readFileSync(appGradlePath, 'utf8');
  content = stripAndroidAutolinkBlock(content);
  for (const module of modules) {
    const depPatterns = [
      new RegExp(`\\s*implementation\\s*\\(\\s*project\\(["']:${module.name}["']\\)\\s*\\)\\s*\\n?`, 'g'),
      new RegExp(`\\s*implementation\\s+project\\(["']:${module.name}["']\\)\\s*\\n?`, 'g'),
    ];
    for (const depPattern of depPatterns) {
      content = content.replace(depPattern, '');
    }
  }

  if (!modules.length) {
    fs.writeFileSync(appGradlePath, content);
    return;
  }

  // Determine base indent of the dependencies block for consistent formatting
  const depIndentMatch = content.match(/^([ \t]*)dependencies\s*\{/m);
  const depIndent = depIndentMatch ? depIndentMatch[1] : '';
  const innerIndent = `${depIndent}    `;

  const depLinesKts = modules.map(m => `${innerIndent}    project(":${m.name}")`).join('\n');
  const ktsBlock = [
    `${innerIndent}// BEGIN SPARKLING AUTOLINK`,
    `${innerIndent}listOf(`,
    depLinesKts,
    `${innerIndent}).forEach { dep -> add("implementation", dep) }`,
    `${innerIndent}// END SPARKLING AUTOLINK`,
  ].join('\n');

  const depLinesGroovy = modules.map(m => `${innerIndent}    project(":${m.name}")`).join(',\n');
  const groovyBlock = [
    `${innerIndent}// BEGIN SPARKLING AUTOLINK`,
    `${innerIndent}[`,
    depLinesGroovy,
    `${innerIndent}].each { dep -> add("implementation", dep) }`,
    `${innerIndent}// END SPARKLING AUTOLINK`,
  ].join('\n');

  const block = dsl === 'kotlin' ? ktsBlock : groovyBlock;

  const closingIndent = depIndent;
  const dependenciesBlock = findDependenciesBlock(content);
  if (!dependenciesBlock) {
    // Fallback: regex-based insertion before the closing brace of dependencies block
    const re = /(^[ \t]*dependencies\s*\{[\s\S]*?)(\n?[ \t]*\})/m;
    const replaced = content.replace(re, (_m, p1: string, p2: string) => {
      // Strip any stray closing braces accidentally stuck at the end of the block content
      const cleanP1 = String(p1).replace(/[ \t]*\}+[ \t]*$/, '');
      return `${cleanP1}\n\n${block}\n${closingIndent}}`;
    });
    const cleaned = normalizeBraceBalance(replaced);
    fs.writeFileSync(appGradlePath, cleaned);
    return;
  }

  // Determine the indentation of the closing brace line (if present)
  // Close with the same indent as the opening 'dependencies' line

  // Robustly remove the final closing brace, regardless of preceding newline
  const dependenciesWithoutClosing = dependenciesBlock.block.replace(/}\s*$/, '');

  // Compose updated dependencies block with autolink section and a single closing brace
  const cleanedWithoutClosing = dependenciesWithoutClosing.replace(/[ \t]*\}+[ \t]*$/, '').trimEnd();
  const updatedDependencies = `${cleanedWithoutClosing}\n\n${block}\n${closingIndent}}`;
  let updated = `${content.slice(0, dependenciesBlock.start)}${updatedDependencies}${content.slice(dependenciesBlock.end + 1)}`;
  // Safety: if autolink block isn't present due to edge formatting, try regex-based replacement
  if (!updated.includes(ANDROID_AUTOLINK_START)) {
    const re = /(^[ \t]*dependencies\s*\{[\s\S]*?)(\n?[ \t]*\})/m;
    updated = updated.replace(re, (_m, p1: string, p2: string) => {
      const cleanP1 = String(p1).replace(/[ \t]*\}+[ \t]*$/, '');
      return `${cleanP1}\n\n${block}\n${closingIndent}}`;
    });
  }
  // Remove any duplicate trailing braces (historical corruption fix)
  const finalContent = normalizeBraceBalance(updated);
  fs.writeFileSync(appGradlePath, finalContent);
}

function injectPodfile(podfilePath: string, modules: MethodModuleConfig[], projectDir: string) {
  if (!fs.existsSync(podfilePath)) {
    console.warn(ui.warn(`Podfile not found at ${podfilePath}, skipping iOS autolink`));
    return;
  }

  let content = fs.readFileSync(podfilePath, 'utf8');
  const start = content.indexOf('def sparkling_methods_dep');
  if (start === -1) {
    console.warn(ui.warn('Podfile missing def sparkling_methods_dep, skipping iOS autolink'));
    return;
  }

  const end = content.indexOf('\nend', start);
  if (end === -1) {
    console.warn(ui.warn('Podfile sparkling_methods_dep block malformed, skipping iOS autolink'));
    return;
  }

  const podLines = modules.map(module => {
    const podspecDir = module.ios?.podspecPath ? path.dirname(module.ios.podspecPath) : module.root;
    const rel = relativeTo(path.dirname(podfilePath), podspecDir);
    const podName = module.ios?.moduleName ? `Sparkling-${module.ios.moduleName}` : module.name;
    return `  pod '${podName}', :path => '${toPosixPath(rel)}'`;
  }).join('\n');

  const block = [
    'def sparkling_methods_dep',
    `  ${IOS_AUTOLINK_START}`,
    podLines || '  # No Sparkling methods found',
    `  ${IOS_AUTOLINK_END}`,
    'end',
  ].join('\n');

  const existing = content.slice(start, end + '\nend'.length);
  content = content.replace(existing, block);
  fs.writeFileSync(podfilePath, content);
}

function writeAndroidRegistry(modules: MethodModuleConfig[], appPackage: string, cwd: string) {
  const javaDir = path.resolve(cwd, 'android/app/src/main/java', ...appPackage.split('.'));
  fs.ensureDirSync(javaDir);
  const filePath = path.join(javaDir, 'SparklingAutolink.kt');
  const entries = modules.map(m => {
    const pkg = m.android?.packageName ?? '';
    const cls = m.android?.className ?? '';
    return `        SparklingAutolinkModule(name = "${m.name}", androidPackage = "${pkg}", className = "${cls}")`;
  }).join(',\n');

  const content = [
    `package ${appPackage}`,
    '',
    'data class SparklingAutolinkModule(val name: String, val androidPackage: String?, val className: String?)',
    '',
    'object SparklingAutolink {',
    '    val modules = listOf(',
    entries,
    '    )',
    '}',
    '',
  ].join('\n');

  fs.writeFileSync(filePath, content);
}

function writeIosRegistry(modules: MethodModuleConfig[], bundleId: string, cwd: string) {
  const filePath = path.resolve(cwd, 'ios/SparklingGo/SparklingGo/SparklingAutolink.swift');
  fs.ensureDirSync(path.dirname(filePath));
  const entries = modules.map(m => {
    const moduleName = m.ios?.moduleName ?? '';
    const cls = m.ios?.className ?? '';
    return `SparklingAutolinkModule(name: "${m.name}", iosModuleName: "${moduleName}", className: "${cls}")`;
  }).join(',\n    ');

  const content = [
    '// Generated by sparkling autolink',
    'import Foundation',
    '',
    'struct SparklingAutolinkModule {',
    '    let name: String',
    '    let iosModuleName: String?',
    '    let className: String?',
    '}',
    '',
    `let sparklingAutolinkBundleId = "${bundleId}"`,
    'let sparklingAutolinkModules: [SparklingAutolinkModule] = [',
    `    ${entries}`,
    ']',
    '',
  ].join('\n');

  fs.writeFileSync(filePath, content);
}

export async function autolink(options: AutolinkOptions): Promise<MethodModuleConfig[]> {
  const platform = options.platform ?? 'all';
  const doAndroid = platform === 'android' || platform === 'all';
  const doIos = platform === 'ios' || platform === 'all';
  const modules = await discoverModules(options.cwd);
  if (isVerboseEnabled()) {
    const moduleNames = modules.map(m => m.name).join(', ') || '(none)';
    verboseLog(`Autolink platforms -> android: ${doAndroid}, ios: ${doIos}`);
    verboseLog(`Autolink discovered modules: ${moduleNames}`);
  }
  // Prefer user-defined IDs but fall back to defaults to stay compatible even if config can't load.
  const defaultAndroidPackage = 'com.example.sparkling.go';
  const defaultIosBundle = 'com.example.sparkling.go';

  if (!modules.length) {
    console.log(ui.tip('No Sparkling method modules found for autolink.'));
    return [];
  }

  let androidPackage = defaultAndroidPackage;
  let iosBundle = defaultIosBundle;
  try {
    const { config } = await loadAppConfig(options.cwd, options.configFile ?? 'app.config.ts');
    if (doAndroid) {
      androidPackage = config.platform?.android?.packageName ?? defaultAndroidPackage;
    }
    if (doIos) {
      iosBundle = config.platform?.ios?.bundleIdentifier ?? defaultIosBundle;
    }
    if (isVerboseEnabled()) {
      verboseLog(`Autolink bundle identifiers -> android: ${androidPackage}, ios: ${iosBundle}`);
    }
  } catch (error) {
    console.warn(ui.warn(`Failed to read app config for autolink, using defaults: ${String(error)}`));
  }

  if (doAndroid) {
    const androidSettings = resolveAndroidSettingsFile(options.cwd);
    const androidAppGradle = resolveAndroidAppGradle(options.cwd);
    if (!androidSettings) {
      console.warn(ui.warn('Android settings.gradle(.kts) not found, skipping android autolink'));
    } else {
      if (isVerboseEnabled()) {
        verboseLog(`Using android settings at ${androidSettings.path} (dsl: ${androidSettings.dsl})`);
      }
      injectAndroidSettings(androidSettings.path, modules, path.dirname(androidSettings.path));
    }
    if (!androidAppGradle) {
      console.warn(ui.warn('Android app build.gradle(.kts) not found, skipping android dependency autolink'));
    } else {
      if (isVerboseEnabled()) {
        verboseLog(`Using android app gradle at ${androidAppGradle.path} (dsl: ${androidAppGradle.dsl})`);
      }
      injectAndroidDependencies(androidAppGradle.path, modules);
    }
  }

  if (doIos) {
    const podfile = path.resolve(options.cwd, 'ios/Podfile');
    injectPodfile(podfile, modules, path.dirname(podfile));
  }

  if (doAndroid) {
    writeAndroidRegistry(modules, androidPackage, options.cwd);
  }
  if (doIos) {
    writeIosRegistry(modules, iosBundle, options.cwd);
  }

  const platformLabel = platform === 'all' ? 'Android & iOS' : platform.toUpperCase();
  console.log(ui.success(`Autolinked ${modules.length} module(s) for ${platformLabel}.`));
  return modules;
}
