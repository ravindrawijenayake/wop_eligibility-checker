const fs = require('fs');

let jsx = fs.readFileSync('src/App.jsx', 'utf8');

const oldAuthView = `  const AuthView = () => (
    <div className="animate-fade-in py-8 px-4">
      <div className="flex justify-center mb-6"><UserCircle2 size={64} className="text-primary" /></div>
      <h2 className="text-3xl font-bold mb-2 text-center">{t('app_title')}</h2>
      <p className="text-center text-muted mb-8 font-bold">{t('select_role')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button className={\`p-4 border rounded-xl font-bold text-sm shadow-sm transition-all \${userRole === 'Public' ? 'border-primary bg-sky-50 text-primary ring-2 ring-primary' : 'border-subtle hover:bg-gray-50'}\`} onClick={() => setUserRole('Public')}>
          {t('role_public')} <br /><span className="text-xs font-normal text-muted block mt-1">{t('role_public_desc')}</span>
        </button>
        <button className={\`p-4 border rounded-xl font-bold text-sm shadow-sm transition-all \${userRole === 'WorkingPlace' ? 'border-primary bg-sky-50 text-primary ring-2 ring-primary' : 'border-subtle hover:bg-gray-50'}\`} onClick={() => setUserRole('WorkingPlace')}>
          {t('role_workplace')} <br /><span className="text-xs font-normal text-muted block mt-1">{t('role_workplace_desc')}</span>
        </button>
        <button className={\`p-4 border rounded-xl font-bold text-sm shadow-sm transition-all \${userRole === 'DivSec' ? 'border-primary bg-sky-50 text-primary ring-2 ring-primary' : 'border-subtle hover:bg-gray-50'}\`} onClick={() => setUserRole('DivSec')}>
          {t('role_divsec')} <br /><span className="text-xs font-normal text-muted block mt-1">{t('role_divsec_desc')}</span>
        </button>
        <button className={\`p-4 border rounded-xl font-bold text-sm shadow-sm transition-all \${userRole === 'HeadOffice' ? 'border-primary bg-sky-50 text-primary ring-2 ring-primary' : 'border-subtle hover:bg-gray-50'}\`} onClick={() => setUserRole('HeadOffice')}>
          {t('role_headoffice')} <br /><span className="text-xs font-normal text-muted block mt-1">{t('role_headoffice_desc')}</span>
        </button>
      </div>

      {authMode === 'login' && (
        <div className="space-y-4 bg-surface-alt p-6 rounded-xl border border-subtle relative overflow-hidden">
          <h3 className="font-bold text-xl mb-4 text-primary">Authenticate Identity</h3>
          <div className="form-row"><label className="label">Verification ID / Username</label><input type="text" className="form-input" defaultValue={userRole === 'Public' ? 'Citizen-Token' : 'Admin-Sys'} /></div>
          <div className="form-row"><label className="label">Secure Password</label><input type="password" className="form-input" defaultValue="password" /></div>

          {userRole !== 'Public' && (
            <div className="form-row mt-2">
              <label className="label">Institution Verification Hash</label>
              <input type="text" className="form-input" placeholder="Institution Reg No. / Code" />
            </div>
          )}

          <button className="btn w-full mt-4 bg-primary text-white hover:opacity-90 transition-opacity" onClick={() => setViewState('checker')}>{t('btn_continue')}</button>
          <div className="flex justify-between mt-4 text-xs font-bold text-primary cursor-pointer hover:underline">
            <span onClick={() => setAuthMode('register')}>Request Agency Access</span>
            <span onClick={() => setAuthMode('forgot')}>Forgot Secure Credentials?</span>
          </div>
        </div>
      )}

      {authMode === 'register' && (
        <div className="space-y-4 bg-surface-alt p-6 rounded-xl border border-subtle relative overflow-hidden">
          <h3 className="font-bold text-xl mb-4 text-primary">Request Access</h3>
          <p className="text-sm text-muted mb-4">Official government agency request form. Validation takes 2-3 business days.</p>
          <div className="form-row"><label className="label">Official Email</label><input type="email" className="form-input" placeholder="name@gov.lk" /></div>
          <button className="btn w-full bg-primary text-white" onClick={() => setAuthMode('login')}>Submit Request</button>
          <div className="text-center mt-4 text-xs font-bold text-primary cursor-pointer hover:underline" onClick={() => setAuthMode('login')}>Back to Login</div>
        </div>
      )}

      {authMode === 'forgot' && (
        <div className="space-y-4 bg-surface-alt p-6 rounded-xl border border-subtle relative overflow-hidden">
          <h3 className="font-bold text-xl mb-4 text-primary">Reset Credentials</h3>
          <p className="text-sm text-muted mb-4">A secure reset link will be dispatched to your registered institutional email.</p>
          <div className="form-row"><label className="label">Verification ID / Official Email</label><input type="text" className="form-input" /></div>
          <button className="btn w-full bg-primary text-white" onClick={() => setAuthMode('login')}>Dispatch Reset Token</button>
          <div className="text-center mt-4 text-xs font-bold text-primary cursor-pointer hover:underline" onClick={() => setAuthMode('login')}>Back to Login</div>
        </div>
      )}
    </div>
  );`;

const newAuthView = `  const AuthView = () => (
    <div className="animate-fade-in glass-panel p-8 w-full max-w-4xl mx-auto my-12" style={{boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'}}>
      <div className="text-center mb-10">
        <div className="inline-flex justify-center items-center p-4 bg-indigo-50 rounded-full mb-6" style={{boxShadow: '0 0 20px rgba(2, 132, 199, 0.15)'}}>
          <ShieldCheck size={56} className="text-primary" />
        </div>
        <h2 className="text-4xl font-extrabold mb-3 text-gray-900 tracking-tight" style={{fontFamily: 'Outfit, sans-serif'}}>{t('app_title')}</h2>
        <p className="text-lg text-muted font-medium">{t('app_subtitle')} — {t('select_role')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className={\`role-card \${userRole === 'Public' ? 'active' : ''}\`} onClick={() => setUserRole('Public')}>
          <div className="flex items-center gap-4 mb-2">
            <div className="role-icon-wrapper">
              <UserCircle2 size={24} />
            </div>
            <div className="role-title">{t('role_public')}</div>
          </div>
          <div className="role-desc">{t('role_public_desc')}</div>
        </div>

        <div className={\`role-card \${userRole === 'WorkingPlace' ? 'active' : ''}\`} onClick={() => setUserRole('WorkingPlace')}>
          <div className="flex items-center gap-4 mb-2">
            <div className="role-icon-wrapper">
              <Activity size={24} />
            </div>
            <div className="role-title">{t('role_workplace')}</div>
          </div>
          <div className="role-desc">{t('role_workplace_desc')}</div>
        </div>

        <div className={\`role-card \${userRole === 'DivSec' ? 'active' : ''}\`} onClick={() => setUserRole('DivSec')}>
          <div className="flex items-center gap-4 mb-2">
            <div className="role-icon-wrapper">
              <PieChart size={24} />
            </div>
            <div className="role-title">{t('role_divsec')}</div>
          </div>
          <div className="role-desc">{t('role_divsec_desc')}</div>
        </div>

        <div className={\`role-card \${userRole === 'HeadOffice' ? 'active' : ''}\`} onClick={() => setUserRole('HeadOffice')}>
          <div className="flex items-center gap-4 mb-2">
            <div className="role-icon-wrapper">
              <Shield size={24} />
            </div>
            <div className="role-title">{t('role_headoffice')}</div>
          </div>
          <div className="role-desc">{t('role_headoffice_desc')}</div>
        </div>
      </div>

      {authMode === 'login' && (
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl border border-white/50 shadow-sm max-w-md mx-auto animate-fade-in relative overflow-hidden" style={{boxShadow: '0 10px 25px rgba(0,0,0,0.05)'}}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-indigo-500"></div>
          <h3 className="font-extrabold text-2xl mb-6 text-gray-900 tracking-tight" style={{fontFamily: 'Outfit, sans-serif'}}>Authenticate Identity</h3>
          
          <div className="form-row mb-5">
            <label className="label font-bold text-gray-700 mb-2">Verification ID / Username</label>
            <input type="text" className="form-input bg-white" defaultValue={userRole === 'Public' ? 'Citizen-Token' : 'Admin-Sys'} />
          </div>
          
          <div className="form-row mb-5">
            <label className="label font-bold text-gray-700 mb-2">Secure Password</label>
            <input type="password" className="form-input bg-white" defaultValue="password" />
          </div>

          {userRole !== 'Public' && (
            <div className="form-row mb-6 mt-2">
              <label className="label font-bold text-gray-700 mb-2">Institution Verification Hash</label>
              <input type="text" className="form-input bg-white" placeholder="Institution Reg No. / Code" />
            </div>
          )}

          <button className="btn w-full py-3 text-lg mt-2" onClick={() => setViewState('checker')}>{t('btn_continue')} <ChevronRight size={20}/></button>
          
          <div className="flex justify-between mt-6 pt-4 border-t border-gray-200 text-sm font-semibold text-primary">
            <span className="cursor-pointer hover:text-indigo-800 transition-colors" onClick={() => setAuthMode('register')}>Request Access</span>
            <span className="cursor-pointer hover:text-indigo-800 transition-colors" onClick={() => setAuthMode('forgot')}>Forgot Credentials?</span>
          </div>
        </div>
      )}

      {authMode === 'register' && (
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl border border-white/50 shadow-sm max-w-md mx-auto animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-indigo-500"></div>
          <h3 className="font-extrabold text-2xl mb-4 text-gray-900" style={{fontFamily: 'Outfit, sans-serif'}}>Request Access</h3>
          <p className="text-sm text-muted font-medium mb-6">Official government agency request form. Validation takes 2-3 business days.</p>
          <div className="form-row mb-6"><label className="label font-bold mb-2">Official Email</label><input type="email" className="form-input bg-white" placeholder="name@gov.lk" /></div>
          <button className="btn w-full" onClick={() => setAuthMode('login')}>Submit Request</button>
          <div className="text-center mt-6 pt-4 border-t border-gray-200 text-sm font-bold text-primary cursor-pointer hover:text-indigo-800 transition-colors" onClick={() => setAuthMode('login')}>Back to Login</div>
        </div>
      )}

      {authMode === 'forgot' && (
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl border border-white/50 shadow-sm max-w-md mx-auto animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-indigo-500"></div>
          <h3 className="font-extrabold text-2xl mb-4 text-gray-900" style={{fontFamily: 'Outfit, sans-serif'}}>Reset Credentials</h3>
          <p className="text-sm text-muted font-medium mb-6">A secure reset link will be dispatched to your registered institutional email.</p>
          <div className="form-row mb-6"><label className="label font-bold mb-2">Verification ID / Official Email</label><input type="text" className="form-input bg-white" /></div>
          <button className="btn w-full" onClick={() => setAuthMode('login')}>Dispatch Reset Token</button>
          <div className="text-center mt-6 pt-4 border-t border-gray-200 text-sm font-bold text-primary cursor-pointer hover:text-indigo-800 transition-colors" onClick={() => setAuthMode('login')}>Back to Login</div>
        </div>
      )}
    </div>
  );`;

if (jsx.includes(oldAuthView)) {
    jsx = jsx.replace(oldAuthView, newAuthView);
    fs.writeFileSync('src/App.jsx', jsx, 'utf8');
    console.log('App.jsx AuthView updated');
} else {
    console.log('Old AuthView not found');
}
