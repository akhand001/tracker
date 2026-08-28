const mongoose = require('mongoose');
const Subject = require('./models/Syllabus');

// YOUR CLOUD DATABASE CONNECTION STRING
const MONGO_URI = "mongodb+srv://djsammy0342_db_user:P4gdPeBihyT0Wlbg@cluster0.raifmjf.mongodb.net/neetpg?appName=Cluster0";

/* COMPLETE NEET PG SYLLABUS DATA 
  Includes all 19 Subjects with detailed Chapter Breakdowns.
*/
const syllabusData = [
  // ==================== PRE-CLINICAL ====================
  { 
    name: "Anatomy", category: "Pre-Clinical", order: 1, 
    topics: [
      { name: "General Anatomy", isHighYield: false },
      { name: "Upper Limb: Bones & Joints", isHighYield: true },
      { name: "Upper Limb: Nerves & Vessels", isHighYield: true, hasPYQ: true },
      { name: "Lower Limb: Bones, Joints & Arches", isHighYield: true },
      { name: "Lower Limb: Nerves, Vessels & Compartments", isHighYield: true, hasPYQ: true },
      { name: "Thorax: Heart & Pericardium", isHighYield: true, hasPYQ: true },
      { name: "Thorax: Lungs, Pleura & Diaphragm", isHighYield: true },
      { name: "Abdomen: Peritoneum & Viscera", isHighYield: true, hasPYQ: true },
      { name: "Abdomen: Vessels & Nerves", isHighYield: true },
      { name: "Pelvis & Perineum", isHighYield: true, hasPYQ: true },
      { name: "Head & Neck: Skull, Face & Scalp", isHighYield: true },
      { name: "Head & Neck: Triangles & Glands", isHighYield: true, hasPYQ: true },
      { name: "Head & Neck: Cranial Nerves", isHighYield: true, hasPYQ: true },
      { name: "Neuroanatomy: Spinal Cord & Brainstem", isHighYield: true, hasPYQ: true },
      { name: "Neuroanatomy: Cerebrum, Cerebellum & Ventricles", isHighYield: true },
      { name: "Embryology: General & Systemic", isHighYield: true, hasPYQ: true },
      { name: "Histology", isHighYield: false },
      { name: "Genetics", isHighYield: true, hasPYQ: true }
    ]
  },
  { 
    name: "Physiology", category: "Pre-Clinical", order: 2, 
    topics: [
      { name: "General Physiology", isHighYield: true },
      { name: "Hematology: RBC, WBC, Platelets", isHighYield: true, hasPYQ: true },
      { name: "Nerve Muscle Physiology", isHighYield: true, hasPYQ: true },
      { name: "CVS: Electrophysiology & ECG", isHighYield: true, hasPYQ: true },
      { name: "CVS: Cardiac Output & Regulation", isHighYield: true },
      { name: "Respiratory System: Mechanics & Exchange", isHighYield: true, hasPYQ: true },
      { name: "Respiratory System: Regulation & Hypoxia", isHighYield: true },
      { name: "Renal: GFR & Clearance", isHighYield: true, hasPYQ: true },
      { name: "Renal: Concentration & Acid-Base", isHighYield: true, hasPYQ: true },
      { name: "GIT: Secretions & Motility", isHighYield: false },
      { name: "Endocrinology: Hypothalamus & Pituitary", isHighYield: true },
      { name: "Endocrinology: Thyroid, Adrenal & Pancreas", isHighYield: true, hasPYQ: true },
      { name: "Reproductive Physiology", isHighYield: true },
      { name: "CNS: Sensory & Motor Systems", isHighYield: true, hasPYQ: true },
      { name: "Special Senses (Vision, Hearing, Taste, Smell)", isHighYield: true }
    ]
  },
  { 
    name: "Biochemistry", category: "Pre-Clinical", order: 3, 
    topics: [
      { name: "Cell & Subcellular Organelles", isHighYield: false },
      { name: "Amino Acids & Proteins", isHighYield: true },
      { name: "Enzymes & Clinical Enzymology", isHighYield: true, hasPYQ: true },
      { name: "Carbohydrate Chemistry & Metabolism", isHighYield: true, hasPYQ: true },
      { name: "Lipid Chemistry & Metabolism", isHighYield: true, hasPYQ: true },
      { name: "Protein Metabolism & Urea Cycle", isHighYield: true, hasPYQ: true },
      { name: "Vitamins (Fat & Water Soluble)", isHighYield: true, hasPYQ: true },
      { name: "Minerals & Trace Elements", isHighYield: true },
      { name: "Heme Metabolism & Porphyrias", isHighYield: true, hasPYQ: true },
      { name: "Nucleotide Metabolism", isHighYield: true },
      { name: "Molecular Biology: Replication, Transcription, Translation", isHighYield: true, hasPYQ: true },
      { name: "Recombinant DNA Technology & PCR", isHighYield: true, hasPYQ: true },
      { name: "Biological Oxidation & ETC", isHighYield: true },
      { name: "Nutrition & Energy Metabolism", isHighYield: true }
    ]
  },

  // ==================== PARA-CLINICAL ====================
  { 
    name: "Pathology", category: "Para-Clinical", order: 4, 
    topics: [
      { name: "Cell Injury, Adaptation & Death", isHighYield: true, hasPYQ: true },
      { name: "Inflammation (Acute & Chronic)", isHighYield: true, hasPYQ: true },
      { name: "Tissue Repair & Healing", isHighYield: false },
      { name: "Hemodynamics, Thrombosis & Shock", isHighYield: true },
      { name: "Genetics & Cytogenetics", isHighYield: true },
      { name: "Immunopathology (Hypersensitivity/Autoimmunity)", isHighYield: true, hasPYQ: true },
      { name: "Neoplasia: Biology & Diagnosis", isHighYield: true, hasPYQ: true },
      { name: "Hematology: RBC Disorders (Anemias)", isHighYield: true, hasPYQ: true },
      { name: "Hematology: WBC Disorders & Leukemias", isHighYield: true, hasPYQ: true },
      { name: "Hematology: Platelets & Coagulation", isHighYield: true },
      { name: "Blood Banking", isHighYield: true },
      { name: "Systemic Path: Kidney & Urinary Tract", isHighYield: true, hasPYQ: true },
      { name: "Systemic Path: Lung & Respiratory", isHighYield: true },
      { name: "Systemic Path: Liver & Biliary", isHighYield: true, hasPYQ: true },
      { name: "Systemic Path: GIT", isHighYield: true },
      { name: "Systemic Path: Endocrine & Breast", isHighYield: true },
      { name: "Systemic Path: Bone & Soft Tissue", isHighYield: true }
    ]
  },
  { 
    name: "Pharmacology", category: "Para-Clinical", order: 5, 
    topics: [
      { name: "General Pharmacology: PK & PD", isHighYield: true, hasPYQ: true },
      { name: "ANS: Cholinergic & Anticholinergic", isHighYield: true, hasPYQ: true },
      { name: "ANS: Adrenergic & Antiadrenergic", isHighYield: true, hasPYQ: true },
      { name: "Autacoids & Histamine", isHighYield: true },
      { name: "Respiratory System Drugs", isHighYield: true },
      { name: "CVS: Diuretics & Antihypertensives", isHighYield: true, hasPYQ: true },
      { name: "CVS: Heart Failure, Angina, Arrhythmia", isHighYield: true, hasPYQ: true },
      { name: "Kidney: Diuretics", isHighYield: true },
      { name: "Hematology: Anticoagulants & Antiplatelets", isHighYield: true, hasPYQ: true },
      { name: "CNS: General Anesthetics & Alcohol", isHighYield: true },
      { name: "CNS: Sedative-Hypnotics & Antiepileptics", isHighYield: true, hasPYQ: true },
      { name: "CNS: Psychopharmacology & Opioids", isHighYield: true, hasPYQ: true },
      { name: "Endocrine: Diabetes & Thyroid", isHighYield: true, hasPYQ: true },
      { name: "Endocrine: Steroids & Reproductive", isHighYield: true },
      { name: "Antimicrobial: Antibiotics Basics", isHighYield: true },
      { name: "Antimicrobial: Antibacterial Agents", isHighYield: true, hasPYQ: true },
      { name: "Antimicrobial: Antiviral, Antifungal, Antimalarial", isHighYield: true, hasPYQ: true },
      { name: "Anticancer Drugs (Chemotherapy)", isHighYield: true, hasPYQ: true },
      { name: "Immunomodulators", isHighYield: false }
    ]
  },
  { 
    name: "Microbiology", category: "Para-Clinical", order: 6, 
    topics: [
      { name: "General Microbiology & Sterilization", isHighYield: true, hasPYQ: true },
      { name: "Immunology: Antigen, Antibody, Complement", isHighYield: true, hasPYQ: true },
      { name: "Immunology: Hypersensitivity & Autoimmunity", isHighYield: true },
      { name: "Bacteriology: Gram Positive Cocci", isHighYield: true, hasPYQ: true },
      { name: "Bacteriology: Gram Negative Cocci", isHighYield: true },
      { name: "Bacteriology: Gram Positive Bacilli", isHighYield: true, hasPYQ: true },
      { name: "Bacteriology: Gram Negative Bacilli", isHighYield: true, hasPYQ: true },
      { name: "Bacteriology: Mycobacteria & Spirochetes", isHighYield: true, hasPYQ: true },
      { name: "Virology: DNA Viruses", isHighYield: true, hasPYQ: true },
      { name: "Virology: RNA Viruses & HIV", isHighYield: true, hasPYQ: true },
      { name: "Mycology (Fungi)", isHighYield: true },
      { name: "Parasitology: Protozoa", isHighYield: true, hasPYQ: true },
      { name: "Parasitology: Helminths", isHighYield: true },
      { name: "Clinical Microbiology (Infections)", isHighYield: true }
    ]
  },
  { 
    name: "Forensic Medicine", category: "Para-Clinical", order: 7, 
    topics: [
      { name: "Legal Procedures & Inquest", isHighYield: true, hasPYQ: true },
      { name: "Identification", isHighYield: true },
      { name: "Thanatology (Death & Changes)", isHighYield: true, hasPYQ: true },
      { name: "Autopsy Procedures", isHighYield: false },
      { name: "Asphyxial Deaths", isHighYield: true, hasPYQ: true },
      { name: "Mechanical Injuries & Wounds", isHighYield: true, hasPYQ: true },
      { name: "Firearm Injuries & Thermal Injuries", isHighYield: true },
      { name: "Regional Injuries", isHighYield: false },
      { name: "Forensic Psychiatry", isHighYield: true },
      { name: "Sexual Jurisprudence & Rape", isHighYield: true, hasPYQ: true },
      { name: "General Toxicology", isHighYield: true },
      { name: "Corrosive & Irritant Poisons", isHighYield: true },
      { name: "Neurotoxic & Cardiac Poisons", isHighYield: true, hasPYQ: true },
      { name: "Asphyxiants & Drug Dependence", isHighYield: true }
    ]
  },
  { 
    name: "PSM (Community Medicine)", category: "Para-Clinical", order: 8, 
    topics: [
      { name: "Concept of Health & Disease", isHighYield: true },
      { name: "Epidemiology: Principles & Methods", isHighYield: true, hasPYQ: true },
      { name: "Screening for Disease", isHighYield: true, hasPYQ: true },
      { name: "Epidemiology of Communicable Diseases", isHighYield: true, hasPYQ: true },
      { name: "Epidemiology of Non-Communicable Diseases", isHighYield: true },
      { name: "National Health Programs of India", isHighYield: true, hasPYQ: true },
      { name: "Demography & Family Planning", isHighYield: true, hasPYQ: true },
      { name: "Biostatistics", isHighYield: true, hasPYQ: true },
      { name: "Nutrition & Health", isHighYield: true, hasPYQ: true },
      { name: "Environment & Health (Waste Management)", isHighYield: true, hasPYQ: true },
      { name: "Occupational Health", isHighYield: true },
      { name: "Health Planning & Management", isHighYield: true },
      { name: "International Health", isHighYield: false }
    ]
  },

  // ==================== CLINICAL ====================
  { 
    name: "Medicine", category: "Clinical", order: 9, 
    topics: [
      { name: "Cardiology: CAD, Failure, Valvular, ECG", isHighYield: true, hasPYQ: true },
      { name: "Pulmonology: Asthma, COPD, TB, ILD", isHighYield: true, hasPYQ: true },
      { name: "Gastroenterology: Liver, GB, Pancreas", isHighYield: true, hasPYQ: true },
      { name: "Nephrology: AKI, CKD, Glomerular", isHighYield: true, hasPYQ: true },
      { name: "Neurology: Stroke, Epilepsy, Movement", isHighYield: true, hasPYQ: true },
      { name: "Endocrinology: Diabetes, Thyroid, Adrenal", isHighYield: true, hasPYQ: true },
      { name: "Hematology: Anemias, Bleeding Disorders", isHighYield: true },
      { name: "Infectious Diseases & HIV", isHighYield: true, hasPYQ: true },
      { name: "Rheumatology & Connective Tissue", isHighYield: true, hasPYQ: true },
      { name: "Fluid, Electrolyte & Acid-Base", isHighYield: true, hasPYQ: true },
      { name: "Clinical Toxicology & Envenomation", isHighYield: true }
    ]
  },
  { 
    name: "Surgery", category: "Clinical", order: 10, 
    topics: [
      { name: "Metabolic Response & Shock", isHighYield: true, hasPYQ: true },
      { name: "Burns & Wound Healing", isHighYield: true, hasPYQ: true },
      { name: "Trauma & ATLS Protocols", isHighYield: true, hasPYQ: true },
      { name: "Thyroid & Parathyroid", isHighYield: true, hasPYQ: true },
      { name: "Breast Disorders", isHighYield: true, hasPYQ: true },
      { name: "Arterial & Venous Disorders", isHighYield: true },
      { name: "Oral Cavity & Salivary Glands", isHighYield: false },
      { name: "Esophagus & Stomach", isHighYield: true, hasPYQ: true },
      { name: "Liver, Gallbladder, Pancreas, Spleen", isHighYield: true, hasPYQ: true },
      { name: "Intestine, Appendix, Rectum, Anal Canal", isHighYield: true, hasPYQ: true },
      { name: "Hernias & Abdominal Wall", isHighYield: true },
      { name: "Urology: Stone, BPH, Tumors", isHighYield: true, hasPYQ: true },
      { name: "Pediatric Surgery", isHighYield: true }
    ]
  },
  { 
    name: "OBGYN", category: "Clinical", order: 11, 
    topics: [
      { name: "OBS: Physiological Changes in Pregnancy", isHighYield: true },
      { name: "OBS: Antenatal Care & Fetal Monitoring", isHighYield: true, hasPYQ: true },
      { name: "OBS: Normal Labor", isHighYield: true },
      { name: "OBS: Abnormal Labor & Malpresentation", isHighYield: true, hasPYQ: true },
      { name: "OBS: Complications (APH, PPH, HTN)", isHighYield: true, hasPYQ: true },
      { name: "OBS: Medical Disorders in Pregnancy", isHighYield: true },
      { name: "GYN: Anatomy & Development", isHighYield: false },
      { name: "GYN: Menstrual Disorders (PCOS, AUB)", isHighYield: true, hasPYQ: true },
      { name: "GYN: Infertility & Contraception", isHighYield: true, hasPYQ: true },
      { name: "GYN: Infections & Prolapse", isHighYield: true },
      { name: "GYN: Oncology (Cervix, Endo, Ovary)", isHighYield: true, hasPYQ: true }
    ]
  },
  { 
    name: "Pediatrics", category: "Clinical", order: 12, 
    topics: [
      { name: "Growth & Development", isHighYield: true, hasPYQ: true },
      { name: "Nutrition & Micronutrients", isHighYield: true, hasPYQ: true },
      { name: "Neonatology: Normal & Resuscitation", isHighYield: true, hasPYQ: true },
      { name: "Neonatology: Jaundice, Sepsis, RDS", isHighYield: true, hasPYQ: true },
      { name: "Infectious Diseases & Immunization", isHighYield: true, hasPYQ: true },
      { name: "Pediatric Systemic (CVS, Resp, GIT)", isHighYield: true },
      { name: "Pediatric Nephrology", isHighYield: true, hasPYQ: true },
      { name: "Pediatric Neurology", isHighYield: true },
      { name: "Pediatric Hematology & Oncology", isHighYield: true, hasPYQ: true },
      { name: "Genetics & Metabolic Disorders", isHighYield: true }
    ]
  },
  { 
    name: "Orthopedics", category: "Clinical", order: 13, 
    topics: [
      { name: "Trauma: Upper Limb Fractures", isHighYield: true, hasPYQ: true },
      { name: "Trauma: Lower Limb & Pelvis", isHighYield: true, hasPYQ: true },
      { name: "Spine Injuries & Disorders", isHighYield: true },
      { name: "Bone Infections (Osteomyelitis/TB)", isHighYield: true, hasPYQ: true },
      { name: "Bone Tumors", isHighYield: true, hasPYQ: true },
      { name: "Metabolic Bone Diseases", isHighYield: true },
      { name: "Nerve Injuries", isHighYield: true, hasPYQ: true },
      { name: "Joint Disorders & Arthritis", isHighYield: true }
    ]
  },
  { 
    name: "Ophthalmology", category: "Clinical", order: 14, 
    topics: [
      { name: "Optics & Refraction", isHighYield: true, hasPYQ: true },
      { name: "Conjunctiva & Cornea", isHighYield: true, hasPYQ: true },
      { name: "Lens & Cataract", isHighYield: true, hasPYQ: true },
      { name: "Glaucoma", isHighYield: true, hasPYQ: true },
      { name: "Uvea & Sclera", isHighYield: true },
      { name: "Retina & Vitreous", isHighYield: true, hasPYQ: true },
      { name: "Neuro-Ophthalmology", isHighYield: true, hasPYQ: true },
      { name: "Squint & Orbit", isHighYield: true },
      { name: "Eyelids & Lacrimal System", isHighYield: true }
    ]
  },
  { 
    name: "ENT", category: "Clinical", order: 15, 
    topics: [
      { name: "Ear: Anatomy & Assessment", isHighYield: false },
      { name: "Ear: Diseases of External & Middle Ear", isHighYield: true, hasPYQ: true },
      { name: "Ear: Inner Ear & Facial Nerve", isHighYield: true, hasPYQ: true },
      { name: "Nose: Rhinitis, Sinusitis, Polyps", isHighYield: true },
      { name: "Pharynx & Oral Cavity", isHighYield: true, hasPYQ: true },
      { name: "Larynx: Voice & Cancer", isHighYield: true, hasPYQ: true },
      { name: "Oesophagus & Trachea", isHighYield: true }
    ]
  },
  { 
    name: "Psychiatry", category: "Clinical", order: 16, 
    topics: [
      { name: "General Psychopathology", isHighYield: true },
      { name: "Schizophrenia & Psychotic Disorders", isHighYield: true, hasPYQ: true },
      { name: "Mood Disorders (Depression/Bipolar)", isHighYield: true, hasPYQ: true },
      { name: "Anxiety, OCD & Stress Disorders", isHighYield: true, hasPYQ: true },
      { name: "Substance Use Disorders", isHighYield: true, hasPYQ: true },
      { name: "Personality & Sleep Disorders", isHighYield: true },
      { name: "Child Psychiatry & Psychopharmacology", isHighYield: true, hasPYQ: true }
    ]
  },
  { 
    name: "Dermatology", category: "Clinical", order: 17, 
    topics: [
      { name: "Basics of Dermatology", isHighYield: false },
      { name: "Infections (Bacterial, Viral, Fungal)", isHighYield: true, hasPYQ: true },
      { name: "Papulosquamous (Psoriasis/Lichen)", isHighYield: true, hasPYQ: true },
      { name: "Eczema & Dermatitis", isHighYield: true },
      { name: "Vesiculobullous Disorders", isHighYield: true, hasPYQ: true },
      { name: "Connective Tissue Disorders", isHighYield: true },
      { name: "Pigmentary & Hair/Nail Disorders", isHighYield: false },
      { name: "Sexually Transmitted Infections (STIs)", isHighYield: true, hasPYQ: true },
      { name: "Leprosy", isHighYield: true, hasPYQ: true }
    ]
  },
  { 
    name: "Radiology", category: "Clinical", order: 18, 
    topics: [
      { name: "Physics & Basics of X-ray/CT/MRI/USG", isHighYield: true },
      { name: "Respiratory Radiology", isHighYield: true, hasPYQ: true },
      { name: "CVS & CNS Radiology", isHighYield: true, hasPYQ: true },
      { name: "GIT & GUT Radiology", isHighYield: true },
      { name: "Musculoskeletal Radiology", isHighYield: true },
      { name: "Emergency Radiology", isHighYield: true, hasPYQ: true },
      { name: "Radiotherapy Basics", isHighYield: false }
    ]
  },
  { 
    name: "Anesthesia", category: "Clinical", order: 19, 
    topics: [
      { name: "Equipment & Monitoring", isHighYield: true },
      { name: "General Anesthetics (IV & Inhalational)", isHighYield: true, hasPYQ: true },
      { name: "Muscle Relaxants", isHighYield: true, hasPYQ: true },
      { name: "Local Anesthesia & Regional Blocks", isHighYield: true, hasPYQ: true },
      { name: "Airway Management", isHighYield: true },
      { name: "CPR & Resuscitation (ACLS/BLS)", isHighYield: true, hasPYQ: true },
      { name: "Oxygen Therapy", isHighYield: true }
    ]
  }
];

// --- SEEDING SCRIPT ---
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB Atlas');
    console.log('🧹 Clearing old data...');
    await Subject.deleteMany({});
    
    console.log('🌱 Seeding FULL NEET PG SYLLABUS...');
    await Subject.insertMany(syllabusData);
    
    console.log('✨ Success! Database is now populated with all 19 subjects and chapters.');
    process.exit();
  })
  .catch(err => {
    console.error('❌ Connection Error:', err);
    process.exit(1);
  });