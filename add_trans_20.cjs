const fs = require('fs');
const keys = {
  en: {
    "lbl_age_at_appointment": "Age at Appointment",
    "lbl_age_at_retirement": "Age at Retirement",
    "lbl_age_at_marriage": "Age at Marriage"
  },
  si: {
    "lbl_age_at_appointment": "පත්වීමේදී වයස",
    "lbl_age_at_retirement": "විශ්‍රාම ගිය විට වයස",
    "lbl_age_at_marriage": "විවාහ වූ විට වයස"
  },
  ta: {
    "lbl_age_at_appointment": "நியமன வயது",
    "lbl_age_at_retirement": "ஓய்வு பெற்ற வயது",
    "lbl_age_at_marriage": "திருமண வயது"
  }
};
['en','si','ta'].forEach(lang => {
  const file = `./src/locales/${lang}.json`;
  const existing = JSON.parse(fs.readFileSync(file,'utf8'));
  fs.writeFileSync(file, JSON.stringify({...existing,...keys[lang]},null,2));
  console.log(`${lang}.json: +${Object.keys(keys[lang]).length} keys`);
});
