// Rebuild from checked-in GUI sources; runtime requires no compiler.
// node tools/build-overlay-swatch.mjs /path/to/typescript/lib/typescript.js /path/to/esbuild/lib/main.js
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const tsImport = await import(pathToFileURL(process.argv[2]).href), ts = tsImport.default || tsImport;
const esbuild = await import(pathToFileURL(process.argv[3]).href);
if (ts.version !== '5.9.3' || esbuild.version !== '0.28.1') throw Error('Use TypeScript 5.9.3 and esbuild 0.28.1 for reproducible output.');
const dir = new URL('../ui/vendor/overlay-swatch/', import.meta.url);
const source = await readFile(new URL('OverlaySwatch.tsx', dir), 'utf8');
let js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022, jsx: ts.JsxEmit.React } }).outputText;
js = js.replace(/import React, \{([^}]+)\} from 'react';/, 'const React = window.React; const {$1} = React;');
js = js.replace("import { useTheme } from '@mui/material/styles';", "import { useThemePalette } from './theme-bridge.js';");
js = js.replace("import { ThemeContext } from '@/gui-internals/Contexts/ThemeContext';", '');
js = js.replace("from './overlaySwatchCore';", "from './overlaySwatchCore.js';");
js = js.replace('const muiTheme = useTheme();', 'const muiTheme = useThemePalette();');
js = js.replace('useContext(ThemeContext)', 'window.GUI.useThemeContext()');
await writeFile(new URL('OverlaySwatch.js', dir), '// GUI source adapted for the existing browser globals; see PROVENANCE.json.\n' + js);
// Bundle only the pure color utility dependency; never a second React/MUI provider.
await esbuild.build({ entryPoints: [new URL('overlaySwatchCore.ts', dir).pathname], bundle: true, format: 'esm', platform: 'browser', target: 'es2022', minify: true, legalComments: 'inline', define: { 'process.env.NODE_ENV': '"production"' }, outfile: new URL('overlaySwatchCore.js', dir).pathname });
