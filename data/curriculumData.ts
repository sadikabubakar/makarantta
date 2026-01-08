
import { Subject } from "../types";

export const CURRICULUM_DATA: Record<string, Subject[]> = {
  "Primary": [
    {
      name: "Harshen Turanci (English)",
      topics: ["Alphabets and Sounds", "Nouns and Pronouns", "Simple Sentence Building", "Reading Comprehension", "Spelling and Dictation", "Verb Tenses", "Greetings and Manners"]
    },
    {
      name: "Lissafi (Mathematics)",
      topics: ["Numbers 1-1000", "Addition and Subtraction", "Multiplication Tables", "Basic Fractions", "Shapes and Measurement", "Time and Calendar", "Money Calculations"]
    },
    {
      name: "Kimiyya (Basic Science)",
      topics: ["The Human Body", "Living and Non-living Things", "Plants and Animals", "The Environment", "Water and Air", "Personal Hygiene", "Healthy Eating"]
    },
    {
      name: "Jama'iya (Social Studies)",
      topics: ["The Family Unit", "Our Community", "Culture and Traditions", "National Identity", "Roles and Responsibilities", "Road Safety", "Leadership"]
    },
    {
      name: "Harshen Hausa",
      topics: ["Wasan Harafi", "Kalmomi da Ma'anarsu", "Al'adun Hausawa", "Karin Magana", "Labaran Gargajiya", "Zantukan Hikima", "Rubutun Hausa"]
    },
    {
      name: "Addinin Musulunci (IRK)",
      topics: ["Tauhidi", "Sira na Annabi (SAW)", "Al-Qur'ani", "Hadirai", "Ibada", "Mu'amala", "Halaye na Gari"]
    }
  ],
  "Secondary": [
    // JSS CORE SUBJECTS
    {
      name: "English Language (JSS)",
      topics: ["Parts of Speech", "Punctuation Marks", "Sentence Structure", "Reading and Summary", "Letter Writing", "Grammar: Tenses", "Oral English"]
    },
    {
      name: "Mathematics (JSS)",
      topics: ["Number Bases", "Fractions and Decimals", "Basic Algebra", "Simple Equations", "Geometry: Angles", "Area and Volume", "Statistics Basics"]
    },
    {
      name: "Basic Science",
      topics: ["Family Health", "Living Things", "Non-Living Things", "Environmental Pollution", "Energy and Work", "Chemical Reactions Basics", "Space Science"]
    },
    {
      name: "Basic Technology",
      topics: ["Technical Drawing", "Properties of Materials", "Hand Tools", "Machine Tools", "Maintenance", "Electricity and Electronics Basics", "Building Construction"]
    },
    {
      name: "Social Studies",
      topics: ["Family and Society", "Social Problems", "Governance and Leadership", "National Integration", "Culture and Identity", "Human Rights", "Globalization"]
    },
    {
      name: "Civic Education",
      topics: ["Values and Society", "Constitution", "Democracy", "Rights and Duties", "Law Enforcement", "Nationalism", "Self-Reliance"]
    },
    {
      name: "Physical & Health Education (PHE)",
      topics: ["Athletics", "Ball Games", "First Aid", "Human Anatomy", "Pathogenic Organisms", "Community Health", "Environmental Health"]
    },
    {
      name: "Computer Studies / ICT",
      topics: ["History of Computers", "Computer Hardware", "Software Basics", "Information Processing", "Internet and Email", "Ethics in Computing", "MS Office Basics"]
    },
    // JSS PRE-VOCATIONAL
    {
      name: "Agricultural Science",
      topics: ["Importance of Agriculture", "Crop Production", "Animal Husbandry Basics", "Farm Power and Machinery", "Agricultural Economics", "Soil Science", "Farm Practical"]
    },
    {
      name: "Home Economics",
      topics: ["Family Living", "Food and Nutrition", "Clothing and Textiles", "Home Management", "Child Development", "Hygiene and Sanitation", "Entrepreneurship in Home Econ"]
    },
    {
      name: "Business Studies",
      topics: ["Introduction to Commerce", "Bookkeeping", "Office Practice", "Keyboarding", "Shorthand Basics", "Consumer Education", "Aids to Trade"]
    },
    // SSS CORE & SCIENCES
    {
      name: "Physics (SSS)",
      topics: ["Mechanics", "Heat and Thermodynamics", "Waves and Optics", "Electricity and Magnetism", "Modern Physics", "Energy Quantization", "Electronics"]
    },
    {
      name: "Chemistry (SSS)",
      topics: ["Atomic Structure", "Chemical Bonding", "Organic Chemistry", "Electrochemistry", "Stoichiometry", "Equilibrium and Rates", "Nuclear Chemistry"]
    },
    {
      name: "Biology (SSS)",
      topics: ["Cell Structure", "Organization of Life", "Plant and Animal Nutrition", "Genetics and Evolution", "Ecology", "Reproduction", "Control and Regulation"]
    },
    {
      name: "Further Mathematics",
      topics: ["Complex Numbers", "Calculus: Differentiation", "Calculus: Integration", "Matrices and Determinants", "Vectors and Mechanics", "Probability Distributions", "Coordinate Geometry"]
    },
    // SSS SOCIAL SCIENCES
    {
      name: "Economics (SSS)",
      topics: ["Concept of Scarcity", "Production Theory", "National Income", "Monetary Policy", "International Trade", "Public Finance", "Development Planning"]
    },
    {
      name: "Geography (SSS)",
      topics: ["Physical Geography", "Regional Geography", "Map Analysis", "Environmental Hazards", "Economic Geography", "Population Geography", "Settlement Studies"]
    },
    {
      name: "Government (SSS)",
      topics: ["Systems of Government", "Public Administration", "Constitutional Development", "International Relations", "Political Parties", "Electoral Process", "Local Government"]
    },
    // SSS TRADE & ENTREPRENEURIAL (SELECTED TOP ONES)
    {
      name: "Catering Craft Practice",
      topics: ["Menu Planning", "Food Service", "Kitchen Management", "Pastry and Confectionery", "Beverage Service", "Safety and Hygiene", "Costing and Accounting"]
    },
    {
      name: "Marketing (Trade)",
      topics: ["Marketing Mix", "Consumer Behavior", "Sales Promotion", "Digital Marketing", "Marketing Research", "Public Relations", "Brand Management"]
    },
    {
      name: "Data Processing",
      topics: ["Database Management", "Data Recovery", "Web Design Basics", "Spreadsheet Advanced", "Networking Basics", "Operating Systems", "Computer Maintenance"]
    },
    {
      name: "GSM Phone Maintenance",
      topics: ["Hardware Components", "Troubleshooting", "Soldering Techniques", "Software Flashing", "Battery Management", "Safety Precautions", "Customer Service"]
    },
    {
      name: "Photography (Trade)",
      topics: ["Camera Anatomy", "Lighting Techniques", "Composition Rules", "Digital Editing", "Event Photography", "Studio Setup", "Business of Photography"]
    },
    {
      name: "Animal Husbandry",
      topics: ["Livestock Management", "Animal Nutrition", "Breeding and Genetics", "Disease Control", "Poultry Production", "Cattle and Small Ruminants", "Farm Records"]
    }
  ],
  "University": [
    // WEALTH CREATING SUBJECTS (TECH & AI)
    {
      name: "Computer Science & Software Engineering",
      topics: ["Full-Stack Development", "Data Structures & Algorithms", "Cloud Computing (AWS/Azure)", "SaaS Business Models", "Mobile App Development", "Software Architecture", "Remote Tech Careers"]
    },
    {
      name: "Artificial Intelligence & Data Science",
      topics: ["Machine Learning Fundamentals", "Deep Learning & Neural Networks", "Natural Language Processing (NLP)", "Big Data Analytics", "AI Ethics & Policy", "Computer Vision", "Predictive Modeling"]
    },
    // LANGUAGES (UNIVERSITY LEVEL)
    {
      name: "English Language & Linguistics",
      topics: ["Morphology & Syntax", "Semantics & Pragmatics", "Phonology & Phonetics", "Applied Linguistics", "Sociolinguistics", "Discourse Analysis", "Computational Linguistics"]
    },
    {
      name: "Arabic Language & Literature",
      topics: ["Classical Arabic Grammar (Nahw/Sarf)", "Arabic Literature & Poetry", "Arabic Rhetoric (Balaghah)", "Linguistic Analysis of Quran", "Modern Standard Arabic", "Translation Methods", "Islamic Intellectual History"]
    },
    // PROFESSIONAL & HEALTH
    {
      name: "Medicine & Surgery",
      topics: ["Human Anatomy & Physiology", "Pathology & Clinical Medicine", "Surgical Procedures", "Pharmacology", "Global Health Relocation", "Medical Diagnostics", "Medical Ethics"]
    },
    {
      name: "Pharmacy",
      topics: ["Pharmaceutics", "Pharmacognosy", "Medicinal Chemistry", "Pharmaceutical Business", "Drug Interactions", "Clinical Pharmacy", "Community Pharmacy Practice"]
    },
    // ENGINEERING
    {
      name: "Engineering (Electrical/Mechanical/Petroleum)",
      topics: ["Thermodynamics", "Renewable Energy Systems", "Reservoir Engineering", "Mechatronics & Robotics", "Fluid Mechanics", "Industrial Automation", "Oil & Gas Exploration"]
    },
    // FINANCE & BUSINESS
    {
      name: "Accounting & Finance",
      topics: ["Financial Reporting", "Investment Banking", "Auditing & Assurance", "Corporate Finance Strategy", "Taxation Law", "Wealth Management", "Financial Risk Analysis"]
    },
    {
      name: "Business Administration & Entrepreneurship",
      topics: ["Startup Scaling Strategies", "Global Marketing", "Venture Capital & Funding", "Organizational Leadership", "Operations Management", "Business Model Innovation", "HR Management"]
    },
    // SOCIAL SCIENCE & LAW
    {
      name: "Economics",
      topics: ["Macroeconomic Policy", "Econometrics", "Global Market Trends", "Behavioral Economics", "Public Finance", "Development Economics", "Monetary Systems"]
    },
    {
      name: "Law",
      topics: ["Corporate & Commercial Law", "International Law", "Intellectual Property Rights", "Technology & Cyber Law", "Criminal Jurisprudence", "Litigation & Arbitration", "Human Rights Law"]
    },
    // CORE ACADEMIC SKILLS
    {
      name: "Academic Writing & Research Methods",
      topics: ["Thesis Formulation", "Citation Styles (APA/MLA)", "Qualitative & Quantitative Research", "Critical Literature Review", "Data Collection Tools", "Abstract & Reporting", "Ethics in Research"]
    },
    {
      name: "Logic & Philosophy",
      topics: ["Critical Thinking", "Ethics and Morality", "Formal Logic", "Epistemology", "Metaphysics", "Political Philosophy", "Ancient & Modern Philosophers"]
    }
  ]
};
