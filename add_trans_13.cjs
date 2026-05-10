const fs = require('fs');

const newKeys = {
  en: {
    "lbl_overpayment_summary": "Overpayment Summary",
    "msg_overpayment_months": "Pension Overpayment Detected",
    "msg_overpayment_recovery_note": "Statutory Recovery Required: The overpaid pension amount must be recovered before W&OP commencement per established regulatory procedures.",
    "lbl_month": "Month",
    "lbl_months": "Months",
    "btn_print_eligibility_determination": "Print Eligibility Determination Report",
    "lbl_service_sector": "Service Sector",
    "opt_civil": "Civil Service",
    "opt_forces": "Military / Tri-Forces",
    "lbl_service_category": "Service Category",
    "opt_regular_force": "Regular Force",
    "opt_volunteer_force": "Volunteer Force",
    "lbl_military_consent_date": "W&OP Contribution Consent Date",
    "lbl_retired_due_to_terrorism": "Retired due to Disability from Terrorist Activities?",
    "err_military_consent_missing": "Please provide the W&OP Contribution Consent Date",
    "err_military_consent_late_regular": "Regular Force W&OP: Consent date exceeds the 30 June 2006 statutory deadline. Ineligible.",
    "err_military_consent_late_volunteer": "Volunteer Force W&OP: Consent date exceeds the 31 December 2012 statutory deadline. Ineligible."
  },
  si: {
    "lbl_overpayment_summary": "අධිගෙවීම් සාරාංශය",
    "msg_overpayment_months": "විශ්‍රාම වැටුප් අධිගෙවීම හඳුනා ගන්නා ලදී",
    "msg_overpayment_recovery_note": "ව්‍යවස්ථාමය ප්‍රතිලාභ: W&OP ආරම්භ කිරීමට පෙර ස්ථාපිත නියාමන ක්‍රියා පටිපාටි අනුව අධිගෙවූ විශ්‍රාම වැටුප් ප්‍රමාණය ලබා ගත යුතුය.",
    "lbl_month": "මාසය",
    "lbl_months": "මාස",
    "btn_print_eligibility_determination": "සුදුසුකම් තීරණ වාර්තාව මුද්‍රණය",
    "lbl_service_sector": "සේවා අංශය",
    "opt_civil": "සිවිල් සේවාව",
    "opt_forces": "හමුදා / ත්‍රිවිධ හමුදා",
    "lbl_service_category": "සේවා කාණ්ඩය",
    "opt_regular_force": "නිත්‍ය හමුදාව",
    "opt_volunteer_force": "ස්වේච්ඡා හමුදාව",
    "lbl_military_consent_date": "W&OP දායකත්ව කැමැත්ත දිනය",
    "lbl_retired_due_to_terrorism": "ත්‍රස්ත ක්‍රියා නිසා ආබාධිත ලෙස විශ්‍රාම ගත් ද?",
    "err_military_consent_missing": "W&OP දායකත්ව කැමැත්ත දිනය ඇතුළත් කරන්න",
    "err_military_consent_late_regular": "නිත්‍ය හමුදා W&OP: 30 ජූනි 2006 ව්‍යවස්ථාමය දේශසීමාව ඉක්මවා ඇත. සුදුසුකම් නොමැත.",
    "err_military_consent_late_volunteer": "ස්වේච්ඡා හමුදා W&OP: 31 දෙසැම්බර් 2012 ව්‍යවස්ථාමය දේශසීමාව ඉක්මවා ඇත. සුදුසුකම් නොමැත."
  },
  ta: {
    "lbl_overpayment_summary": "அதிக கட்டணம் சுருக்கம்",
    "msg_overpayment_months": "ஓய்வூதிய அதிக கட்டணம் கண்டறியப்பட்டது",
    "msg_overpayment_recovery_note": "சட்டப்பூர்வ மீட்பு தேவை: நிறுவப்பட்ட ஒழுங்குமுறை நடைமுறைகளின்படி W&OP தொடங்குவதற்கு முன் அதிகமாக செலுத்தப்பட்ட ஓய்வூதியத் தொகை மீட்கப்படல் வேண்டும்.",
    "lbl_month": "மாதம்",
    "lbl_months": "மாதங்கள்",
    "btn_print_eligibility_determination": "தகுதி நிர்ணய அறிக்கையை அச்சிடு",
    "lbl_service_sector": "சேவைத் துறை",
    "opt_civil": "சிவில் சேவை",
    "opt_forces": "இராணுவம் / முப்படை",
    "lbl_service_category": "சேவை வகை",
    "opt_regular_force": "தொடர் படை",
    "opt_volunteer_force": "தன்னார்வ படை",
    "lbl_military_consent_date": "W&OP பங்களிப்பு சம்மத தேதி",
    "lbl_retired_due_to_terrorism": "பயங்கரவாத செயல்களால் ஊனமடைந்து ஓய்வு பெற்றீர்களா?",
    "err_military_consent_missing": "W&OP பங்களிப்பு சம்மத தேதியை வழங்கவும்",
    "err_military_consent_late_regular": "தொடர் படை W&OP: சம்மத தேதி 30 ஜூன் 2006 சட்டப்பூர்வ காலக்கெடுவை மீறுகிறது. தகுதியற்றது.",
    "err_military_consent_late_volunteer": "தன்னார்வ படை W&OP: சம்மத தேதி 31 டிசம்பர் 2012 சட்டப்பூர்வ காலக்கெடுவை மீறுகிறது. தகுதியற்றது."
  }
};

['en', 'si', 'ta'].forEach(lang => {
  const file = `./src/locales/${lang}.json`;
  let existing = {};
  if (require('fs').existsSync(file)) {
    existing = JSON.parse(require('fs').readFileSync(file, 'utf8'));
  }
  const updated = { ...existing, ...newKeys[lang] };
  require('fs').writeFileSync(file, JSON.stringify(updated, null, 2));
  console.log(`${lang}.json updated with ${Object.keys(newKeys[lang]).length} keys`);
});
