const mongoose = require("mongoose");
const Question = require("./models/Question");
const questions = require("./neet_questions.json");

const MONGO_URI =
  "mongodb+srv://djsammy0342_db_user:P4gdPeBihyT0Wlbg@cluster0.raifmjf.mongodb.net/neetpg";

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to neetpg");

    // ⚠️ ONLY questions collection clear hogi
    await Question.deleteMany({});
    console.log("🗑 Old questions removed");

    await Question.insertMany(questions);
    console.log(`✅ ${questions.length} questions inserted`);

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
