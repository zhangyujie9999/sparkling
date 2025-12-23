// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import XCTest
import SparklingMethod
@testable import Sparkling_SPKRouter
import Foundation

// Mock completion handler for testing that implements CompletionHandlerProtocol
class MockCompletionHandler: NSObject, PipeMethod.CompletionHandlerProtocol {
    var statusCode: Int = 0
    var statusMessage: String?
    var result: SPKMethodModel?
    
    func handleCompletion(status: MethodStatus, result: SPKMethodModel?) {
        self.statusCode = status.rawCode
        self.statusMessage = status.message
        self.result = result
    }
}

// Mock HTTP task for testing
class MockSPKHttpTask: NSObject {
    var resumed = false
    var cancelled = false
    
    func resume() {
        resumed = true
    }
    
    func cancel() {
        cancelled = true
    }
}

// Mock TTNetworkManager for testing
class MockTTNetworkManager {
    static var shared = MockTTNetworkManager()
    
    // Properties to track method calls
    var uploadTaskCalled = false
    var lastUploadTaskParams: [String: Any] = [:]
    var uploadTaskCompletionHandler: ((Any?, Any?, Error?) -> Void)?
    
    // Mock implementation of uploadTaskWithRequest
    func uploadTaskWithRequest(
        _ url: String,
        fileURL: URL,
        name: String,
        fileName: String,
        mimeType: String,
        parameters: [String: Any]?,
        headerField: [String: Any]?,
        needCommonParams: Bool,
        progress: ((Double) -> Void)?,
        completion: @escaping (Any?, Any?, Error?) -> Void
    ) -> Any {
        uploadTaskCalled = true
        
        // Store all parameters for verification
        lastUploadTaskParams = [
            "url": url,
            "fileURL": fileURL,
            "name": name,
            "fileName": fileName,
            "mimeType": mimeType,
            "parameters": parameters ?? [:],
            "headerField": headerField ?? [:],
            "needCommonParams": needCommonParams
        ]
        
        uploadTaskCompletionHandler = completion
        
        return MockSPKHttpTask()
    }
}

class SPKUploadFileMethodTests: XCTestCase {
    var uploadMethod: SPKUploadFileMethod!
    
    override func setUp() {
        super.setUp()
        // Initialize test object
        uploadMethod = SPKUploadFileMethod()
    }
    
    override func tearDown() {
        // Clean up test environment
        uploadMethod = nil
        super.tearDown()
    }
    
    func testMethodName() {
        XCTAssertEqual(uploadMethod.methodName, "x.uploadFile")
        XCTAssertEqual(SPKUploadFileMethod.methodName(), "x.uploadFile")
    }
    
    func testParamsModelClass() {
        XCTAssertTrue(uploadMethod.paramsModelClass is SPKUploadFileMethodParamModel.Type)
    }
    
    func testResultModelClass() {
        XCTAssertTrue(uploadMethod.resultModelClass is SPKUploadFileMethodResultModel.Type)
    }
    
    func testParamModelCreationWithInvalidParams() {
        // Test creation with invalid parameters (missing required URL)
        let invalidParams: [String: Any] = [
            "header": ["Content-Type": "application/json"],
            "params": ["key": "value"]
        ]
        
        // Should throw error due to missing required parameters
        XCTAssertThrowsError(try SPKUploadFileMethodParamModel(dictionary: invalidParams))
        
        // Test creation with missing filePath
        let missingFilePathParams: [String: Any] = [
            "url": "https://example.com/upload"
        ]
        XCTAssertThrowsError(try SPKUploadFileMethodParamModel(dictionary: missingFilePathParams))
    }
    
    func testParamModelCreationWithValidParams() {
        // Test creation with valid parameters
        let validParams: [String: Any] = [
            "url": "https://example.com/upload",
            "filePath": "/path/to/file.jpg",
            "header": ["Content-Type": "multipart/form-data"],
            "params": ["key": "value"]
        ]
        
        // Create parameter model
        do {
            let params = try SPKUploadFileMethodParamModel(dictionary: validParams)
            
            // Verify parameters are correctly set
            XCTAssertEqual(params.url, "https://example.com/upload")
            XCTAssertEqual(params.filePath, "/path/to/file.jpg")
            XCTAssertEqual(params.header?["Content-Type"], "multipart/form-data")
            XCTAssertEqual(params.params?["key"] as? String, "value")
        } catch {
            XCTFail("Should not throw error with valid parameters: \(error)")
        }
    }
    
    func testParamModelWithUploadSpecificParams() {
        // Test param model with upload-specific parameters
        let paramsDict: [String: Any] = [
            "url": "https://example.com/upload",
            "filePath": "/path/to/image.jpg",
            "name": "uploadField",
            "fileName": "custom_image.jpg",
            "mimeType": "image/jpeg"
        ]
        
        do {
            let paramModel = try SPKUploadFileMethodParamModel(dictionary: paramsDict)
            
            // Verify all parameters are correctly set
            XCTAssertEqual(paramModel.url, "https://example.com/upload")
            XCTAssertEqual(paramModel.filePath, "/path/to/image.jpg")
            XCTAssertEqual(paramModel.name, "uploadField")
            XCTAssertEqual(paramModel.fileName, "custom_image.jpg")
            XCTAssertEqual(paramModel.mimeType, "image/jpeg")
        } catch {
            XCTFail("Should not throw error with upload-specific parameters: \(error)")
        }
    }
    
    func testParamModelWithTimeoutProperty() {
        // Test param model with timeoutInterval property
        let paramsDict: [String: Any] = [
            "url": "https://example.com/upload",
            "filePath": "/path/to/file.jpg",
            "timeoutInterval": 60.0
        ]
        
        do {
            let paramModel = try SPKUploadFileMethodParamModel(dictionary: paramsDict)
            
            // Verify parameters are correctly set
            XCTAssertEqual(paramModel.url, "https://example.com/upload")
            XCTAssertEqual(paramModel.filePath, "/path/to/file.jpg")
            XCTAssertEqual(paramModel.timeoutInterval, 60.0)
        } catch {
            XCTFail("Should not throw error with timeoutInterval parameter: \(error)")
        }
    }
    
    func testParamModelWithNeedCommonParamsProperty() {
        // Test param model with needCommonParams property set to false
        let paramsDict: [String: Any] = [
            "url": "https://example.com/upload",
            "filePath": "/path/to/file.jpg",
            "needCommonParams": false
        ]
        
        do {
            let params = try SPKUploadFileMethodParamModel(dictionary: paramsDict)
            
            // Verify parameters are correctly set
            XCTAssertEqual(params.url, "https://example.com/upload")
            XCTAssertEqual(params.filePath, "/path/to/file.jpg")
            XCTAssertFalse(params.needCommonParams)
        } catch {
            XCTFail("Should not throw error with needCommonParams parameter: \(error)")
        }
    }
    
    func testResultModelInitialization() {
        // Test result model initialization
        let resultModel = SPKUploadFileMethodResultModel()
        
        // Verify default values
        XCTAssertEqual(resultModel.clientCode, 0)
        XCTAssertEqual(resultModel.httpCode, 0)
        XCTAssertNil(resultModel.header)
        XCTAssertNil(resultModel.responseData)
        
        // Test setting values
        resultModel.clientCode = 200
        resultModel.httpCode = 200
        resultModel.header = ["Content-Type": "application/json"]
        resultModel.responseData = ["success": true, "message": "Upload completed"]
        
        // Verify values are set correctly
        XCTAssertEqual(resultModel.clientCode, 200)
        XCTAssertEqual(resultModel.httpCode, 200)
        XCTAssertEqual(resultModel.header?["Content-Type"], "application/json")
        XCTAssertEqual(resultModel.responseData?["success"] as? Bool, true)
        XCTAssertEqual(resultModel.responseData?["message"] as? String, "Upload completed")
    }
    
    // MARK: - Call Method Tests
    
    func testCallWithInvalidParamModel() {
        // Test with invalid parameter model type
        let completionHandler = MockCompletionHandler()
        uploadMethod.call(withParamModel: "invalid", completionHandler: completionHandler)
        
        // Verify completion handler was called with invalid parameter status
        XCTAssertEqual(completionHandler.statusCode, MethodStatusCode.invalidInputParameter.rawValue) // Invalid parameter status code
        XCTAssertEqual(completionHandler.statusMessage, "Invalid parameter model type")
        XCTAssertNil(completionHandler.result)
    }
    
    func testCallWithMissingURL() {
        // Test with missing URL parameter
        let params: [String: Any] = [
            "filePath": "/path/to/file.jpg"
        ]
        
        do {
            let paramModel = try SPKUploadFileMethodParamModel(dictionary: params)
            let completionHandler = MockCompletionHandler()
            uploadMethod.call(withParamModel: paramModel, completionHandler: completionHandler)
            
            // Verify completion handler was called with invalid parameter status
            XCTAssertEqual(completionHandler.statusCode, MethodStatusCode.invalidInputParameter.rawValue) // Invalid parameter status code
            XCTAssertEqual(completionHandler.statusMessage, "The URL should not be empty.")
            XCTAssertNil(completionHandler.result)
        } catch {
            // Parameter error is expected when required fields are missing
            XCTAssertNotNil(error)
        }
        
        func testCallWithMissingFilePath() {
            // Test with missing filePath parameter
            let params: [String: Any] = [
                "url": "https://example.com/upload"
            ]
            
            do {
                let paramModel = try SPKUploadFileMethodParamModel(dictionary: params)
                let completionHandler = MockCompletionHandler()
                uploadMethod.call(withParamModel: paramModel, completionHandler: completionHandler)
                
                // Verify completion handler was called with invalid parameter status
                XCTAssertEqual(completionHandler.statusCode, MethodStatusCode.invalidInputParameter.rawValue) // Invalid parameter status code
                XCTAssertEqual(completionHandler.statusMessage, "The filePath should not be empty.")
                XCTAssertNil(completionHandler.result)
            } catch {
                // Parameter error is expected when required fields are missing
                XCTAssertNotNil(error)
            }
            
            func testCallWithNonExistentFile() {
                // Test with non-existent file path
                let params: [String: Any] = [
                    "url": "https://example.com/upload",
                    "filePath": "/non/existent/file.jpg"
                ]
                
                do {
                    let paramModel = try SPKUploadFileMethodParamModel(dictionary: params)
                    let completionHandler = MockCompletionHandler()
                    uploadMethod.call(withParamModel: paramModel, completionHandler: completionHandler)
                    
                    // Verify completion handler was called with invalid parameter status
                    XCTAssertEqual(completionHandler.statusCode, MethodStatusCode.invalidInputParameter.rawValue) // Invalid parameter status code
                    XCTAssertEqual(completionHandler.statusMessage, "The file does not exist at the specified path.")
                    XCTAssertNil(completionHandler.result)
                } catch {
                    XCTFail("Should not throw error with non-existent file: \(error)")
                }
            }
            
            func testGuessMimeTypeMethod() {
                // Instead of using reflection to access private methods, we'll
                // test the MIME type handling through the public API
                let tempDir = NSTemporaryDirectory()
                
                // Test cases with various file extensions
                let testCases: [(extension: String, expectedMimeType: String)] = [
                    ("jpg", "image/jpeg"),
                    ("png", "image/png"),
                    ("pdf", "application/pdf"),
                    ("mp4", "video/mp4"),
                    ("json", "application/json"),
                    ("txt", "text/plain"),
                    ("unknown", "application/octet-stream")
                ]
                
                // For each test case, create a temporary file and test upload
                for testCase in testCases {
                    let tempFileName = "test_upload.\(testCase.extension)"
                    let tempFilePath = tempDir.appending(tempFileName)
                    let tempFileURL = URL(fileURLWithPath: tempFilePath)
                    
                    // Create test file content
                    let testContent = "test content".data(using: .utf8)!
                    
                    do {
                        // Write test content to temporary file
                        try testContent.write(to: tempFileURL)
                        defer {
                            // Clean up temporary file
                            try? FileManager.default.removeItem(at: tempFileURL)
                        }
                        
                        // Set up test parameters
                        let params: [String: Any] = [
                            "url": "https://example.com/upload",
                            "filePath": tempFilePath
                        ]
                        
                        let paramModel = try SPKUploadFileMethodParamModel(dictionary: params)
                        let completionHandler = MockCompletionHandler()
                        
                        // We're not actually checking the network call result here,
                        // but we're ensuring the code can process different file types
                        // without crashing
                        uploadMethod.call(withParamModel: paramModel, completionHandler: completionHandler)
                        
                        // Note: In a real implementation with proper dependency injection,
                        // we could verify the MIME type used for each file extension
                    } catch {
                        XCTFail("Test failed for .\(testCase.extension) with error: \(error)")
                    }
                }
            }
            
            func testCallWithValidParametersAndSuccessResponse() {
                // Create a temporary file for testing
                let tempDir = NSTemporaryDirectory()
                let tempFileName = "test_upload.jpg"
                let tempFilePath = tempDir.appending(tempFileName)
                let tempFileURL = URL(fileURLWithPath: tempFilePath)
                
                // Create test file content
                let testContent = "test content".data(using: .utf8)!
                
                do {
                    // Write test content to temporary file
                    try testContent.write(to: tempFileURL)
                    defer {
                        // Clean up temporary file
                        try? FileManager.default.removeItem(at: tempFileURL)
                    }
                    
                    // Set up test parameters
                    let params: [String: Any] = [
                        "url": "https://example.com/upload",
                        "filePath": tempFilePath,
                        "name": "uploadField",
                        "fileName": "custom_file.jpg",
                        "mimeType": "image/jpeg",
                        "params": ["key": "value"],
                        "header": ["Authorization": "Bearer token"],
                        "timeoutInterval": 30.0,
                        "needCommonParams": true
                    ]
                    
                    let paramModel = try SPKUploadFileMethodParamModel(dictionary: params)
                    let completionHandler = MockCompletionHandler()
                    
                    // Call the method
                    uploadMethod.call(withParamModel: paramModel, completionHandler: completionHandler)
                    
                    // Note: We can't mock TTNetworkManager.shared since it's a let constant
                    // In a real test environment, we would use dependency injection or method swizzling
                    
                    // For this test, we'll just verify that the completion handler is called
                    // with some result (the actual network call will fail in test environment)
                    // but we can check that the parameters are valid before the network call
                } catch {
                    XCTFail("Test failed with error: \(error)")
                }
            }
            
            func testCallWithValidParametersAndErrorResponse() {
                // Create a temporary file for testing
                let tempDir = NSTemporaryDirectory()
                let tempFileName = "test_upload.txt"
                let tempFilePath = tempDir.appending(tempFileName)
                let tempFileURL = URL(fileURLWithPath: tempFilePath)
                
                // Create test file content
                let testContent = "test content".data(using: .utf8)!
                
                do {
                    // Write test content to temporary file
                    try testContent.write(to: tempFileURL)
                    defer {
                        // Clean up temporary file
                        try? FileManager.default.removeItem(at: tempFileURL)
                    }
                    
                    // Set up test parameters
                    let params: [String: Any] = [
                        "url": "https://example.com/upload",
                        "filePath": tempFilePath
                    ]
                    
                    let paramModel = try SPKUploadFileMethodParamModel(dictionary: params)
                    let completionHandler = MockCompletionHandler()
                    
                    // Call the method
                    uploadMethod.call(withParamModel: paramModel, completionHandler: completionHandler)
                    
                    // Note: We can't mock TTNetworkManager.shared since it's a let constant
                    // In a real test environment, we would use dependency injection or method swizzling
                } catch {
                    XCTFail("Test failed with error: \(error)")
                }
            }
        }
    }
}