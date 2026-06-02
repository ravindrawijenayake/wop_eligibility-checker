const fs = require('fs');

let jsx = fs.readFileSync('src/App.jsx', 'utf8');

// The AuthView component ranges from "const AuthView = () => (" to the line before "const Part1A = () => {"
const authViewStart = 'const AuthView = () => (';
const authViewEnd = '  );'; // We will find the one right before const Part1A
const part1AIndex = jsx.indexOf('const Part1A = () => {');

const beforeAuthView = jsx.substring(0, jsx.indexOf(authViewStart));
// The end of AuthView is the last `  );` before Part1A
const authViewBlock = jsx.substring(jsx.indexOf(authViewStart), part1AIndex);
const lastParenIndex = authViewBlock.lastIndexOf('  );');
const afterAuthView = jsx.substring(jsx.indexOf(authViewStart) + lastParenIndex + 4);

const newAuthView = `const AuthView = () => (
    <div className="w-screen min-h-screen flex flex-col lg:flex-row bg-white overflow-hidden relative z-50">
      {/* Left Side: Thematic Image */}
      <div className="hidden lg:flex w-full lg:w-5/12 relative bg-slate-900 overflow-hidden">
        <img src={bannerImg} alt="WOP Banner" className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent"></div>
        <div className="relative z-10 p-12 lg:p-16 flex flex-col justify-center h-full text-white">
          <div className="inline-flex justify-center items-center p-4 bg-white/10 backdrop-blur-md rounded-2xl mb-8 w-max border border-white/20 shadow-xl">
            <ShieldCheck size={56} className="text-blue-200" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight leading-tight" style={{fontFamily: 'Outfit, sans-serif'}}>{t('app_title')}</h2>
          <p className="text-xl text-blue-200 font-bold mb-8 max-w-xl leading-relaxed">{t('app_subtitle')}</p>
          <div className="w-16 h-1 bg-blue-500 rounded-full mb-8"></div>
          <p className="text-base text-slate-300 leading-relaxed font-medium max-w-xl">
            Welcome to the Widows’ and Orphans’ Pensions (W&OP) Eligibility Checker, an intuitive and user-friendly digital platform designed to help public sector employees and their families seamlessly determine their qualification for survivor benefits. By entering a few key details regarding service history and familial status, this tool securely evaluates your information against official regulatory guidelines to provide instant, clear guidance on your status.
          </p>
        </div>
      </div>

      {/* Right Side: Authentication Panel */}
      <div className="w-full lg:w-7/12 min-h-screen overflow-y-auto flex flex-col justify-center bg-white p-6 lg:p-16 shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.1)] relative z-20">
        <div className="max-w-xl w-full mx-auto">
          <div className="mb-10 text-center lg:text-left">
            <h3 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight" style={{fontFamily: 'Outfit, sans-serif'}}>{t('select_role')}</h3>
            <p className="text-slate-500 font-medium">Please select your official capacity to continue.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 lg:gap-6 mb-10">
            <div className={\`role-card \${userRole === 'Public' ? 'active' : ''}\`} onClick={() => setUserRole('Public')}>
              <div className="role-icon-wrapper"><UserCircle2 size={32} /></div>
              <div className="role-title">{t('role_public')}</div>
            </div>
            <div className={\`role-card \${userRole === 'WorkingPlace' ? 'active' : ''}\`} onClick={() => setUserRole('WorkingPlace')}>
              <div className="role-icon-wrapper"><Activity size={32} /></div>
              <div className="role-title">{t('role_workplace')}</div>
            </div>
            <div className={\`role-card \${userRole === 'DivSec' ? 'active' : ''}\`} onClick={() => setUserRole('DivSec')}>
              <div className="role-icon-wrapper"><PieChart size={32} /></div>
              <div className="role-title">{t('role_divsec')}</div>
            </div>
            <div className={\`role-card \${userRole === 'HeadOffice' ? 'active' : ''}\`} onClick={() => setUserRole('HeadOffice')}>
              <div className="role-icon-wrapper"><Shield size={32} /></div>
              <div className="role-title">{t('role_headoffice')}</div>
            </div>
          </div>

          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
            {authMode === 'login' && (
              <div className="animate-fade-in">
                {userRole === 'Public' ? (
                  <div className="text-center lg:text-left">
                    <h3 className="font-bold text-2xl mb-2 text-slate-800" style={{fontFamily: 'Outfit, sans-serif'}}>General Public Access</h3>
                    <p className="text-sm text-slate-500 font-medium mb-8">No formal authentication is required for basic eligibility checking.</p>
                    
                    <button className="btn w-full py-4 text-lg shadow-md" onClick={() => setViewState('checker')}>{t('btn_continue')} <ChevronRight size={24}/></button>
                    
                    <div className="mt-6 p-4 bg-white rounded-xl text-xs text-slate-500 font-medium border border-slate-100 shadow-sm text-left">
                      <strong>Note:</strong> Formal application submissions still require physical document verification at your relevant Divisional Secretariat or Last Working Place.
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold text-2xl mb-6 text-slate-800 text-center lg:text-left" style={{fontFamily: 'Outfit, sans-serif'}}>Authenticate Identity</h3>
                    
                    <div className="form-row mb-5">
                      <label className="label font-bold text-slate-700 mb-2">Verification ID / Username</label>
                      <input type="text" className="form-input bg-white border-slate-200 shadow-sm" defaultValue="Admin-Sys" />
                    </div>
                    
                    <div className="form-row mb-5">
                      <label className="label font-bold text-slate-700 mb-2">Secure Password</label>
                      <input type="password" className="form-input bg-white border-slate-200 shadow-sm" defaultValue="password" />
                    </div>

                    <div className="form-row mb-6 mt-2">
                      <label className="label font-bold text-slate-700 mb-2">Institution Verification Hash</label>
                      <input type="text" className="form-input bg-white border-slate-200 shadow-sm" placeholder="Institution Reg No. / Code" />
                    </div>

                    <button className="btn w-full py-3 text-lg mt-2 shadow-md" onClick={() => setViewState('checker')}>{t('btn_continue')} <ChevronRight size={20}/></button>
                    
                    <div className="flex justify-between mt-6 pt-4 border-t border-slate-200 text-sm font-bold text-primary">
                      <span className="cursor-pointer hover:text-indigo-800 transition-colors" onClick={() => setAuthMode('register')}>Request Access</span>
                      <span className="cursor-pointer hover:text-indigo-800 transition-colors" onClick={() => setAuthMode('forgot')}>Forgot Credentials?</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {authMode === 'register' && (
              <div className="animate-fade-in text-center lg:text-left">
                <h3 className="font-bold text-2xl mb-2 text-slate-800" style={{fontFamily: 'Outfit, sans-serif'}}>Request Access</h3>
                <p className="text-sm text-slate-500 font-medium mb-6">Official government agency request form. Validation takes 2-3 business days.</p>
                <div className="form-row mb-6 text-left"><label className="label font-bold mb-2">Official Email</label><input type="email" className="form-input bg-white border-slate-200 shadow-sm" placeholder="name@gov.lk" /></div>
                <button className="btn w-full py-3 shadow-md" onClick={() => setAuthMode('login')}>Submit Request</button>
                <div className="text-center mt-6 pt-4 border-t border-slate-200 text-sm font-bold text-slate-500 cursor-pointer hover:text-indigo-800 transition-colors" onClick={() => setAuthMode('login')}>Back to Login</div>
              </div>
            )}

            {authMode === 'forgot' && (
              <div className="animate-fade-in text-center lg:text-left">
                <h3 className="font-bold text-2xl mb-2 text-slate-800" style={{fontFamily: 'Outfit, sans-serif'}}>Reset Credentials</h3>
                <p className="text-sm text-slate-500 font-medium mb-6">A secure reset link will be dispatched to your registered institutional email.</p>
                <div className="form-row mb-6 text-left"><label className="label font-bold mb-2">Verification ID / Official Email</label><input type="text" className="form-input bg-white border-slate-200 shadow-sm" /></div>
                <button className="btn w-full py-3 shadow-md" onClick={() => setAuthMode('login')}>Dispatch Reset Token</button>
                <div className="text-center mt-6 pt-4 border-t border-slate-200 text-sm font-bold text-slate-500 cursor-pointer hover:text-indigo-800 transition-colors" onClick={() => setAuthMode('login')}>Back to Login</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );`;

fs.writeFileSync('src/App.jsx', beforeAuthView + newAuthView + afterAuthView, 'utf8');
console.log('Rewrite AuthView complete');
