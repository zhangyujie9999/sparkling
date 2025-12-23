plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.kapt)
    jacoco
}

android {
    namespace = "com.tiktok.sparkling.playground"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.tiktok.sparkling.playground"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        ndk {
            abiFilters.addAll(listOf("armeabi-v7a", "arm64-v8a"))
        }
    }

    buildTypes {
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
    
    buildTypes {
        debug {
            enableAndroidTestCoverage = true
            enableUnitTestCoverage = true
        }
    }
    
    testOptions {
        unitTests {
            isIncludeAndroidResources = true
            isReturnDefaultValues = true
        }
    }
}

dependencies {

    implementation(libs.androidx.core.ktx)
    implementation("androidx.core:core-splashscreen:1.0.1")
    implementation(libs.androidx.appcompat)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)

    implementation(project(":sparkling"))
    implementation(project(":sparkling-router"))
    implementation(project(":sparkling-storage"))
//    implementation(project(":sparkling-method-media"))

    implementation(libs.retrofit)
    implementation(libs.retrofit.converter.gson)
    implementation(libs.okhttp.logging)


    implementation(libs.fresco)
    implementation(libs.fresco.animated.gif)
    implementation(libs.fresco.animated.webp)
    implementation(libs.fresco.webp.support)
    implementation(libs.fresco.animated.base)

    kapt(libs.lynx.processor)
}


kapt {
    javacOptions {
        option("-J--add-exports=jdk.compiler/com.sun.tools.javac.api=ALL-UNNAMED")
        option("-J--add-exports=jdk.compiler/com.sun.tools.javac.code=ALL-UNNAMED")
        option("-J--add-exports=jdk.compiler/com.sun.tools.javac.comp=ALL-UNNAMED")
        option("-J--add-exports=jdk.compiler/com.sun.tools.javac.file=ALL-UNNAMED")
        option("-J--add-exports=jdk.compiler/com.sun.tools.javac.main=ALL-UNNAMED")
        option("-J--add-exports=jdk.compiler/com.sun.tools.javac.model=ALL-UNNAMED")
        option("-J--add-exports=jdk.compiler/com.sun.tools.javac.parser=ALL-UNNAMED")
        option("-J--add-exports=jdk.compiler/com.sun.tools.javac.processing=ALL-UNNAMED")
        option("-J--add-exports=jdk.compiler/com.sun.tools.javac.tree=ALL-UNNAMED")
        option("-J--add-exports=jdk.compiler/com.sun.tools.javac.util=ALL-UNNAMED")
        option("-J--add-opens=jdk.compiler/com.sun.tools.javac.api=ALL-UNNAMED")
        option("-J--add-opens=jdk.compiler/com.sun.tools.javac.file=ALL-UNNAMED")
        option("-J--add-opens=jdk.compiler/com.sun.tools.javac.util=ALL-UNNAMED")
    }
}

tasks.register<JacocoReport>("jacocoTestReport") {
    dependsOn(tasks.named("testDebugUnitTest"))

    reports {
        xml.required.set(true)
        xml.outputLocation.set(layout.buildDirectory.file("reports/jacoco/test/jacocoTestReport.xml"))
        html.required.set(true)
    }

    val fileFilter = listOf(
        "**/R.class",
        "**/R$*.class",
        "**/BuildConfig.*",
        "**/Manifest*.*",
        "**/*Test*.*",
        "android/**/*.*",
        "**/build/**",
        "**/res/**",
        "**/tmp/**"
    )
    
    val mainSrc = "${project.projectDir}/src/main/java"
    sourceDirectories.setFrom(files(mainSrc))
    val debugJavaTree = layout.buildDirectory.dir("intermediates/javac/debug").map { dir ->
        dir.asFileTree.matching {
            exclude(fileFilter)
        }
    }
    classDirectories.setFrom(debugJavaTree)

    val unitTestCoverageExec = layout.buildDirectory.file("outputs/unit_test_code_coverage/debugUnitTest/testDebugUnitTest.exec")
    val jacocoExec = layout.buildDirectory.file("jacoco/testDebugUnitTest.exec")
    executionData.setFrom(files(unitTestCoverageExec, jacocoExec))

    onlyIf {
        executionData.files.any { it.exists() }
    }
    outputs.upToDateWhen { false }
}
