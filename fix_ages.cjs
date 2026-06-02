const fs = require('fs');
let src = fs.readFileSync('./src/App.jsx', 'utf8');

// ============================================================
// FIX 1: Add computeFullAge helper (returns "X yrs Y mo Z days")
// Insert after computeAgeAtDate function
// ============================================================
src = src.replace(
`const validateLinearMarriages`,
`// Returns a human-readable Y/M/D age string between two dates
const computeFullAge = (dobStr, targetDateStr) => {
  if (!dobStr || !targetDateStr) return '';
  const d1 = new Date(dobStr);
  const d2 = new Date(targetDateStr);
  if (d2 < d1) return '';
  let years = d2.getFullYear() - d1.getFullYear();
  let months = d2.getMonth() - d1.getMonth();
  let days = d2.getDate() - d1.getDate();
  if (days < 0) { months--; const prev = new Date(d2.getFullYear(), d2.getMonth(), 0); days += prev.getDate(); }
  if (months < 0) { years--; months += 12; }
  const parts = [];
  if (years > 0) parts.push(\`\${years} yr\${years !== 1 ? 's' : ''}\`);
  if (months > 0) parts.push(\`\${months} mo\`);
  if (days > 0 || parts.length === 0) parts.push(\`\${days} day\${days !== 1 ? 's' : ''}\`);
  return parts.join(' ');
};

const validateLinearMarriages`
);

// ============================================================
// FIX 2: Move the under-18 check INTO the errsA field block
// so it fires even when DOA is just entered but DOB exists
// ============================================================
src = src.replace(
`            if (Object.keys(errsA).length > 0) { setFormErrors(prev => ({ ...prev, ...errsA, global: t('err_global_format') })); return; }
            if (data.dob && data.doa) {
              const ageAtAppt = computeAgeAtDate(data.dob, data.doa);
              if (ageAtAppt < 18) { handleRejection(t('err_under_18')); return; }
            }`,
`            // Under-18 check: run before field errors so it can also set field error
            if (data.dob && data.doa) {
              const ageAtAppt = computeAgeAtDate(data.dob, data.doa);
              if (ageAtAppt < 18) errsA.doa = t('err_under_18');
            }
            if (Object.keys(errsA).length > 0) { setFormErrors(prev => ({ ...prev, ...errsA, global: t('err_global_format') })); return; }`
);

// ============================================================
// FIX 3: Add age-at-appointment badge below DOA date input
// ============================================================
src = src.replace(
`            <input type="date" min="1900-01-01" className={\`form-input \${formErrors.doa ? 'border-[2px] border-error text-error' : ''}\`} value={data.doa} onChange={e => { updateData('doa', e.target.value); setFormErrors(prev => ({ ...prev, doa: null, svcCategory: null, militaryConsentDate: null })); }} />
            {formErrors.doa && <div className="text-error text-xs font-bold mt-1">{formErrors.doa}</div>}`,
`            <input type="date" min="1900-01-01" className={\`form-input \${formErrors.doa ? 'border-[2px] border-error text-error' : ''}\`} value={data.doa} onChange={e => { updateData('doa', e.target.value); setFormErrors(prev => ({ ...prev, doa: null, svcCategory: null, militaryConsentDate: null })); }} />
            {formErrors.doa && <div className="text-error text-xs font-bold mt-1">{formErrors.doa}</div>}
            {data.dob && data.doa && !formErrors.doa && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-primary text-white text-xs font-bold rounded">{t('lbl_age_at_appointment')}: {computeFullAge(data.dob, data.doa)}</span>
            )}`
);

// ============================================================
// FIX 4: Add age-at-retirement badge below DOR in SectionB_C
// The DOR input in SectionB_C is disabled (display only) — add badge after it
// ============================================================
src = src.replace(
`            <div className="form-row"><label className="label">{t('lbl_retired_date')}</label><input type="date" className="form-input bg-gray-100" disabled value={data.dor} /></div>`,
`            <div className="form-row">
              <label className="label">{t('lbl_retired_date')}</label>
              <input type="date" className="form-input bg-gray-100" disabled value={data.dor} />
              {data.dob && data.dor && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-primary text-white text-xs font-bold rounded">{t('lbl_age_at_retirement')}: {computeFullAge(data.dob, data.dor)}</span>
              )}
            </div>`
);

// ============================================================
// FIX 5: Add age-at-marriage badge below each marriage date in builder
// Find the marriage date input block and add badge after the error div
// ============================================================
src = src.replace(
`                  <input type="date" min="1900-01-01" className={\`form-input \${formErrors[\`\${arrKey}_\${i}_date\`] ? 'border-[2px] border-error text-error' : ''}\`} value={m.date || ''} onChange={e => { updateMar(i, 'date', e.target.value); setFormErrors(p => ({ ...p, [\`\${arrKey}_\${i}_date\`]: null })) }} />
                  {formErrors[\`\${arrKey}_\${i}_date\`] && <div className="text-error text-xs font-bold leading-tight mt-1">{formErrors[\`\${arrKey}_\${i}_date\`]}</div>}`,
`                  <input type="date" min="1900-01-01" className={\`form-input \${formErrors[\`\${arrKey}_\${i}_date\`] ? 'border-[2px] border-error text-error' : ''}\`} value={m.date || ''} onChange={e => { updateMar(i, 'date', e.target.value); setFormErrors(p => ({ ...p, [\`\${arrKey}_\${i}_date\`]: null })) }} />
                  {formErrors[\`\${arrKey}_\${i}_date\`] && <div className="text-error text-xs font-bold leading-tight mt-1">{formErrors[\`\${arrKey}_\${i}_date\`]}</div>}
                  {data.dob && m.date && !formErrors[\`\${arrKey}_\${i}_date\`] && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-primary text-white text-xs font-bold rounded">{t('lbl_age_at_marriage')}: {computeFullAge(data.dob, m.date)}</span>
                  )}`
);

// ============================================================
// FIX 6: Also add DOR field in Part1A (it exists but has no age badge)
// The DOR in Part1A is inside formErrors.p1dor block
// ============================================================
src = src.replace(
`            <div className="form-row animate-fade-in">
              <label className="label">{t('lbl_dor')}</label>
              <input type="date" min="1900-01-01" className={\`form-input \${formErrors.p1dor ? 'border-[2px] border-error text-error' : ''}\`} value={data.dor} onChange={e => { updateData('dor', e.target.value); setFormErrors(p => ({ ...p, p1dor: null })); }} />
              {formErrors.p1dor && <div className="text-error text-xs font-bold mt-1">{formErrors.p1dor}</div>}
            </div>`,
`            <div className="form-row animate-fade-in">
              <label className="label">{t('lbl_dor')}</label>
              <input type="date" min="1900-01-01" className={\`form-input \${formErrors.p1dor ? 'border-[2px] border-error text-error' : ''}\`} value={data.dor} onChange={e => { updateData('dor', e.target.value); setFormErrors(p => ({ ...p, p1dor: null })); }} />
              {formErrors.p1dor && <div className="text-error text-xs font-bold mt-1">{formErrors.p1dor}</div>}
              {data.dob && data.dor && !formErrors.p1dor && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-primary text-white text-xs font-bold rounded">{t('lbl_age_at_retirement')}: {computeFullAge(data.dob, data.dor)}</span>
              )}
            </div>`
);

fs.writeFileSync('./src/App.jsx', src, 'utf8');
console.log('Done.');
