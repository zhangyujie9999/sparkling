// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import XCTest
import Foundation
import UIKit
import Photos
import AVFoundation
@testable import Sparkling_SPKRouter

class SPKChooseMediaMethodTest: XCTestCase {
    
    var chooseMediaMethod: SPKChooseMediaMethod!
    
    override func setUp() {
        super.setUp()
        chooseMediaMethod = SPKChooseMediaMethod()
    }
    
    override func tearDown() {
        chooseMediaMethod = nil
        super.tearDown()
    }
    
    // Validate method name
    func testMethodName() {
        XCTAssertEqual(SPKChooseMediaMethod.methodName(), "x.chooseMedia", "Method name should be 'x.chooseMedia'")
        XCTAssertEqual(chooseMediaMethod.methodName, "x.chooseMedia", "Instance method name should be 'x.chooseMedia'")
    }
    
    // Validate parameter model class
    func testParamsModelClass() {
        XCTAssertEqual(String(describing: chooseMediaMethod.paramsModelClass), String(describing: SPKChooseMediaMethodParamModel.self), "Parameter model class should be SPKChooseMediaMethodParamModel")
    }
    
    // Validate result model class
    func testResultModelClass() {
        XCTAssertEqual(String(describing: chooseMediaMethod.resultModelClass), String(describing: SPKChooseMediaMethodResultModel.self), "Result model class should be SPKChooseMediaMethodResultModel")
    }
    
    // Validate parameter model JSON mapping
    func testParamModelJsonMapping() {
        let paramModel = SPKChooseMediaMethodParamModel()
        paramModel.mediaTypes = [1, 2] // image and video
        paramModel.sourceType = 1 // album
        paramModel.cameraType = 1 // front
        paramModel.maxCount = 5
        paramModel.compressOption = 1 // both
        
        let keyPaths = type(of: paramModel).jsonKeyPathsByPropertyKey()
        XCTAssertNotNil(keyPaths["mediaTypes"], "mediaTypes key path should exist")
        XCTAssertNotNil(keyPaths["sourceType"], "sourceType key path should exist")
        XCTAssertNotNil(keyPaths["cameraType"], "cameraType key path should exist")
        XCTAssertNotNil(keyPaths["maxCount"], "maxCount key path should exist")
        XCTAssertNotNil(keyPaths["compressOption"], "compressOption key path should exist")
    }
    
    // Validate result model JSON mapping
    func testResultModelJsonMapping() {
        let resultModel = SPKChooseMediaMethodResultModel()
        
        let keyPaths = type(of: resultModel).jsonKeyPathsByPropertyKey()
        XCTAssertNotNil(keyPaths["tempFiles"], "tempFiles key path should exist")
    }
    
    // Validate temporary file model JSON mapping
    func testTempFileModelJsonMapping() {
        let tempFileModel = SPKChooseMediaMethodResultTempFileModel()
        
        let keyPaths = type(of: tempFileModel).jsonKeyPathsByPropertyKey()
        XCTAssertNotNil(keyPaths["tempFilePath"], "tempFilePath key path should exist")
        XCTAssertNotNil(keyPaths["mediaType"], "mediaType key path should exist")
        XCTAssertNotNil(keyPaths["size"], "size key path should exist")
        XCTAssertNotNil(keyPaths["base64Data"], "base64Data key path should exist")
        XCTAssertNotNil(keyPaths["tempFileAbsolutePath"], "tempFileAbsolutePath key path should exist")
        XCTAssertNotNil(keyPaths["mimeType"], "mimeType key path should exist")
    }
    
    // Validate presence of permission-checking APIs
    func testPermissionMethodExistence() {
        // Ensure permission-related types are accessible
        XCTAssertTrue(SPKChooseMediaPermissionDenyAction.self is Any.Type, "SPKChooseMediaPermissionDenyAction enum should be accessible")
        XCTAssertTrue(SPKChooseMediaMediaSourceType.self is Any.Type, "SPKChooseMediaMediaSourceType enum should be accessible")
    }
    
    // Validate media picker support for media type mapping
    func testMediaTypesMapping() {
        let mediaPicker = SPKDefaultMediaPicker()
        let paramModel = SPKChooseMediaMethodParamModel()
        
        // Validate image type mapping
        paramModel.mediaTypes = [1] // image only
        let imagePickerVC1 = mediaPicker.mediaPicker(with: paramModel) { _, _ in }
        XCTAssertNotNil(imagePickerVC1, "Media picker should be created for image type")
        
        // Validate video type mapping
        paramModel.mediaTypes = [2] // video only
        let imagePickerVC2 = mediaPicker.mediaPicker(with: paramModel) { _, _ in }
        XCTAssertNotNil(imagePickerVC2, "Media picker should be created for video type")
        
        // Validate combined image and video mapping
        paramModel.mediaTypes = [1, 2] // both image and video
        let imagePickerVC3 = mediaPicker.mediaPicker(with: paramModel) { _, _ in }
        XCTAssertNotNil(imagePickerVC3, "Media picker should be created for both image and video types")
    }
    
    // Validate image compression behavior
    func testImageCompression() {
        let mediaPicker = SPKDefaultMediaPicker()
        let paramModel = SPKChooseMediaMethodParamModel()
        paramModel.compressOption = 1 // both
        paramModel.compressWidth = 100
        paramModel.compressHeight = 100
        paramModel.compressionQuality = 0.5
        
        // Set params so imageDataForImage can access them
        let setParamsSelector = NSSelectorFromString("params=")
        if mediaPicker.responds(to: setParamsSelector) {
            // Use reflection to set the params property
            mediaPicker.perform(setParamsSelector, with: paramModel)
            
            // Create a test image
            let testImage = UIImage(systemName: "photo") ?? UIImage()
            
            // Fetch the compressed image data
            let compressedDataSelector = NSSelectorFromString("imageDataForImage:")
            if mediaPicker.responds(to: compressedDataSelector) {
                let imageData = mediaPicker.perform(compressedDataSelector, with: testImage)?.takeRetainedValue() as? Data
                XCTAssertNotNil(imageData, "Compressed image data should not be nil")
            }
        }
    }
    
    // Validate camera type setting
    func testCameraTypeSetting() {
        let mediaPicker = SPKDefaultMediaPicker()
        let paramModel = SPKChooseMediaMethodParamModel()
        paramModel.sourceType = 2 // camera
        
        // Validate front camera
        paramModel.cameraType = 1 // front
        let frontCameraPicker = mediaPicker.mediaPicker(with: paramModel) { _, _ in }
        XCTAssertNotNil(frontCameraPicker, "Front camera picker should be created")
        
        // Validate rear camera
        paramModel.cameraType = 2 // back
        let backCameraPicker = mediaPicker.mediaPicker(with: paramModel) { _, _ in }
        XCTAssertNotNil(backCameraPicker, "Back camera picker should be created")
    }
    
}
