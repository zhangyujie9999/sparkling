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
    namespace = "com.tiktok.sparkling"
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
}

dependencies {

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.androidx.fragment.ktx)
    testImplementation(libs.junit)
    testImplementation("io.mockk:mockk:1.13.8")
    testImplementation("org.robolectric:robolectric:4.11.1")
    testImplementation("org.json:json:20231013")
    testImplementation("androidx.fragment:fragment-testing:1.6.2")
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    api(project(":sparkling-method"))

    // lynx dependencies
    api(libs.lynx)
    api(libs.lynx.jssdk)
    api(libs.lynx.trace)
    api(libs.primjs)
    api(libs.lynx.service.image)
    api(libs.lynx.service.log)
    api(libs.lynx.service.http)
//    api(libs.okhttp)

    api(libs.lynx.service.devtool)
    api(libs.lynx.devtool)
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
                artifactId = "sparkling-sdk"
                version = publishingVersion

                from(components["release"])
                artifact(androidSourcesJar)
                artifact(emptyJavadocJar)

                pom {
                    name.set("sparkling-sdk")
                    description.set("Sparkling Android SDK core module")
                }
            }
        }
    }
}
