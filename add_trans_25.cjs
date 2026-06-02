const fs = require('fs');
const keys = {
  en: {
    "lbl_foreign_ministry_date": "Date of Disappearance (as per Consular Division / Foreign Ministry Letter)",
    "msg_foreign_ministry_date_note": "This date is used as the reference for overpayment calculation and eligibility waiting period instead of the police complaint date.",
    "err_foreign_ministry_date_required": "Date of disappearance as per the Foreign Ministry letter is required.",
    "err_missing_retired_4m": "Eligibility criteria not met: For a missing pensioner, a minimum of 4 months must have elapsed from the reference date before a W&OP claim can be processed.",
    "err_missing_active_12m": "Eligibility criteria not met: For a missing in-service contributor, a minimum of 12 months must have elapsed from the reference date before a W&OP claim can be processed."
  },
  si: {
    "lbl_foreign_ministry_date": "අතුරුදන් වූ දිනය (කොන්සියුලර් අංශ / විදේශ කටයුතු අමාත්‍යාංශ ලිපිය අනුව)",
    "msg_foreign_ministry_date_note": "මෙම දිනය, අධික ගෙවීම් ගණනය හා සුදුසුකම් සඳහා රැකියාවේ සිටිය දී ලිවූ දිනය ලෙස භාවිතා වේ.",
    "err_foreign_ministry_date_required": "විදේශ අමාත්‍යාංශ ලිපිය අනුව අතුරුදන් වූ දිනය අවශ්‍ය වේ.",
    "err_missing_retired_4m": "සුදුසුකම් නොමැත: අතුරුදන් වූ විශ්‍රාමිකයකු සඳහා, W&OP ඉල්ලුමක් සැකසිය හැකි වීමට, යොමු දිනෙන් අවම වශයෙන් මාස 4 ක් ගත විය යුතුය.",
    "err_missing_active_12m": "සුදුසුකම් නොමැත: සේවයේ සිටියදී අතුරුදන් වූ දායකයකු සඳහා, W&OP ඉල්ලුමක් සැකසිය හැකි වීමට, යොමු දිනෙන් අවම වශයෙන් මාස 12 ක් ගත විය යුතුය."
  },
  ta: {
    "lbl_foreign_ministry_date": "காணாமல் போன தேதி (தூதரக பிரிவு / வெளியுறவு அமைச்சு கடிதத்தின்படி)",
    "msg_foreign_ministry_date_note": "இந்த தேதி அதிக கொடுப்பனவு கணக்கீடு மற்றும் தகுதி காத்திருப்பு காலத்திற்கு குறிப்பு தேதியாக பயன்படுத்தப்படும்.",
    "err_foreign_ministry_date_required": "வெளியுறவு அமைச்சு கடிதத்தின்படி காணாமல் போன தேதி தேவை.",
    "err_missing_retired_4m": "தகுதி நிறைவேறவில்லை: காணாமல் போன ஓய்வுபெற்றவருக்கு, W&OP கோரிக்கையை செயலாக்க குறிப்பு தேதியிலிருந்து குறைந்தது 4 மாதங்கள் கடந்திருக்க வேண்டும்.",
    "err_missing_active_12m": "தகுதி நிறைவேறவில்லை: சேவையில் இருக்கும்போது காணாமல் போன பங்களிப்பாளருக்கு, W&OP கோரிக்கையை செயலாக்க குறிப்பு தேதியிலிருந்து குறைந்தது 12 மாதங்கள் கடந்திருக்க வேண்டும்."
  }
};
['en','si','ta'].forEach(lang => {
  const file = `./src/locales/${lang}.json`;
  const existing = JSON.parse(fs.readFileSync(file,'utf8'));
  fs.writeFileSync(file, JSON.stringify({...existing,...keys[lang]},null,2));
  console.log(`${lang}.json: +${Object.keys(keys[lang]).length} keys`);
});
