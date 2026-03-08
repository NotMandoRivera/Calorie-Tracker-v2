# Calorie Tracker (v2)

Track daily meals, calories, and protein. Version 2 — cloned from [Calorie-Tracker-v1](https://github.com/notmandorivera/Calorie-Tracker-v1). Set a goal, log by meal type (breakfast, lunch, dinner, snacks), and view totals by date. Works on desktop and mobile; installable as an app.

## Features

- **Meal types**: Breakfast, lunch, dinner, snacks
- **Calories & protein**: Log calories and grams of protein per entry; see daily totals
- **Date & day of week**: Pick any date to view or edit that day’s entries
- **Last entry saved**: The last thing you added is remembered and pre-filled for quick repeat logging
- **Mobile-friendly**: Responsive layout, large touch targets, safe areas for notched devices
- **Installable (PWA)**: Add to home screen on phone or desktop for an app-like experience
- **App Store / Play Store**: The app can be wrapped with [Capacitor](https://capacitorjs.com/) and submitted to the iOS App Store and Google Play Store

## How to run

- **Local**: Open `index.html` in your browser (double-click or drag into Chrome/Edge/Firefox). For the service worker to work, use a local server (e.g. `npx serve .` or open from VS Code Live Server).
- **Install on phone**: Serve the folder over HTTPS (e.g. GitHub Pages, Netlify, or your own server). On Android: Chrome → menu → “Install app” or “Add to Home screen”. On iOS: Safari → Share → “Add to Home Screen”.

## Getting on the App Store / Play Store

This is a web app. To distribute it as a native app:

1. **Capacitor**: Use [Capacitor](https://capacitorjs.com/) to wrap the built web app in a native shell.
2. Build your site (e.g. copy `index.html`, `style.css`, `app.js`, `manifest.json`, `sw.js` into a build output).
3. Run `npx cap init`, add the web asset folder, then `npx cap add ios` and/or `npx cap add android`.
4. Open the native project in Xcode (iOS) or Android Studio (Android), then follow each store’s submission process.

You’ll need Apple and Google developer accounts and to meet each store’s guidelines.
