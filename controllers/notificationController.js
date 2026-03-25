const admin = require('firebase-admin');
const User  = require('../models/User');

// Initialize Firebase Admin
let initialized = false;
exports.initFirebase = () => {
  if (initialized) return;
  
  // Check if all required env vars are present
  const required = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.log('⚠️  Firebase credentials incomplete. Notifications will be skipped.');
    console.log('Missing:', missing.join(', '));
    console.log('Add to .env: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
    return;
  }
  
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    initialized = true;
    console.log('✅ Firebase Admin initialized successfully');
  } catch (e) {
    console.log('❌ Firebase Admin init failed:', e.message);
    console.log('Tip: Download service account key from Firebase Console');
  }
};

// Save FCM token when user logs in
exports.saveFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    await User.findByIdAndUpdate(req.user.id, { fcmToken });
    res.json({ message: 'Token saved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Send to single user
exports.sendToUser = async (userId, title, body, data = {}) => {
  try {
    if (!initialized) {
      console.log('⚠️  Firebase not initialized. Skipping notification.');
      return;
    }
    
    const user = await User.findById(userId);
    if (!user?.fcmToken) {
      console.log(`⚠️  User ${userId} has no FCM token`);
      return;
    }
    
    console.log(`📱 Sending notification to ${user.name}: "${title}"`);
    
    await admin.messaging().send({
      token: user.fcmToken,
      notification: { title, body },
      data,
      android: {
        priority: 'high',
        notification: { sound: 'default', channelId: 'attendance_channel' },
      },
    });
    console.log('✅ Notification sent successfully');
  } catch (e) {
    console.log('❌ Notification failed:', e.message);
  }
};

// Send to multiple users
exports.sendToMany = async (userIds, title, body, data = {}) => {
  try {
    const users = await User.find({
      _id: { $in: userIds },
      fcmToken: { $exists: true, $ne: null }
    });
    const tokens = users.map(u => u.fcmToken).filter(Boolean);
    if (tokens.length === 0) {
      console.log('No FCM tokens found for users');
      return;
    }
    console.log(`Sending notification to ${tokens.length} devices`);

    // Send in batches of 500
    for (let i = 0; i < tokens.length; i += 500) {
      const chunk = tokens.slice(i, i + 500);
      const response = await admin.messaging().sendEachForMulticast({
        tokens: chunk,
        notification: { title, body },
        data,
        android: {
          priority: 'high',
          notification: { sound: 'default', channelId: 'attendance_channel' },
        },
      });
      console.log(`Sent: ${response.successCount} success, ${response.failureCount} failed`);
    }
  } catch (e) {
    console.log('Batch notification failed:', e.message);
  }
};