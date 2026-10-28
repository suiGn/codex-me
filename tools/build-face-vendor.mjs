// Optional maintainer rebuild; runtime uses the checked-in JavaScript, without a compiler.
// node tools/build-face-vendor.mjs /absolute/path/to/typescript/lib/typescript.js
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const module = await import(pathToFileURL(process.argv[2]).href), ts = module.default || module;
if (ts.version !== '5.9.3') throw Error('Use TypeScript 5.9.3 for reproducible output.');
for (const name of ['useFaceLandmarker', 'useFaceOverlay']) {
 const path = new URL(`../ui/vendor/face/${name}`, import.meta.url);
 const source = await readFile(new URL(path.href + '.ts'), 'utf8');
 let js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
 js = js.replace("import * as React from 'react';", 'const React = window.React;');
 js = js.replace("import('@mediapipe/tasks-vision')", "import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs')");
 await writeFile(new URL(path.href + '.js'), '// Vendored this.gui FaceRecognition hook; see PROVENANCE.json and LICENSE.\n' + js);
}
