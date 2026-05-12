# Firebase Setup Guide for Kolom 15 Absensi

This guide will help you set up Firebase Realtime Database for the attendance tracking system.

## Prerequisites
- Google account
- Firebase project (create at https://firebase.google.com)

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `kolom15-absensi` (or your preferred name)
4. Follow the setup wizard and create the project

## Step 2: Set Up Realtime Database

1. In Firebase Console, go to **Realtime Database**
2. Click **Create Database**
3. Choose location (closest to your users)
4. Start in **Test Mode** for development (change to production rules later)
5. Copy the Database URL (looks like: `https://your-project.firebaseio.com`)

## Step 3: Get Firebase Config

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Click the web icon to create a web app if not already created
4. Copy the Firebase config object - you'll need these values for `NEXT_PUBLIC_*` environment variables

Example config:
```javascript
{
  "apiKey": "AIzaSy...",
  "authDomain": "kolom15-absensi.firebaseapp.com",
  "databaseURL": "https://kolom15-absensi.firebaseio.com",
  "projectId": "kolom15-absensi",
  "storageBucket": "kolom15-absensi.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "1:123456789:web:abc123def456"
}
```

## Step 4: Create Service Account (For Server-Side Access)

1. In Firebase Console, go to **Project Settings** > **Service Accounts**
2. Click **Generate New Private Key**
3. A JSON file will download - keep this secure!
4. Copy values from this JSON file for `FIREBASE_*` environment variables

## Step 5: Configure Environment Variables

1. Create `.env.local` file in your project root (copy from `.env.local.example`)
2. Fill in all the values from steps 3 and 4:

```bash
# From Firebase config (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# From Service Account JSON (Private - keep secret!)
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...your key...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-admin@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=your_client_cert_url
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

⚠️ **IMPORTANT**: Never commit `.env.local` to Git. It's already in `.gitignore`.

## Step 6: Set Up Firebase Security Rules

Replace the default rules with these in **Realtime Database > Rules**:

```json
{
  "rules": {
    "attendance": {
      ".read": true,
      ".write": true,
      ".indexOn": ["status"]
    }
  }
}
```

**For Production**, use stricter rules:
```json
{
  "rules": {
    "attendance": {
      ".read": "auth.uid !== null",
      ".write": "auth.uid !== null"
    }
  }
}
```

## Step 7: Install Dependencies

```bash
npm install
```

## Step 8: Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` - data will now be stored in Firebase!

## Verification

1. Open the app in your browser
2. Add some attendance records
3. Open Firebase Console > Realtime Database
4. You should see an `attendance` node with your data

## Troubleshooting

- **"Permission denied" errors**: Check your Firebase Rules in the console
- **"Cannot find module 'firebase-admin'"**: Run `npm install` again
- **Missing environment variables**: Verify `.env.local` has all required values
- **Data not syncing**: Check browser console (F12) for error messages

## Migrating Existing Data

If you have existing data from Vercel KV, you'll need to export it and import it into Firebase:

1. Export your data from Vercel KV
2. In Firebase Console, manually add it or use a script to upload it
3. The data structure should match what's in `attendance` node

## Production Deployment

When deploying to Vercel or other platforms:

1. Add all environment variables in your hosting provider's settings
2. Never expose private keys in your repository
3. Update Firebase Security Rules to production-level restrictions
4. Enable Firebase Authentication if needed for additional security
