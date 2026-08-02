# Connecting the real database (Firebase) — step by step

You don't need to know anything technical for this — just follow along
and click where it says to click. Takes about 5 minutes.

## 1. Create a free Firebase project

1. Go to https://console.firebase.google.com
2. Sign in with any Google account.
3. Click **"Add project"** (or "Create a project").
4. Give it a name — e.g. `libas-e-nazar` — click Continue.
5. You can turn off Google Analytics for this project (not needed) — click
   Create project, then wait ~30 seconds and click Continue.

## 2. Register a "Web app" inside that project

1. On the project's home screen, click the **`</>`** (web) icon to add a
   web app.
2. Give it a nickname (anything, e.g. `libas-e-nazar-web`). You don't need
   to check "Also set up Firebase Hosting."
3. Click **Register app**.
4. You'll now see a code block that starts with `const firebaseConfig = {`
   — **keep this tab open**, you'll copy values from it in step 4.

## 3. Turn on Authentication (for Login/Signup)

1. In the left sidebar, click **Build → Authentication**.
2. Click **Get started**.
3. Click **Email/Password** in the list of sign-in providers.
4. Toggle it **Enabled**, click **Save**.

## 4. Turn on Firestore (the actual database)

1. In the left sidebar, click **Build → Firestore Database**.
2. Click **Create database**.
3. Choose **Start in production mode** → Next.
4. Pick any location close to you → **Enable**.
5. Once it's created, click the **Rules** tab at the top.
6. Delete what's there and paste in the contents of the
   `firestore.rules.example` file (in this same folder) instead.
7. Click **Publish**.

## 5. Copy your config values into the project

1. Go back to the tab from step 2 (or: gear icon ⚙️ next to "Project
   Overview" → **Project settings** → scroll to "Your apps" → click the
   web app).
2. You'll see something like this:
   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "libas-e-nazar.firebaseapp.com",
     projectId: "libas-e-nazar",
     storageBucket: "libas-e-nazar.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123",
   };
   ```
3. In your project folder, copy `.env.example` and rename the copy to
   `.env` (just `.env`, nothing else).
4. Open `.env` and fill in each line using the matching value from above:
   ```
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=libas-e-nazar.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=libas-e-nazar
   VITE_FIREBASE_STORAGE_BUCKET=libas-e-nazar.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```
5. Save the file.

## 6. Run it

```
npm install
npm run dev
```

Try signing up for an account on the site. Then go back to the Firebase
Console → **Authentication** tab — you should see your new user listed
there. Place a test order → check **Firestore Database → Data** tab →
you should see an `orders` collection with your order in it, and an
`authHistory` collection logging the signup/login.

That's it — that's the real database, live.

## If something's not working

- **"Firebase config is missing" warning in the browser console** → your
  `.env` file isn't filled in correctly, or you're still running the dev
  server from before you created `.env` (restart it: stop with Ctrl+C,
  run `npm run dev` again — Vite only reads `.env` on startup).
- **"Missing or insufficient permissions" error** → the Firestore rules
  from step 4.6 weren't published, or Authentication isn't enabled.
- Anything else — send me the exact error message and I'll help sort it
  out.
