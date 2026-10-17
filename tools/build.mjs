import {build} from 'esbuild';
import {createHash} from 'node:crypto';
import {readFile, writeFile, mkdir, cp, rm, readdir} from 'node:fs/promises';
// Hash only inputs shipped to visitors, including the bundler version and build rules.
const hash=createHash('sha256');
async function fingerprint(path){
  let entries;
  try{entries=await readdir(path,{withFileTypes:true});}
  catch(e){if(e.code!=='ENOTDIR')throw e;hash.update(path).update(await readFile(path));return;}
  for(const entry of entries.sort((a,b)=>a.name.localeCompare(b.name)))await fingerprint(`${path}/${entry.name}`);
}
for(const path of ['src','data','index.html','style.css','icon.svg','icons','manifest.webmanifest','package-lock.json','tools/build.mjs','THIRD_PARTY_LICENSES.txt'])await fingerprint(path);
try{await fingerprint('textures');}catch(e){if(e.code!=='ENOENT')throw e;}
const version=hash.digest('hex').slice(0,24), builtAt=Date.now();
await rm('dist',{recursive:true,force:true});
await mkdir('dist/assets',{recursive:true});
const result=await build({entryPoints:['src/main.js'],outfile:`dist/assets/viewer-${version}.js`,bundle:true,format:'esm',target:'es2022',minify:true,legalComments:'eof',metafile:true,define:{__BUILD_VERSION__:JSON.stringify(version),__BUILD_TIME__:String(builtAt)}});
await writeFile('dist/build-inputs.json',JSON.stringify(Object.keys(result.metafile.inputs).filter(p=>!p.startsWith('node_modules/')),null,2));
let html=await readFile('index.html','utf8');
html=html.replace(/\s*<script type="importmap">[\s\S]*?<\/script>/,'').replace('./src/main.js',`./assets/viewer-${version}.js`).replace('./style.css',`./assets/style-${version}.css`);
// Allow exactly the inline startup guard (#37) as built, by its hash; everything else must be a same-origin file.
const inlineHashes=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(([,code])=>`'sha256-${createHash('sha256').update(code).digest('base64')}'`);
html=html.replace(/script-src[^;]+;/,`script-src 'self'${inlineHashes.map(h=>' '+h).join('')};`);
await writeFile('dist/index.html',html);
await cp('style.css',`dist/assets/style-${version}.css`);
for(const p of ['icon.svg','icons','manifest.webmanifest','data','THIRD_PARTY_LICENSES.txt'])await cp(p,`dist/${p}`,{recursive:true});
try{await cp('textures','dist/textures',{recursive:true});}catch(e){if(e.code!=='ENOENT')throw e;}
await writeFile('dist/version.json',JSON.stringify({version,builtAt})+'\n');
await writeFile('dist/.nojekyll','');
console.log(`Static site built in dist/: ${version}`);
