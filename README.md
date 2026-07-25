

### Option A — Expo Go / dev server (fastest)
   npm install
   npm start
   
   Then scan the QR code with the **Expo Go** app, or press:
   
   - `a` — open on an Android emulator/device
   - `i` — open on an iOS simulator
   - `w` — open in a web browser
   
   This is the loop you want for day-to-day UI work: save a file and it hot-reloads.

### Option B — Native development build
   Needed if you change anything native (dependencies, `app.json` plugins, icons, splash screen):
   npm run android   # builds and installs the app, then starts Metro
   
   The first run is slow (Gradle downloads its dependencies); later runs are much faster.

### Option C — Android emulator (a phone screen on your laptop)
   
   No physical phone needed — the emulator opens a virtual Android device in a window on your desktop.
   
   **1. Create the virtual device (one time only)**
   
   1. Open Android Studio.
      2. **Tools → Device Manager** (or the phone icon in the right sidebar).
      3. Click **`+` → Create Virtual Device**.
      4. Pick a phone under **Category: Phone** — **Pixel 7** or **Pixel 8** is a good default.
      5. Click **Next**, then choose a system image. Pick one with **API 36**, and prefer a row whose ABI is **x86_64** — ARM images are extremely slow on a Windows laptop. Click the **Download** arrow next to it if it isn't installed yet, and wait.
      6. **Next → Finish**.
   
   > If the emulator refuses to start or runs at a crawl, enable hardware acceleration: in **SDK Manager → SDK Tools**, install the **Intel x86 Emulator Accelerator (HAXM)** or, on newer machines, turn on **Windows Hypervisor Platform** in Windows Features and reboot.
   
   **2. Start the emulator**
   
   In **Device Manager**, press the **▶** button next to your device. A phone-shaped window opens on your desktop. Give it a minute on first boot.
   
   **3. Run the app on it**
   
   With the emulator already running, from the project root:
   
   ```bash
   npm start
   ```
   
   Then press **`a`** in the terminal. Expo installs the app onto the emulator and opens it.
   
   Or skip the key press and go straight there:
   
   ```bash
   npm run android
   ```
   
   **Handy emulator controls**
   
   - Drag with the mouse = swipe; click = tap.
   - `Ctrl` + `M` opens the React Native dev menu (reload, inspector, performance monitor).
   - The **`⋮`** button on the emulator's side toolbar opens extended controls — rotate, change screen size, simulate location.
   - To rotate: `Ctrl` + `←` / `Ctrl` + `→`.
   
   > Prefer not to install Android Studio at all? `npm run web` opens the app in your browser instead. It's the quickest look at the UI, but it's not a real phone — layout, fonts, and gestures can differ from Android.

### Other commands

npm run ios     # iOS — requires macOS + Xcode
npm run web     # run in the browser
npm run lint    # ESLint

---

## Building for Android in Android Studio (step by step)
   
   ### 1. Generate the native Android project
   
   From the project root:
   
   ```bash
   npx expo prebuild --platform android --clean
   ```
   
   This creates the `android/` folder from `app.json`. Re-run it whenever you change the app name, icon, splash screen, package name, or add/remove a native dependency. `--clean` deletes and regenerates the folder, so **don't hand-edit files inside `android/`** — your changes will be wiped.
   
   ### 2. Open the project in Android Studio
   
   1. Launch Android Studio → **Open**.
      2. Select the **`android`** folder inside the project (⚠️ not the project root — pointing at the root will not import as a Gradle project).
      3. Click **OK** and wait for the initial Gradle sync to finish. The status bar at the bottom shows the progress.
   
   ### 3. Point Android Studio at the correct JDK
   
   1. **File → Settings → Build, Execution, Deployment → Build Tools → Gradle** (on macOS: **Android Studio → Settings**).
      2. Set **Gradle JDK** to the bundled **jbr-17** / **Embedded JDK**.
      3. Click **Apply**, then **File → Sync Project with Gradle Files**.
   
   ### 4. Install the required SDK
   
   1. **Tools → SDK Manager → SDK Platforms** → check **Android API 36**.
      2. Switch to **SDK Tools** → check **Android SDK Build-Tools**, **Android SDK Platform-Tools**, and **Android Emulator**.
      3. **Apply** to download.
   
   ### 5. Run a debug build on a device or emulator
   
   1. Create a virtual device via **Tools → Device Manager → Add a new device**, or plug in a physical phone with **USB debugging** enabled.
      2. Pick the device in the toolbar dropdown.
      3. In a terminal, start the JS bundler so the app has something to load:
         ```bash
         npx expo start
         ```
      4. Press the green **Run ▶** button in Android Studio.
   
   ### 6. Build a release APK (for sharing / sideloading)
   
   In Android Studio: **Build → Generate App Bundles or APKs → Generate APKs**.
   
   Or from the terminal:
   
   ```bash
   cd android
   ./gradlew assembleRelease        # Windows: .\gradlew.bat assembleRelease
   ```
   
   Output: `android/app/build/outputs/apk/release/app-release.apk`
   
   ### 7. Build a release AAB (for the Play Store)
   
   ```bash
   cd android
   ./gradlew bundleRelease          # Windows: .\gradlew.bat bundleRelease
   ```
   
   Output: `android/app/build/outputs/bundle/release/app-release.aab`
   
   ### 8. Sign the release properly
   
   > **Important:** out of the box, Expo's generated project signs release builds with the **debug keystore**. That is fine for testing on your own device, but the Play Store will reject it. Generate your own keystore before publishing.
   
   1. Create a keystore (keep it safe and backed up — losing it means you can't update the app):
      ```bash
      keytool -genkey -v -keystore imposter-release.keystore -alias imposter -keyalg RSA -keysize 2048 -validity 10000
      ```
      2. Put the file in `android/app/`.
      3. Add the credentials to `android/gradle.properties` (this file is regenerated by `prebuild`, so keep a copy of these lines somewhere):
         ```properties
         MYAPP_RELEASE_STORE_FILE=imposter-release.keystore
         MYAPP_RELEASE_KEY_ALIAS=imposter
         MYAPP_RELEASE_STORE_PASSWORD=*****
         MYAPP_RELEASE_KEY_PASSWORD=*****
         ```
      4. In `android/app/build.gradle`, add a `release` block under `signingConfigs` and point the `release` build type at it:
         ```gradle
         signingConfigs {
             release {
                 storeFile file(MYAPP_RELEASE_STORE_FILE)
                 storePassword MYAPP_RELEASE_STORE_PASSWORD
                 keyAlias MYAPP_RELEASE_KEY_ALIAS
                 keyPassword MYAPP_RELEASE_KEY_PASSWORD
             }
         }
         buildTypes {
             release {
                 signingConfig signingConfigs.release
                 ...
             }
         }
         ```
      5. Rebuild with `./gradlew bundleRelease`.
   
   ---
