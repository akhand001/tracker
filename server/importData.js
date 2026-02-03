const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Question = require('./models/Question');

// YAHA APNA PASSWORD DALEIN (Jahan <db_password> likha hai use hata kar)
const uri = "mongodb+srv://djsammy0342_db_user:P4gdPeBihyT0Wlbg@cluster0.raifmjf.mongodb.net/?appName=Cluster0"

// ... baaki poora code same rahega upar ka ...

mongoose.connect(uri)
  .then(async () => {
    console.log("✅ MongoDB Atlas se connect ho gaya!");

    try {
        const filePath = path.join(__dirname, 'neet_questions.json');
        const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        console.log(`🚀 ${rawData.length} Questions mil gaye. Processing...`);

        // ID problem solve karne ke liye: Hum dataset ki id ko mita denge 
        // taaki MongoDB apni default ObjectId auto-generate kare.
        const dataToUpload = rawData.map(item => {
            const { id, _id, ...rest } = item; // dataset wali id ko nikal diya
            return rest;
        });

        console.log("⬆️ Uploading to MongoDB...");
        await Question.insertMany(dataToUpload);
        
        console.log("🎉 🎉 MUBARAK HO! Saara data MongoDB mein upload ho gaya.");
        process.exit(0);

    } catch (err) {
        console.error("❌ Data upload error:", err);
        process.exit(1);
    }
  })
// ... baaki niche ka code same ...