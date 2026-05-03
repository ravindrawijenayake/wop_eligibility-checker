const fs = require('fs');

const sec8_en = {
  "btn_finish_return_dashboard": "Finish & Return to Dashboard",
  "msg_death_gratuity_warning_gt5": "Statutory Directive: Contributor died in active service with >= 5 years reckonable service. Eligible for Death Gratuity. The Last Working Place MUST formally submit a PD 05 application alongside this W&OP (PD 04). W&OP payments strictly commence only after Death Gratuity is settled.",
  "msg_death_gratuity_warning_lt5": "Statutory Directive: Contributor died in active service with < 5 years reckonable service. Only W&OP benefits are eligible. Death Gratuity does not apply.",
  "msg_auth_warning_public": "As a General Public user, this portal provides logical eligibility checking only. To formally claim benefits, please physically submit the required documents to the Divisional Secretariat (if Deceased was a pensioner) or the Last Working Place (if Deceased in active service).",
  "msg_auth_warning_divsec_not_pensioner": "Authorization Block: Legal applications for Contributors who deceased PRIOR to retirement must theoretically be initiated and formally submitted by their Last Working Place, not through a Divisional Secretariat branch.",
  "msg_auth_warning_workingplace_pensioner": "Authorization Block: Legal applications for Contributors who deceased AS PENSIONERS must computationally be processed, validated, and submitted by the relevant Divisional Secretariat, not the Last Working Place.",
  "msg_auth_warning_divsec_pension_not_commenced": "Authorization Block: Because pension payments had not commenced prior to demise, the Last Working Place must submit the PD 03 application for Heirs' Payments. You are blocked from completing this application directly.",
  "msg_auth_warning_workingplace_pension_not_commenced": "Mandatory Directive: As pension payments had not commenced, you must submit a PD 03 application to the Centralised Pensions Division for Heirs' payments. This W&OP (PD 04) application must be forwarded alongside it.",
  "msg_auth_warning_headoffice": "Head Office Administrative Mode active: Direct Central Authorization and Auditing overrides enabled.",
  "btn_authorize_internal_application": "Authorize Internal Application",
  "btn_formally_submit_application": "Formally Submit Statutory Application",
  "msg_dg_approval_missing_person": "Statutory Protocol: The Contributor is a declared Missing Person. Special Director General Approval is formally mandated under current regulatory frameworks.",
  "msg_dg_approval_marriage_duration": "Marriage {index}: Active duration falls strictly below the mandatory 1-year threshold devoid of biological offspring.",
  "msg_dg_approval_financial_alert": "Dependent Financial Alert (Proxy ID: {id}): Independent generating assets documented necessitating formal evaluation.",
  "btn_print_app_summary": "Print Application Summary",
  "btn_print_docs_list": "Print Document List",
  "btn_print_eligibility_report": "Print Eligibility Report"
};

const sec8_si = {
  "btn_finish_return_dashboard": "අවසන් කර උපකරණ පුවරුවට ආපසු යන්න",
  "msg_death_gratuity_warning_gt5": "ව්‍යවස්ථාපිත නියෝගය: දායකයා වසර 5කට වැඩි ගණනය කළ හැකි සේවා කාලයක් සමඟ සක්‍රීය සේවයේ යෙදී සිටියදී මිය ගොස් ඇත. මරණ පාරිතෝෂිකය සඳහා සුදුසුකම් ලබයි. අවසන් වරට සේවය කළ ස්ථානය විසින් මෙම W&OP (PD 04) සමඟ PD 05 අයදුම්පතක් ද විධිමත් ලෙස ඉදිරිපත් කළ යුතුය. W&OP ගෙවීම් ආරම්භ වන්නේ මරණ පාරිතෝෂිකය පියවීමෙන් පසුව පමණි.",
  "msg_death_gratuity_warning_lt5": "ව්‍යවස්ථාපිත නියෝගය: දායකයා වසර 5කට අඩු ගණනය කළ හැකි සේවා කාලයක් සමඟ සක්‍රීය සේවයේ යෙදී සිටියදී මිය ගොස් ඇත. සුදුසුකම් ලබන්නේ W&OP ප්‍රතිලාභ සඳහා පමණි. මරණ පාරිතෝෂිකය අදාළ නොවේ.",
  "msg_auth_warning_public": "පොදු පරිශීලකයෙකු ලෙස, මෙම ද්වාරය මගින් ලබාදෙන්නේ තාර්කික සුදුසුකම් පරීක්ෂා කිරීමක් පමණි. ප්‍රතිලාභ විධිමත් ලෙස ඉල්ලා සිටීම සඳහා, කරුණාකර අවශ්‍ය ලේඛන ප්‍රාදේශීය ලේකම් කාර්යාලයට (මියගිය අය විශ්‍රාමිකයෙකු නම්) හෝ අවසන් වරට සේවය කළ ස්ථානයට (සක්‍රීය සේවයේ සිටියදී මිය ගියේ නම්) භෞතිකව භාර දෙන්න.",
  "msg_auth_warning_divsec_not_pensioner": "අවසර දීමේ අවහිරය: විශ්‍රාම යාමට පෙර මියගිය දායකයින් සඳහා වන නීත්‍යානුකූල අයදුම්පත් ප්‍රාදේශීය ලේකම් කාර්යාලයක් හරහා නොව, ඔවුන් අවසන් වරට සේවය කළ ස්ථානය මගින් ආරම්භ කර විධිමත් ලෙස ඉදිරිපත් කළ යුතුය.",
  "msg_auth_warning_workingplace_pensioner": "අවසර දීමේ අවහිරය: විශ්‍රාමිකයින් ලෙස මියගිය දායකයින් සඳහා වන නීත්‍යානුකූල අයදුම්පත් අදාළ ප්‍රාදේශීය ලේකම් කාර්යාලය මගින් සකස් කර, සත්‍යාපනය කර ඉදිරිපත් කළ යුතු අතර, අවසන් වරට සේවය කළ ස්ථානය මගින් නොවේ.",
  "msg_auth_warning_divsec_pension_not_commenced": "අවසර දීමේ අවහිරය: මිය යාමට පෙර විශ්‍රාම වැටුප් ගෙවීම් ආරම්භ කර නොතිබූ බැවින්, උරුමක්කරුවන්ගේ ගෙවීම් සඳහා වන PD 03 අයදුම්පත අවසන් වරට සේවය කළ ස්ථානය විසින් ඉදිරිපත් කළ යුතුය. මෙම අයදුම්පත සෘජුවම සම්පූර්ණ කිරීමෙන් ඔබව අවහිර කර ඇත.",
  "msg_auth_warning_workingplace_pension_not_commenced": "අනිවාර්ය නියෝගය: විශ්‍රාම වැටුප් ගෙවීම් ආරම්භ කර නොතිබූ බැවින්, උරුමක්කරුවන්ගේ ගෙවීම් සඳහා ඔබ මධ්‍යගත විශ්‍රාම වැටුප් අංශය වෙත PD 03 අයදුම්පතක් ඉදිරිපත් කළ යුතුය. මෙම W&OP (PD 04) අයදුම්පත ඒ සමඟම යොමු කළ යුතුය.",
  "msg_auth_warning_headoffice": "ප්‍රධාන කාර්යාල පරිපාලන මාදිලිය සක්‍රීයයි: සෘජු මධ්‍යම බලය පැවරීම සහ විගණන අභිබවා යාම් සක්‍රීය කර ඇත.",
  "btn_authorize_internal_application": "අභ්‍යන්තර අයදුම්පත සඳහා අවසර දෙන්න",
  "btn_formally_submit_application": "ව්‍යවස්ථාපිත අයදුම්පත විධිමත් ලෙස ඉදිරිපත් කරන්න",
  "msg_dg_approval_missing_person": "ව්‍යවස්ථාපිත ප්‍රොටෝකෝලය: දායකයා අතුරුදහන් වූ පුද්ගලයෙකු ලෙස ප්‍රකාශයට පත් කර ඇත. වත්මන් නියාමන රාමු යටතේ විශේෂ අධ්‍යක්ෂ ජනරාල් අනුමැතිය විධිමත් ලෙස අනිවාර්ය වේ.",
  "msg_dg_approval_marriage_duration": "විවාහය {index}: ජීව විද්‍යාත්මක දරුවන් නොමැතිව, සක්‍රීය කාලසීමාව අනිවාර්ය වසර 1ක සීමාවට වඩා අඩුය.",
  "msg_dg_approval_financial_alert": "යැපෙන්නන්ගේ මූල්‍ය අනතුරු ඇඟවීම (නියෝජිත හැඳුනුම්පත: {id}): ස්වාධීන ආදායම් උත්පාදන වත්කම් ලේඛනගත කර ඇති බැවින් විධිමත් ඇගයීමක් අවශ්‍ය වේ.",
  "btn_print_app_summary": "අයදුම්පත් සාරාංශය මුද්‍රණය කරන්න",
  "btn_print_docs_list": "ලේඛන ලැයිස්තුව මුද්‍රණය කරන්න",
  "btn_print_eligibility_report": "සුදුසුකම් වාර්තාව මුද්‍රණය කරන්න"
};

const sec8_ta = {
  "btn_finish_return_dashboard": "முடித்து கட்டுப்பாட்டுப் பலகத்திற்குத் திரும்பு",
  "msg_death_gratuity_warning_gt5": "சட்ட ரீதியான உத்தரவு: பங்களிப்பாளர் 5 அல்லது அதற்கு மேற்பட்ட ஆண்டுகள் சேவைக்காலத்துடன் சேவையில் இருக்கும்போதே இறந்துள்ளார். இறப்புக் கொடைக்கு தகுதியானவர். கடைசியாக பணிபுரிந்த இடம் இந்த W&OP (PD 04) உடன் PD 05 விண்ணப்பத்தையும் முறைப்படி சமர்ப்பிக்க வேண்டும். இறப்புக் கொடை தீர்க்கப்பட்ட பின்னரே W&OP கொடுப்பனவுகள் தொடங்கும்.",
  "msg_death_gratuity_warning_lt5": "சட்ட ரீதியான உத்தரவு: பங்களிப்பாளர் 5 ஆண்டுகளுக்கு குறைவான சேவைக்காலத்துடன் சேவையில் இருக்கும்போதே இறந்துள்ளார். W&OP நன்மைகளுக்கு மட்டுமே தகுதியானவர். இறப்புக் கொடை பொருந்தாது.",
  "msg_auth_warning_public": "பொதுப் பயனர் என்ற வகையில், இந்த இணையதளம் தர்க்கரீதியான தகுதி சரிபார்ப்பை மட்டுமே வழங்குகிறது. நன்மைகளை முறைப்படி கோருவதற்கு, தேவையான ஆவணங்களை பிரதேச செயலகத்தில் (இறந்தவர் ஓய்வூதியராக இருந்தால்) அல்லது கடைசியாக பணிபுரிந்த இடத்தில் (சேவையில் இருக்கும்போது இறந்தால்) நேரில் சமர்ப்பிக்கவும்.",
  "msg_auth_warning_divsec_not_pensioner": "அங்கீகாரத் தடை: ஓய்வுபெறுவதற்கு முன் இறந்த பங்களிப்பாளர்களுக்கான சட்டப்பூர்வ விண்ணப்பங்கள் பிரதேச செயலகத்தின் மூலம் அல்லாமல், அவர்கள் கடைசியாக பணிபுரிந்த இடத்தாலேயே ஆரம்பிக்கப்பட்டு முறைப்படி சமர்ப்பிக்கப்பட வேண்டும்.",
  "msg_auth_warning_workingplace_pensioner": "அங்கீகாரத் தடை: ஓய்வூதியர்களாக இறந்த பங்களிப்பாளர்களுக்கான சட்டப்பூர்வ விண்ணப்பங்கள் கடைசியாக பணிபுரிந்த இடத்தால் அல்லாமல், சம்பந்தப்பட்ட பிரதேச செயலகத்தால் முறைப்படி செயலாக்கப்பட்டு, சரிபார்க்கப்பட்டு சமர்ப்பிக்கப்பட வேண்டும்.",
  "msg_auth_warning_divsec_pension_not_commenced": "அங்கீகாரத் தடை: இறப்பதற்கு முன் ஓய்வூதியக் கொடுப்பனவுகள் தொடங்கப்படாததால், வாரிசுகளின் கொடுப்பனவுகளுக்கான PD 03 விண்ணப்பத்தை கடைசியாக பணிபுரிந்த இடம் சமர்ப்பிக்க வேண்டும். இந்த விண்ணப்பத்தை நேரடியாகப் பூர்த்தி செய்வதிலிருந்து நீங்கள் தடுக்கப்பட்டுள்ளீர்கள்.",
  "msg_auth_warning_workingplace_pension_not_commenced": "கட்டாய உத்தரவு: ஓய்வூதியக் கொடுப்பனவுகள் தொடங்கப்படாததால், வாரிசுகளின் கொடுப்பனவுகளுக்காக மையப்படுத்தப்பட்ட ஓய்வூதியப் பிரிவிற்கு நீங்கள் PD 03 விண்ணப்பத்தை சமர்ப்பிக்க வேண்டும். இந்த W&OP (PD 04) விண்ணப்பம் அதனுடன் இணைத்து அனுப்பப்பட வேண்டும்.",
  "msg_auth_warning_headoffice": "தலைமை அலுவலக நிர்வாக முறைமை செயலில் உள்ளது: நேரடி மைய அங்கீகாரம் மற்றும் தணிக்கை மேலெழுதல்கள் செயல்படுத்தப்பட்டுள்ளன.",
  "btn_authorize_internal_application": "உள் விண்ணப்பத்தை அங்கீகரி",
  "btn_formally_submit_application": "சட்டப்பூர்வ விண்ணப்பத்தை முறைப்படி சமர்ப்பி",
  "msg_dg_approval_missing_person": "சட்ட ரீதியான நெறிமுறை: பங்களிப்பாளர் காணாமல் போனவராக அறிவிக்கப்பட்டுள்ளார். தற்போதைய ஒழுங்குமுறை கட்டமைப்புகளின் கீழ் சிறப்பு பணிப்பாளர் நாயகத்தின் ஒப்புதல் முறைப்படி கட்டாயமாக்கப்பட்டுள்ளது.",
  "msg_dg_approval_marriage_duration": "திருமணம் {index}: உயிரியல் குழந்தைகள் இல்லாமல், செயலில் உள்ள காலம் கட்டாய 1 வருட காலக்கெடுவை விட குறைவாக உள்ளது.",
  "msg_dg_approval_financial_alert": "சார்ந்திருப்போர் நிதி எச்சரிக்கை (பதிலாள் ஐடி: {id}): சுயாதீன வருமானத்தை உருவாக்கும் சொத்துக்கள் ஆவணப்படுத்தப்பட்டுள்ளதால் முறையான மதிப்பீடு தேவைப்படுகிறது.",
  "btn_print_app_summary": "விண்ணப்ப சுருக்கத்தை அச்சிடு",
  "btn_print_docs_list": "ஆவணப் பட்டியலை அச்சிடு",
  "btn_print_eligibility_report": "தகுதி அறிக்கையை அச்சிடு"
};

const newData = {
  en: { ...sec8_en },
  si: { ...sec8_si },
  ta: { ...sec8_ta }
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
