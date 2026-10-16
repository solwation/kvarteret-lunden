import {build} from 'esbuild';
import {readFile, writeFile, mkdir, cp, rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});
await mkdir('dist/assets',{recursive:true});
await build({entryPoints:['src/main.js'],outfile:'dist/assets/viewer.js',bundle:true,format:'esm',target:'es2022',minify:true,legalComments:'eof',metafile:true}).then(async r=>writeFile('dist/build-inputs.json',JSON.stringify(Object.keys(r.metafile.inputs).filter(p=>!p.startsWith('node_modules/')),null,2)));
let html=await readFile('index.html','utf8');
html=html.replace(/\s*<script type="importmap">[\s\S]*?<\/script>/,'').replace('./src/main.js','./assets/viewer.js');
html=html.replace(/script-src[^;]+;/,"script-src 'self';");
await writeFile('dist/index.html',html);
for(const p of ['style.css','icon.svg','data','THIRD_PARTY_LICENSES.txt'])await cp(p,`dist/${p}`,{recursive:true});
try{await cp('textures','dist/textures',{recursive:true});}catch(e){if(e.code!=='ENOENT')throw e;}
await writeFile('dist/.nojekyll','');
console.log('Static site built in dist/.');
