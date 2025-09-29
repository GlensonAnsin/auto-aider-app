export default {
  "expo": {
    "name": "Auto AIDER",
    "slug": "auto-aider-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "autoaiderapp",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "This app needs access to your location to show your position on the map."
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        }
      },
      "permissions": [
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.RECORD_AUDIO",
        "android.permission.RECEIVE_BOOT_COMPLETED",
        "android.permission.SCHEDULE_EXACT_ALARM"
      ],
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#000B58"
      },
      "edgeToEdgeEnabled": true,
      "package": "com.glensonansin.autoaiderapp",
      "softwareKeyboardLayoutMode": "pan",
      "googleServicesFile": "./google-services.json"
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash.png",
          "imageWidth": 180,
          "resizeMode": "contain",
          "backgroundColor": "#000B58"
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "The app accesses your photos."
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/images/icon.png",
          "color": "#ffffff",
          "defaultChannel": "default",
          "enableBackgroundRemoteNotifications": false
        }
      ],
      [
        "with-rn-bluetooth-classic",
        {
          "peripheralUsageDescription": "Allow myDevice to check bluetooth peripheral info",
          "alwaysUsageDescription": "Allow myDevice to always use bluetooth info",
          "protocols": [
            "com.myCompany.p1",
            "com.myCompany.p2"
          ]
        }
      ],
      "expo-web-browser"
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "router": {},
      "eas": {
        "projectId": process.env.EXPO_PUBLIC_EAS_PROJECT_ID
      },
      "apiKey": process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      "authDomain": process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      "projectId": process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      "storageBucket": process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      "messagingSenderId": process.env.EXPO_PUBLIC_FIREBASE_SENDER_ID,
      "appId": process.env.EXPO_PUBLIC_FIREBASE_APP_ID
    }
  }
}
