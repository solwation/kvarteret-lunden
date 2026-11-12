"""Local public-only paired fixture: current checkout, frozen public build and Git baseline sources."""
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote,urlsplit
from functools import lru_cache
import argparse,io,subprocess
p=argparse.ArgumentParser();p.add_argument('--before',required=True,type=Path);p.add_argument('--baseline',required=True);p.add_argument('--port',type=int,default=8301);a=p.parse_args();root=Path(__file__).resolve().parent.parent
@lru_cache(maxsize=128)
def old(path):return subprocess.check_output(['git','show',a.baseline+':'+path],cwd=root)
class Handler(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
 def send_head(self):
  path=unquote(urlsplit(self.path).path).lstrip('/')
  try:
   if '..'in Path(path).parts:raise ValueError()
   if path.startswith('__before/'):relative=path.removeprefix('__before/');data=old(relative)
   else:
    folder,relative=(a.before,path.removeprefix('before/'))if path.startswith('before/')else(root/'dist',path.removeprefix('after/'))if path.startswith('after/')else(root,path)
    target=folder/relative
    if target.is_dir():target/='index.html'
    data=target.read_bytes();relative=str(target)
  except (OSError,ValueError,subprocess.CalledProcessError):self.send_error(404);return None
  self.send_response(200);self.send_header('Content-Type',self.guess_type(relative));self.send_header('Content-Length',str(len(data)));self.send_header('Cache-Control','no-store');self.end_headers();return io.BytesIO(data)
print(f'Public cat fixture http://127.0.0.1:{a.port}; baseline {a.baseline}',flush=True)
ThreadingHTTPServer(('127.0.0.1',a.port),Handler).serve_forever()
