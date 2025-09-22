# Firebase Setup Instructions

## 🔥 Setting Up Firebase for Sleep Quest Authentication

To complete the authentication setup, you need to create a Firebase project and configure it:

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it "Sleep Quest" (or any name you prefer)
4. Enable Google Analytics (optional)

### Step 2: Enable Authentication
1. In your Firebase project, go to **Authentication**
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password** authentication
5. Save the changes

### Step 3: Create Firestore Database
1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select a location close to you
5. Click **Done**

### Step 4: Enable Storage (for profile pictures)
1. Go to **Storage**
2. Click **Get started**
3. Choose **Start in test mode**
4. Select the same location as Firestore

### Step 5: Get Your Configuration
1. Go to **Project Settings** (gear icon)
2. Scroll down to **Your apps**
3. Click **Web app** icon (</>)
4. Register app with nickname "Sleep Quest Web"
5. Copy the `firebaseConfig` object

### Step 6: Update Configuration File
Replace the placeholder config in `config/firebase.ts` with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "your-actual-app-id"
};
```

### Step 7: Set Up Firestore Security Rules (Optional)
For production, update Firestore rules to secure user data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Sleep entries belong to authenticated users
    match /sleepEntries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }

    // Friend requests
    match /friendRequests/{requestId} {
      allow read, write: if request.auth != null &&
        (request.auth.uid == resource.data.fromUserId ||
         request.auth.uid == resource.data.toUserId);
    }

    // Username reservations (read-only for availability checks)
    match /usernames/{username} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### Step 8: Test the Setup
1. Run your app: `npm start`
2. Try creating a new account
3. Test logging in/out
4. Create sleep entries
5. Test friend requests

## 🚀 Features Now Available

With authentication enabled, your Sleep Quest app now has:

✅ **User Accounts**: Secure signup/login with email and password
✅ **User Profiles**: Customizable usernames, display names, and avatars
✅ **Persistent Data**: Sleep entries saved to your account forever
✅ **Real Friends System**: Send friend requests and build your network
✅ **Privacy**: Your sleep data is private and secure
✅ **Cross-Device Sync**: Access your data from any device

## 📱 Testing on Different Platforms

- **Web**: Works immediately after setup
- **iOS/Android**: May need additional Expo configuration
- **Development**: Test mode allows easy account creation

## 🔒 Security Features

- ✅ Password-based authentication
- ✅ Secure session management
- ✅ User data isolation
- ✅ Request validation
- ✅ XSS protection

Your Sleep Quest app is now ready for real users! 🌙✨