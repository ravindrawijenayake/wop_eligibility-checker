const fs = require('fs');
const keys = {
  en: { "lbl_time_since_complaint": "Time since police complaint" },
  si: { "lbl_time_since_complaint": "පොලිස් පැමිණිල්ලේ සිට ගත වූ කාලය" },
  ta: { "lbl_time_since_complaint": "காவல் முறையீடு செய்தது முதல் கடந்த காலம்" }
};
['en','si','ta'].forEach(lang => {
  const file = `./src/locales/${lang}.json`;
  const existing = JSON.parse(fs.readFileSync(file,'utf8'));
  fs.writeFileSync(file, JSON.stringify({...existing,...keys[lang]},null,2));
  console.log(`${lang}.json updated`);
});
