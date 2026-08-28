// --- src/data/quotes.js ---

export const MEDICAL_QUOTES = [
  { text: "The chapter you are learning today is going to save someone's life tomorrow.", author: "Unknown" },
  { text: "Medicine is a science of uncertainty and an art of probability.", author: "Sir William Osler" },
  { text: "Study hard until you can say 'I am a doctor' instead of 'I want to be a doctor'.", author: "Motivation" },
  { text: "Wherever the art of Medicine is loved, there is also a love of Humanity.", author: "Hippocrates" },
  { text: "Diagnosis is not the end, but the beginning of practice.", author: "Martin H. Fischer" },
  { text: "Don't study to pass the test. Study to prepare for the day when you are the only thing between a patient and the grave.", author: "Mark Reid" },
  { text: "Your hands will heal what your heart cares for.", author: "Unknown" },
  { text: "Every master was once a beginner. Keep pushing.", author: "Robin Sharma" },
  { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The good physician treats the disease; the great physician treats the patient who has the disease.", author: "Sir William Osler" },
  { text: "Wear your white coat with dignity and pride—it is an honor and a privilege to serve.", author: "Bill Histand" },
  { text: "Hardships often prepare ordinary people for an extraordinary destiny.", author: "C.S. Lewis" },

  { text: "Medicine demands dedication long before it offers rewards.", author: "Medical Wisdom" },
  { text: "One day your sleepless nights will become someone’s second chance at life.", author: "Unknown" },
  { text: "A calm mind saves more lives than panic ever could.", author: "Medical Wisdom" },
  { text: "Books today, lives tomorrow.", author: "Unknown" },
  { text: "The pain of studying is temporary, the impact of healing is permanent.", author: "Motivation" },
  { text: "A doctor’s true power lies in empathy.", author: "Unknown" },
  { text: "Learn the science, master the art, serve with heart.", author: "Medical Wisdom" },
  { text: "Medicine is not a career, it is a responsibility.", author: "Unknown" },
  { text: "Small concepts mastered today prevent big mistakes tomorrow.", author: "Medical Wisdom" },
  { text: "A single correct decision can save a lifetime.", author: "Unknown" },

  { text: "Discipline builds doctors before degrees do.", author: "Motivation" },
  { text: "Trust is the strongest medicine you will ever prescribe.", author: "Unknown" },
  { text: "A tired doctor can still be a determined healer.", author: "Medical Wisdom" },
  { text: "Study until confidence replaces confusion.", author: "Motivation" },
  { text: "Healing begins the moment a patient feels heard.", author: "Unknown" },
  { text: "Your future patients are counting on your effort today.", author: "Motivation" },
  { text: "Medicine teaches humility every single day.", author: "Unknown" },
  { text: "Accuracy is kindness in medicine.", author: "Medical Wisdom" },
  { text: "A doctor never stops being a student.", author: "Unknown" },
  { text: "Long nights create strong clinicians.", author: "Motivation" },

  { text: "Knowledge saves lives only when applied with care.", author: "Medical Wisdom" },
  { text: "Every correct diagnosis begins with careful listening.", author: "Unknown" },
  { text: "Medicine rewards patience before success.", author: "Motivation" },
  { text: "You are training for moments that truly matter.", author: "Unknown" },
  { text: "Excellence in medicine is built in silence and practice.", author: "Medical Wisdom" },
  { text: "A doctor’s duty begins where comfort ends.", author: "Unknown" },
  { text: "Late nights today mean steady hands tomorrow.", author: "Motivation" },
  { text: "Healing is a balance of knowledge and compassion.", author: "Medical Wisdom" },
  { text: "Medicine is teamwork, not heroism.", author: "Unknown" },
  { text: "Precision is the language of good doctors.", author: "Medical Wisdom" },

  { text: "Behind every confident doctor is years of self-doubt.", author: "Unknown" },
  { text: "Respect the basics; they save the most lives.", author: "Medical Wisdom" },
  { text: "Medicine humbles even the brightest minds.", author: "Unknown" },
  { text: "Study like someone’s life depends on it—because it does.", author: "Motivation" },
  { text: "A doctor’s presence can be more powerful than medicine.", author: "Unknown" },
  { text: "The best doctors treat fear along with disease.", author: "Medical Wisdom" },
  { text: "Exams test memory, patients test wisdom.", author: "Unknown" },
  { text: "True healing starts with responsibility.", author: "Medical Wisdom" },
  { text: "Medicine rewards those who never stop improving.", author: "Motivation" },
  { text: "Every patient teaches something new.", author: "Unknown" },

  { text: "Consistency creates clinical excellence.", author: "Medical Wisdom" },
  { text: "Doctors carry hope in their words.", author: "Unknown" },
  { text: "Your dedication today shapes your judgment tomorrow.", author: "Motivation" },
  { text: "Medicine demands courage in uncertainty.", author: "Medical Wisdom" },
  { text: "Healing is science guided by humanity.", author: "Unknown" },
  { text: "A doctor’s learning never truly ends.", author: "Medical Wisdom" },
  { text: "Patience saves more lives than haste.", author: "Unknown" },
  { text: "Study deeply so you can act decisively.", author: "Motivation" },
  { text: "Medicine is service before status.", author: "Unknown" },
  { text: "The white coat is earned through sacrifice.", author: "Medical Wisdom" }
];


// Helper function to get a consistent quote for the day
export function getDailyQuote() {
  const current = new Date();
  const start = new Date(current.getFullYear(), 0, 0);
  const diff = current - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  // Use modulo to cycle through quotes if days exceed quote count
  return MEDICAL_QUOTES[dayOfYear % MEDICAL_QUOTES.length];
}