Pod::Spec.new do |s|
  s.name           = 'Sparkling'
  s.version        = "2.0.0"
  s.summary        = "iOS SDK for Sparkling Framework"
  s.description    = "iOS SDK for Sparkling Framework"
  s.license        = "Apache 2.0"
  s.author         = "junchen.ge"
  s.homepage       = 'https://github.com/tiktok/sparkling.git'
  s.platforms      = {
    :ios => '12.0'
  }
  s.swift_version  = '5.10'
  s.source         = { git: 'https://github.com/tiktok/sparkling.git' }
  s.static_framework = true
  
  s.source_files = 'macro/SparklingMarcoMacros'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule',
    'OTHER_SWIFT_FLAGS' => '-enable-experimental-feature SymbolLinkageMarkers -Xfrontend -load-plugin-executable -Xfrontend ${PODS_TARGET_SRCROOT}/macro/SparklingMarcoMacros#SparklingMarcoMacros'
  }
  
  s.subspec 'Application' do |application|
    application.source_files = 'Sparkling/Application/**/*.{swift,m,h}'
    application.dependency 'Sparkling/Service'
    application.dependency 'Sparkling/Utils'
    application.dependency 'SparklingMethod/Core'
    application.dependency 'SnapKit'
    
    application.resource_bundle = {
      'sparklingPageResource' => 'Sparkling/Application/Container/UI/SparklingPageResource.xcassets'
    }
    
  end
  
  s.subspec 'Service' do |service|
    service.source_files = 'Sparkling/Service/{Base,Protocols}/**/*.{swift,m,h}'
    service.dependency 'Sparkling/Utils'
    service.dependency 'SparklingMethod/Core'
    
    service.subspec 'LynxService' do |lynx|
      lynx.dependency 'Lynx/Framework'
      lynx.dependency 'SparklingMethod/Lynx'
      lynx.source_files = 'Sparkling/Service/LynxService/**/*.{swift,m,h}'
    end
    
  end
  
  s.subspec 'Utils' do |utils|
    utils.source_files = 'Sparkling/Utils/**/*.{swift,m,h}'
  end
end
