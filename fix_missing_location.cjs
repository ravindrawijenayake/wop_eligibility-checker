const fs = require('fs');
let src = fs.readFileSync('./src/App.jsx', 'utf8');

// ============================================================
// FIX 1: Add missingLocation to initial state
// ============================================================
src = src.replace(
  `isMissingPerson: false, policeComplaintDate: '', diedDueToTerrorism: false,`,
  `isMissingPerson: false, policeComplaintDate: '', missingLocation: '', diedDueToTerrorism: false,`
);

// ============================================================
// FIX 2: Replace the static abroad note in Part1A with a 
// "Where did the disappearance occur?" radio + conditional guidance
// ============================================================
src = src.replace(
  `                <input type="date" min="1900-01-01" className={\`form-input \${formErrors.p1police ? 'border-[2px] border-error text-error' : ''}\`} value={data.policeComplaintDate} onChange={e => { updateData('policeComplaintDate', e.target.value); setFormErrors(p => ({ ...p, p1police: null })); }} />
                {formErrors.p1police && <div className="text-error text-xs font-bold mt-1">{formErrors.p1police}</div>}
                {data.policeComplaintDate && !formErrors.p1police && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-amber text-white text-xs font-bold rounded">
                    {t('lbl_time_since_complaint')}: {computeFullAge(data.policeComplaintDate, new Date().toISOString().slice(0, 10))}
                  </span>
                )}
                <div className="text-xs text-amber font-bold mt-1">{t('msg_waiting_period_validated')}</div>
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs font-bold text-blue-800">
                  {t('msg_missing_abroad_note')}
                </div>`,
  `                <input type="date" min="1900-01-01" className={\`form-input \${formErrors.p1police ? 'border-[2px] border-error text-error' : ''}\`} value={data.policeComplaintDate} onChange={e => { updateData('policeComplaintDate', e.target.value); setFormErrors(p => ({ ...p, p1police: null })); }} />
                {formErrors.p1police && <div className="text-error text-xs font-bold mt-1">{formErrors.p1police}</div>}
                {data.policeComplaintDate && !formErrors.p1police && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-amber text-white text-xs font-bold rounded">
                    {t('lbl_time_since_complaint')}: {computeFullAge(data.policeComplaintDate, new Date().toISOString().slice(0, 10))}
                  </span>
                )}
                <div className="text-xs text-amber font-bold mt-1">{t('msg_waiting_period_validated')}</div>
                {/* Location of disappearance */}
                <div className="mt-3 p-3 bg-surface-alt border border-subtle rounded animate-fade-in">
                  <label className="label font-bold mb-2">{t('lbl_missing_location')}</label>
                  <div className={\`flex gap-4 \${formErrors.missingLocation ? 'p-2 rounded border-[2px] border-error bg-red-50' : ''}\`}>
                    <label className="cursor-pointer font-bold text-sm"><input type="radio" checked={data.missingLocation === 'Sri Lanka'} onChange={() => { updateData('missingLocation', 'Sri Lanka'); setFormErrors(p => ({ ...p, missingLocation: null })); }} /> {t('opt_missing_sri_lanka')}</label>
                    <label className="cursor-pointer font-bold text-sm"><input type="radio" checked={data.missingLocation === 'Abroad'} onChange={() => { updateData('missingLocation', 'Abroad'); setFormErrors(p => ({ ...p, missingLocation: null })); }} /> {t('opt_missing_abroad')}</label>
                  </div>
                  {formErrors.missingLocation && <div className="text-error text-xs font-bold mt-1">{formErrors.missingLocation}</div>}
                  {data.missingLocation === 'Sri Lanka' && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900 font-bold animate-fade-in">
                      {t('msg_missing_sri_lanka_doc_note')}
                    </div>
                  )}
                  {data.missingLocation === 'Abroad' && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900 font-bold animate-fade-in">
                      {t('msg_missing_abroad_doc_note')}
                    </div>
                  )}
                </div>`
);

// ============================================================
// FIX 3: Validate missingLocation is selected before proceeding Part1A
// ============================================================
src = src.replace(
  `      if (data.isMissingPerson && !data.policeComplaintDate) errs.p1police = 'Required';`,
  `      if (data.isMissingPerson && !data.policeComplaintDate) errs.p1police = 'Required';
      if (data.isMissingPerson && !data.missingLocation) errs.missingLocation = t('err_missing_location_required');`
);

// ============================================================
// FIX 4: Replace static abroad note in SectionB_C with location-aware note
// ============================================================
src = src.replace(
  `          {data.isMissingPerson && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded animate-fade-in">
              <p className="text-xs font-bold text-blue-900">{t('msg_missing_abroad_pension_note')}</p>
            </div>
          )}`,
  `          {data.isMissingPerson && data.missingLocation === 'Abroad' && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded animate-fade-in">
              <p className="text-xs font-bold text-blue-900">{t('msg_missing_abroad_pension_note')}</p>
            </div>
          )}`
);

// ============================================================
// FIX 5: Add location-specific required documents
// Replace the generic death certificate doc push with conditional logic
// ============================================================
src = src.replace(
  `    docs.push({ id: 'c_dc', label: \`\${contributorPrefix} Death Certificate [Original certified by Additional/District Registrar]\`, required: true });`,
  `    if (data.isMissingPerson) {
      if (data.missingLocation === 'Sri Lanka') {
        docs.push({ id: 'c_police_complaint', label: \`\${contributorPrefix} Certified Copy of Police Complaint (from the relevant Police Station) regarding the disappearance\`, required: true });
      } else if (data.missingLocation === 'Abroad') {
        docs.push({ id: 'c_consular_letter', label: \`\${contributorPrefix} Confirmation Letter from the Consular Division, Ministry of Foreign Affairs (Sri Lanka) confirming the disappearance\`, required: true });
      }
    } else {
      docs.push({ id: 'c_dc', label: \`\${contributorPrefix} Death Certificate [Original certified by Additional/District Registrar]\`, required: true });
    }`
);

fs.writeFileSync('./src/App.jsx', src, 'utf8');
console.log('Done.');
