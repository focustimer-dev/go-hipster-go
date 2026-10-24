"""Build a separate visual edition from the canonical launcher, sharing its behavior."""
from pathlib import Path
import re
import hashlib
ROOT=Path(__file__).resolve().parents[1]
s=(ROOT/'launcher/index.html').read_text()
s=s.replace('<body data-page="launch">','<body data-page="launch" class="gig-poster">')
edition_css=ROOT/'launcher/editions/gig-poster/edition.css'
version=hashlib.sha256(edition_css.read_bytes()).hexdigest()[:12] if edition_css.exists() else 'initial'
s=s.replace('</head>',f'<link rel="preload" href="/editions/gig-poster/assets/anton.woff" as="font" type="font/woff" crossorigin>\n<link rel="stylesheet" href="/editions/gig-poster/edition.css?v={version}">\n</head>')
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
s=s.replace('<h3 class="panel-head"','<h2 class="panel-head"').replace('THE ROBOT</h3>','THE ROBOT</h2>').replace('THE NEEDLE</h3>','THE NEEDLE</h2>')
s=s.replace('CHOOSE YOUR SERVICES','PICK YOUR SERVICES').replace('THE ROBOT','PICK YOUR AI').replace('THE NEEDLE','PICK YOUR DESTINATION').replace('SHAPE YOUR MIX','SET THE TEMPO').replace('<h3 class="counter-label">MOOD</h3>','<h2 class="counter-label">WHAT’S THE VIBE?</h2>')
s=s.replace('<details class="crate-geo" id="crateGeo">','<details class="crate-geo" id="crateGeo" open>')
s=s.replace('      <small>TAKE YOUR TASTE ABROAD</small>','')
s=s.replace('<div class="handoff" aria-label="Copy and open your AI">','<p class="poster-instructions">Paste and send in your AI.</p>\n    <div class="handoff" aria-label="Copy and open your AI">')
# Two-spot-color halftone from the guide's screenprint/gig-poster language.
s=s.replace('<pattern id="atlasHatch"', '<pattern id="posterSelectedHalftone" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#dfb045"/><circle cx="1.75" cy="1.75" r="1.1" fill="#103135"/><circle cx="5.25" cy="5.25" r="1.1" fill="#103135"/></pattern>\n              <pattern id="atlasHatch"')
out=ROOT/'launcher/editions/gig-poster/index.html';out.parent.mkdir(parents=True,exist_ok=True);out.write_text(s)
