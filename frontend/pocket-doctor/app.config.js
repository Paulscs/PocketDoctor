// app.config.js
export default {
  expo: {
    name: "Pocket Doctor Asistente Médico AI",
    slug: "pocket-doctor",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/alogoBlue.png",

    // ✅ Fixes the Linking warning in production builds
    scheme: "pocketdoctor",

    userInterfaceStyle: "light",
    newArchEnabled: true,

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.litox06.pocket-doctor",
    },

    android: {
      package: "com.litox06.pocketdoctor",
      edgeToEdgeEnabled: true,
      usesCleartextTraffic: true,
      predictiveBackGestureEnabled: false,
      adaptiveIcon: {
        backgroundColor: "#ffffff",
        foregroundImage: "./assets/images/alogoBlue.png",
      },
      // (Optional) Let Android open your app via your scheme: pocketdoctor://
      intentFilters: [
        {
          action: "VIEW",
          data: [{ scheme: "pocketdoctor" }],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },

    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },

    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/logoWhite.png",

          backgroundColor: "#002D73",
        },
      ],
      "expo-web-browser",
      [
        "expo-location",
        {
          "locationWhenInUsePermission": "Necesitamos tu ubicación para mostrarte las clínicas y especialistas más cercanos a ti."
        }
      ]
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: false,
    },
    extra: {
      eas: {
        projectId: "2e198946-5c5c-48a5-bed0-d6273bd0bf43"
      }
    }
  },
};
