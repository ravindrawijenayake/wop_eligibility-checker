const fs = require('fs');

const sec10_en = {
  "lbl_service_sector": "Service Sector",
  "opt_civil": "Civil Service",
  "opt_forces": "Military / Tri-Forces",
  "lbl_service_category": "Service Category",
  "opt_regular_force": "Regular Force",
  "opt_volunteer_force": "Volunteer Force",
  "lbl_retired_due_to_terrorism": "Retired due to Disability from Terrorist Activities",
  "lbl_military_consent_date": "W&OP Contribution Consent Date",
  "err_military_consent_missing": "A Contribution Consent Date is strictly required based on your Appointment Date and Service Category.",
  "err_military_consent_late_regular": "Consent Date is invalid. Must be given on or before 30 June 2006 for Regular Forces appointed prior to 30 Sep 1968.",
  "err_military_consent_late_volunteer": "Consent Date is invalid. Must be given on or before 31 Dec 2012 for Volunteer Forces appointed prior to the statutory cutoff date."
};

const sec10_si = {
  "lbl_service_sector": "සේවා අංශය",
  "opt_civil": "සිවිල් සේවය",
  "opt_forces": "ත්‍රිවිධ හමුදාව",
  "lbl_service_category": "සේවා කාණ්ඩය",
  "opt_regular_force": "නිත්‍ය බලකාය",
  "opt_volunteer_force": "ස්වේච්ඡා බලකාය",
  "lbl_retired_due_to_terrorism": "ත්‍රස්තවාදී ක්‍රියා හේතුවෙන් වූ ආබාධිත තත්වයක් මත විශ්‍රාම ගොස් ඇත",
  "lbl_military_consent_date": "W&OP දායකත්ව කැමැත්ත ලබා දුන් දිනය",
  "err_military_consent_missing": "ඔබගේ පත්වීම් දිනය සහ සේවා කාණ්ඩය අනුව දායකත්ව කැමැත්ත ලබා දුන් දිනය අනිවාර්ය වේ.",
  "err_military_consent_late_regular": "කැමැත්ත ලබා දුන් දිනය වලංගු නොවේ. 1968 සැප්තැම්බර් 30 ට පෙර පත්කළ නිත්‍ය බලකාය සඳහා එය 2006 ජූනි 30 හෝ ඊට පෙර ලබා දිය යුතුය.",
  "err_military_consent_late_volunteer": "කැමැත්ත ලබා දුන් දිනය වලංගු නොවේ. නියමිත දිනට පෙර පත්කළ ස්වේච්ඡා බලකාය සඳහා එය 2012 දෙසැම්බර් 31 හෝ ඊට පෙර ලබා දිය යුතුය."
};

const sec10_ta = {
  "lbl_service_sector": "சேவைத் துறை",
  "opt_civil": "சிவில் சேவை",
  "opt_forces": "இராணுவம் / முப்படைகள்",
  "lbl_service_category": "சேவை வகை",
  "opt_regular_force": "நிரந்தரப் படை",
  "opt_volunteer_force": "தொண்டர் படை",
  "lbl_retired_due_to_terrorism": "பயங்கரவாத நடவடிக்கைகளால் ஏற்பட்ட ஊனம் காரணமாக ஓய்வு பெற்றவர்",
  "lbl_military_consent_date": "W&OP பங்களிப்பு ஒப்புதல் தேதி",
  "err_military_consent_missing": "உங்கள் நியமனத் தேதி மற்றும் சேவை வகையின் அடிப்படையில் பங்களிப்பு ஒப்புதல் தேதி கட்டாயமாகத் தேவை.",
  "err_military_consent_late_regular": "ஒப்புதல் தேதி செல்லுபடியற்றது. 30 செப்டம்பர் 1968 இற்கு முன்னர் நியமிக்கப்பட்ட நிரந்தரப் படையினருக்கு இது 30 ஜூன் 2006 அன்று அல்லது அதற்கு முன்னர் வழங்கப்பட்டிருக்க வேண்டும்.",
  "err_military_consent_late_volunteer": "ஒப்புதல் தேதி செல்லுபடியற்றது. சட்டரீதியான காலக்கெடுவிற்கு முன்னர் நியமிக்கப்பட்ட தொண்டர் படையினருக்கு இது 31 டிசம்பர் 2012 அன்று அல்லது அதற்கு முன்னர் வழங்கப்பட்டிருக்க வேண்டும்."
};

const newData = {
  en: { ...sec10_en },
  si: { ...sec10_si },
  ta: { ...sec10_ta }
};

['en', 'si', 'ta'].forEach(lang => {
  const file = `./src/locales/${lang}.json`;
  let existing = {};
  if(fs.existsSync(file)) {
      existing = JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  const updated = { ...existing, ...newData[lang] };
  fs.writeFileSync(file, JSON.stringify(updated, null, 2));
});
