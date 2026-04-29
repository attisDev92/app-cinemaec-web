console.log = (...args) => { window.__lastLog = args }; window.__lastLog = null;
