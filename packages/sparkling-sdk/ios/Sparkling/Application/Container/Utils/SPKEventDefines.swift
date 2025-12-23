// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import Foundation

/// Defines event constants and keys used throughout the SPKKit framework.
/// 
/// `SPKEvent` provides a centralized collection of event names, action types,
/// and parameter keys used for inter-component communication within the framework.
/// This includes container events, navigation events, theme changes, and common
/// parameter keys used across different event types.
/// 
/// The enum is organized into logical groups using nested enums to provide
/// clear categorization and avoid naming conflicts.
public enum SPKEvent {
    
    // MARK: - Container Event
    
    /// Event name fired when the container mask is tapped.
    /// 
    /// This event is typically used to handle user interactions with overlay
    /// or background areas of container views.
    static let containerTaskDidTap = "containerMaskTapped"
    
    // MARK: - Back Events
    
    /// Contains event names and parameter keys related to back navigation actions.
    enum Back {
        /// Event name for standard page back navigation.
        static let pageBack = "sparkPageBackEvent"
        
        /// Event name for final back navigation that closes the container.
        static let finishBack = "pageFinishBackEvent"
        
        /// Parameter key indicating the source of the back action.
        static let actionFromKey = "actionFrom"
        
        /// Action type value for navigation bar back button press.
        static let actionTypeNavBarBackPress = "navBarBackPress"
        
        /// Action type value for swipe gesture back navigation.
        static let actionTypeSwipe = "swipe"
    }

    // MARK: - Common Keys
    
    /// Contains commonly used parameter keys across different event types.
    /// 
    /// This enum provides standardized key names for parameters that are
    /// frequently used across multiple event types within the framework.
    enum Common {
        /// Parameter key for container identifier in event data.
        /// 
        /// This key is used to identify which container instance
        /// an event is associated with.
        static let containerIdKey = "containerId"
    }

    // MARK: - Theme Event
    
    /// Contains event names and parameter keys related to theme changes.
    enum Theme {
        /// Event name fired when the application theme changes.
        static let changed = "onThemeChanged"
        
        /// Parameter key for theme value in theme change events.
        static let valueKey = "theme"
        
        /// Theme value indicating light mode.
        static let valueLight = "light"
        
        /// Theme value indicating dark mode.
        static let valueDark = "dark"
    }
}
