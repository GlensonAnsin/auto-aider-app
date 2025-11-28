# Auto AIDER - Vehicle Diagnostic Mobile App

Auto AIDER is a React Native mobile application that connects to vehicles via Bluetooth Low Energy (BLE) OBD2 adapters to read diagnostic trouble codes (DTCs) and provide real-time code interpretation powered by Google Gemini AI.

## Technology Stack

### Core Framework
- **React Native**: 0.79.5
- **Expo**: 53.0.0 with Expo Router 5.1.2
- **React**: 19.0.0
- **TypeScript**: 5.8.3
- **Navigation**: React Navigation 7.x with Expo Router (file-based routing)

### State Management
- **Redux Toolkit**: 2.8.2 with Redux Persist for offline state

### Platform-Specific
- **Android SDK**: Level 35 (target), 24+ (minimum)
- **Build System**: Gradle 8.13, Kotlin 2.0.21, NDK 26.2.11394342
- **JS Engine**: JSC (Hermes disabled due to architecture compatibility)
- **New Architecture**: Currently disabled (newArchEnabled=false) - see Known Issues

### BLE & OBD2 Communication
- **react-native-ble-plx**: 3.5.0 - Core BLE communication library
- **OBD2 Protocol**: ISO 15765-2 Mode 03 (Read DTC)
- **Supported Adapters**: Any Bluetooth LE OBD2 adapter (ELM327 clones, VEEPEAK, etc.)

### Backend & Services
- **Firebase**: Authentication, Cloud Messaging, Analytics (v23.4.0)
- **REST API**: Custom backend for user data, shop management, diagnostic history
- **Socket.io**: Real-time updates for chat and notifications
- **Google Gemini AI**: Code interpretation and technical descriptions

### Additional Libraries
- **Axios**: HTTP client for API calls
- **dayjs**: Date/time manipulation
- **Lottie**: JSON animation rendering
- **Google Maps**: Location services and shop discovery
- **expo-dev-client**: 5.2.4 (development only)

## Project Structure

```
app/                          # Main app source code (file-based routing)
├── _layout.tsx              # Root layout with auth navigation
├── index.tsx                # Entry point
├── auth/
│   ├── login.tsx
│   ├── signup.tsx
│   └── forgot-pass.tsx
├── car-owner/               # Car owner role screens
│   ├── _layout.tsx
│   ├── (screens)/           # Individual screens
│   ├── (tabs)/              # Bottom tab screens
│   └── run-diagnostics/     # BLE device discovery & DTC reading
├── repair-shop/             # Repair shop role screens
│   ├── _layout.tsx
│   ├── (screens)/
│   └── (tabs)/
├── chat-room/
└── error/

components/                   # Reusable UI components
├── Header.tsx
├── TabBar.tsx
├── Loading.tsx
├── NetworkProvider.tsx       # Network status context
├── PrivacyPolicyComp.tsx
├── TermsOfServiceComp.tsx
└── withNetworkCheck.tsx      # HOC for offline functionality

hooks/                        # Custom React hooks
├── useNetworkStatus.ts       # Monitor online/offline
└── useBackRoute.ts           # Handle back navigation

redux/                        # Redux store and slices
├── store.ts
└── slices/
    ├── deviceSlice.ts        # Connected OBD2 device state
    ├── scanSlice.ts          # DTC scan results
    ├── vehicleDiagIDSlice.ts # Diagnostic history
    └── [other slices]

services/                     # API & external services
├── backendApi.ts            # REST API calls
├── geminiApi.ts             # Gemini AI integration
├── socket.ts                # Socket.io client
├── notifications.ts         # Push notification handlers
├── interceptor.ts           # Axios interceptor for auth
└── tokenStorage.ts          # Secure token management

types/                        # TypeScript type definitions
├── user.ts
├── vehicle.ts
├── vehicleDiagnostic.ts
├── mechanicRequest.ts
└── autoRepairShop.ts

config/                       # Configuration files
docs/                         # Documentation
assets/                       # Images, fonts, sounds, animations

android/                      # Native Android code
├── app/
│   ├── src/main/AndroidManifest.xml  # Permissions & activities
│   └── src/main/res/values/styles.xml # Themes
└── gradle.properties         # Build configuration
```

## Key Features

### 1. OBD2 Device Discovery & Connection
- **File**: `app/car-owner/(screens)/run-diagnostics/run-diagnostics.tsx`
- Scans for Bluetooth LE OBD2 adapters
- Supports device names: OBD, ELM, VEEPEAK, and derivatives
- Establishes BLE connection and discovers service characteristics
- Initializes adapter with AT commands (ATZ, ATE0, ATS0, ATH0)

### 2. Diagnostic Trouble Code (DTC) Reading
- **Protocol**: OBD2 Mode 03 (Read DTC)
- **Commands**: 
  - `03` - Standard DTC read command
  - `0300` - Fallback format for compatibility
- **Timeout**: 10 seconds (fallback 8 seconds)
- **Response**: Hex-encoded codes with format PXYZZ (P=category, X=system, Y=problem, Z=condition)

### 3. Code Interpretation
- **AI Service**: Google Gemini API
- **For Each Code**: Returns technical description, meaning, common causes, typical repairs
- **User Display**: Card-based UI showing code details and repair suggestions

### 4. Bluetooth Permission Handling (Android 12+)
- **Manifest Declaration**: Added `usesPermissionFlags="neverForLocation"` to prevent location-based permission routing
- **Permission Flow**:
  1. Request BLUETOOTH_SCAN (Bluetooth discovery)
  2. Request BLUETOOTH_CONNECT (Bluetooth connection)
  3. Request ACCESS_FINE_LOCATION (for reliable permission grant)
- **Sequential Request**: Permissions requested one-by-one, not batched

## Build & Deployment

### Development Build
```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Connect device or emulator and press 'a' for Android
```

### Release Build (Production APK)
```bash
# Build unsigned release APK
cd android
./gradlew assembleRelease
cd ..

# APK location: android/app/build/outputs/apk/release/app-release-unsigned.apk

# OR use Expo to build signed APK
eas build --platform android --profile release
```

### Configuration Files
- **metro.config.js**: Metro bundler config (CommonJS format, SVG transformer enabled)
- **eslint.config.js**: ESLint v9 flat config format
- **tsconfig.json**: TypeScript configuration with strict mode
- **app.config.js**: Expo app configuration (plugins, permissions, etc.)

## Android Permissions

**Required Permissions**:
- `BLUETOOTH_SCAN` - Discover OBD2 adapters
- `BLUETOOTH_CONNECT` - Connect to discovered devices
- `ACCESS_FINE_LOCATION` - Location access (required for Bluetooth on some Android versions)
- `INTERNET` - Backend API communication
- `MODIFY_AUDIO_SETTINGS` - Audio-related features
- `RECORD_AUDIO` - Audio recording if applicable

**Optional Permissions**:
- `ACCESS_BACKGROUND_LOCATION` - Background location (currently not used)
- `SCHEDULE_EXACT_ALARM` - Precise alarms

## Redux State Management

### Key Slices
- **deviceSlice**: Connected OBD2 device info (name, UUID, characteristic UUIDs)
- **scanSlice**: Latest DTC scan results and status
- **vehicleDiagIDSlice**: Historical diagnostic records
- **vehicleDiagIDArrSlice**: Array of diagnostic sessions
- **senderReceiverSlice**: Chat message participants
- **tabBarSlice**: Active tab state
- **roleSlice**: User role (car-owner, repair-shop)

## OBD2 Communication Flow

```
1. discoverDevices()
   └─ Scan for BLE devices (20s timeout, filter by name)
   
2. connectToDevice(device)
   └─ Establish BLE connection
   └─ Discover services & characteristics
   └─ Initialize with AT commands
   
3. readCodes()
   └─ sendCommand('03', 10s)
   └─ If no response: sendCommand('0300', 8s)
   
4. parseDTCResponse(raw)
   └─ Validate response format ('43' header)
   └─ Extract count byte
   └─ Parse hex DTC values
   └─ Return array of decoded codes
   
5. decodeDTC(hex)
   └─ Convert 4-char hex to PXYZZ format
   └─ Return standardized DTC code
   
6. handleCodeInterpretation(codes[])
   └─ Send each code to Gemini API
   └─ Display interpretation to user
```

## Known Issues & Limitations

### 1. New Architecture Disabled
- **Status**: `newArchEnabled=false` in `android/gradle.properties`
- **Reason**: expo-dev-menu-interface v1.8.4 incompatible with React Native 0.79.5 bridgeless architecture
- **Error**: Kotlin compilation fails with unresolved references to ReactFeatureFlags properties
- **Impact**: Performance optimization not available; app works on JSC engine
- **Solution**: Upgrade to newer Expo or downgrade React Native (pending investigation)

### 2. OBD2 Code Reading Not Reliable
- **Status**: Sometimes returns "No codes detected" on vehicles with active check engine light
- **Possible Causes**:
  - Different OBD2 adapter dialect/protocol variant
  - Insufficient adapter initialization sequence
  - Timing issues specific to release builds
  - Adapter not returning data in expected format
- **Debug Steps**:
  1. Build and install release APK
  2. Connect real vehicle with OBD2 adapter
  3. Run: `adb logcat | Select-String "ReactNativeJS"` (Windows PowerShell)
  4. Tap "Discover Devices" and "Scan"
  5. Check console output for raw adapter response
  6. Share logs showing exact response format
- **Workaround**: Comprehensive logging added to `parseDTCResponse()` for debugging

### 3. Hermes JS Engine Disabled
- **Status**: JSC only (hermesEnabled=false)
- **Reason**: Hermes incompatible with new architecture disabled state in build system
- **Impact**: Slightly larger app size, slower startup
- **Solution**: Re-enable once new architecture stabilized

## Debugging & Console Logs

### BLE Communication Logs
Add this to terminal to monitor all BLE operations:
```bash
adb logcat | Select-String "ReactNativeJS" | Select-String "BLE|DTC|Command|Parse"
```

### Key Log Points
- `=== Starting device discovery ===` - Scan started
- `=== Found device: [name] ===` - Device discovered
- `Sending command: [cmd]` - OBD2 command sent
- `Response received: [hex]` - Raw adapter response
- `Raw response: "[data]"` - Before parsing
- `After cleanup: "[data]"` - Whitespace removed
- `Extracted DTCs: [codes]` - Successfully parsed codes
- `ERROR: Failed to parse response` - Parsing failed

## Performance Optimization

- **BLE Polling**: 100ms lock, 200ms response (reduced from 20/50ms for release stability)
- **Command Timeout**: 5s default, 10s for DTC read (increased for adapter latency)
- **Redux Persist**: Offline state preservation
- **Network Monitoring**: Graceful degradation when offline
- **Image Optimization**: Lottie animations for smooth performance

## Setup Instructions for Development

1. **Install Node.js**: v18+ required
2. **Install Android Studio**: For SDK, emulator, build tools
3. **Clone & Install**:
   ```bash
   npm install
   ```
4. **Configure Environment**:
   - Create `.env` with backend API URL
   - Add Firebase configuration
   - Configure Gemini API key
5. **Run Development**:
   ```bash
   npx expo start
   ```
6. **Test on Device**:
   - Install Expo Go or development build
   - Scan QR code from terminal
   - Test Bluetooth permissions on Android 12+

## Contributing

- Follow TypeScript strict mode
- Add console.log statements for debugging (removed in production builds)
- Test on real Android device before merging
- Update Redux slices for state changes
- Add types for all API responses

## Troubleshooting

### Bluetooth Permission Not Showing
- Ensure `android:usesPermissionFlags="neverForLocation"` in AndroidManifest.xml
- Clear app cache: `adb shell pm clear [package.name]`
- Test on Android 12+ device

### OBD2 Adapter Not Found
- Ensure adapter is powered on and in pairing mode
- Check adapter battery
- Verify vehicle is on (some adapters require vehicle power)
- Confirm adapter Bluetooth name matches filter (OBD, ELM, VEEPEAK)

### App Crashes on DTC Read
- Check logcat for exceptions in `parseDTCResponse()`
- Verify adapter responds with expected format
- Check timeout values (may need increase for slower adapters)

### Build Fails
```bash
# Clean build artifacts
cd android
./gradlew clean
cd ..

# Rebuild
cd android
./gradlew assembleRelease
```

## Support & Resources

- **Firebase Console**: Monitor authentication, analytics, messaging
- **Google Gemini API**: Documentation at ai.google.dev
- **OBD2 Protocol**: ISO 15765-2 specification
- **React Native BLE**: https://github.com/dotintent/react-native-ble-plx
