"""Build a separate visual edition from the canonical launcher, sharing its behavior."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
s=(ROOT/'launcher/index.html').read_text()
s=s.replace('<body data-page="launch">','<body data-page="launch" class="gig-poster">')
s=s.replace('</head>','<link rel="preload" href="/editions/gig-poster/assets/anton.woff" as="font" type="font/woff" crossorigin>\n<link rel="stylesheet" href="/editions/gig-poster/edition.css">\n</head>')
s=s.replace('<title>Go, Hipster, Go! — Press GO, Question Everything</title>','<title>Go, Hipster, Go! — Gig Poster edition</title>')
s=s.replace('href="/" aria-label="Go, Hipster, Go! home"','href="/editions/gig-poster/" aria-label="Go, Hipster, Go! home"')
s=s.replace('<a href="/" aria-current="page">','<a href="/editions/gig-poster/" aria-current="page">')
welcome=re.search(r'    <aside class="welcome-setup".*?</aside>\n',s,re.S).group()
s=s.replace(welcome,'')
s=s.replace('    <div class="badge-row">',welcome+'    <div class="badge-row">') if '<div class="badge-row">' in s else s.replace('  </main>',welcome+'  </main>')
a=s.index('    <div class="hero-title">');b=s.index('    <section class="service-counter"',a)
s=s[:a]+'''    <div class="hero-title poster-hero">
      <h1 class="headline"><span class="first-sleeve"><span class="poster-line">YOUR TASTE</span><span class="poster-line">IS A</span><span class="poster-line">PROBLEM.</span></span><span class="return-sleeve"><span class="poster-line">BACK</span><span class="poster-line">FOR</span><span class="poster-line">MORE?</span></span></h1>
      <img class="poster-bird" src="/editions/gig-poster/assets/bird-globe.webp" width="1292" height="1196" alt="" aria-hidden="true">
      <span class="sticker">Locally<br>sourced<br>pretension</span>
    </div>

'''+s[b:]
s=s.replace('CHOOSE YOUR SERVICES','PICK YOUR SERVICES').replace('THE ROBOT','PICK YOUR AI').replace('THE NEEDLE','PICK YOUR DESTINATION').replace('SHAPE YOUR MIX','SET THE TEMPO').replace('<h3 class="counter-label">MOOD</h3>','<h3 class="counter-label">WHAT’S THE VIBE?</h3>')
s=s.replace('<details class="crate-geo" id="crateGeo">','<details class="crate-geo" id="crateGeo" open>')
s=s.replace('      <small>TAKE YOUR TASTE ABROAD</small>','')
s=s.replace('<div class="handoff" aria-label="Copy and open your AI">','<p class="poster-instructions">Paste and send in your AI.</p>\n    <div class="handoff" aria-label="Copy and open your AI">')
s=s.replace('href="/assets/app.js"','href="/assets/app.js"')
out=ROOT/'launcher/editions/gig-poster/index.html';out.parent.mkdir(parents=True,exist_ok=True);out.write_text(s)
