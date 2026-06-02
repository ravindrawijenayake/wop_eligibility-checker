const fs = require('fs');
const keys = {
  en: {
    "msg_auto_filled_forces": "Auto-Filled",
    "msg_forces_wop_same_as_number": "Forces W&OP registration number is the same as the Forces Number."
  },
  si: {
    "msg_auto_filled_forces": "ස්වයංක්‍රීයව පිරවිණ",
    "msg_forces_wop_same_as_number": "ත්‍රිවිධ හමුදාවේ W&OP ලියාපදිංචි අංකය, හමුදා අංකයම වේ."
  },
  ta: {
    "msg_auto_filled_forces": "தானாக நிரப்பப்பட்டது",
    "msg_forces_wop_same_as_number": "படையினரின் W&OP பதிவு எண், படை எண்ணோடு ஒன்றாகும்."
  }
};
['en','si','ta'].forEach(lang => {
  const file = `./src/locales/${lang}.json`;
  const existing = JSON.parse(fs.readFileSync(file,'utf8'));
  fs.writeFileSync(file, JSON.stringify({...existing,...keys[lang]},null,2));
  console.log(`${lang}.json: +${Object.keys(keys[lang]).length} keys`);
});
