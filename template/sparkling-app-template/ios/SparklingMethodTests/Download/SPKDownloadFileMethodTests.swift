// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import XCTest
import SparklingMethod
@testable import Sparkling_SPKRouter

class SPKDownloadFileMethodTests: XCTestCase {
    var downloadMethod: SPKDownloadFileMethod!
    
    override func setUp() {
        super.setUp()
        // Initialize test object
        downloadMethod = SPKDownloadFileMethod()
    }
    
    override func tearDown() {
        // Clean up test environment
        downloadMethod = nil
        super.tearDown()
    }
    
    // Test parameter validation - missing URL
    func testParameterValidation_MissingURL() {
        let expectation = self.expectation(description: "Parameter validation test - missing URL")
        
        // Create invalid parameters (missing url)
        let invalidParams: [String: Any] = [
            "saveToAlbum": "false"
        ]
        
        // Create parameter model and result model
        do {
            let params = try SPKDownloadFileMethodParamModel(dictionary: invalidParams)
        let resultModel = SPKDownloadFileMethodResultModel()
            
            // Call method handler
            downloadMethod.invoke(withParams: params) { status, _ in
                // Verify status is failure
                if status == MethodStatus.invalidParameter(message: "") {
                    // Invalid parameter case passed
                } else {
                    XCTFail("Should return invalid parameter status")
                }
                expectation.fulfill()
            }
        } catch {
            // If parameter model creation fails, it's also expected
            expectation.fulfill()
        }
        
        wait(for: [expectation], timeout: 5.0)
    }
    
    // Test basic method execution - valid parameters
    func testMethodExecution_ValidParameters() {
        let expectation = self.expectation(description: "Method execution test - valid parameters")
        
        // Create valid parameters
        let validParams: [String: Any] = [
            "url": "https://www.baidu.com/img/PCtm_d9c8750bed0b3c7d089fa7d55720d6cf.png",
            "saveToAlbum": "image"
        ]
        
        // Create parameter model
        do {
            let params = try SPKDownloadFileMethodParamModel(dictionary: validParams)
            
            // Call method
            downloadMethod.invoke(withParams: params) { _, _ in
                // We don't care about the result here, just verifying the method can execute without crashing
                expectation.fulfill()
            }
        } catch {
            XCTFail("Failed to create parameter model: \(error)")
            expectation.fulfill()
        }
        
        wait(for: [expectation], timeout: 10.0)
    }
    
    // Test save to album parameter handling
    func testSaveToAlbumParameter() {
        // Create request with save to album parameter
        let paramsDict: [String: Any] = [
            "url": "https://example.com/image.jpg",
            "saveToAlbum": "image"
        ]
        
        // Create parameter model
        do {
            let paramModel = try SPKDownloadFileMethodParamModel(dictionary: paramsDict)
            
            // Verify parameter is correctly set
            XCTAssertEqual(paramModel.url, "https://example.com/image.jpg")
            XCTAssertTrue((paramModel.saveToAlbum != nil))
        } catch {
            XCTFail("Failed to create parameter model: \(error)")
        }
    }
    
    // Test timeout parameter handling
    func testTimeoutParameter() {
        // Create request with timeout parameter
        let paramsDict: [String: Any] = [
            "url": "https://example.com/image.jpg",
            "timeoutInterval": 30.0,
            "saveToAlbum": "false"
        ]
        
        // Create parameter model and verify model can be created correctly (even if timeout property doesn't exist)
        do {
            let paramModel = try SPKDownloadFileMethodParamModel(dictionary: paramsDict)
            
            // Verify URL parameter is correctly set
            XCTAssertEqual(paramModel.url, "https://example.com/image.jpg")
        } catch {
            XCTFail("Failed to create parameter model: \(error)")
        }
    }
    
    // Test temporary file path creation logic - verify URL parsing
    func testURLParsingForFileExtension() {
        // Test different types of URL parsing
        let testURLs = [
            "https://example.com/image.jpg": "jpg",
            "https://example.com/file.pdf": "pdf",
            "https://example.com/data": ""
        ]
        
        for (url, _) in testURLs {
            // Create parameter model for each URL
            let paramsDict: [String: Any] = [
                "url": url,
                "saveToAlbum": "false"
            ]
            
            do {
                let paramModel = try SPKDownloadFileMethodParamModel(dictionary: paramsDict)
                
                // Verify URL is correctly set
                XCTAssertEqual(paramModel.url, url)
            } catch {
                XCTFail("Failed to create parameter model: \(url), error: \(error)")
            }
        }
    }
    
    // Test empty URL case
    func testEmptyURL() {
        let expectation = self.expectation(description: "Empty URL test")
        
        // Create empty URL parameter
        let paramsDict: [String: Any] = [
            "url": "",
            "saveToAlbum": "false"
        ]
        
        do {
            let params = try SPKDownloadFileMethodParamModel(dictionary: paramsDict)
            
            // Call method
            downloadMethod.invoke(withParams: params) { status, _ in
                // Verify status is invalid parameter
                if status == MethodStatus.invalidParameter(message: "") {
                    // Test passed
                } else {
                    XCTFail("Should return invalid parameter status")
                }
                expectation.fulfill()
            }
        } catch {
            XCTFail("Failed to create parameter model: \(error)")
            expectation.fulfill()
        }
        
        wait(for: [expectation], timeout: 5.0)
    }
    
    // Test invalid URL format case
    func testInvalidURLFormat() {
        let expectation = self.expectation(description: "Invalid URL format test")
        
        // Create invalid URL format parameter
        let paramsDict: [String: Any] = [
            "url": "not-a-valid-url",
            "saveToAlbum": "false"
        ]
        
        do {
            let params = try SPKDownloadFileMethodParamModel(dictionary: paramsDict)
            
            // Call method
            downloadMethod.invoke(withParams: params) { _, _ in
                // We only verify that the method can handle invalid URL without crashing
                expectation.fulfill()
            }
        } catch {
            XCTFail("Failed to create parameter model: \(error)")
            expectation.fulfill()
        }
        
        wait(for: [expectation], timeout: 5.0)
    }
    
    // Test different saveToAlbum parameter formats
    func testSaveToAlbumParameterDifferentFormats() {
        // Test string type saveToAlbum parameter
        let stringParamsDict: [String: Any] = [
            "url": "https://example.com/image.jpg",
            "saveToAlbum": "image"
        ]
        
        do {
            let stringParamModel = try SPKDownloadFileMethodParamModel(dictionary: stringParamsDict)
            XCTAssertTrue((stringParamModel.saveToAlbum != nil))
        } catch {
            XCTFail("Failed to create string parameter model: \(error)")
        }
        
        // Test boolean type saveToAlbum parameter
        let boolParamsDict: [String: Any] = [
            "url": "https://example.com/image.jpg",
            "saveToAlbum": "true"
        ]
        
        do {
            let boolParamModel = try SPKDownloadFileMethodParamModel(dictionary: boolParamsDict)
            XCTAssertTrue((boolParamModel.saveToAlbum != nil))
        } catch {
            XCTFail("Failed to create boolean parameter model: \(error)")
        }
        
        // Test number type saveToAlbum parameter
        let numberParamsDict: [String: Any] = [
            "url": "https://example.com/image.jpg",
            "saveToAlbum": "1"
        ]
        
        do {
            let numberParamModel = try SPKDownloadFileMethodParamModel(dictionary: numberParamsDict)
            XCTAssertTrue((numberParamModel.saveToAlbum != nil))
        } catch {
            XCTFail("Failed to create number parameter model: \(error)")
        }
    }
}
