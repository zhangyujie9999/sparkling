import org.gradle.api.publish.PublishingExtension
import org.gradle.api.publish.maven.MavenPublication
import org.gradle.api.tasks.bundling.Jar

plugins {
    alias(libs.plugins.android.library)
    alias(libs.plugins.kotlin.android)
    id("maven-publish")
    jacoco
}

android {
    namespace = "com.tiktok.sparkling.method"
    compileSdk = 34

    defaultConfig {
        minSdk = 21
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        debug {
            enableUnitTestCoverage = true
        }
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    
    testOptions {
        unitTests {
            isIncludeAndroidResources = true
            all {
                it.jvmArgs("-Xmx2048m", "-XX:MaxMetaspaceSize=512m")
                it.systemProperty("robolectric.logging.enabled", "true")
            }
        }
    }
}

dependencies {

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)

    // Testing dependencies
    testImplementation("io.mockk:mockk:1.13.8")
    testImplementation("org.robolectric:robolectric:4.10.3")
    testImplementation("org.bouncycastle:bcprov-jdk18on:1.75")
    testImplementation("androidx.test:core:1.5.0")
    testImplementation("androidx.test.ext:junit:1.1.5")
    testImplementation("org.mockito:mockito-core:5.2.0")
    testImplementation("org.mockito:mockito-inline:5.2.0")
    testImplementation("androidx.test:runner:1.5.2")
    testImplementation("androidx.test:rules:1.5.0")
    // Removed PowerMock due to compatibility issues with Robolectric and Java 11

    api(libs.lynx)
    api("com.google.code.gson:gson:2.8.9")
}

tasks.register<JacocoReport>("jacocoTestReport") {
    dependsOn(tasks.named("testDebugUnitTest"))

    reports {
        xml.required.set(true)
        html.required.set(true)
    }

    val fileFilter = listOf(
        "**/R.class",
        "**/R$*.class",
        "**/BuildConfig.*",
        "**/Manifest*.*",
        "**/*Test*.*",
        "android/**/*.*"
    )

    val mainSrc = "${project.projectDir}/src/main/java"
    sourceDirectories.setFrom(files(mainSrc))

    val debugJavaTree = layout.buildDirectory.dir("intermediates/javac/debug").map { dir ->
        dir.asFileTree.matching {
            exclude(fileFilter)
        }
    }
    val debugKotlinTree = layout.buildDirectory.dir("tmp/kotlin-classes/debug").map { dir ->
        dir.asFileTree.matching {
            exclude(fileFilter)
        }
    }
    classDirectories.setFrom(debugJavaTree, debugKotlinTree)

    val unitTestCoverageExec = layout.buildDirectory.file("outputs/unit_test_code_coverage/debugUnitTest/testDebugUnitTest.exec")
    val jacocoExec = layout.buildDirectory.file("jacoco/testDebugUnitTest.exec")
    executionData.setFrom(files(unitTestCoverageExec, jacocoExec))

    onlyIf {
        executionData.files.any { it.exists() }
    }
    outputs.upToDateWhen { false }
}

val publishingGroupId = (findProperty("SPARKLING_PUBLISHING_GROUP_ID") as? String)
    ?: System.getenv("SPARKLING_PUBLISHING_GROUP_ID")
    ?: "com.tiktok.sparkling"
val publishingVersion = (findProperty("SPARKLING_PUBLISHING_VERSION") as? String)
    ?: System.getenv("SPARKLING_PUBLISHING_VERSION")
    ?: "1.0.0"

val androidSourcesJar by tasks.register<Jar>("androidSourcesJar") {
    archiveClassifier.set("sources")
    from(android.sourceSets.getByName("main").java.srcDirs)
}

val emptyJavadocJar by tasks.register<Jar>("javadocJar") {
    archiveClassifier.set("javadoc")
}

afterEvaluate {
    extensions.configure<PublishingExtension>("publishing") {
        publications {
            create<MavenPublication>("release") {
                groupId = publishingGroupId
                artifactId = "sparkling-method-sdk"
                version = publishingVersion

                from(components["release"])
                artifact(androidSourcesJar)
                artifact(emptyJavadocJar)

                pom {
                    name.set("sparkling-method-sdk")
                    description.set("Sparkling method Android SDK module")
                }
            }
        }
    }
}
