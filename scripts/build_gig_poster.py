"""Build a separate visual edition from the canonical launcher, sharing its behavior."""
from pathlib import Path
import re
import hashlib
ROOT=Path(__file__).resolve().parents[1]
s=(ROOT/'launcher/index.html').read_text()
s=s.replace('<body data-page="launch">','<body data-page="launch" class="gig-poster">')
edition_css=ROOT/'launcher/editions/gig-poster/edition.css'
version=hashlib.sha256(edition_css.read_bytes()).hexdigest()[:12] if edition_css.exists() else 'initial'
s=s.replace('</head>',f'<link rel="preload" href="/editions/gig-poster/assets/weird-curly.webp" as="image">\n<link rel="preload" href="/editions/gig-poster/assets/clerks-expressions.webp" as="image">\n<link rel="preload" href="/editions/gig-poster/assets/anton.woff" as="font" type="font/woff" crossorigin>\n<link rel="stylesheet" href="/editions/gig-poster/edition.css?v={version}">\n</head>')
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
    <div class="poster-go-trail">
      <div class="poster-go-trail-steps">
        <span class="poster-go-trail-word">PICK YOUR SOUND</span>
        <svg class="poster-go-trail-arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11m-4-4 4 4-4 4"/></svg>
        <span class="poster-go-trail-mark"><svg class="poster-go-trail-star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5 14.4 8.2 21.8 8.2 15.9 12.7 18.1 20 12 15.8 5.9 20 8.1 12.7 2.2 8.2 9.6 8.2Z"/></svg>GO!<svg class="poster-go-trail-down" viewBox="0 0 12 16" aria-hidden="true"><path d="M6 1v13m-4-4 4 4 4-4"/></svg></span>
        <svg class="poster-go-trail-arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11m-4-4 4 4-4 4"/></svg>
        <span class="poster-go-trail-word">PASTE IN YOUR AI</span>
      </div>
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
# The workflow is explained at the top; the real copy status handles the next step.
s=s.replace('Start your search here. No regional quotas; blank means worldwide. We do allow records to travel.', 'No stamps? Worldwide. Pick regions to steer the search, not fence it in.')
s=s.replace('Choose a mood, then press GO to copy your prompt.', 'Pick a mood, or press GO for a surprise.')
s=re.sub(r'<p class="footnote">The AI and music apps.*?</p>', '<p class="footnote">Select the skill and music app in your AI. Playlist saving happens there. <a href="/setup/">Setup instructions →</a></p>', s, count=1)
# Two-spot-color halftone from the guide's screenprint/gig-poster language.
s=s.replace('<pattern id="atlasHatch"', '<pattern id="posterSelectedHalftone" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#d64b30"/><path d="M-2 2L2-2M0 7L7 0M5 9L9 5" stroke="#103135" stroke-width="1.3"/></pattern>\n              <pattern id="atlasHatch"')
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
