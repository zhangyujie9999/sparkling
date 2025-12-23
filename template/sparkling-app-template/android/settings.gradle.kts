pluginManagement {
    repositories {
        mavenLocal()
google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
}
}

rootProject.name = "Sparkling"
include(":app")

// BEGIN SPARKLING AUTOLINK
val sparklingAutolinkProjects = listOf<Pair<String, java.io.File>>(
  "sparkling-router" to file("../node_modules/sparkling-router/android")
)
sparklingAutolinkProjects.forEach { (name, dir) ->
    include(":$name")
    project(":$name").projectDir = dir
}
// END SPARKLING AUTOLINK
