const fs = require('fs');

let jsx = fs.readFileSync('src/App.jsx', 'utf8');

const newAuthView = `  const AuthView = () => (
    <div className="animate-fade-in glass-panel p-8 lg:p-12 w-full max-w-7xl mx-auto my-8 lg:my-16" style={{boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'}}>
      <div className="flex flex-col lg:flex-row gap-12 items-center">
        {/* Left Side Description */}
        <div className="w-full lg:w-1/2 text-left">
          <div className="inline-flex justify-center items-center p-4 bg-indigo-50 rounded-full mb-6" style={{boxShadow: '0 0 20px rgba(2, 132, 199, 0.15)'}}>
            <ShieldCheck size={56} className="text-primary" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold mb-4 text-gray-900 tracking-tight" style={{fontFamily: 'Outfit, sans-serif'}}>{t('app_title')}</h2>
          <p className="text-xl text-primary font-bold mb-6">{t('app_subtitle')}</p>
          <p className="text-base text-gray-700 leading-relaxed font-medium">
            Welcome to the Widows’ and Orphans’ Pensions (W&OP) Eligibility Checker, an intuitive and user-friendly digital platform designed to help public sector employees and their families seamlessly determine their qualification for survivor benefits. By entering a few key details regarding service history and familial status, this tool securely evaluates your information against official regulatory guidelines to provide instant, clear guidance on your status. Streamlining what was once a complex manual process, this interactive checker ensures transparent, accurate, and accessible information, empowering you to navigate your pension benefits with absolute confidence.
          </p>
        </div>

        {/* Right Side Roles & Login */}
        <div className="w-full lg:w-1/2">
          <div className="mb-6 border-b border-gray-200 pb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4" style={{fontFamily: 'Outfit, sans-serif'}}>{t('select_role')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={\`role-card \${userRole === 'Public' ? 'active' : ''}\`} onClick={() => setUserRole('Public')}>
                <div className="flex items-center gap-3 mb-1">
                  <div className="role-icon-wrapper"><UserCircle2 size={20} /></div>
                  <div className="role-title text-base">{t('role_public')}</div>
                </div>
              </div>
              <div className={\`role-card \${userRole === 'WorkingPlace' ? 'active' : ''}\`} onClick={() => setUserRole('WorkingPlace')}>
                <div className="flex items-center gap-3 mb-1">
                  <div className="role-icon-wrapper"><Activity size={20} /></div>
                  <div className="role-title text-base">{t('role_workplace')}</div>
                </div>
              </div>
              <div className={\`role-card \${userRole === 'DivSec' ? 'active' : ''}\`} onClick={() => setUserRole('DivSec')}>
                <div className="flex items-center gap-3 mb-1">
                  <div className="role-icon-wrapper"><PieChart size={20} /></div>
                  <div className="role-title text-base">{t('role_divsec')}</div>
                </div>
              </div>
              <div className={\`role-card \${userRole === 'HeadOffice' ? 'active' : ''}\`} onClick={() => setUserRole('HeadOffice')}>
                <div className="flex items-center gap-3 mb-1">
                  <div className="role-icon-wrapper"><Shield size={20} /></div>
                  <div className="role-title text-base">{t('role_headoffice')}</div>
                </div>
              </div>
            </div>
          </div>

          {authMode === 'login' && (
            <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl border border-white shadow-lg w-full animate-fade-in relative overflow-hidden" style={{boxShadow: '0 10px 25px rgba(0,0,0,0.08)'}}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-indigo-500"></div>
              
              {userRole === 'Public' ? (
                <div className="py-2">
                  <h3 className="font-extrabold text-2xl mb-3 text-gray-900 tracking-tight" style={{fontFamily: 'Outfit, sans-serif'}}>General Public Access</h3>
                  <p className="text-sm text-muted font-medium mb-8">You are accessing the portal as a member of the General Public. No formal authentication is required for basic eligibility checking.</p>
                  
                  <button className="btn w-full py-4 text-lg shadow-md" onClick={() => setViewState('checker')}>{t('btn_continue')} <ChevronRight size={24}/></button>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-center text-gray-500 font-medium">
                    Note: Formal application submissions still require physical document verification at your relevant Divisional Secretariat or Last Working Place.
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-extrabold text-2xl mb-6 text-gray-900 tracking-tight" style={{fontFamily: 'Outfit, sans-serif'}}>Authenticate Identity</h3>
                  
                  <div className="form-row mb-5">
                    <label className="label font-bold text-gray-700 mb-2">Verification ID / Username</label>
                    <input type="text" className="form-input bg-white" defaultValue="Admin-Sys" />
                  </div>
                  
                  <div className="form-row mb-5">
                    <label className="label font-bold text-gray-700 mb-2">Secure Password</label>
                    <input type="password" className="form-input bg-white" defaultValue="password" />
                  </div>

                  <div className="form-row mb-6 mt-2">
                    <label className="label font-bold text-gray-700 mb-2">Institution Verification Hash</label>
                    <input type="text" className="form-input bg-white" placeholder="Institution Reg No. / Code" />
                  </div>

                  <button className="btn w-full py-3 text-lg mt-2 shadow-md" onClick={() => setViewState('checker')}>{t('btn_continue')} <ChevronRight size={20}/></button>
                  
                  <div className="flex justify-between mt-6 pt-4 border-t border-gray-200 text-sm font-semibold text-primary">
                    <span className="cursor-pointer hover:text-indigo-800 transition-colors" onClick={() => setAuthMode('register')}>Request Access</span>
                    <span className="cursor-pointer hover:text-indigo-800 transition-colors" onClick={() => setAuthMode('forgot')}>Forgot Credentials?</span>
                  </div>
                </>
              )}
            </div>
          )}

          {authMode === 'register' && (
            <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl border border-white shadow-lg w-full animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-indigo-500"></div>
              <h3 className="font-extrabold text-2xl mb-4 text-gray-900" style={{fontFamily: 'Outfit, sans-serif'}}>Request Access</h3>
              <p className="text-sm text-muted font-medium mb-6">Official government agency request form. Validation takes 2-3 business days.</p>
              <div className="form-row mb-6"><label className="label font-bold mb-2">Official Email</label><input type="email" className="form-input bg-white" placeholder="name@gov.lk" /></div>
              <button className="btn w-full" onClick={() => setAuthMode('login')}>Submit Request</button>
              <div className="text-center mt-6 pt-4 border-t border-gray-200 text-sm font-bold text-primary cursor-pointer hover:text-indigo-800 transition-colors" onClick={() => setAuthMode('login')}>Back to Login</div>
            </div>
          )}

          {authMode === 'forgot' && (
            <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl border border-white shadow-lg w-full animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-indigo-500"></div>
              <h3 className="font-extrabold text-2xl mb-4 text-gray-900" style={{fontFamily: 'Outfit, sans-serif'}}>Reset Credentials</h3>
              <p className="text-sm text-muted font-medium mb-6">A secure reset link will be dispatched to your registered institutional email.</p>
              <div className="form-row mb-6"><label className="label font-bold mb-2">Verification ID / Official Email</label><input type="text" className="form-input bg-white" /></div>
              <button className="btn w-full" onClick={() => setAuthMode('login')}>Dispatch Reset Token</button>
              <div className="text-center mt-6 pt-4 border-t border-gray-200 text-sm font-bold text-primary cursor-pointer hover:text-indigo-800 transition-colors" onClick={() => setAuthMode('login')}>Back to Login</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );`;

// Find where const AuthView starts and where const SectionF_DisabledOps starts
const startIdx = jsx.indexOf('const AuthView = () => (');
const endIdx = jsx.indexOf('const SectionF_DisabledOps = () => {');

if (startIdx !== -1 && endIdx !== -1) {
    let lastIndex = jsx.lastIndexOf(');', endIdx);
    if (lastIndex !== -1 && lastIndex > startIdx) {
       const replacementEnd = lastIndex + 2; // Include ");"
       const newJsx = jsx.substring(0, startIdx) + newAuthView + jsx.substring(replacementEnd);
       fs.writeFileSync('src/App.jsx', newJsx, 'utf8');
       console.log('App.jsx AuthView updated with split layout');
    } else {
       console.log('Could not find end of AuthView');
    }
} else {
    console.log('Could not find AuthView or SectionF_DisabledOps boundaries');
}
