// app.config.js
export default {
  expo: {
    name: "Pocket Doctor Asistente Médico AI",
    slug: "pocket-doctor",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",

    // ✅ Fixes the Linking warning in production builds
    scheme: "pocketdoctor",

    userInterfaceStyle: "light",
    newArchEnabled: true,

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.litox06.pocket-doctor",
    },

    android: {
      edgeToEdgeEnabled: true,
      usesCleartextTraffic: true,
      predictiveBackGestureEnabled: false,
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
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
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: { backgroundColor: "#000000" },
        },
      ],
      // ✅ Your fonts plugin merged here
      [
        "expo-font",
        {
          fonts: [
            "./node_modules/@expo-google-fonts/pridi/Pridi_400Regular.ttf",
            "./node_modules/@expo-google-fonts/pridi/Pridi_500Medium.ttf",
            "./node_modules/@expo-google-fonts/pridi/Pridi_700Bold.ttf",
          ],
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
  },
};
