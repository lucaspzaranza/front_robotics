# BotBot Front Robotics

<div align="center">
  <img src="public/botbot-logo.png" alt="BotBot Logo" width="250px">
</div>

A modern web-based control interface for robot teleoperation and monitoring. This Next.js application provides a comprehensive dashboard for controlling robots, viewing camera feeds, visualizing 3D models, and monitoring sensor data in real-time using ROS2 (Robot Operating System).

## Features

- **Robot Teleoperation**: Control your robot with intuitive joystick controls or gamepad integration
- **Real-time Data Visualization**: Monitor robot sensors, battery status, and performance metrics
- **3D Robot Visualization**: View and interact with a 3D model of your robot
- **Camera Feeds**: View multiple camera streams from your robot
- **Map View**: Navigate using interactive maps and location tracking
- **Chat Interface**: Communicate with the robot or other operators
- **Responsive Design**: Fully functional on both desktop and mobile devices
- **Authentication**: Secure login system with NextAuth.js
- **Settings Management**: Configure robot and user preferences
- **Dark/Light Mode**: Customizable UI color theme
- **Bilingual Support**: English and Portuguese language options
- **Fallback Simulation**: Built-in robot simulation when not connected to a physical robot
- **Automatic Reconnection**: Robust connection handling with automatic retry mechanisms
- **Multiple Input Methods**: Support for touchscreen, keyboard, mouse, and gamepad controls

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- A ROS2-enabled robot (Robot Operating System)
- ROS WebSocket connection for real-time communication
- Modern web browser with WebSocket and WebGL support

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/front_robotics.git
cd front_robotics
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:
   Create a `.env.local` file with your configuration settings:

```
# Authentication settings
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_COOKIE_SECURE=false  # Set to true in production with HTTPS

# Robot settings
DEFAULT_ROBOT_IP=192.168.2.109
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Architecture Overview

BotBot Front Robotics follows a modern React architecture with context-based state management and custom hooks for business logic separation.

### Key Architectural Patterns

- **Context API**: Global state management using React's Context API
- **Custom Hooks**: Encapsulated business logic and ROS communication
- **Component Composition**: Modular UI components with clear responsibility separation
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **ROS Bridge**: WebSocket communication with ROS2 using roslib
- **Fallback Simulation**: In-browser ROS2 simulation when not connected to a physical robot

## Project Structure

- `src/app`: Main application pages and layouts
  - `robot-home`: Dashboard for robot monitoring and control
  - `charts`: Data visualization dashboards
  - `api`: Backend API endpoints for authentication and data handling
    - `auth/[...nextauth]`: NextAuth.js implementation with credentials provider
- `src/components`: Reusable UI components
  - `ui`: Base UI components used throughout the application
  - `robot-controls.tsx`: Control interface for robot movement
  - `robot-cams.tsx`: Camera feed displays
  - `robot-data.tsx`: Sensor data visualization
  - `robot-3d-viewer.tsx`: 3D visualization of robot model
  - `map-view.tsx`: Interactive map for navigation
  - `chat.tsx`: Text communication interface
  - `chat-header.tsx`: Chat interface header with controls
  - `robot-header.tsx`: Main navigation and status display
  - `sidebar.tsx`: Collapsible sidebar with tools and settings
  - `robot-connection-popup.tsx`: Connection management dialog
  - `user-profile-popup.tsx`: User settings and profile management
  - `chart-card.tsx`: Data visualization components
- `src/hooks`: Custom React hooks for ROS integration and state management
  - `useGamepadInput.tsx`: Hook for gamepad control integration
  - `useJoystickMove.tsx`: Hook for touch/mouse joystick controls
  - `useKeyboardInput.tsx`: Hook for keyboard navigation controls
  - `ros/`: Directory containing specialized ROS hooks
    - `useRobotVelocity.tsx`: Hook for publishing velocity commands
    - `useRobotVelocityPublisher.tsx`: Hook for velocity command publishing
    - `useRobotBatteryState.tsx`: Hook for monitoring battery levels
    - `useRobotSpeed.tsx`: Hook for speed control and adjustment
    - `useRobotTemperature.tsx`: Hook for monitoring temperature sensors
    - `useRobotActionDispatcher.tsx`: Hook for dispatching robot actions
    - `useRobotActionButtons.tsx`: Hook for robot action button controls
    - `useOdometry.tsx`: Hook for tracking robot position
    - `useChartData.tsx`: Hook for chart data processing
    - `useJointState.tsx`: Hook for monitoring robot joint states
    - `useLaserScan.tsx`: Hook for processing laser scan data
    - `useRobotCamera.tsx`: Hook for receiving camera feeds
- `src/contexts`: React contexts for global state management
  - `RobotConnectionContext.tsx`: Manages robot connection state with auto-reconnect
  - `ThemeContext.tsx`: Manages UI theme preferences (dark/light mode)
  - `AuthContext.tsx`: Manages user authentication state
  - `LanguageContext.tsx`: Manages language selection (English/Portuguese)
  - `NotificationsContext.tsx`: Manages system notifications
  - `HeaderContext.tsx`: Manages header UI state
- `src/utils`: Utility functions and helpers
  - `translations/`: Language files for internationalization
    - `en.ts`: English translations
    - `pt.ts`: Portuguese translations
    - `index.ts`: Translation type definitions and exports
  - `ros/`: ROS-specific utilities
    - `topics-and-services.tsx`: Factory classes for ROS topics and services
    - `ros2-simulation.ts`: In-browser simulation for development/testing
    - `ros2-simulator-provider.tsx`: React provider for the simulator
    - `messages.tsx`: ROS message type definitions and helpers
    - `roslib-utils.tsx`: Utility functions for roslib
  - `clamp.tsx`: Number range limiting utility
  - `cn.tsx`: Class name utilities for styling
  - `toggle-fullscreen.tsx`: Fullscreen mode utilities
- `src/types`: TypeScript type definitions
  - `StickType.ts`: Type for joystick input
  - `MoveKeyType.ts`: Type for keyboard movement keys
  - `ActionType.ts`: Type for robot actions
  - `ros3d.d.ts`: Type definitions for ROS3D library
  - `next-auth.d.ts`: Type extensions for NextAuth
  - `global.d.ts`: Global type definitions

## ROS Topic Structure

BotBot Front Robotics uses a standardized topic structure for communicating with the robot:

### Main ROS Topics

- `/cmd_vel_joy`: Velocity commands from gamepad/keyboard
- `/cmd_vel_nipple`: Velocity commands from on-screen joystick
- `/temperature`: Temperature sensor data
- `/battery`: Battery state information
- `/scan`: Laser scan data for obstacle detection
- `/odom`: Odometry data for position tracking
- `/joint_states`: Robot joint position data
- `/compressed_camera`: Camera feed with compression
- `/lf/sportmodestate`: Sport mode state information

### Message Types

- `geometry_msgs/Twist`: For velocity commands
- `sensor_msgs/LaserScan`: For laser scan data
- `sensor_msgs/Temperature`: For temperature readings
- `sensor_msgs/BatteryState`: For battery information
- `nav_msgs/Odometry`: For position and movement data
- `sensor_msgs/JointState`: For robot joint positions
- `sensor_msgs/CompressedImage`: For camera imagery

## Key Components

- `robot-controls`: Joystick and button controls for robot teleoperation

  - Virtual joystick for touchscreen movement control
  - Keyboard controls for desktop navigation (WASD, arrow keys)
  - Gamepad integration with analog stick support
  - Emergency stop button for safety
  - Speed adjustment controls
  - Robot-specific command buttons

- `robot-cams`: Camera feed display from robot sensors

  - Support for multiple camera streams
  - Toggle between different camera views
  - Resize and reposition camera feeds
  - Camera parameter adjustments
  - Low-latency streaming optimization

- `robot-data`: Dashboard for robot status and sensor data visualization

  - Real-time sensor data display (temperature, battery)
  - Custom gauge components for critical metrics
  - Historical data trending with interactive charts
  - System health indicators and alerts
  - Network connection quality indicators

- `robot-3d-viewer`: Interactive 3D visualization of the robot

  - Real-time robot model visualization based on URDF
  - Environment mapping and obstacle visualization
  - Interactive viewpoint control
  - Joint state visualization

- `map-view`: Interactive map for navigation and position tracking

  - Real-time robot position on map
  - Path planning visualization
  - Map layer controls and filtering

- `chat`: Messaging interface for robot interaction

  - Text-based communication with robot AI
  - Command history and suggestions
  - Status updates and notifications
  - Multi-language support (English/Portuguese)

- `robot-header`: Main navigation and status display

  - Connection status indicator with detailed diagnostics
  - Battery level monitoring
  - Quick access to key functions and emergency controls
  - User profile and settings access

- `sidebar`: Collapsible sidebar for additional tools and settings
  - Tool selection for specialized functions
  - Quick access to frequently used features
  - Customizable shortcut buttons
  - Collapsible design to maximize workspace

## Connection Management

The application includes sophisticated connection management through the `RobotConnectionContext`:

- **Auto-reconnect**: Automatically reconnects after connection loss with exponential backoff
- **Connection Status Monitoring**: Tracks and displays connection state (idle, connecting, connected, error)
- **Fallback Simulation**: Automatically switches to simulation mode when disconnected
- **Keep-alive Mechanism**: Sends periodic pings to prevent connection timeout
- **Error Recovery**: Graceful error handling with detailed error messages
- **Connection Persistence**: Stores and retrieves connection settings

## Authentication

BotBot Front Robotics uses NextAuth.js for authentication:

- **Credentials Provider**: Username/password authentication
- **JWT Sessions**: Secure session management with JSON Web Tokens
- **Persistent Sessions**: Sessions maintained across page reloads
- **Customized Login Page**: Branded login experience
- **Session Management**: 30-day session duration with secure cookies

## Internationalization

The application supports multiple languages through a custom internationalization system:

- **Language Selection**: Toggle between English and Portuguese
- **Translation Objects**: Structured translation data in separate files
- **Component-level Translations**: Each component accesses translations via the LanguageContext
- **Typesafe Translations**: TypeScript ensures translation key validity
- **Language Persistence**: User language preference is saved

## Technologies

### Frontend Framework

- **Next.js 15.2**: React framework for production-grade applications
- **React 19**: Library for building user interfaces
- **TypeScript**: Typed JavaScript for better code quality

### Robot Communication

- **ROS2 (Robot Operating System)**: Industry standard robot software framework
- **roslib**: JavaScript library for ROS WebSocket communication
- **ros3d**: 3D visualization library for ROS data

### Visualization Libraries

- **Three.js**: 3D visualization library
- **URDF-loader**: Universal Robot Description Format loader
- **ApexCharts**: Interactive chart components for sensor data
- **Recharts**: Composable charting library
- **Leaflet**: Interactive maps for robot navigation

### UI Components

- **Tailwind CSS**: Utility-first CSS framework for styling
- **Tailwind Merge**: Utility for merging Tailwind classes
- **clsx**: Utility for constructing className strings
- **Framer Motion**: Animation library for React
- **Lucide React**: Icon library for interface elements
- **Radix UI**: Unstyled, accessible UI components

### Input Handling

- **nipplejs**: Virtual joystick library for touch interaction
- **Gamepad API**: Browser API for gamepad integration
- **Keyboard Events**: For WASD and arrow key controls

### Authentication

- **NextAuth.js**: Authentication framework for Next.js

### Development Tools

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking

## Performance Optimizations

- **Code Splitting**: Dynamic imports for better load times
- **Memoization**: Prevents unnecessary re-renders with useCallback and useMemo
- **Optimized Asset Loading**: Images and 3D models optimized for web
- **WebGL Acceleration**: Hardware acceleration for 3D visualization
- **Efficient State Management**: Context selectors to prevent unnecessary updates
- **Debouncing**: Control commands are debounced to prevent flooding
- **Connection Management**: Intelligent reconnection with exponential backoff

## License

**CLOSED SOURCE**

This software is proprietary and confidential. Unauthorized copying, distribution, modification,
public display, or public performance of this software is strictly prohibited. All rights reserved.
