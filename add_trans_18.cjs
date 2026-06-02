const fs = require('fs');
const keys = {
  en: { "err_last_pension_required": "Last pension payment date is required." },
  si: { "err_last_pension_required": "අවසාන විශ්‍රාම වැටුප් ගෙවූ දිනය අවශ්‍ය වේ." },
  ta: { "err_last_pension_required": "கடைசி ஓய்வூதிய கொடுப்பனவு தேதி தேவை." }
};
['en','si','ta'].forEach(lang => {
  const file = `./src/locales/${lang}.json`;
  const existing = JSON.parse(fs.readFileSync(file,'utf8'));
  fs.writeFileSync(file, JSON.stringify({...existing,...keys[lang]},null,2));
  console.log(`${lang}.json updated`);
});
