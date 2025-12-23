require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'Sparkling-SPKStorage'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = package['license']
  s.author         = package['author']
  s.homepage       = 'https://github.com/leeekyrie/Sparkling.git'
  s.platforms      = {
    :ios => '12.0'
  }
  s.swift_version  = '5.7'
  s.source         = { git: 'https://github.com/leeekyrie/Sparkling.git' }
  s.static_framework = true

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }
  
  s.subspec 'Core' do |core|
    core.source_files = [
      'Sources/Core/Methods/**/*.{h,m,swift}',
      'Sources/Core/Protocols/*.{h,m,swift}',
    ]
  end
  
  s.dependency 'SparklingMethod/Core'
end
