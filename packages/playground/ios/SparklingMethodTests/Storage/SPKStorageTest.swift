// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import XCTest
import SparklingMethod
import Sparkling_SPKStorage
import Testing

class SPKStorageTest: XCTestCase {
    var setStorageItemMethod: SetStorageItemMethod!
    var getStorageItemMethod: GetStorageItemMethod!
    var removeStorageItemMethod: RemoveStorageItemMethod!
    
    var setStorageItemModelJSONDict: [String: Any] = [
        "key": "storage_test" as String,
        "data": ["test_key": "test_value" as String, "number": 123 as Int] as [String: Any]
    ]
    
    var getStorageItemModelJSONDict: [String: Any] = [
        "key": "storage_test" as String
    ]
    
    var removeStorageItemModelJSONDict: [String: Any] = [
        "key": "storage_test" as String
    ]
    
    override func setUp() {
        SPKServiceRegister.registerAll()
        setStorageItemMethod = SetStorageItemMethod()
        getStorageItemMethod = GetStorageItemMethod()
        removeStorageItemMethod = RemoveStorageItemMethod()
        // No need to register services as they should be registered automatically
    }
    
    override func tearDown() {
        super.tearDown()
        // Clean up if needed
    }
    
    // MARK: - SetStorageItemMethod Tests
    
    // Test SetStorageItemMethod parameter model conversion
    func testSetStorageItemMethodParamModelConversion() {
        do {
            let model = try SetStorageItemMethodParamModel(dictionary: setStorageItemModelJSONDict)
            XCTAssertNotNil(model, "Model should not be nil")
            XCTAssertEqual(model.key, "storage_test", "Key should be 'storage_test'")
            XCTAssertNotNil(model.data, "Data should not be nil")
            
            // Test toDict conversion
            let toDict = try model.toDict()
            XCTAssertNotNil(toDict, "toDict should not be nil")
            XCTAssertEqual(toDict?["key"] as? String, setStorageItemModelJSONDict["key"] as? String, "Keys should match")
        } catch {
            XCTFail("Failed to create model: \(error)")
        }
    }
    
    // Test SetStorageItemMethod invoke
    func testSetStorageItemMethodInvoke() {
        let expectation = self.expectation(description: "SetStorageItemMethod invoke test")
        
        do {
            // Create parameter model
            let model: SetStorageItemMethodParamModel = try SetStorageItemMethodParamModel(dictionary: setStorageItemModelJSONDict)
            
            // Get the method from registry
            let method = setStorageItemMethod
            
            // Call the method with explicit types
            let callClosure: (MethodStatus, Any?) -> Void = { status, result in
                #expect(status.code == MethodStatusCode.succeeded)
                XCTAssertNil(result, "Result should be nil for setItem method")
                expectation.fulfill()
            }
            method?.call(withParamModel: model, completionHandler: callClosure)
        } catch {
            XCTFail("Failed to invoke method: \(error)")
            expectation.fulfill()
        }
        
        wait(for: [expectation], timeout: 5.0)
    }
    
    // Test SetStorageItemMethod with empty key
    func testSetStorageItemMethodWithEmptyKey() {
        let expectation = self.expectation(description: "SetStorageItemMethod with empty key test")
        
        do {
            // Create parameter model with empty key
            var invalidParams = setStorageItemModelJSONDict
            invalidParams["key"] = ""
            let model: SetStorageItemMethodParamModel = try SetStorageItemMethodParamModel(dictionary: invalidParams)
            
            // Get the method from registry
            let methodName = SetStorageItemMethod.methodName()
            guard let method = MethodRegistry.global.method(forName: methodName) as? SetStorageItemMethod else {
                XCTFail("Method not found: \(methodName)")
                expectation.fulfill()
                return
            }
            
            // Call the method with explicit types
            let callClosure: (MethodStatus, Any?) -> Void = { status, _ in
                XCTAssertEqual(status.code, MethodStatusCode.invalidInputParameter, "Status code should be invalidInputParameter")
                expectation.fulfill()
            }
            method.call(withParamModel: model, completionHandler: callClosure)
        } catch {
            XCTFail("Failed to invoke method: \(error)")
            expectation.fulfill()
        }
        
        wait(for: [expectation], timeout: 5.0)
    }
    
    // MARK: - GetStorageItemMethod Tests
    
    // Test GetStorageItemMethod parameter model conversion
    func testGetStorageItemMethodParamModelConversion() {
        do {
            let model = try GetStorageItemMethodParamModel(dictionary: getStorageItemModelJSONDict)
            XCTAssertNotNil(model, "Model should not be nil")
            XCTAssertEqual(model.key, "storage_test", "Key should be 'storage_test'")
            
            // Test toDict conversion
            let toDict = try model.toDict()
            XCTAssertNotNil(toDict, "toDict should not be nil")
            XCTAssertEqual(toDict?["key"] as? String, getStorageItemModelJSONDict["key"] as? String, "Keys should match")
        } catch {
            XCTFail("Failed to create model: \(error)")
        }
    }
    
    // Test GetStorageItemMethod invoke
    func testGetStorageItemMethodInvoke() {
        let expectation = self.expectation(description: "GetStorageItemMethod invoke test")
        
        do {
            // First, ensure the item is stored
            testSetStorageItemMethodInvoke()
            
            // Create parameter model
            let model: GetStorageItemMethodParamModel = try GetStorageItemMethodParamModel(dictionary: getStorageItemModelJSONDict)
            
            let method = getStorageItemMethod
            
            // Call the method with explicit types
            let callClosure: (MethodStatus, Any?) -> Void = { status, result in
                #expect(status.code == MethodStatusCode.succeeded)
                
                // Verify result
                if let resultModel = result as? GetStorageItemMethodResultModel {
                    XCTAssertNotNil(resultModel.data, "Data should not be nil")
                } else {
                    XCTFail("Result should be GetStorageItemMethodResultModel")
                }
                expectation.fulfill()
            }
            method?.call(withParamModel: model, completionHandler: callClosure)
        } catch {
            XCTFail("Failed to invoke method: \(error)")
            expectation.fulfill()
        }
        
        wait(for: [expectation], timeout: 5.0)
    }
    
    // Test GetStorageItemMethod with empty key
    func testGetStorageItemMethodWithEmptyKey() {
        let expectation = self.expectation(description: "GetStorageItemMethod with empty key test")
        
        do {
            let method = getStorageItemMethod
            
            // Create parameter model with empty key
            var invalidParams = getStorageItemModelJSONDict
            invalidParams["key"] = ""
            let model = try GetStorageItemMethodParamModel(dictionary: invalidParams)
            
            // Call the method with explicit types
            let callClosure: (MethodStatus, Any?) -> Void = { status, _ in
                XCTAssertEqual(status.code, MethodStatusCode.invalidInputParameter, "Status code should be invalidInputParameter")
                expectation.fulfill()
            }
            method?.call(withParamModel: model, completionHandler: callClosure)
        } catch {
            XCTFail("Failed to invoke method: \(error)")
            expectation.fulfill()
        }
        
        wait(for: [expectation], timeout: 5.0)
    }
    
    // MARK: - RemoveStorageItemMethod Tests
    
    // Test RemoveStorageItemMethod parameter model conversion
    func testRemoveStorageItemMethodParamModelConversion() {
        do {
            let model = try RemoveStorageItemMethodParamModel(dictionary: removeStorageItemModelJSONDict)
            XCTAssertNotNil(model, "Model should not be nil")
            XCTAssertEqual(model.key, "storage_test", "Key should be 'storage_test'")
            
            // Test toDict conversion
            let toDict = try model.toDict()
            XCTAssertNotNil(toDict, "toDict should not be nil")
            XCTAssertEqual(toDict?["key"] as? String, removeStorageItemModelJSONDict["key"] as? String, "Keys should match")
        } catch {
            XCTFail("Failed to create model: \(error)")
        }
    }
    
    // Test RemoveStorageItemMethod invoke
    func testRemoveStorageItemMethodInvoke() {
        let expectation = self.expectation(description: "RemoveStorageItemMethod invoke test")
        
        do {
            // First, ensure the item is stored
            testSetStorageItemMethodInvoke()
            
            let method = removeStorageItemMethod
            
            // Create parameter model
            let model = try RemoveStorageItemMethodParamModel(dictionary: removeStorageItemModelJSONDict)
            
            // Call the method with explicit types
            let callClosure: (MethodStatus, Any?) -> Void = { status, result in
                #expect(status.code == MethodStatusCode.succeeded)
                expectation.fulfill()
            }
            method?.call(withParamModel: model, completionHandler: callClosure)
        } catch {
            XCTFail("Failed to invoke method: \(error)")
            expectation.fulfill()
        }
        
        wait(for: [expectation], timeout: 5.0)
    }
    
    // Test RemoveStorageItemMethod with empty key
    func testRemoveStorageItemMethodWithEmptyKey() {
        let expectation = self.expectation(description: "RemoveStorageItemMethod with empty key test")
        
        do {
            let method = removeStorageItemMethod
            
            // Create parameter model with empty key
            var invalidParams = removeStorageItemModelJSONDict
            invalidParams["key"] = ""
            let model = try RemoveStorageItemMethodParamModel(dictionary: invalidParams)
            
            // Call the method with explicit types
            let callClosure: (MethodStatus, Any?) -> Void = { status, _ in
                XCTAssertEqual(status.code, MethodStatusCode.invalidInputParameter, "Status code should be invalidInputParameter")
                expectation.fulfill()
            }
            method?.call(withParamModel: model, completionHandler: callClosure)
        } catch {
            XCTFail("Failed to invoke method: \(error)")
            expectation.fulfill()
        }
        
        wait(for: [expectation], timeout: 5.0)
    }
    
    // MARK: - Integration Tests
    
    // Test sequence: set, get, remove, get (should be nil)
    func testStorageOperationSequence() {
        let expectation = self.expectation(description: "Storage operation sequence test")
        
        // Create a dispatch group to ensure sequential execution
        let group = DispatchGroup()
        
        // Set item
        group.enter()
        DispatchQueue.global().async {
            self.testSetStorageItemMethodInvoke()
            group.leave()
        }
        
        // Get item
        group.enter()
        DispatchQueue.global().asyncAfter(deadline: .now() + 0.5) {
            self.testGetStorageItemMethodInvoke()
            group.leave()
        }
        
        // Remove item
        group.enter()
        DispatchQueue.global().asyncAfter(deadline: .now() + 1.0) {
            self.testRemoveStorageItemMethodInvoke()
            group.leave()
        }
        
        // Verify item is removed by trying to get it again
        group.enter()
        DispatchQueue.global().asyncAfter(deadline: .now() + 1.5) {
            let getExpectation = self.expectation(description: "Get non-existent item test")
            
            do {
                let method = self.getStorageItemMethod
                
                // Create parameter model with explicit type
                let model: GetStorageItemMethodParamModel = try GetStorageItemMethodParamModel(dictionary: self.getStorageItemModelJSONDict)
                
                // Call the method with explicit types
                let callClosure: (MethodStatus, Any?) -> Void = { status, result in
                    #expect(status.code == MethodStatusCode.succeeded)
                    
                    // Verify result - data should be nil after removal
                    if let resultModel = result as? GetStorageItemMethodResultModel {
                        XCTAssertNil(resultModel.data, "Data should be nil after removal")
                    } else {
                        
                    }
                    
                    getExpectation.fulfill()
                    group.leave()
                }
                method?.call(withParamModel: model, completionHandler: callClosure)
            } catch {
                XCTFail("Failed to invoke method: \(error)")
                getExpectation.fulfill()
                group.leave()
            }
            
            self.wait(for: [getExpectation], timeout: 5.0)
        }
        
        // Notify when all operations are done
        group.notify(queue: .main) {
            expectation.fulfill()
        }
        
        wait(for: [expectation], timeout: 20.0)
    }
    
    // Test missing required parameters
    func testMissingRequiredParameters() {
        let setExpectation = self.expectation(description: "Missing required parameters for setItem test")
        let getExpectation = self.expectation(description: "Missing required parameters for getItem test")
        let removeExpectation = self.expectation(description: "Missing required parameters for removeItem test")
        
        // Test setItem with missing key
        let invalidSetParams: [String: Any] = [
            "data": ["test_key": "test_value" as String] as [String: Any]
        ]
        XCTAssertThrowsError(try SetStorageItemMethodParamModel(dictionary: invalidSetParams))
        setExpectation.fulfill()
        
        // Test setItem with missing data
        let invalidSetParams2: [String: Any] = [
            "key": "test_key"
        ]
        XCTAssertThrowsError(try SetStorageItemMethodParamModel(dictionary: invalidSetParams2))
        
        // Test getItem with missing key
        let invalidGetParams: [String: Any] = [:]
        XCTAssertThrowsError(try GetStorageItemMethodParamModel(dictionary: invalidGetParams))
        getExpectation.fulfill()
        
        // Test removeItem with missing key
        let invalidRemoveParams: [String: Any] = [:]
        XCTAssertThrowsError(try RemoveStorageItemMethodParamModel(dictionary: invalidRemoveParams))
        removeExpectation.fulfill()
        
        wait(for: [setExpectation, getExpectation, removeExpectation], timeout: 3.0)
    }
    
    // Test method name access
    func testMethodNameAccess() {
        // Test instance method name
        let setMethod = SetStorageItemMethod()
        let getMethod = GetStorageItemMethod()
        let removeMethod = RemoveStorageItemMethod()
        
        XCTAssertEqual(setMethod.methodName, "storage.setItem", "SetStorageItemMethod name should be correct")
        XCTAssertEqual(getMethod.methodName, "storage.getItem", "GetStorageItemMethod name should be correct")
        XCTAssertEqual(removeMethod.methodName, "storage.removeItem", "RemoveStorageItemMethod name should be correct")
        
        // Test class method name
        XCTAssertEqual(SetStorageItemMethod.methodName(), "storage.setItem", "SetStorageItemMethod class name should be correct")
        XCTAssertEqual(GetStorageItemMethod.methodName(), "storage.getItem", "GetStorageItemMethod class name should be correct")
        XCTAssertEqual(RemoveStorageItemMethod.methodName(), "storage.removeItem", "RemoveStorageItemMethod class name should be correct")
    }
    
    // Test model class access
    func testModelClassAccess() {
        let setMethod = SetStorageItemMethod()
        let getMethod = GetStorageItemMethod()
        let removeMethod = RemoveStorageItemMethod()
        
        // Compare class names instead of types directly to avoid Equatable conformance issues
        XCTAssertEqual(String(describing: setMethod.paramsModelClass), String(describing: SetStorageItemMethodParamModel.self), "SetStorageItemMethod paramsModelClass should be correct")
        XCTAssertEqual(String(describing: setMethod.resultModelClass), String(describing: EmptyMethodModelClass.self), "SetStorageItemMethod resultModelClass should be correct")
        
        XCTAssertEqual(String(describing: getMethod.paramsModelClass), String(describing: GetStorageItemMethodParamModel.self), "GetStorageItemMethod paramsModelClass should be correct")
        XCTAssertEqual(String(describing: getMethod.resultModelClass), String(describing: GetStorageItemMethodResultModel.self), "GetStorageItemMethod resultModelClass should be correct")
        
        XCTAssertEqual(String(describing: removeMethod.paramsModelClass), String(describing: RemoveStorageItemMethodParamModel.self), "RemoveStorageItemMethod paramsModelClass should be correct")
        XCTAssertEqual(String(describing: removeMethod.resultModelClass), String(describing: EmptyMethodModelClass.self), "RemoveStorageItemMethod resultModelClass should be correct")
    }
}
