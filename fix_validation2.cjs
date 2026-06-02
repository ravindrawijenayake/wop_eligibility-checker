const fs = require('fs');
let src = fs.readFileSync('./src/App.jsx', 'utf8');

// Add inline error text under marriage date field (after the input, before the closing div)
src = src.replace(
  `                  <input type="date" min="1900-01-01" className={\`form-input \${formErrors[\`\${arrKey}_\${i}_date\`] ? 'border-[2px] border-error text-error' : ''}\`} value={m.date || ''} onChange={e => { updateMar(i, 'date', e.target.value); setFormErrors(p => ({ ...p, [\`\${arrKey}_\${i}_date\`]: null })) }} />
                  {formErrors[\`\${arrKey}_\${i}_date\`] && <div className="text-error text-xs font-bold leading-tight mt-1">{formErrors[\`\${arrKey}_\${i}_date\`]}</div>}`,
  `                  <input type="date" min="1900-01-01" className={\`form-input \${formErrors[\`\${arrKey}_\${i}_date\`] ? 'border-[2px] border-error text-error' : ''}\`} value={m.date || ''} onChange={e => { updateMar(i, 'date', e.target.value); setFormErrors(p => ({ ...p, [\`\${arrKey}_\${i}_date\`]: null })) }} />
                  {formErrors[\`\${arrKey}_\${i}_date\`] && <div className="text-error text-xs font-bold leading-tight mt-1">{formErrors[\`\${arrKey}_\${i}_date\`]}</div>}`
);

// Fix marriage cert input - already has error display, just ensure border-[2px] applied (already done by fix_validation.cjs)
// Fix spouse NIC - add inline error text (currently missing)
src = src.replace(
  `                  <input type="text" placeholder={t('lbl_spouse_nic')} className={\`form-input \${formErrors[\`\${arrKey}_\${i}_s_nic\`] ? 'border-[2px] border-error text-error' : ''}\`} value={m.s_nic || ''} onChange={e => { updateMar(i, 's_nic', e.target.value); setFormErrors(p => ({ ...p, [\`\${arrKey}_\${i}_s_nic\`]: null })) }} />
                  {formErrors[\`\${arrKey}_\${i}_s_nic\`] && <div className="text-error text-xs font-bold leading-tight mt-1">{formErrors[\`\${arrKey}_\${i}_s_nic\`]}</div>}`,
  `                  <input type="text" placeholder={t('lbl_spouse_nic')} className={\`form-input \${formErrors[\`\${arrKey}_\${i}_s_nic\`] ? 'border-[2px] border-error text-error' : ''}\`} value={m.s_nic || ''} onChange={e => { updateMar(i, 's_nic', e.target.value); setFormErrors(p => ({ ...p, [\`\${arrKey}_\${i}_s_nic\`]: null })) }} />
                  {formErrors[\`\${arrKey}_\${i}_s_nic\`] && <div className="text-error text-xs font-bold leading-tight mt-1">{formErrors[\`\${arrKey}_\${i}_s_nic\`]}</div>}`
);

// Fix gender select in child - already has error class, add inline error text
src = src.replace(
  `                            <select className={\`form-input text-sm \${formErrors[\`\${arrKey}_\${i}_c_\${j}_gender\`] ? 'border-[2px] border-error text-error' : ''}\`} value={child.gender} onChange={e => { let arr = [...m.children]; arr[j].gender = e.target.value; updateMar(i, 'children', arr); setFormErrors(p => ({ ...p, [\`\${arrKey}_\${i}_c_\${j}_gender\`]: null })); }}><option value="Male">Male</option><option value="Female">Female</option></select>`,
  `                            <div>\n                              <select className={\`form-input text-sm \${formErrors[\`\${arrKey}_\${i}_c_\${j}_gender\`] ? 'border-[2px] border-error text-error' : ''}\`} value={child.gender} onChange={e => { let arr = [...m.children]; arr[j].gender = e.target.value; updateMar(i, 'children', arr); setFormErrors(p => ({ ...p, [\`\${arrKey}_\${i}_c_\${j}_gender\`]: null })); }}><option value="Male">Male</option><option value="Female">Female</option></select>\n                              {formErrors[\`\${arrKey}_\${i}_c_\${j}_gender\`] && <div className="text-error text-[10px] font-bold mt-0.5">{formErrors[\`\${arrKey}_\${i}_c_\${j}_gender\`]}</div>}\n                            </div>`
);

// Fix child DOB - add inline error text below date input
src = src.replace(
  `                              <input type="date" min="1900-01-01" className={\`form-input text-sm mb-1 \${formErrors[\`\${arrKey}_\${i}_c_\${j}_dob\`] ? 'border-[2px] border-error text-error' : ''}\`} value={child.dob} onChange={e => { let arr = [...m.children]; arr[j].dob = e.target.value; updateMar(i, 'children', arr); setFormErrors(p => ({ ...p, [\`\${arrKey}_\${i}_c_\${j}_dob\`]: null })); }} />
                              <div className="text-xs text-primary font-bold">{t('lbl_auto_age').replace('{age}', cAge)}</div>`,
  `                              <input type="date" min="1900-01-01" className={\`form-input text-sm mb-1 \${formErrors[\`\${arrKey}_\${i}_c_\${j}_dob\`] ? 'border-[2px] border-error text-error' : ''}\`} value={child.dob} onChange={e => { let arr = [...m.children]; arr[j].dob = e.target.value; updateMar(i, 'children', arr); setFormErrors(p => ({ ...p, [\`\${arrKey}_\${i}_c_\${j}_dob\`]: null })); }} />
                              {formErrors[\`\${arrKey}_\${i}_c_\${j}_dob\`] && <div className="text-error text-[10px] font-bold mt-0.5">{formErrors[\`\${arrKey}_\${i}_c_\${j}_dob\`]}</div>}
                              {!formErrors[\`\${arrKey}_\${i}_c_\${j}_dob\`] && <div className="text-xs text-primary font-bold">{t('lbl_auto_age').replace('{age}', cAge)}</div>}`
);

// Fix remarriage date - add inline error text
src = src.replace(
  `                      <input type="date" min="1900-01-01" className={\`form-input border-amber max-w-sm \${formErrors[\`\${arrKey}_\${i}_s_rem_date\`] ? 'border-[2px] border-error text-error' : ''}\`} value={m.s_remarriage_date || ''} onChange={e => { updateMar(i, 's_remarriage_date', e.target.value); setFormErrors(p => ({ ...p, [\`\${arrKey}_\${i}_s_rem_date\`]: null })); }} />
                      {formErrors[\`\${arrKey}_\${i}_s_rem_date\`] && <div className="text-error text-xs font-bold leading-tight mt-1">{formErrors[\`\${arrKey}_\${i}_s_rem_date\`]}</div>}`,
  `                      <input type="date" min="1900-01-01" className={\`form-input max-w-sm \${formErrors[\`\${arrKey}_\${i}_s_rem_date\`] ? 'border-[2px] border-error text-error' : 'border-amber'}\`} value={m.s_remarriage_date || ''} onChange={e => { updateMar(i, 's_remarriage_date', e.target.value); setFormErrors(p => ({ ...p, [\`\${arrKey}_\${i}_s_rem_date\`]: null })); }} />
                      {formErrors[\`\${arrKey}_\${i}_s_rem_date\`] && <div className="text-error text-xs font-bold leading-tight mt-1">{formErrors[\`\${arrKey}_\${i}_s_rem_date\`]}</div>}`
);

// Fix SectionB_C formErrors.global display (it doesn't have one - add it)
// Check if SectionB_C has a global error banner
if (!src.includes('section_b_c_title')) {
  console.log('WARNING: section_b_c_title not found');
} else {
  // Add global error display to SectionB_C after its opening div
  src = src.replace(
    `      <div className="tag">{t('section_b_c_title')}</div>\n      <h2 className="text-2xl font-bold mb-4">{t('lbl_reg_term')}</h2>`,
    `      <div className="tag">{t('section_b_c_title')}</div>\n      {formErrors.global && <div className="p-3 bg-red-100 text-error border-[2px] border-error mb-4 font-bold rounded animate-fade-in">{formErrors.global}</div>}\n      <h2 className="text-2xl font-bold mb-4">{t('lbl_reg_term')}</h2>`
  );
}

fs.writeFileSync('./src/App.jsx', src, 'utf8');
console.log('Done — inline error texts and SectionB_C global banner added.');
