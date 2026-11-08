# Makes the Artifact copy: same game, minus the document wrapper the publisher adds itself.
import re,sys
src='/mnt/project-files/games/batch2/sporecrown/sporecrown.html'
out=sys.argv[1]
s=open(src).read()
s=re.sub(r'<!doctype html>\s*<html[^>]*>\s*<head>\s*','',s,count=1,flags=re.I)
s=re.sub(r'<meta charset="utf-8">\s*','',s,count=1)
s=re.sub(r'<meta name="viewport"[^>]*>\s*','',s,count=1)
s=s.replace('</head>\n<body>','',1).replace('</body>\n</html>','',1)
# the publisher already pads :root by the safe-area insets
s=s.replace('padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom)','padding:0')
s=s.replace('height:100%;height:100dvh;','height:100%;')
assert '<title>Sporecrown</title>' in s[:8000]
open(out,'w').write(s)
print('wrote',out,len(s))
