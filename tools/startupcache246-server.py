"""Profile-only static server: ROOT/before and ROOT/after with explicit ten-minute HTTP cache headers.
Usage: python3 tools/startupcache246-server.py ROOT
"""
import http.server,sys
class Handler(http.server.SimpleHTTPRequestHandler):
 def end_headers(self):
  self.send_header('Cache-Control','public, max-age=600')
  super().end_headers()
http.server.ThreadingHTTPServer(('127.0.0.1',8921),lambda *a,**k:Handler(*a,directory=sys.argv[1],**k)).serve_forever()
