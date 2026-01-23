# Deployment Guide

## 1. Backend Deployment (Render)

We have added a `Dockerfile` to the `backend/` folder. This file tells Render how to build your server.

### Steps:
1.  **Push your code to GitHub**: Ensure the `backend/Dockerfile` is committed and pushed to your repo.
2.  **Create account on Render.com**.
3.  Click **"New +"** -> **"Web Service"**.
4.  Connect your GitHub repository (`PocketDoctor`).
5.  **Root Directory**: Set this to `backend`.
    *   *Important*: Since your API is inside a subfolder, you must tell Render to look there.
6.  **Runtime**: Select **"Docker"**.
7.  **Instance Type**: Select **"Free"**.
8.  **Environment Variables**:
    *   Copy all variables from your `backend/.env` file into Render's "Environment" tab.
    *   e.g., `OPENAI_API_KEY`, `SUPABASE_URL`, etc.
9.  Click **"Create Web Service"**.
10. **Wait for deployment**: Once finished, Render will give you a URL (e.g., `https://pocket-doctor.onrender.com`). **Copy this URL.**

## 2. Connect Frontend to Backend

Before building the app, you must tell the frontend where the live server is.

1.  Open `frontend/pocket-doctor/.env`.
2.  Find `EXPO_PUBLIC_API_BASE_URL`.
3.  Replace the value with your Render URL:
    ```env
    EXPO_PUBLIC_API_BASE_URL=https://your-app-name.onrender.com
    ```
    *Note: Do not add a trailing slash `/`.*

## 3. Google Maps Configuration (Crucial for APK)

**This is the reason for the map crash.** You must configure Google Maps for the standalone Android app.

1.  **Go to Google Cloud Console**: [https://console.cloud.google.com/](https://console.cloud.google.com/)
2.  **Create a Project** (or select an existing one).
3.  **Enable SDK**:
    *   Go to "APIs & Services" -> "Library".
    *   Search for **"Maps SDK for Android"**.
    *   Click **Enable**.
4.  **Create API Key**:
    *   Go to "APIs & Services" -> "Credentials".
    *   Click **"Create Credentials"** -> **"API Key"**.
    *   **(Recommended) Restrict Key**: Click the pencil icon to edit the key. Under "API restrictions", select "Restrict key" and choose "Maps SDK for Android".
5.  **Copy the API Key**.
6.  **Add to `app.config.js`**:
    *   We will add it to the `android` section:
    ```javascript
    android: {
      package: "com.litox06.pocketdoctor",
      config: {
        googleMaps: {
          apiKey: "YOUR_API_KEY_HERE"
        }
      }
      // ... other settings
    }
    ```

## 4. APK Building (Expo EAS)

We have added `eas.json` to the `frontend/pocket-doctor/` folder.

### Steps:
1.  Open your terminal in `frontend/pocket-doctor`.
2.  Install EAS CLI (if not installed):
    ```bash
    npm install -g eas-cli
    ```
3.  Login to Expo:
    ```bash
    eas login
    ```
4.  Build the APK:
    ```bash
    eas build -p android --profile preview
    ```
5.  Wait for the build to finish. Expo will give you a link to download the `.apk` file.
