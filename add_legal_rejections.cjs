const fs = require('fs');
let src = fs.readFileSync('./src/App.jsx', 'utf8');

// ============================================================
// PHASE 2: Wire rejection messages with legal citations
// Each handleRejection gets the citation appended as a second list item
// ============================================================

// Helper: wrap a rejection to include citation
// Pattern: handleRejection(t('KEY')) → handleRejection([t('KEY'), getLegalRef('REF', i18n.language)])
// Since we can't use hooks in script, we embed as a formatted string in the reason itself

// 1. err_statutory_65 → age_65_in_service
src = src.replace(
  `handleRejection(t('err_statutory_65'));`,
  `handleRejection([t('err_statutory_65'), '⚖ ' + getLegalRef('age_65_in_service', i18n.language)]);`
);

// 2. err_missing_retired_4m → missing_person_waiting
src = src.replace(
  `handleRejection(t('err_missing_retired_4m'));`,
  `handleRejection([t('err_missing_retired_4m'), '⚖ ' + getLegalRef('missing_person_waiting', i18n.language)]);`
);

// 3. err_missing_active_12m → missing_person_waiting
src = src.replace(
  `handleRejection(t('err_missing_active_12m'));`,
  `handleRejection([t('err_missing_active_12m'), '⚖ ' + getLegalRef('missing_person_waiting', i18n.language)]);`
);

// 4. err_female_reluctant → female_civil_pre1983_ineligible
src = src.replace(
  `if (e.target.value === 'No + Reluctant') handleRejection(t('err_female_reluctant'));`,
  `if (e.target.value === 'No + Reluctant') handleRejection([t('err_female_reluctant'), '⚖ ' + getLegalRef('female_civil_pre1983_ineligible', i18n.language)]);`
);

// 5. err_military_consent_late_regular → forces_regular_consent_late
src = src.replace(
  `else if (data.militaryConsentDate > '2006-06-30') { setFormErrors(errsA); handleRejection(t('err_military_consent_late_regular')); return; }`,
  `else if (data.militaryConsentDate > '2006-06-30') { setFormErrors(errsA); handleRejection([t('err_military_consent_late_regular'), '⚖ ' + getLegalRef('forces_regular_consent_late', i18n.language)]); return; }`
);

// 6. err_military_consent_late_volunteer → forces_volunteer_consent_late
src = src.replace(
  `else if (data.militaryConsentDate > '2012-12-31') { setFormErrors(errsA); handleRejection(t('err_military_consent_late_volunteer')); return; }`,
  `else if (data.militaryConsentDate > '2012-12-31') { setFormErrors(errsA); handleRejection([t('err_military_consent_late_volunteer'), '⚖ ' + getLegalRef('forces_volunteer_consent_late', i18n.language)]); return; }`
);

// 7. err_not_permanent → non_pensionable_ineligible
src = src.replace(
  `handleRejection(t('err_not_permanent')); return;`,
  `handleRejection([t('err_not_permanent'), '⚖ ' + getLegalRef('non_pensionable_ineligible', i18n.language)]); return;`
);

// 8. under-10-years service rejection
src = src.replace(
  `handleRejection("Statutory Application Voided: Contributor service terminated with loss of pension and did not complete the mandatory minimum 10 years of reckonable service.");`,
  `handleRejection(["Statutory Application Voided: Contributor service terminated with loss of pension and did not complete the mandatory minimum 10 years of reckonable service.", '⚖ ' + getLegalRef('under10yrs_no_pension', i18n.language)]);`
);

// 9. err_divorced_from_contributor
src = src.replace(
  `handleRejection(t('err_divorced_from_contributor')); return;`,
  `handleRejection([t('err_divorced_from_contributor'), '⚖ ' + getLegalRef('post_retirement_marriage', i18n.language)]); return;`
);

fs.writeFileSync('./src/App.jsx', src, 'utf8');
console.log('Phase 2 done: rejection messages wired with citations.');
