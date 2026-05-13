const fs = require('fs');

const keys = {
  en: {
    "msg_child_married_disabled_review": "Married — DG Livelihood Review Required",
    "err_last_pension_before_retirement": "Last pension payment date cannot be before the retirement date."
  },
  si: {
    "msg_child_married_disabled_review": "විවාහ වී ඇත — DG ජීවිකා සමාලෝචනය අවශ්‍ය වේ",
    "err_last_pension_before_retirement": "අවසාන විශ්‍රාම වැටුප් ගෙවූ දිනය විශ්‍රාම දිනයට පෙර විය නොහැක."
  },
  ta: {
    "msg_child_married_disabled_review": "திருமணமானவர் — DG வாழ்வாதார மதிப்பாய்வு தேவை",
    "err_last_pension_before_retirement": "கடைசி ஓய்வூதிய கொடுப்பனவு தேதி ஓய்வு பெற்ற தேதிக்கு முன்னர் இருக்க முடியாது."
  }
};

['en', 'si', 'ta'].forEach(lang => {
  const file = `./src/locales/${lang}.json`;
  const existing = JSON.parse(fs.readFileSync(file, 'utf8'));
  fs.writeFileSync(file, JSON.stringify({ ...existing, ...keys[lang] }, null, 2));
  console.log(`${lang}.json: +${Object.keys(keys[lang]).length} keys`);
});
