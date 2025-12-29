import org.gradle.api.publish.PublishingExtension
import org.gradle.api.publish.maven.MavenPublication
import org.gradle.api.tasks.bundling.Jar

plugins {
    alias(libs.plugins.android.library)
    alias(libs.plugins.kotlin.android)
    id("maven-publish")
}

android {
    namespace = "com.tiktok.sparkling.debug"
    compileSdk = 34

    defaultConfig {
        minSdk = 21
        consumerProguardFiles("consumer-rules.pro")
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
}

dependencies {
    // lynx base
    implementation(libs.lynx)

    // lynx debug tooling
    implementation(libs.lynx.service.log)
    implementation(libs.lynx.service.devtool)
    implementation(libs.lynx.devtool)
}

val publishingGroupId = (findProperty("SPARKLING_PUBLISHING_GROUP_ID") as? String)
    ?: System.getenv("SPARKLING_PUBLISHING_GROUP_ID")
    ?: "com.tiktok.sparkling"
val publishingVersion = (findProperty("SPARKLING_PUBLISHING_VERSION") as? String)
    ?: System.getenv("SPARKLING_PUBLISHING_VERSION")
    ?: "2.0.0"

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
                artifactId = "sparkling-debug"
                version = publishingVersion

                from(components["release"])
                artifact(androidSourcesJar)
                artifact(emptyJavadocJar)

                pom {
                    name.set("sparkling-debug")
                    description.set("Sparkling Android Lynx debug integration module")
                }
            }
        }
    }
}

