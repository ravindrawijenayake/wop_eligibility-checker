const fs = require('fs');

let jsx = fs.readFileSync('src/App.jsx', 'utf8');

const oldIneligible = `<div className="animate-fade-in text-center py-8 px-6 bg-surface-alt border border-error rounded-xl shadow-lg">
            <XCircle size={64} className="text-error mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-error mb-2">{t('section_f_ineligibility_title')}</h2>
            <p className="text-muted text-lg mb-8">{t('msg_ineligibility_desc')}</p>

            <div className="bg-[#ffffff] p-6 rounded border border-error text-left max-w-lg mx-auto">
              <h3 className="font-bold text-lg border-b border-subtle pb-2 mb-4 text-error">{t('lbl_failure_identifiers')}</h3>
              <ul className="list-disc pl-5 space-y-2 mt-4 text-[#991b1b] font-bold">
                {data.rejectionReasons.map((r, idx) => <li key={idx}>{r}</li>)}
              </ul>
              <div className="mt-6 pt-4 border-t border-subtle text-sm text-muted">
                <p>{t('lbl_contributor')}: {data.name || t('msg_not_captured')}</p>
                <p>{t('lbl_nic')}: {data.nic || t('msg_not_captured')}</p>
              </div>
            </div>
            <p className="mt-6 text-sm text-muted font-bold">{t('msg_rejection_trigger_info')}</p>
            <button className="btn mt-4 bg-surface-alt text-primary border-primary hover:bg-gray-100 mr-4" onClick={() => { updateData('isEligible', true); setCheckerStep(0); }}>{t('btn_back_correct_inputs')}</button>
            <button className="btn mt-8" style={{ background: 'var(--error)' }} onClick={() => resetApp()}>{t('btn_acknowledge_exit')}</button>
            <button className="btn mt-8 ml-4" style={{ background: '#334155', color: '#fff' }} onClick={() => handlePrint('rejection')}>{t('btn_print_rejection_report')}</button>
          </div>`;

const newIneligible = `<div className="animate-fade-in result-card max-w-2xl mx-auto">
            <div className="result-header ineligible flex flex-col items-center">
              <XCircle size={72} className="text-white mb-4 drop-shadow-md" />
              <h2 className="text-3xl font-bold text-white tracking-tight" style={{fontFamily: 'Outfit, sans-serif'}}>{t('section_f_ineligibility_title')}</h2>
              <p className="text-red-100 text-lg mt-2 font-medium">{t('msg_ineligibility_desc')}</p>
            </div>
            <div className="result-body">
              <div className="bg-white p-6 rounded-xl border border-red-200 shadow-sm text-left">
                <h3 className="font-bold text-lg border-b border-red-100 pb-3 mb-4 text-error flex items-center gap-2">
                  <AlertTriangle size={20} /> {t('lbl_failure_identifiers')}
                </h3>
                <ul className="list-disc pl-5 space-y-3 mt-4 text-red-700 font-medium">
                  {data.rejectionReasons.map((r, idx) => <li key={idx}>{r}</li>)}
                </ul>
                <div className="mt-6 pt-4 border-t border-slate-200 text-sm">
                  <div className="detail-item !py-1 !border-none"><span className="detail-label">{t('lbl_contributor')}</span> <span className="detail-value">{data.name || t('msg_not_captured')}</span></div>
                  <div className="detail-item !py-1 !border-none"><span className="detail-label">{t('lbl_nic')}</span> <span className="detail-value">{data.nic || t('msg_not_captured')}</span></div>
                </div>
              </div>
              <p className="mt-6 text-sm text-center text-slate-500 font-semibold">{t('msg_rejection_trigger_info')}</p>
              
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <button className="btn bg-white text-slate-700 border border-slate-300 shadow-sm hover:bg-slate-50" onClick={() => { updateData('isEligible', true); setCheckerStep(0); }}>{t('btn_back_correct_inputs')}</button>
                <button className="btn bg-red-600 text-white shadow-md hover:bg-red-700" onClick={() => resetApp()}>{t('btn_acknowledge_exit')}</button>
                <button className="btn bg-slate-800 text-white shadow-md hover:bg-slate-900" onClick={() => handlePrint('rejection')}><Printer size={18} /> {t('btn_print_rejection_report')}</button>
              </div>
            </div>
          </div>`;


const oldEligibleStart = `<div className={\`animate-fade-in py-8 px-6 bg-surface-alt border border-success rounded-xl shadow-lg \${printMode && printMode !== 'output' ? 'print-hide' : ''}\`}>
            <div className={\`text-center mb-6 \${printMode === 'output' ? 'print-hide' : ''}\`}>
            <CheckCircle size={64} className="text-success mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-success mb-2">{t('section_f_eligibility_title').replace('{wopTitle}', wopTitle)}</h2>
            <p className="text-muted text-lg">{t('msg_validations_completed')}</p>
          </div>`;

const newEligibleStart = `<div className={\`animate-fade-in result-card \${printMode && printMode !== 'output' ? 'print-hide' : ''}\`}>
            <div className={\`result-header eligible \${printMode === 'output' ? 'print-hide' : ''}\`}>
              <CheckCircle size={72} className="text-white mx-auto mb-4 drop-shadow-md" />
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight" style={{fontFamily: 'Outfit, sans-serif'}}>{t('section_f_eligibility_title').replace('{wopTitle}', wopTitle)}</h2>
              <p className="text-green-50 text-lg font-medium">{t('msg_validations_completed')}</p>
            </div>
            
            <div className="result-body">`;

// We also need to close the result-body div instead of just the original div
const oldEligibleEnd = `</div>
        </>`;
        
const newEligibleEnd = `</div>
          </div>
        </>`;

if (jsx.includes(oldIneligible)) {
  jsx = jsx.replace(oldIneligible, newIneligible);
  console.log('Ineligible updated.');
} else {
  // If strict match fails, use regex or partial
  console.log('Ineligible old strict match failed.');
}

if (jsx.includes(oldEligibleStart)) {
  jsx = jsx.replace(oldEligibleStart, newEligibleStart);
  // Also we must add closing div for result-body
  // Find the exact return statement for the eligible block
  let returnIdx = jsx.indexOf(newEligibleStart);
  if(returnIdx !== -1) {
    let oldEndIdx = jsx.indexOf('</div>\\n        </>', returnIdx);
    if(oldEndIdx !== -1) {
       jsx = jsx.substring(0, oldEndIdx) + '</div>\\n          </div>\\n        </>' + jsx.substring(oldEndIdx + 19);
    }
  }
  console.log('Eligible updated.');
} else {
  console.log('Eligible old strict match failed.');
}

fs.writeFileSync('src/App.jsx', jsx, 'utf8');
