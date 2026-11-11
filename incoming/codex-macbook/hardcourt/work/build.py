#!/usr/bin/env python3
import argparse
import json
import plistlib
import re
import shutil
import subprocess
from pathlib import Path

base = Path(__file__).resolve().parent
parser = argparse.ArgumentParser(description='Build the offline Hardcourt game and optional Mac app.')
parser.add_argument('--out', type=Path, default=base / 'dist')
parser.add_argument('--app', action='store_true', help='Compile a universal Mac app; requires Apple Command Line Tools.')
args = parser.parse_args()
out = args.out.resolve()
out.mkdir(parents=True, exist_ok=True)
html = (base / 'game/index.html').read_text()
html = re.sub(r'<link\s+rel="stylesheet"\s+href="styles.css"\s*/?>', lambda _: '<style>' + (base / 'game/styles.css').read_text() + '</style>', html)
for script in ['engine.js', 'app.js']:
    html = html.replace('<script src="' + script + '"></script>', '<script>' + (base / 'game' / script).read_text().replace('</script', '<\\/script') + '</script>')
html = html.replace('<meta name="theme-color"', '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'; style-src \'unsafe-inline\'; img-src data:; connect-src \'none\'; base-uri \'none\'; form-action \'none\'"><meta name="theme-color"')
(out / 'Hardcourt.html').write_text(html)
if args.app:
    app = out / 'Hardcourt.app'
    contents = app / 'Contents'
    resources = contents / 'Resources'
    binaries = contents / 'MacOS'
    resources.mkdir(parents=True, exist_ok=True)
    binaries.mkdir(parents=True, exist_ok=True)
    scratch = base / 'build-cache'
    scratch.mkdir(exist_ok=True)
    for arch in ['arm64', 'x86_64']:
        subprocess.run(['swiftc', '-parse-as-library', str(base / 'native/Hardcourt.swift'), '-O', '-framework', 'AppKit', '-framework', 'WebKit', '-target', arch + '-apple-macos13.0', '-o', str(scratch / ('Hardcourt-' + arch))], check=True)
    subprocess.run(['lipo', '-create', str(scratch / 'Hardcourt-arm64'), str(scratch / 'Hardcourt-x86_64'), '-output', str(binaries / 'Hardcourt')], check=True)
    shutil.copy2(out / 'Hardcourt.html', resources / 'Hardcourt.html')
    icon = base / 'native/Hardcourt.icns'
    if icon.exists():
        shutil.copy2(icon, resources / icon.name)
    info = {'CFBundleName': 'Hardcourt', 'CFBundleDisplayName': 'Hardcourt', 'CFBundleIdentifier': 'com.kevin.hardcourt', 'CFBundleVersion': '1', 'CFBundleShortVersionString': '1.0', 'CFBundleExecutable': 'Hardcourt', 'CFBundlePackageType': 'APPL', 'CFBundleIconFile': 'Hardcourt', 'LSMinimumSystemVersion': '13.0', 'NSHighResolutionCapable': True, 'NSPrincipalClass': 'NSApplication', 'NSSupportsAutomaticTermination': False}
    with (contents / 'Info.plist').open('wb') as file:
        plistlib.dump(info, file)
    subprocess.run(['xattr', '-cr', str(app)], check=True)
    subprocess.run(['codesign', '--force', '--deep', '--sign', '-', str(app)], check=True)
print(json.dumps({'html': str(out / 'Hardcourt.html'), 'app': str(out / 'Hardcourt.app') if args.app else None}))
