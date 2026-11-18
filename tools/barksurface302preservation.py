"""Exact public-base preservation and reviewed helper provenance; run from repository root."""
import hashlib,json,pathlib,subprocess,sys
base='014f5c680bdb17595ff329dc7425cef193b3d21a'
source='957303341e153cc4bae3993a1e773f07a79dcd17'
sha=lambda b:hashlib.sha256(b).hexdigest()
def before(f):return subprocess.check_output(['git','show',base+':'+f])
def read(f):return pathlib.Path(f).read_bytes()
fol=read('src/foliage.js').decode();line="import { applyBarkSurface } from './barksurface.js'; // #302\n";assert fol.startswith(line);fol=fol[len(line):]
new="  return applyBarkSurface(new THREE.MeshStandardMaterial({ color: kind === 'birch' ? F.trunk.birchColor : F.trunk.color, map: tex, roughness: kind === 'birch' ? 0.85 : 1 }), kind);"
old="  return new THREE.MeshStandardMaterial({ color: kind === 'birch' ? F.trunk.birchColor : F.trunk.color, map: tex, roughness: kind === 'birch' ? 0.85 : 1 });"
assert fol.count(new)==1;assert fol.replace(new,old).encode()==before('src/foliage.js')
cfg=read('src/config.js').decode();a=cfg.index('// #302: BARK_SURFACE');b=cfg.index('export const FENCE_HEIGHT',a);block=cfg[a:b]
assert (cfg[:a]+cfg[b:]).encode()==before('src/config.js')
unchanged=['src/seasons.js','src/lod.js','src/surroundings.js','src/courtyard.js','src/southbackdrop.js','src/siteinstancebatch.js','src/vertexcompile.js']
for f in unchanged:assert read(f)==before(f),f
proof={'publicBase':base,'acceptedOriginalSource':source,'exactInverseFoliage':True,'exactInverseConfig':True,'unchanged':{f:sha(read(f)) for f in unchanged},'selectedSha256':{f:sha(read(f)) for f in ['src/barksurface.js','src/foliage.js','src/config.js','tools/barksurfacetest.mjs']}}
if len(sys.argv)>1:
 def upstream(f):return subprocess.check_output(['git','-C',sys.argv[1],'show',source+':'+f])
 for f in ['src/barksurface.js','tools/barksurfacetest.mjs']:assert read(f)==upstream(f),f
 original=upstream('src/config.js').decode();a=original.index('// #2081: BARK_SURFACE');b=original.index('export const FENCE_HEIGHT',a);assert block.replace('#302:','#2081:')==original[a:b]
 proof['helperAndTestsByteIdenticalToAcceptedSource']=True;proof['configBlockExactExceptPublicIssueComment']=True
pathlib.Path('docs/verification/302/selection.json').write_text(json.dumps(proof,indent=2)+'\n');print(json.dumps(proof,indent=2))
