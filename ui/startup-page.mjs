export function startupPage(status) {
  const data = JSON.stringify(status).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="data:,">
<title>Codex .me — Stream setup</title>
<style>html,body{margin:0;min-height:100%;background:#0b1215;color:#dce5e8}body{font-family:ui-monospace,monospace}*{box-sizing:border-box}.material-icons,.material-symbols-rounded{display:none!important}</style>
<script>window.__thisGuiThemeScope={scopeId:"codex-me",themeModeKey:"codex-me.themeMode",themeIdKey:"codex-me.themeId",defaultMode:"dark"};</script>
<!-- Pinned dependencies (jsDelivr, exact versions, Subresource Integrity). React 18 = last React with UMD builds. -->
<script src="https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.production.min.js" integrity="sha384-DGyLxAyjq0f9SPpVevD6IgztCFlnMF6oW/XQGmfe+IsZ8TqEiDrcHkMLKI6fiB/Z" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.production.min.js" integrity="sha384-gTGxhz21lVGYNMcdJOyq01Edg0jhn/c22nsx0kyqP0TxaV5WVdsSH1fSDUf5YJj1" crossorigin="anonymous"></script>
<!-- .GUI: this.gui@4.2.1 from npm (sha256 bb86db3a5dc0b37f3c6a8551e1f8a4681ec0dc49f5b405a2b2deaf6ac5b0790f) -->
<script src="https://cdn.jsdelivr.net/npm/this.gui@4.2.1/dist/this.gui.umd.js" integrity="sha384-hMM5lKGHIJVSKMQgLKFJCTZNMwCQ7XHWcMHCiiTwDFzA0a2q4p0crD/NyA9Pg7wb" crossorigin="anonymous"></script>

</head>
<body>
<div id="root"><p style="padding:24px">Loading Codex .me · this.gui 4.2.1…</p></div>
<noscript>Enable JavaScript to view stream setup.</noscript>
<script id="startup-status" type="application/json">${data}</script>
<script type="module" src="/ui/startup.js"></script>
</body>
</html>`;
}
