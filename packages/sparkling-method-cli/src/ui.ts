// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';

type UiConfig = {
  labels?: { tip?: string };
  // Allow simple styles like 'dim' or 'none' in addition to color names
  colors?: Partial<Record<'headline' | 'success' | 'warn' | 'error' | 'info' | 'muted' | 'tipLabel' | 'tipText' | 'promptLabel' | 'promptText', string>>;
};

const DEFAULT_CONFIG: Required<UiConfig> = {
  labels: { tip: 'Tip' },
  colors: {
    headline: 'cyan',
    success: 'green',
    warn: 'yellow',
    error: 'red',
    // Use blue for info to improve contrast on light themes
    info: 'blue',
    // Use dim for muted text to avoid low-contrast gray on light themes
    muted: 'dim',
    tipLabel: 'cyan',
    tipText: 'blue',
    promptLabel: 'blue',
    promptText: 'blue',
  },
};

const colorFns: Record<string, (msg: string) => string> = {
  cyan: chalk.cyan,
  green: chalk.green,
  yellow: chalk.yellow,
  red: chalk.red,
  white: chalk.white,
  gray: chalk.gray,
  grey: chalk.grey,
  magenta: chalk.magenta,
  blue: chalk.blue,
};

function loadUiConfig(): UiConfig {
  const candidate = path.join(process.cwd(), 'packages', 'common', 'cli-style.config.json');
  if (fs.existsSync(candidate)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(candidate, 'utf8')) as UiConfig;
      return parsed;
    } catch {
      // ignore parse errors
    }
  }
  return {};
}

const cfg = loadUiConfig();
const palette = { ...DEFAULT_CONFIG.colors, ...(cfg.colors ?? {}) };
const labels = { ...DEFAULT_CONFIG.labels, ...(cfg.labels ?? {}) };

function paint(msg: string, colorName: string | undefined, bold = false): string {
  const key = colorName?.toLowerCase();
  if (key === 'none' || key === 'default' || key === 'reset') {
    return bold ? chalk.bold(msg) : msg;
  }
  if (key === 'dim') {
    const styled = chalk.dim(msg);
    return bold ? chalk.bold(styled) : styled;
  }
  const fn = key ? colorFns[key] : undefined;
  const colored = fn ? fn(msg) : msg;
  return bold ? chalk.bold(colored) : colored;
}

export const ui = {
  headline: (msg: string) => paint(msg, palette.headline, true),
  success: (msg: string) => paint(msg, palette.success, true),
  warn: (msg: string) => paint(msg, palette.warn, true),
  error: (msg: string) => paint(msg, palette.error, true),
  info: (msg: string) => paint(msg, palette.info, false),
  muted: (msg: string) => paint(msg, palette.muted, false),
  tipLabel: paint(labels.tip ?? 'TIP', palette.tipLabel, true),
  tip: (msg: string) => `${paint(labels.tip ?? 'TIP', palette.tipLabel, true)} ${paint(msg, palette.tipText, true)}`,
  step: (msg: string) => paint(msg, palette.headline, false),
  prompt: (msg: string) => paint(msg, palette.promptText ?? palette.promptLabel ?? palette.info, true),
};
