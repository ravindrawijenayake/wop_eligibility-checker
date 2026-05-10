const fs = require('fs');

const sec11_en = {
  "lbl_temporary_hold_rule": "Statutory Temporary Hold Rule (Multiple Orphans)",
  "msg_temporary_hold_desc": "If multiple orphans are eligible, the disabled orphan's pension portion will be placed on a temporary hold when they reach 26 years of age, provided there are other eligible siblings under 26. During this hold, their portion is equally distributed among the eligible younger siblings. Once all other siblings lose eligibility (reach age 26 or gain employment), the disabled orphan's lifetime pension will automatically resume at 100%."
};

const sec11_si = {
  "lbl_temporary_hold_rule": "නීත්‍යානුකූල තාවකාලික අත්හිටුවීමේ නීතිය (අනාථ දරුවන් කිහිප දෙනෙකු සිටින විට)",
  "msg_temporary_hold_desc": "සුදුසුකම් ලත් අනාථ දරුවන් කිහිප දෙනෙකු සිටී නම්, ආබාධිත දරුවාගේ වයස අවුරුදු 26 සම්පූර්ණ වූ විට ඔවුන්ගේ විශ්‍රාම වැටුප් කොටස තාවකාලිකව අත්හිටුවනු ලැබේ (වයස 26 ට අඩු වෙනත් සුදුසුකම් ලත් සහෝදර සහෝදරියන් සිටී නම්). මෙම කාලය තුළ එම කොටස අනෙකුත් දරුවන් අතර සමානව බෙදී යයි. අනෙකුත් සියලුම දරුවන්ගේ සුදුසුකම් අවසන් වූ පසු (වයස 26 සම්පූර්ණ වීම හෝ රැකියාවක් ලබා ගැනීම), ආබාධිත දරුවාගේ ජීවිත කාලය පුරාම හිමි විශ්‍රාම වැටුප 100% ක් ලෙස නැවත ආරම්භ වේ."
};

const sec11_ta = {
  "lbl_temporary_hold_rule": "சட்டப்பூர்வ தற்காலிக நிறுத்தி வைப்பு விதி (பல அனாதைகள்)",
  "msg_temporary_hold_desc": "தகுதியான பல அனாதைகள் இருந்தால், ஊனமுற்ற அனாதைக்கு 26 வயது பூர்த்தியடையும் போது, 26 வயதுக்குட்பட்ட பிற தகுதியான உடன்பிறப்புகள் இருந்தால் அவர்களின் ஓய்வூதியப் பங்கு தற்காலிகமாக நிறுத்தி வைக்கப்படும். இந்த நிறுத்தி வைப்பின் போது, அவர்களின் பங்கு மற்ற தகுதியான இளைய உடன்பிறப்புகளிடையே சமமாக விநியோகிக்கப்படும். மற்ற அனைத்து உடன்பிறப்புகளும் தகுதியை இழந்தவுடன் (26 வயதை அடைதல் அல்லது வேலைவாய்ப்பைப் பெறுதல்), ஊனமுற்ற அனாதையின் வாழ்நாள் ஓய்வூதியம் தானாகவே 100% ஆக மீண்டும் தொடங்கும்."
};

const newData = {
  en: { ...sec11_en },
  si: { ...sec11_si },
  ta: { ...sec11_ta }
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
