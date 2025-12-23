// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import Foundation
import UIKit
import Photos
import SparklingMethod
import AVFoundation

extension SPKChooseMediaMethod {
    @objc public override func call(withParamModel paramModel: Any, completionHandler: CompletionHandlerProtocol) {
        // Check parameter model type
        guard let typedParamModel = paramModel as? SPKChooseMediaMethodParamModel else {
            completionHandler.handleCompletion(status: .invalidParameter(message: "Invalid parameter model type"), result: nil)
            return
        }
        
        // Handle different source types
        switch SPKChooseMediaMediaSourceType(rawValue: typedParamModel.sourceType) {
        case .album:
            // Check album permission
            checkAlbumPermission(with: typedParamModel) { [weak self] hasPermission in
                guard let self = self else { return }
                
                if hasPermission {
                    self.openMediaPicker(with: typedParamModel, completionHandler: completionHandler)
                } else {
                    self.handleAlbumDenyAction(with: typedParamModel, completionHandler: completionHandler)
                }
            }
        case .camera:
            // Check camera permission
            checkCameraPermission(with: typedParamModel) { [weak self] hasPermission in
                guard let self = self else { return }
                
                if hasPermission {
                    self.openMediaPicker(with: typedParamModel, completionHandler: completionHandler)
                } else {
                    self.handleCameraDenyAction(with: typedParamModel, completionHandler: completionHandler)
                }
            }
        default:
            completionHandler.handleCompletion(status: .invalidParameter(message: "Invalid source type"), result: nil)
        }
    }
    
    // Check album permission
    private func checkAlbumPermission(with paramModel: SPKChooseMediaMethodParamModel, completionHandler: @escaping (Bool) -> Void) {
        let authorizationStatus = PHPhotoLibrary.authorizationStatus()
        
        switch authorizationStatus {
        case .authorized, .limited:
            completionHandler(true)
        case .notDetermined:
            PHPhotoLibrary.requestAuthorization { status in
                DispatchQueue.main.async {
                    if #available(iOS 14, *) {
                        completionHandler(status == .authorized || status == .limited)
                    } else {
                        completionHandler(status == .authorized)
                    }
                }
            }
        default:
            completionHandler(false)
        }
    }
    
    // Check camera permission
    private func checkCameraPermission(with paramModel: SPKChooseMediaMethodParamModel, completionHandler: @escaping (Bool) -> Void) {
        let authorizationStatus = AVCaptureDevice.authorizationStatus(for: .video)
        
        switch authorizationStatus {
        case .authorized:
            completionHandler(true)
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { granted in
                DispatchQueue.main.async {
                    completionHandler(granted)
                }
            }
        default:
            completionHandler(false)
        }
    }
    
    // Handle album permission deny action
    private func handleAlbumDenyAction(with paramModel: SPKChooseMediaMethodParamModel, completionHandler: CompletionHandlerProtocol) {
        if paramModel.albumPermissionDenyAction == SPKChooseMediaPermissionDenyAction.default.rawValue {
            // Show alert
            let alert = UIAlertController(title: "Photo library access required",
                                          message: "Please allow photo library access in Settings",
                                          preferredStyle: .alert)
            
            let cancelAction = UIAlertAction(title: "Cancel", style: .cancel) {
                _ in
                completionHandler.handleCompletion(status: .failed(message: "User cancelled authorization"), result: nil)
            }
            
            let settingsAction = UIAlertAction(title: "Open Settings", style: .default) {
                _ in
                if let settingsURL = URL(string: UIApplication.openSettingsURLString) {
                    UIApplication.shared.open(settingsURL)
                }
                completionHandler.handleCompletion(status: .failed(message: "Please grant permission in Settings"), result: nil)
            }
            
            alert.addAction(cancelAction)
            alert.addAction(settingsAction)
            
            // Present alert
            if let rootViewController = UIApplication.shared.keyWindow?.rootViewController {
                rootViewController.present(alert, animated: true, completion: nil)
            }
        } else {
            // No alert, just fail
            completionHandler.handleCompletion(status: .failed(message: "Photo library permission denied"), result: nil)
        }
    }
    
    // Handle camera permission deny action
    private func handleCameraDenyAction(with paramModel: SPKChooseMediaMethodParamModel, completionHandler: CompletionHandlerProtocol) {
        if paramModel.cameraPermissionDenyAction == SPKChooseMediaPermissionDenyAction.default.rawValue {
            // Show alert
            let alert = UIAlertController(title: "Camera access required",
                                          message: "Please allow camera access in Settings",
                                          preferredStyle: .alert)
            
            let cancelAction = UIAlertAction(title: "Cancel", style: .cancel) {
                _ in
                completionHandler.handleCompletion(status: .failed(message: "User cancelled authorization"), result: nil)
            }
            
            let settingsAction = UIAlertAction(title: "Open Settings", style: .default) {
                _ in
                if let settingsURL = URL(string: UIApplication.openSettingsURLString) {
                    UIApplication.shared.open(settingsURL)
                }
                completionHandler.handleCompletion(status: .failed(message: "Please grant permission in Settings"), result: nil)
            }
            
            alert.addAction(cancelAction)
            alert.addAction(settingsAction)
            
            // Present alert
            if let rootViewController = UIApplication.shared.keyWindow?.rootViewController {
                rootViewController.present(alert, animated: true, completion: nil)
            }
        } else {
            // No alert, just fail
            completionHandler.handleCompletion(status: .failed(message: "Camera permission denied"), result: nil)
        }
    }
    
    // Open media picker using SPKDefaultMediaPicker
    private func openMediaPicker(with paramModel: SPKChooseMediaMethodParamModel, completionHandler: CompletionHandlerProtocol) {
        // Create default media picker
        let mediaPicker = SPKDefaultMediaPicker()
        
        // Call media picker with the parameter model
        mediaPicker.mediaPicker(with: paramModel) { [weak self] resultModel, error in
            guard let self = self else { return }
            
            if let error = error {
                // Handle error
                completionHandler.handleCompletion(status: .failed(message: error.message), result: nil)
            } else if let resultModel = resultModel {
                // Success, use the returned result model
                completionHandler.handleCompletion(status: .succeeded(), result: resultModel)
            } else {
                // No files selected
                completionHandler.handleCompletion(status: .failed(message: "No media file selected"), result: nil)
            }
        }
    }
    
    // Helper method to get default media picker (similar to original code)
    private var defaultMediaPicker: SPKDefaultMediaPicker {
        return SPKDefaultMediaPicker()
    }
    
    // Check if camera is denied
    private func isCameraDenied() -> Bool {
        let authorizationStatus = AVCaptureDevice.authorizationStatus(for: .video)
        return authorizationStatus == .denied || authorizationStatus == .restricted
    }
    
    // Check if album is denied
    private func isAlbumDenied() -> Bool {
        let authorizationStatus = PHPhotoLibrary.authorizationStatus()
        return authorizationStatus == .denied || authorizationStatus == .restricted
    }
}
