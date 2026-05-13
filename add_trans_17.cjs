const fs = require('fs');

const keys = {
  en: {
    "err_dor_required": "Retirement date is required for a pensioner.",
    "err_doa_required": "Date of appointment is required.",
    "err_service_category_required": "Please select Regular Force or Volunteer Force."
  },
  si: {
    "err_dor_required": "විශ්‍රාම ගිය දිනය අවශ්‍ය වේ.",
    "err_doa_required": "පත්වීමේ දිනය අවශ්‍ය වේ.",
    "err_service_category_required": "රෙගුලර් හෝ ස්වේච්ඡා බලකාය තෝරන්න."
  },
  ta: {
    "err_dor_required": "ஓய்வு பெற்ற தேதி தேவை.",
    "err_doa_required": "நியமன தேதி தேவை.",
    "err_service_category_required": "ரெகுலர் அல்லது தன்னார்வ படையை தேர்ந்தெடுக்கவும்."
  }
};

['en', 'si', 'ta'].forEach(lang => {
  const file = `./src/locales/${lang}.json`;
  const existing = JSON.parse(fs.readFileSync(file, 'utf8'));
  fs.writeFileSync(file, JSON.stringify({ ...existing, ...keys[lang] }, null, 2));
  console.log(`${lang}.json: +${Object.keys(keys[lang]).length} keys`);
});
