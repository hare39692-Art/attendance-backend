# 📱 ATTENDANCE NOTIFICATIONS - SETUP GUIDE

## ❌ Current Issue
Firebase Admin SDK initialization fails because `FIREBASE_PROJECT_ID` is missing or invalid in `.env`

---

## ✅ How to Fix Notifications (3 Steps)

### Step 1: Get Firebase Credentials
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click ⚙️ Settings → Service Accounts
4. Click "Generate New Private Key" → Downloads `.json` file

### Step 2: Add to `.env`
Open `.env` and add:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-email@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOU_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**Copy from the JSON file:**
- `project_id` → `FIREBASE_PROJECT_ID`
- `client_email` → `FIREBASE_CLIENT_EMAIL`  
- `private_key` → `FIREBASE_PRIVATE_KEY` (keep newlines as `\n`)

### Step 3: Test It
1. Restart server: `npm run dev`
2. You should see: `✅ Firebase Admin initialized successfully`
3. Test endpoint: `POST http://localhost:5000/api/notification/test-send`
4. Check if student has token: `GET http://localhost:5000/api/notification/check-token`

---

## 📲 How Student Notifications Work

```
1. Student logs in on mobile app
   ↓
2. Mobile app registers device → gets FCM token
   ↓
3. App sends `POST /api/auth/save-fcm-token` with token
   ↓
4. Token saved in database
   ↓
5. Teacher marks attendance
   ↓
6. Backend sends push notification to all student FCM tokens
   ↓
7. 🔔 Student gets notification on phone!
```

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Firebase not initialized" | Add Firebase credentials to `.env` |
| Student doesn't get notifications | Check `GET /api/notification/check-token` - must show `hasToken: true` |
| App doesn't send token | Mobile app must call `POST /api/auth/save-fcm-token` on login |
| Old token invalid | Firebase invalidates tokens after ~30 days inactivity |

---

## 📋 Test Notification Flow

**1. Open Postman/Insomnia**

**2. Login as teacher:**
```
POST http://localhost:5000/api/auth/login
Body:
{
  "email": "teacher@college.com",
  "password": "password123"
}
→ Copy the token
```

**3. Check if student has token:**
```
GET http://localhost:5000/api/notification/check-token
Header: Authorization: Bearer <token>
→ Should show: hasToken: true
```

**4. Mark attendance (will auto-send notifications):**
```
POST http://localhost:5000/api/attendance/mark
Header: Authorization: Bearer <teacher_token>
Body:
{
  "subjectId": "65abc...",
  "date": "2024-03-25",
  "records": [
    { "studentId": "65def...", "status": "present" }
  ]
}
→ Check console: "✅ Notifications sent to 1 students"
```

**5. Or send manual test notification:**
```
POST http://localhost:5000/api/notification/test-send
Header: Authorization: Bearer <student_token>
Body:
{
  "title": "Hello!",
  "body": "Testing notifications"
}
```

---

## 🎯 Summary

- ✅ **Notifications are now integrated** with attendance marking
- ✅ **Auto-sends messages** when teacher marks attendance  
- ✅ **Test endpoints** added for debugging
- ✅ **Better error messages** if Firebase fails
- ⚠️ **YOU NEED**: Firebase service account credentials in `.env`

**Next steps:**
1. Add Firebase credentials to `.env`
2. Restart server
3. Test with mobile app
