const fs = require('fs');
let src = fs.readFileSync('./src/App.jsx', 'utf8');

// ============================================================
// PHASE 3: Inline LegalBadge on form fields
// ============================================================

// 3A: Below DOA field — age at appointment provision
src = src.replace(
  `            {data.dob && data.doa && !formErrors.doa && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-primary text-white text-xs font-bold rounded">{t('lbl_age_at_appointment')}: {computeFullAge(data.dob, data.doa)}</span>
            )}`,
  `            {data.dob && data.doa && !formErrors.doa && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-primary text-white text-xs font-bold rounded">{t('lbl_age_at_appointment')}: {computeFullAge(data.dob, data.doa)}</span>
            )}
            <LegalBadge refKey={data.serviceSector === 'Forces' ? (data.gender === 'Female' ? 'forces_female_regular' : 'forces_male_regular') : (data.gender === 'Female' && data.doa >= '1983-08-01' ? 'female_civil_post1983' : data.gender === 'Male' ? 'male_civil_mandatory' : 'female_civil_pre1983_opt')} lang={i18n.language} />`
);

// 3B: Below female consent select — opt-in legal basis
src = src.replace(
  `                  <select className={\`form-input \${formErrors.femaleConsent ? 'border-[2px] border-error text-error' : ''}\`} value={data.femaleConsent} onChange={e => {
                    if (e.target.value === 'No + Reluctant') handleRejection([t('err_female_reluctant'), '⚖ ' + getLegalRef('female_civil_pre1983_ineligible', i18n.language)]);
                    updateData('femaleConsent', e.target.value);
                    setFormErrors(p => ({ ...p, femaleConsent: null }));
                  }}>
                    <option value="">{t('opt_select')}</option>
                    <option value="Yes">{t('opt_yes')}</option>
                    <option value="Yes Before 2014">{t('opt_yes_before_2014')}</option>
                    <option value="Yes Evidence">{t('opt_yes_evidence')}</option>
                    <option value="No + Reluctant">{t('opt_no_reluctant')}</option>
                  </select>`,
  `                  <select className={\`form-input \${formErrors.femaleConsent ? 'border-[2px] border-error text-error' : ''}\`} value={data.femaleConsent} onChange={e => {
                    if (e.target.value === 'No + Reluctant') handleRejection([t('err_female_reluctant'), '⚖ ' + getLegalRef('female_civil_pre1983_ineligible', i18n.language)]);
                    updateData('femaleConsent', e.target.value);
                    setFormErrors(p => ({ ...p, femaleConsent: null }));
                  }}>
                    <option value="">{t('opt_select')}</option>
                    <option value="Yes">{t('opt_yes')}</option>
                    <option value="Yes Before 2014">{t('opt_yes_before_2014')}</option>
                    <option value="Yes Evidence">{t('opt_yes_evidence')}</option>
                    <option value="No + Reluctant">{t('opt_no_reluctant')}</option>
                  </select>
                  <LegalBadge refKey="female_civil_pre1983_opt" lang={i18n.language} />`
);

// 3C: Below military service category radios
src = src.replace(
  `              <label className="cursor-pointer"><input type="radio" checked={data.serviceCategory === 'Regular Force'} onChange={() => { updateData('serviceCategory', 'Regular Force'); setFormErrors(p => (`,
  `              <LegalBadge refKey={data.gender === 'Female' ? 'forces_female_regular' : 'forces_male_regular'} lang={i18n.language} />
              <label className="cursor-pointer"><input type="radio" checked={data.serviceCategory === 'Regular Force'} onChange={() => { updateData('serviceCategory', 'Regular Force'); setFormErrors(p => (`
);

// 3D: Below military consent date field — forces deadline citations
src = src.replace(
  `                    {formErrors.militaryConsentDate && <span className="text-error text-xs font-bold">— {formErrors.militaryConsentDate}</span>}`,
  `                    {formErrors.militaryConsentDate && <span className="text-error text-xs font-bold">— {formErrors.militaryConsentDate}</span>}
                    <LegalBadge refKey={data.serviceCategory === 'Volunteer Force' ? 'forces_volunteer_opt' : 'forces_pre1968_opt'} lang={i18n.language} />`
);

// 3E: Below waiting period note for missing persons
src = src.replace(
  `                <div className="text-xs text-amber font-bold mt-1">{t('msg_waiting_period_validated')}</div>`,
  `                <div className="text-xs text-amber font-bold mt-1">{t('msg_waiting_period_validated')}</div>
                <LegalBadge refKey="missing_person_waiting" lang={i18n.language} />`
);

fs.writeFileSync('./src/App.jsx', src, 'utf8');
console.log('Phase 3 done: inline form badges added.');
