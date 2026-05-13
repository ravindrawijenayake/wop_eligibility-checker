const fs = require('fs');

const keys = {
  en: {
    "lbl_child_is_married": "Married?",
    "msg_child_married_ineligible": "Married — Ineligible for orphan pension"
  },
  si: {
    "lbl_child_is_married": "විවාහ වී ඇත්ද?",
    "msg_child_married_ineligible": "විවාහ වී ඇත — අනත්දරු විශ්‍රාම වැටුපට සුදුසු නොවේ"
  },
  ta: {
    "lbl_child_is_married": "திருமணமானவரா?",
    "msg_child_married_ineligible": "திருமணமானவர் — அனாதை ஓய்வூதியத்திற்கு தகுதியற்றவர்"
  }
};

['en', 'si', 'ta'].forEach(lang => {
  const file = `./src/locales/${lang}.json`;
  const existing = JSON.parse(fs.readFileSync(file, 'utf8'));
  fs.writeFileSync(file, JSON.stringify({ ...existing, ...keys[lang] }, null, 2));
  console.log(`${lang}.json: +${Object.keys(keys[lang]).length} keys`);
});
