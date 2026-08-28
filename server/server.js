const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Models
const Subject = require('./models/Syllabus'); // Jo aapke seed.js me use hua tha
const UserProgress = require('./models/UserProgress');
const ErrorBook = require('./models/ErrorBook');

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://djsammy0342_db_user:P4gdPeBihyT0Wlbg@cluster0.raifmjf.mongodb.net/neetpg?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas (NEET-PG 2028 Engine)'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

const DEFAULT_USER_ID = 'default_user_2028';

// ===================================================================
// 1. 19-SUBJECT TRACKER APIS
// ===================================================================

// GET: Fetch all 19 subjects with progress (Auto-initializes from Syllabus)
app.get('/api/tracker/subjects', async (req, res) => {
  try {
    let userProgress = await UserProgress.find({ userId: DEFAULT_USER_ID }).sort({ order: 1 });

    // Agar user ka progress database me abhi nahi hai, to seed data se create karo
    if (!userProgress || userProgress.length === 0) {
      const masterSyllabus = await Subject.find({}).sort({ order: 1 });

      if (masterSyllabus.length > 0) {
        const initialProgress = masterSyllabus.map(subj => ({
          userId: DEFAULT_USER_ID,
          subjectName: subj.name,
          category: subj.category,
          order: subj.order,
          topics: subj.topics.map(t => ({
            topicName: t.name,
            isHighYield: t.isHighYield,
            hasPYQ: t.hasPYQ,
            status: 'NOT_STARTED'
          }))
        }));

        userProgress = await UserProgress.insertMany(initialProgress);
      }
    }

    res.json(userProgress);
  } catch (err) {
    console.error('Error fetching tracker subjects:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT: Update checkbox / progress for a topic
app.put('/api/tracker/update-topic', async (req, res) => {
  try {
    const { subjectName, topicName, field, value } = req.body;

    const progress = await UserProgress.findOne({ userId: DEFAULT_USER_ID, subjectName });
    if (!progress) return res.status(404).json({ error: 'Subject progress not found' });

    const topic = progress.topics.find(t => t.topicName === topicName);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });

    // Update field value
    topic[field] = value;

    // Auto-calculate Status
    if (topic.isWeak) {
      topic.status = 'WEAK';
    } else if (topic.revision1 || (topic.videosCompleted && topic.notesCompleted && topic.mcqsCompleted)) {
      topic.status = 'COMPLETED';
    } else if (topic.videosCompleted || topic.notesCompleted || topic.mcqsCompleted || topic.pyqCompleted) {
      topic.status = 'IN_PROGRESS';
    } else {
      topic.status = 'NOT_STARTED';
    }

    topic.lastStudied = new Date();
    await progress.save();

    res.json(progress);
  } catch (err) {
    console.error('Error updating topic:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===================================================================
// 2. DIGITAL ERROR BOOK & SPACED REPETITION APIS
// ===================================================================

// GET: Sabhi logged errors
app.get('/api/error-book', async (req, res) => {
  try {
    const errors = await ErrorBook.find({ userId: DEFAULT_USER_ID }).sort({ createdAt: -1 });
    res.json(errors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Sirf wo errors jo aaj revision ke liye DUE hain (Spaced Repetition)
app.get('/api/spaced-repetition/due', async (req, res) => {
  try {
    const today = new Date();
    const dueErrors = await ErrorBook.find({
      userId: DEFAULT_USER_ID,
      isResolved: false,
      nextReviewDate: { $lte: today }
    }).sort({ priority: 1, nextReviewDate: 1 });

    res.json(dueErrors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Naya mistake add karo
app.post('/api/error-book', async (req, res) => {
  try {
    const newError = new ErrorBook({
      ...req.body,
      userId: DEFAULT_USER_ID
    });
    await newError.save();
    res.status(201).json(newError);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Spaced Repetition Review (Day 1 -> 3 -> 7 -> 14 -> 30 -> 60)
app.post('/api/error-book/:id/reviewed', async (req, res) => {
  try {
    const { isCorrect } = req.body;
    const intervals =; // Days interval

    const errorItem = await ErrorBook.findById(req.params.id);
    if (!errorItem) return res.status(404).json({ error: 'Item not found' });

    if (isCorrect) {
      if (errorItem.repetitionStage >= intervals.length - 1) {
        errorItem.isResolved = true; // Completely Mastered
      } else {
        errorItem.repetitionStage += 1;
        const daysToAdd = intervals[errorItem.repetitionStage];
        errorItem.nextReviewDate = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);
      }
    } else {
      // Agar bhool gaye to wapis Day 1 par reset
      errorItem.repetitionStage = 0;
      errorItem.nextReviewDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
    }

    await errorItem.save();
    res.json(errorItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Resolved mistake ko delete karna
app.delete('/api/error-book/:id', async (req, res) => {
  try {
    await ErrorBook.findByIdAndDelete(req.params.id);
    res.json({ message: 'Mistake removed from Error Book' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================================================================
// 3. DASHBOARD STATS API (Real-time progress overview)
// ===================================================================
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const progress = await UserProgress.find({ userId: DEFAULT_USER_ID });
    
    let totalTopics = 0;
    let completedTopics = 0;
    let weakTopics = 0;

    progress.forEach(subj => {
      subj.topics.forEach(t => {
        totalTopics++;
        if (t.status === 'COMPLETED') completedTopics++;
        if (t.isWeak || t.status === 'WEAK') weakTopics++;
      });
    });

    const dueRevisions = await ErrorBook.countDocuments({
      userId: DEFAULT_USER_ID,
      isResolved: false,
      nextReviewDate: { $lte: new Date() }
    });

    res.json({
      totalTopics,
      completedTopics,
      weakTopics,
      dueRevisions,
      syllabusCompletionPct: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 NEET-PG 2028 API Server running on port ${PORT}`));