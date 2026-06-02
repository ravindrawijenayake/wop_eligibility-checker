const fs = require('fs');
const keys = {
  en: {
    "lbl_missing_location": "Where did the disappearance occur?",
    "opt_missing_sri_lanka": "Within Sri Lanka",
    "opt_missing_abroad": "Outside Sri Lanka (Abroad)",
    "err_missing_location_required": "Please indicate where the disappearance occurred.",
    "msg_missing_sri_lanka_doc_note": "📋 Required Document: A certified copy of the police complaint must be obtained from the relevant police station where the missing report was filed.",
    "msg_missing_abroad_doc_note": "📋 Required Document: A Confirmation Letter from the Consular Division, Ministry of Foreign Affairs (Sri Lanka) is required to confirm the disappearance occurred abroad."
  },
  si: {
    "lbl_missing_location": "අතුරුදන් වූයේ කොහිද?",
    "opt_missing_sri_lanka": "ශ්‍රී ලංකාව තුළ",
    "opt_missing_abroad": "ශ්‍රී ලංකාවෙන් පිටත (විදේශයන්හි)",
    "err_missing_location_required": "අතුරුදන් වූ ස්ථානය සඳහන් කරන්න.",
    "msg_missing_sri_lanka_doc_note": "📋 අවශ්‍ය ලේඛනය: අදාළ පොලිස් ස්ථානයෙන් නිකුත් කළ පොලිස් පැමිණිල්ලේ සහතිකගත පිටපතක් ඉදිරිපත් කළ යුතුය.",
    "msg_missing_abroad_doc_note": "📋 අවශ්‍ය ලේඛනය: විදේශ කටයුතු අමාත්‍යාංශයේ කොන්සියුලර් අංශයෙන් (ශ්‍රී ලංකා) ලබාගත් තහවුරු ලිපිය ඉදිරිපත් කළ යුතුය."
  },
  ta: {
    "lbl_missing_location": "காணாமல் போனது எங்கே?",
    "opt_missing_sri_lanka": "இலங்கைக்குள்",
    "opt_missing_abroad": "இலங்கைக்கு வெளியே (வெளிநாட்டில்)",
    "err_missing_location_required": "காணாமல் போன இடத்தை குறிப்பிடவும்.",
    "msg_missing_sri_lanka_doc_note": "📋 தேவையான ஆவணம்: காணாமல் போனோர் அறிக்கை தாக்கல் செய்யப்பட்ட பொலிஸ் நிலையத்திலிருந்து பொலிஸ் முறையீட்டின் சான்றிதழ் பெறப்பட வேண்டும்.",
    "msg_missing_abroad_doc_note": "📋 தேவையான ஆவணம்: வெளிநாட்டில் காணாமல் போனதை உறுதிப்படுத்த இலங்கை வெளியுறவு அமைச்சின் தூதரக பிரிவிலிருந்து உறுதிப்படுத்தல் கடிதம் தேவை."
  }
};
['en','si','ta'].forEach(lang => {
  const file = `./src/locales/${lang}.json`;
  const existing = JSON.parse(fs.readFileSync(file,'utf8'));
  fs.writeFileSync(file, JSON.stringify({...existing,...keys[lang]},null,2));
  console.log(`${lang}.json: +${Object.keys(keys[lang]).length} keys`);
});
