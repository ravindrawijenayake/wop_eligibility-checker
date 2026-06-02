const fs = require('fs');

try {
  let content = fs.readFileSync('./src/App.jsx', 'utf8');

  function doReplace(search1, search2, replacement, desc) {
    if (content.includes(search1)) {
      content = content.replace(search1, replacement);
      console.log("Replaced:", desc, "using format 1");
    } else if (content.includes(search2)) {
      content = content.replace(search2, replacement);
      console.log("Replaced:", desc, "using format 2");
    } else {
      console.error("Failed to find chunk for:", desc);
      throw new Error(`Failed to find chunk for: ${desc}`);
    }
  }

  doReplace(
    "import './App.css';\r\nimport bannerImg from './assets/WOP_banner.png';",
    "import './App.css';\nimport bannerImg from './assets/WOP_banner.png';",
    "import './App.css';\nimport bannerImg from './assets/WOP_banner.png';\nimport LandingView from './LandingView';",
    "imports"
  );

  doReplace(
    "const [viewState, setViewState] = useState('auth');",
    "const [viewState, setViewState] = useState('auth');",
    "const [viewState, setViewState] = useState('landing');",
    "default state"
  );

  doReplace(
    "setViewState('auth'); setAuthMode('login'); setCheckerStep(0);",
    "setViewState('auth'); setAuthMode('login'); setCheckerStep(0);",
    "setViewState('landing'); setAuthMode('login'); setCheckerStep(0);",
    "reset state"
  );

  doReplace(
    "<div className={`app-container ${viewState === 'auth' ? 'mesh-bg' : ''}`}>\r\n      <div className={`w-full mx-auto ${viewState === 'auth' ? 'max-w-7xl' : 'max-w-4xl'}`}>\r\n",
    "<div className={`app-container ${viewState === 'auth' ? 'mesh-bg' : ''}`}>\n      <div className={`w-full mx-auto ${viewState === 'auth' ? 'max-w-7xl' : 'max-w-4xl'}`}>\n",
    "<div className={`app-container ${viewState === 'auth' || viewState === 'landing' ? 'mesh-bg' : ''}`}>\n      <div className={`w-full mx-auto ${viewState === 'auth' ? 'max-w-7xl' : viewState === 'landing' ? 'max-w-full' : 'max-w-4xl'}`}>\n",
    "app container"
  );

  doReplace(
    "{viewState === 'auth' ? (\r\n          <div className=\"w-full mt-2\"><AuthView /></div>\r\n        ) : (",
    "{viewState === 'auth' ? (\n          <div className=\"w-full mt-2\"><AuthView /></div>\n        ) : (",
    "{viewState === 'landing' ? (\n          <div className=\"w-full mt-2\"><LandingView onLaunch={() => setViewState('auth')} /></div>\n        ) : viewState === 'auth' ? (\n          <div className=\"w-full mt-2\"><AuthView /></div>\n        ) : (",
    "view router"
  );

  fs.writeFileSync('./src/App.jsx', content);
  console.log("App.jsx patched successfully!");
} catch (e) {
  console.error(e.message);
}
