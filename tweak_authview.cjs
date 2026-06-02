const fs = require('fs');

let jsx = fs.readFileSync('src/App.jsx', 'utf8');

const authViewStart = 'const AuthView = () => (';
const part1AIndex = jsx.indexOf('const Part1A = () => {');

const beforeAuthView = jsx.substring(0, jsx.indexOf(authViewStart));
const authViewBlock = jsx.substring(jsx.indexOf(authViewStart), part1AIndex);
const lastParenIndex = authViewBlock.lastIndexOf('  );');
const afterAuthView = jsx.substring(jsx.indexOf(authViewStart) + lastParenIndex + 4);

const newAuthView = `const AuthView = () => (
    <div className="w-screen min-h-screen flex flex-col lg:flex-row bg-slate-50 overflow-hidden relative z-50">
      
      {/* Left Side: Thematic Column */}
      <div className="hidden lg:flex w-full lg:w-5/12 flex-col bg-slate-900 border-r border-slate-800 shadow-2xl z-10 relative">
        
        {/* Title & Subtitle (Beautifully Styled) */}
        <div className="px-10 lg:px-14 pt-14 pb-10 flex flex-col justify-start bg-slate-900 z-10 relative">
          <div className="w-16 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-6 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
          
          <h2 className="text-4xl lg:text-5xl font-black mb-4 tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400" style={{fontFamily: 'Outfit, sans-serif'}}>
            {t('app_title')}
          </h2>
          
          <p className="text-lg lg:text-xl text-blue-300 font-bold max-w-xl leading-relaxed tracking-wide uppercase" style={{fontFamily: 'Inter, sans-serif'}}>
            {t('app_subtitle')}
          </p>
        </div>
        
        {/* Banner Image */}
        <div className="relative w-full h-80 border-y border-slate-800 bg-slate-900 shadow-inner">
           <img src={bannerImg} alt="WOP Banner" className="absolute inset-0 w-full h-full object-cover opacity-90" />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
           <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-transparent to-transparent"></div>
        </div>

        {/* Description Below Banner */}
        <div className="p-10 lg:p-14 flex-grow flex flex-col justify-start bg-slate-900">
          <p className="text-lg text-slate-400 leading-relaxed font-medium max-w-xl text-justify">
            Welcome to the Widows’ and Orphans’ Pensions (W&OP) Eligibility Checker, an intuitive and user-friendly digital platform designed to help public sector employees and their families seamlessly determine their qualification for survivor benefits. By entering a few key details regarding service history and familial status, this tool securely evaluates your information against official regulatory guidelines to provide instant, clear guidance on your status.
          </p>
        </div>

      </div>

      {/* Right Side: Authentication Panel */}
      <div className="w-full lg:w-7/12 min-h-screen overflow-y-auto flex flex-col justify-center bg-slate-50 p-6 lg:p-16 relative z-20">
        <div className="max-w-xl w-full mx-auto">
          
          <div className="mb-8 text-center lg:text-left">
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

          {/* Refined Login Portal Box */}
          <div className="bg-white p-8 lg:p-10 rounded-2xl border border-slate-200 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            
            {authMode === 'login' && (
              <div className="animate-fade-in">
                {userRole === 'Public' ? (
                  <div className="text-center lg:text-left">
                    <h3 className="font-bold text-2xl mb-2 text-slate-800" style={{fontFamily: 'Outfit, sans-serif'}}>General Public Access</h3>
                    <p className="text-sm text-slate-500 font-medium mb-8">No formal authentication is required for basic eligibility checking.</p>
                    
                    <button className="btn w-full py-4 text-lg shadow-md hover:shadow-lg transition-shadow bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setViewState('checker')}>{t('btn_continue')} <ChevronRight size={24}/></button>
                    
                    <div className="mt-8 p-5 bg-amber-50 rounded-xl text-xs text-amber-800 font-medium border border-amber-200 shadow-sm text-left flex gap-3 items-start">
                      <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                      <span><strong>Note:</strong> Formal application submissions still require physical document verification at your relevant Divisional Secretariat or Last Working Place.</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold text-2xl mb-6 text-slate-800 text-center lg:text-left" style={{fontFamily: 'Outfit, sans-serif'}}>Authenticate Identity</h3>
                    
                    <div className="form-row mb-5">
                      <label className="label font-bold text-slate-700 mb-2">Verification ID / Username</label>
                      <input type="text" className="form-input bg-slate-50 border-slate-300 focus:bg-white transition-colors" defaultValue="Admin-Sys" />
                    </div>
                    
                    <div className="form-row mb-5">
                      <label className="label font-bold text-slate-700 mb-2">Secure Password</label>
                      <input type="password" className="form-input bg-slate-50 border-slate-300 focus:bg-white transition-colors" defaultValue="password" />
                    </div>

                    <div className="form-row mb-8 mt-2">
                      <label className="label font-bold text-slate-700 mb-2">Institution Verification Hash</label>
                      <input type="text" className="form-input bg-slate-50 border-slate-300 focus:bg-white transition-colors" placeholder="Institution Reg No. / Code" />
                    </div>

                    <button className="btn w-full py-3 text-lg mt-2 shadow-md hover:shadow-lg transition-shadow bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setViewState('checker')}>{t('btn_continue')} <ChevronRight size={20}/></button>
                    
                    <div className="flex justify-between mt-8 pt-6 border-t border-slate-100 text-sm font-bold text-blue-600">
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
                <div className="form-row mb-6 text-left"><label className="label font-bold mb-2 text-slate-700">Official Email</label><input type="email" className="form-input bg-slate-50 border-slate-300 focus:bg-white transition-colors" placeholder="name@gov.lk" /></div>
                <button className="btn w-full py-3 shadow-md bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setAuthMode('login')}>Submit Request</button>
                <div className="text-center mt-6 pt-6 border-t border-slate-100 text-sm font-bold text-slate-500 cursor-pointer hover:text-indigo-800 transition-colors" onClick={() => setAuthMode('login')}>Back to Login</div>
              </div>
            )}

            {authMode === 'forgot' && (
              <div className="animate-fade-in text-center lg:text-left">
                <h3 className="font-bold text-2xl mb-2 text-slate-800" style={{fontFamily: 'Outfit, sans-serif'}}>Reset Credentials</h3>
                <p className="text-sm text-slate-500 font-medium mb-6">A secure reset link will be dispatched to your registered institutional email.</p>
                <div className="form-row mb-6 text-left"><label className="label font-bold mb-2 text-slate-700">Verification ID / Official Email</label><input type="text" className="form-input bg-slate-50 border-slate-300 focus:bg-white transition-colors" /></div>
                <button className="btn w-full py-3 shadow-md bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setAuthMode('login')}>Dispatch Reset Token</button>
                <div className="text-center mt-6 pt-6 border-t border-slate-100 text-sm font-bold text-slate-500 cursor-pointer hover:text-indigo-800 transition-colors" onClick={() => setAuthMode('login')}>Back to Login</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );`;

fs.writeFileSync('src/App.jsx', beforeAuthView + newAuthView + afterAuthView, 'utf8');
console.log('AuthView tweaked successfully!');
