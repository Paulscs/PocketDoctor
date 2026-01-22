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

## 3. APK Building (Expo EAS)

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
