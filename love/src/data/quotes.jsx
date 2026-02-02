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
  { text: "Wear your white coat with dignity and pride—it is an honor and a privilege to get to serve the public as a physician.", author: "Bill Histand" },
  { text: "Hardships often prepare ordinary people for an extraordinary destiny.", author: "C.S. Lewis" }
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