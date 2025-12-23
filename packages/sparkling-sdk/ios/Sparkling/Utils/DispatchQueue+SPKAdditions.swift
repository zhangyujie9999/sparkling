// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import Foundation

public extension SPKKitWrapper where Base: DispatchQueue {
    /// Executes a block synchronously on a global queue with timeout support when called from the main thread.
    /// 
    /// This method provides different behavior based on the calling thread:
    /// - **Main Thread**: Executes the block on a global queue and waits with timeout
    /// - **Background Thread**: Executes the block immediately without timeout
    /// 
    /// When called from the main thread, this prevents blocking the UI while allowing controlled execution time.
    /// The minimum timeout is automatically set to 0.01 seconds if a smaller value is provided.
    /// 
    /// - Parameters:
    ///   - timeout: The maximum time to wait for execution completion (minimum 0.01 seconds on main thread)
    ///   - flags: Additional attributes to apply when executing the block. See DispatchWorkItemFlags for options
    ///   - work: The block containing the work to perform. This block has no return value and no parameters
    /// 
    /// - Returns: `.success` if the block completed within the timeout, `.timedOut` if the timeout was exceeded
    /// 
    /// - Example:
    ///   ```swift
    ///   let result = DispatchQueue.spk.syncGlobal(timeout: 2.0) {
    ///       // Perform some work that might take time
    ///       Thread.sleep(forTimeInterval: 1.0)
    ///   }
    ///   
    ///   if result == .success {
    ///       print("Work completed successfully")
    ///   } else {
    ///       print("Work timed out")
    ///   }
    ///   ```
    @discardableResult
    static func syncGlobal(timeout: TimeInterval = 0.01, flags: DispatchWorkItemFlags = [], execute work: @escaping @convention(block) () -> Void) -> DispatchTimeoutResult {
        var timeout = timeout
        if Thread.isMainThread {
            if timeout <= 0 {
                timeout = 0.01
            }
            let qos = DispatchQoS(qosClass: .userInitiated, relativePriority: -8)
            let task_work = DispatchWorkItem(qos: qos, flags: flags, block: work)
            DispatchQueue.global(qos: .default).async(execute: task_work)
            return task_work.wait(timeout: .now() + timeout)
        } else {
            work()
            return .success
        }
    }
    
    /// Executes a block on the main queue, with intelligent thread-aware behavior.
    /// 
    /// This method provides safe main queue execution:
    /// - **Already on Main Queue**: Executes the block immediately to avoid deadlock
    /// - **Background Queue**: Synchronously dispatches to main queue and waits for completion
    /// 
    /// This is particularly useful for UI updates that need to be performed on the main thread,
    /// regardless of the calling thread context.
    /// 
    /// - Parameters:
    ///   - flags: Additional attributes to apply when executing the block. See DispatchWorkItemFlags for options
    ///   - work: The block containing the work to perform. This block has no return value and no parameters
    /// 
    /// - Example:
    ///   ```swift
    ///   // Safe to call from any thread
    ///   DispatchQueue.spk.syncMain {
    ///       // This will always execute on the main thread
    ///       self.updateUI()
    ///   }
    ///   ```
    /// 
    /// - Warning: Be cautious when calling this from the main thread with long-running operations,
    ///   as it will block the UI until completion.
    static func syncMain(flags: DispatchWorkItemFlags = [], execute work: @escaping @convention(block) () -> Void) {
        if isMain {
            work()
        } else {
            DispatchQueue.main.sync(flags: flags, execute: work)
        }
    }

    /// Executes a block on the main queue asynchronously, with intelligent thread-aware behavior.
    /// 
    /// This method provides safe asynchronous main queue execution:
    /// - **Already on Main Queue**: Executes the block immediately without queuing
    /// - **Background Queue**: Asynchronously dispatches to main queue without blocking current thread
    /// 
    /// This is ideal for UI updates that should happen on the main thread but don't need to block
    /// the current thread's execution.
    /// 
    /// - Parameters:
    ///   - group: The dispatch group to associate with the work item. Use nil if no group association is needed
    ///   - qos: The quality-of-service class for execution priority. See DispatchQoS for available options
    ///   - flags: Additional attributes to apply when executing the block. See DispatchWorkItemFlags for options
    ///   - work: The block containing the work to perform. This block has no return value and no parameters
    /// 
    /// - Example:
    ///   ```swift
    ///   // Safe to call from any thread - won't block
    ///   DispatchQueue.spk.asyncMain {
    ///       // This will execute on the main thread
    ///       self.updateLabel("Processing complete")
    ///   }
    ///   
    ///   // With custom QoS for high priority UI updates
    ///   DispatchQueue.spk.asyncMain(qos: .userInteractive) {
    ///       self.animateImportantChange()
    ///   }
    ///   ```
    static func asyncMain(group: DispatchGroup? = nil, qos: DispatchQoS = .unspecified, flags: DispatchWorkItemFlags = [], execute work: @escaping @convention(block) () -> Void) {
        if isMain {
            work()
        } else {
            DispatchQueue.main.async(group: group, qos: qos, flags: flags, execute: work)
        }
    }

    /// Determines whether the current execution context is on the main dispatch queue.
    /// 
    /// This property provides a reliable way to check if code is currently executing on the main queue
    /// by comparing the current queue's label with the main queue's label.
    /// 
    /// - Returns: `true` if currently executing on the main queue, `false` otherwise
    /// 
    /// - Example:
    ///   ```swift
    ///   if DispatchQueue.spk.isMain {
    ///       // Safe to update UI directly
    ///       updateUserInterface()
    ///   } else {
    ///       // Need to dispatch to main queue for UI updates
    ///       DispatchQueue.main.async {
    ///           updateUserInterface()
    ///       }
    ///   }
    ///   ```
    static var isMain: Bool {
        return currentLabel == DispatchQueue.main.label
    }
    
    /// Returns the label of the current dispatch queue.
    /// 
    /// This private property retrieves the label of the currently executing dispatch queue
    /// using the low-level `__dispatch_queue_get_label` function. It provides the foundation
    /// for queue identification and comparison operations.
    /// 
    /// - Returns: The label string of the current queue, or an empty string if unavailable
    private static var currentLabel: String {
        return String(validatingUTF8: __dispatch_queue_get_label(nil)) ?? ""
    }
    
}
