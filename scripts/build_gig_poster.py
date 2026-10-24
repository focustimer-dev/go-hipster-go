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

a=s.index('    <div class="hero-title">');b=s.index('    <section class="service-counter"',a)
s=s[:a]+'''    <div class="hero-title poster-hero">
      <h1 class="headline"><span class="first-sleeve"><span class="poster-line">YOUR TASTE</span><span class="poster-line">IS A</span><span class="poster-line">PROBLEM.</span></span><span class="return-sleeve"><span class="poster-line">BACK</span><span class="poster-line">FOR</span><span class="poster-line">MORE?</span></span></h1>
      <img class="poster-bird" src="/editions/gig-poster/assets/bird-globe.webp" width="1292" height="1196" alt="" aria-hidden="true">
      <span class="sticker">Locally<br>sourced<br>pretension</span>
    </div>

'''+s[b:]
# Setup stays visible until explicitly dismissed, without an extra disclosure tap.
welcome="""    <aside class="welcome-setup poster-setup" id="welcomeSetup" aria-labelledby="firstVisitTitle">
      <h2 id="firstVisitTitle">FIRST VISIT? SORT OUT THE CONNECTIONS.</h2>
      <p>One setup check. Then we can discuss your taste.</p>
      <div class="poster-setup-actions"><a href="/setup/">SET UP YOUR SERVICES →</a><button type="button" id="dismissWelcome">Dismiss</button></div>
    </aside>
"""
s=s.replace('    <section class="service-counter"',welcome+'    <section class="service-counter"',1)
s=s.replace('<h3 class="panel-head"','<h2 class="panel-head"').replace('THE ROBOT</h3>','THE ROBOT</h2>').replace('THE NEEDLE</h3>','THE NEEDLE</h2>')
s=s.replace('CHOOSE YOUR SERVICES','PICK YOUR SERVICES').replace('THE ROBOT','PICK YOUR AI').replace('THE NEEDLE','PICK YOUR DESTINATION').replace('SHAPE YOUR MIX','SET THE TEMPO').replace('<h3 class="counter-label">MOOD</h3>','<h2 class="counter-label">WHAT’S THE VIBE?</h2>')
s=s.replace('<details class="crate-geo" id="crateGeo">','<details class="crate-geo" id="crateGeo" open>')
s=s.replace('      <small>TAKE YOUR TASTE ABROAD</small>','')
s=s.replace('<div class="handoff" aria-label="Copy and open your AI">','<p class="poster-instructions">Paste and send in your AI.</p>\n    <div class="handoff" aria-label="Copy and open your AI">')
# Two-spot-color halftone from the guide's screenprint/gig-poster language.
s=s.replace('<pattern id="atlasHatch"', '<pattern id="posterSelectedHalftone" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#dfb045"/><circle cx="1.75" cy="1.75" r="1.1" fill="#103135"/><circle cx="5.25" cy="5.25" r="1.1" fill="#103135"/></pattern>\n              <pattern id="atlasHatch"')
s=s.replace('href="/setup/"','href="/editions/gig-poster/setup/"')
out=ROOT/'launcher/editions/gig-poster/index.html';out.parent.mkdir(parents=True,exist_ok=True);out.write_text(s)

# Manual edition inherits current setup behavior and all recovery/download content.
s=(ROOT/'launcher/setup/index.html').read_text()
s=s.replace('<body data-page="setup">','<body data-page="setup" class="gig-poster">')
s=s.replace('</head>',f'<link rel="preload" href="/editions/gig-poster/assets/anton.woff" as="font" type="font/woff" crossorigin>\n<link rel="stylesheet" href="/editions/gig-poster/edition.css?v={version}">\n</head>')
s=s.replace('href="/"','href="/editions/gig-poster/"').replace('href="/setup/"','href="/editions/gig-poster/setup/"')
s=re.sub(r'<div class="ticker".*?</div></div>','',s,flags=re.S)
s=s.replace('<h1 class="headline">THE OWNER\'S <em>MANUAL.</em></h1>', '<div class="manual-hero"><h1 class="headline"><span>THE OWNER’S</span><span>MANUAL.</span></h1><img class="manual-print" src="/editions/gig-poster/assets/manual-hand.webp" width="1024" height="1024" alt="" aria-hidden="true"></div>')
s=re.sub(r'  <div class="section-title"><span><span class="num">A</span>.*?</div>','',s)
s=s.replace('01 / WHICH AI?','PICK YOUR AI').replace('02 / WHICH MUSIC?','PICK YOUR DESTINATION')
s=re.sub(r'<div class="section-title" style="margin-top:23px">.*?</div>','<h2 class="manual-fine-title">THE FINE PRINT</h2>',s)
s=re.sub(r'  <div class="confessional">.*?</div>','',s,flags=re.S)
s=s.replace('<span class="stamp">NO RETURNS<br>ON TASTE</span>','')
s=s.replace('✂ COPY MY SETUP PROMPT','COPY MY SETUP PROMPT').replace('↗ OPEN YOUR AI','OPEN YOUR AI')
s=s.replace('<h3>Studio notes, not marketing claims</h3>','')
out=ROOT/'launcher/editions/gig-poster/setup/index.html';out.parent.mkdir(parents=True,exist_ok=True);out.write_text(s)
