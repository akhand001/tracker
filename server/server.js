const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// --- CONFIGURATION ---
const MONGO_URI = "mongodb+srv://djsammy0342_db_user:P4gdPeBihyT0Wlbg@cluster0.raifmjf.mongodb.net/neetpg?appName=Cluster0";
const JWT_SECRET = "cherry_secret_key_123"; 
const PORT = 5000;

// Models
const User = require('./models/User'); 
const Subject = require('./models/Syllabus'); 
const Progress = require('./models/UserProgress');
const Target = require('./models/Target'); // NEW MODEL
// server.js ke upar check karein
const Question = require('./models/Question');
const app = express();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors());

// --- AUTH MIDDLEWARE ---
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// --- ROUTES ---

// 1. REGISTER
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Please add all fields' });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      user.lastLogin = Date.now();
      await user.save();
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. DASHBOARD (NOW INCLUDES TARGETS)
app.get('/api/dashboard', protect, async (req, res) => {
  try {
    // Fetch base data
    const subjects = await Subject.find().sort('order').lean();
    const progressDocs = await Progress.find({ userId: req.user._id }).lean();
    const targetDocs = await Target.find({ userId: req.user._id }).lean();

    // Create Maps for O(1) access
    const progressMap = {};
    progressDocs.forEach(p => { progressMap[p.topicId] = p; });

    const targetMap = {};
    targetDocs.forEach(t => { targetMap[t.subjectId] = t.targetDate; });

    let totalTopics = 0;
    let masteredTopics = 0;

    // Merge everything
    const enrichedSubjects = subjects.map(sub => {
      let subjectCompletedCount = 0;
      
      const enrichedTopics = sub.topics.map(topic => {
        totalTopics++;
        const statusObj = progressMap[topic._id] || { status: 'pending', isWeak: false };
        if (statusObj.status === 'mastered') subjectCompletedCount++;
        return { ...topic, userStatus: statusObj };
      });

      return {
        ...sub,
        topics: enrichedTopics,
        completion: sub.topics.length > 0 ? Math.round((subjectCompletedCount / sub.topics.length) * 100) : 0,
        targetDate: targetMap[sub._id] || null // Inject Target Date
      };
    });

    const globalProgress = totalTopics > 0 ? Math.round((masteredTopics / totalTopics) * 100) : 0;

    res.json({ subjects: enrichedSubjects, stats: { globalProgress } });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// 4. UPDATE TOPIC PROGRESS
app.post('/api/progress', protect, async (req, res) => {
  try {
    const { topicId, status, isWeak } = req.body;
    const update = { userId: req.user._id, topicId, lastRevised: new Date() };

    if (status) update.status = status;
    if (isWeak !== undefined) update.isWeak = isWeak;
    
    if (status === 'revision') {
      await Progress.updateOne({ userId: req.user._id, topicId }, { $inc: { revisionCount: 1 } });
    }

    const result = await Progress.findOneAndUpdate(
      { userId: req.user._id, topicId },
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. SET SUBJECT TARGET (NEW ROUTE)
app.post('/api/target', protect, async (req, res) => {
  try {
    const { subjectId, targetDate } = req.body;
    
    const target = await Target.findOneAndUpdate(
      { userId: req.user._id, subjectId },
      { targetDate },
      { upsert: true, new: true }
    );
    
    res.json(target);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- HELPER ---
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// --- START SERVER ---
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas Connected Successfully');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error('❌ Database Connection Error:', err));


app.get('/api/questions', async (req, res) => {
  try {
    const questions = await Question.find();
    console.log("Questions found:", questions.length); // Debugging ke liye
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});