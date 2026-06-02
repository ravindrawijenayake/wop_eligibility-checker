const fs = require('fs');
const keys = {
  en: {
    "msg_overpayment_deceased": "⚠ Overpayment Alert: Pension was paid for {months} month(s) after the date of death. Recovery action required.",
    "msg_overpayment_missing": "⚠ Overpayment Alert: Pension was paid for {months} month(s) after the police complaint date. Recovery action required from the date the person was reported missing.",
    "msg_missing_abroad_note": "ℹ Note: If the contributor went missing while abroad (including those engaged in foreign conflicts such as the Russia-Ukraine war), the police complaint date is used as the overpayment reference date. Supporting documentation from foreign authorities or employer may be required.",
    "msg_missing_abroad_pension_note": "ℹ Important: For pensioners reported missing while abroad (including war zones such as Russia-Ukraine), pension overpayment is calculated from the date of police complaint. The DG may require additional evidence from the foreign employer, Sri Lanka Embassy, or relevant foreign authorities to confirm the date of disappearance."
  },
  si: {
    "msg_overpayment_deceased": "⚠ අධික ගෙවීම් අනතුරු ඇඟවීම: මරණ දිනෙන් පසු {months} මාස(ය) සඳහා විශ්‍රාම අයිතිය ගෙවා ඇත. නැවත ලබා ගැනීමේ ක්‍රියාමාර්ගය අවශ්‍ය වේ.",
    "msg_overpayment_missing": "⚠ අධික ගෙවීම් අනතුරු ඇඟවීම: පොලිස් පැමිණිල්ලේ දිනෙන් පසු {months} මාස(ය) සඳහා විශ්‍රාම අයිතිය ගෙවා ඇත. අතුරුදන් වූ දිනෙන් ආරම්භ කර නැවත ලබා ගැනීමේ ක්‍රියාමාර්ගය අවශ්‍ය වේ.",
    "msg_missing_abroad_note": "ℹ සටහන: දායකකරු විදේශයන්හිදී (රුසියා-යුක්රේන යුද්ධය ඇතුළු) අතුරුදන් වූ නම්, පොලිස් පැමිණිල්ලේ දිනය අධික ගෙවීම් ගණනය කිරීමේ දිනය ලෙස භාවිතා වේ.",
    "msg_missing_abroad_pension_note": "ℹ වැදගත්: විදේශ රටවල (රුසියා-යුක්රේන ඇතුළු) සේවය කරමින් අතුරුදන් වූ විශ්‍රාමිකයින් සඳහා, විශ්‍රාම ගෙවීම් අධික ලෙස ගෙවා ඇත්නම්, එය පොලිස් පැමිණිල්ලේ දිනෙන් ගණනය කෙරේ. අධ්‍යක්ෂ ජනරාල් විසින් විදේශ ආයතනයෙන් හෝ ශ්‍රී ලංකා තානාපති කාර්යාලයෙන් අතිරේක සාක්ෂ්‍ය ඉල්ලා සිටිය හැකිය."
  },
  ta: {
    "msg_overpayment_deceased": "⚠ அதிக கொடுப்பனவு எச்சரிக்கை: மரண தேதிக்குப் பிறகு {months} மாதம் ஓய்வூதியம் வழங்கப்பட்டது. மீட்பு நடவடிக்கை தேவை.",
    "msg_overpayment_missing": "⚠ அதிக கொடுப்பனவு எச்சரிக்கை: காவல் முறையீடு தேதிக்குப் பிறகு {months} மாதம் ஓய்வூதியம் வழங்கப்பட்டது. காணாமல் போன தேதியிலிருந்து மீட்பு நடவடிக்கை தேவை.",
    "msg_missing_abroad_note": "ℹ குறிப்பு: பங்களிப்பாளர் வெளிநாட்டில் (ரஷ்யா-உக்ரைன் போர் உட்பட) காணாமல் போயிருந்தால், காவல் முறையீடு தேதி அதிக கொடுப்பனவு குறிப்பு தேதியாக பயன்படுத்தப்படும்.",
    "msg_missing_abroad_pension_note": "ℹ முக்கியம்: வெளிநாட்டில் (ரஷ்யா-உக்ரைன் உட்பட) காணாமல் போன ஓய்வுபெற்றவர்களுக்கு, காவல் முறையீடு தேதியிலிருந்து அதிக கொடுப்பனவு கணக்கிடப்படும். DG கூடுதல் ஆவணங்கள் கோரலாம்."
  }
};
['en','si','ta'].forEach(lang => {
  const file = `./src/locales/${lang}.json`;
  const existing = JSON.parse(fs.readFileSync(file,'utf8'));
  fs.writeFileSync(file, JSON.stringify({...existing,...keys[lang]},null,2));
  console.log(`${lang}.json: +${Object.keys(keys[lang]).length} keys`);
});
