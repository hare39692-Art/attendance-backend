# ✅ RENDER.COM PRODUCTION CHECKLIST

## 🔴 CRITICAL - Check These First

### 1. Environment Variables on Render
Go to **Dashboard → Your Service → Environment**

Verify these are set:
```
✓ MONGO_URI=mongodb+srv://...
✓ JWT_SECRET=your_secret_key
✓ FIREBASE_PROJECT_ID=your-project-id
✓ FIREBASE_CLIENT_EMAIL=your@email.com
✓ FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
✓ PORT=10000  (Render uses this)
✓ NODE_ENV=production
```

### 2. Test Your Live API
Replace `<YOUR_RENDER_URL>` with your Render service URL:

**Health Check:**
```bash
curl https://<YOUR_RENDER_URL>/
# Should return: "Attendance Analyzer API 🚀"
```

**Test Login:**
```bash
curl -X POST https://<YOUR_RENDER_URL>/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@college.com",
    "password": "password123"
  }'
# Should return: token + user data
```

**Check Firebase Status:**
```bash
curl -X POST https://<YOUR_RENDER_URL>/api/notification/test-send \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Production Test",
    "body": "Testing from Render"
  }'
# Should return: ✅ Test notification sent
```

---

## 🟡 MONITOR THESE

### 3. Check Render Logs
1. Go to **Dashboard → Your Service → Logs**
2. Look for:
   - ✅ `MongoDB Connected ✅`
   - ✅ `✅ Firebase Admin initialized successfully`
   - ✅ `Server running on port 10000`

### 4. Database Backups
Your MongoDB might be on:
- MongoDB Atlas (cloud) - Auto-backups enabled?
- Local MongoDB - Need manual backups?

### 5. SSL/HTTPS
Render auto-provides SSL. Verify your API is using `https://`

---

## 🟢 FEATURE CHECKLIST

### Students Can:
- [ ] Login with email/password
- [ ] Receive FCM token saved (check body: POST `/api/auth/save-fcm-token`)
- [ ] View attendance reports
- [ ] Get smart analytics (classes needed, can afford to miss)
- [ ] Receive push notifications when attendance marked

### Teachers Can:
- [ ] Login
- [ ] Mark attendance (bulk)
- [ ] Mark via QR code
- [ ] View class reports

### Admins Can:
- [ ] Create teachers/students
- [ ] Manage subjects
- [ ] Configure timetables
- [ ] Set college location

---

## 🚀 If Something Breaks

### Error: "MongoDB Connection Failed"
```
Solution: Check MONGO_URI in Render environment is correct
- Test locally first: node server.js
- Check MongoDB Atlas IP whitelist includes Render IPs
- Render IPs: 0.0.0.0/0 (all) - but Atlas may restrict
```

### Error: "Firebase not initialized"
```
Solution: Firebase credentials missing in Render environment
1. Copy from .env (local)
2. Paste each line into Render Environment Variables
3. Restart service (Force New Deployment)
```

### Error: "Port already in use"
```
Solution: Render uses PORT env var automatically
- Don't hardcode port in code
- Use: process.env.PORT || 5000
- Already done in your server.js ✓
```

### Notifications Not Working
```
Solution:
1. Check Firebase initialized: /api/notification/check-token
2. Verify student has FCM token: hasToken: true
3. Manually trigger: POST /api/notification/test-send
4. Check Render logs for Firebase errors
```

---

## 📊 Performance Tips for Presentation

Your Render free tier can handle:
- **100-500 concurrent users**
- **1000s of attendance records**
- But response time may be 2-5 seconds on cold start

If slow:
1. **Render Performance Tier** - Faster startup (costs $$$)
2. **Add pagination** - Already implemented ✓
3. **Add database indexes** - Already done ✓

---

## 💡 Pro Tips

1. **Rate Limiting** - Add to prevent abuse of login
   ```javascript
   // In server.js
   const rateLimit = require('express-rate-limit');
   const limiter = rateLimit({ windowMs: 15*60*1000, max: 100 });
   app.use(limiter);
   ```

2. **Monitoring** - Go to Render Dashboard to see:
   - CPU usage
   - Memory usage
   - Request count
   - Response time

3. **Auto-Sleep** - Render spins down after 15 mins inactivity
   - First request takes 30 seconds
   - Subsequent requests are fast
   - Consider paid tier for production

4. **Logs** - Monitor errors:
   ```bash
   # In Render dashboard, tail logs for:
   - ❌ Firebase errors
   - ❌ MongoDB connection issues
   - ❌ 500 errors
   ```

---

## ✅ VERIFICATION SCRIPT (Run Locally)

```bash
#!/bin/bash

API="https://<YOUR_RENDER_URL>"
EMAIL="admin@college.com"
PASSWORD="password123"

echo "🔍 Testing Production API..."

# 1. Health check
echo "1️⃣  Health check..."
curl $API/

# 2. Login
echo -e "\n\n2️⃣  Login..."
TOKEN=$(curl -s -X POST $API/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | jq -r '.token')

echo "Token: ${TOKEN:0:20}..."

# 3. Check Firebase
echo -e "\n\n3️⃣  Check Firebase..."
curl -s -X GET $API/api/notification/check-token \
  -H "Authorization: Bearer $TOKEN" | jq .

# 4. Get profile
echo -e "\n\n4️⃣  Get profile..."
curl -s -X GET $API/api/auth/profile \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n\n✅ Tests complete!"
```

---

## 📋 For Your Presentation Tomorrow

**Show:**
1. Live login at https://your-render-url
2. Mark attendance → notification appears
3. Student views report with analytics
4. "Made with MongoDB, Express, Node.js, deployed on Render.com"

**Demo Scenario:**
- Login as teacher
- Mark 3 students present/absent
- Show notifications in Render logs
- Show student report with smart analytics

---

## 🎯 Last Minute Checklist (24 Hours Before Presentation)

- [ ] Test all endpoints work on live server
- [ ] MongoDB connection stable
- [ ] Firebase notifications working
- [ ] No console errors in Render logs
- [ ] Sample data exists in production
- [ ] Screenshots ready for fallback
- [ ] Can quickly restart if needed

**Fallback Plan (if server down):**
- Have screenshots of working app
- Have local demo ready to run
- Have video recording playing
