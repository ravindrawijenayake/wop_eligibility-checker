const fs = require('fs');

try {
  let content = fs.readFileSync('./src/App.jsx', 'utf8');

  function doReplace(search, replacement, desc) {
    if (content.includes(search)) {
      content = content.replace(search, replacement);
      console.log("Replaced:", desc);
    } else {
      console.error("Failed to find chunk for:", desc);
      throw new Error(`Failed to find chunk for: ${desc}`);
    }
  }

  // REVERT imports
  if (content.includes("import LandingView from './LandingView';\r\n")) {
    content = content.replace("import LandingView from './LandingView';\r\n", "");
  } else if (content.includes("import LandingView from './LandingView';\n")) {
    content = content.replace("import LandingView from './LandingView';\n", "");
  }

  // REVERT default state
  doReplace(
    "const [viewState, setViewState] = useState('landing');",
    "const [viewState, setViewState] = useState('auth');",
    "default state"
  );

  // REVERT reset state
  doReplace(
    "setViewState('landing'); setAuthMode('login'); setCheckerStep(0);",
    "setViewState('auth'); setAuthMode('login'); setCheckerStep(0);",
    "reset state"
  );

  // REVERT app container (\r\n and \n variants)
  if (content.includes("<div className={`app-container ${viewState === 'auth' || viewState === 'landing' ? 'mesh-bg' : ''}`}>\r\n      <div className={`w-full mx-auto ${viewState === 'auth' ? 'max-w-7xl' : viewState === 'landing' ? 'max-w-full' : 'max-w-4xl'}`}>\r\n")) {
    content = content.replace(
      "<div className={`app-container ${viewState === 'auth' || viewState === 'landing' ? 'mesh-bg' : ''}`}>\r\n      <div className={`w-full mx-auto ${viewState === 'auth' ? 'max-w-7xl' : viewState === 'landing' ? 'max-w-full' : 'max-w-4xl'}`}>\r\n",
      "<div className={`app-container ${viewState === 'auth' ? 'mesh-bg' : ''}`}>\r\n      <div className={`w-full mx-auto ${viewState === 'auth' ? 'max-w-7xl' : 'max-w-4xl'}`}>\r\n"
    );
  } else if (content.includes("<div className={`app-container ${viewState === 'auth' || viewState === 'landing' ? 'mesh-bg' : ''}`}>\n      <div className={`w-full mx-auto ${viewState === 'auth' ? 'max-w-7xl' : viewState === 'landing' ? 'max-w-full' : 'max-w-4xl'}`}>\n")) {
    content = content.replace(
      "<div className={`app-container ${viewState === 'auth' || viewState === 'landing' ? 'mesh-bg' : ''}`}>\n      <div className={`w-full mx-auto ${viewState === 'auth' ? 'max-w-7xl' : viewState === 'landing' ? 'max-w-full' : 'max-w-4xl'}`}>\n",
      "<div className={`app-container ${viewState === 'auth' ? 'mesh-bg' : ''}`}>\n      <div className={`w-full mx-auto ${viewState === 'auth' ? 'max-w-7xl' : 'max-w-4xl'}`}>\n"
    );
  }

  // REVERT view router
  if (content.includes("{viewState === 'landing' ? (\r\n          <div className=\"w-full mt-2\"><LandingView onLaunch={() => setViewState('auth')} /></div>\r\n        ) : viewState === 'auth' ? (\r\n          <div className=\"w-full mt-2\"><AuthView /></div>\r\n        ) : (")) {
    content = content.replace(
      "{viewState === 'landing' ? (\r\n          <div className=\"w-full mt-2\"><LandingView onLaunch={() => setViewState('auth')} /></div>\r\n        ) : viewState === 'auth' ? (\r\n          <div className=\"w-full mt-2\"><AuthView /></div>\r\n        ) : (",
      "{viewState === 'auth' ? (\r\n          <div className=\"w-full mt-2\"><AuthView /></div>\r\n        ) : ("
    );
  } else if (content.includes("{viewState === 'landing' ? (\n          <div className=\"w-full mt-2\"><LandingView onLaunch={() => setViewState('auth')} /></div>\n        ) : viewState === 'auth' ? (\n          <div className=\"w-full mt-2\"><AuthView /></div>\n        ) : (")) {
    content = content.replace(
      "{viewState === 'landing' ? (\n          <div className=\"w-full mt-2\"><LandingView onLaunch={() => setViewState('auth')} /></div>\n        ) : viewState === 'auth' ? (\n          <div className=\"w-full mt-2\"><AuthView /></div>\n        ) : (",
      "{viewState === 'auth' ? (\n          <div className=\"w-full mt-2\"><AuthView /></div>\n        ) : ("
    );
  }

  fs.writeFileSync('./src/App.jsx', content);
  console.log("App.jsx reverted successfully!");
} catch (e) {
  console.error(e.message);
}
