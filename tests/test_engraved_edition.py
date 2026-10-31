"""Smoke checks for the v18 engraved Gig Poster edition."""
from pathlib import Path
import unittest
import json
import re

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "launcher/editions/gig-poster"

class EngravedEditionChecks(unittest.TestCase):
    def test_engraving_assets_exist(self):
        for name in ("engraved-six-clerks.webp","weird-v18.webp","setup-crate-record.png","atlas-engraved-details.png"):
            with self.subTest(name=name):
                path=BASE/"assets"/name
                self.assertTrue(path.is_file(),name)
                self.assertGreater(path.stat().st_size,10000)

    def test_chart_is_fixed_and_not_interactive(self):
        index=(BASE/"index.html").read_text()
        css=(BASE/"edition.css").read_text()
        self.assertIn('class="chart-viewport-frame"',index)
        self.assertIn('class="chart-details"',index)
        self.assertIn("pointer-events:none;z-index:1",css)
        self.assertIn('id="crateAtlasMap"',index)
        self.assertIn('id="atlasHome"',index)

    def test_atlas_secrets_are_zoom_gated_and_route_picks_replace_regions(self):
        script=(ROOT/"launcher/assets/app.js").read_text()
        css=(BASE/"edition.css").read_text()
        generated=(BASE/"index.html").read_text()
        # Existing engraved furniture and Robinson camera remain the source.
        self.assertIn('class="chart-nautical-routes"',generated)
        self.assertIn('class="chart-details"',generated)
        self.assertIn('class="crate-robinson"',generated)
        self.assertIn('class="chart-compass-fixed"',generated)
        self.assertIn("installAtlasSecrets()",script)
        self.assertIn('map._atlasSecretsSync?.(visible)',script)
        self.assertIn('map.getAttribute("data-details")!=="true"',script)
        self.assertIn('atlasTouchGesture||Date.now()<atlasSuppressTapUntil',script)
        self.assertIn('map.querySelectorAll(".chart-details > svg")',script)
        self.assertIn('map.querySelector(".chart-nautical-routes path")',script)
        # Three port-to-port corridors must project to the actual painted
        # Robinson map, not recycle unrelated ornament coordinates.
        self.assertIn('Georgetown, Guyana / Dakar, Senegal',script)
        self.assertIn('Rio de Janeiro, Brazil / Luanda, Angola',script)
        self.assertIn('Mombasa, Kenya / Mumbai, India',script)
        # Transpacific route: its great-circle is rendered as two SVG
        # subpaths at the antimeridian, not a false line across the map.
        self.assertIn('greatCirclePacific=()=>{',script)
        self.assertIn('start=unit([113.62,22.78])',script)
        self.assertIn('end=unit([-118.20,33.77])',script)
        self.assertIn('legs[0].push([180,seamLat])',script)
        self.assertIn('legs.push([[-180,seamLat]])',script)
        self.assertIn('if(legs.length!==2||!Number.isFinite(seamLat))return null',script)
        self.assertIn('routeParts.push(pacific.path)',script)
        self.assertIn('class:"atlas-pacific-crossing"',script)
        self.assertIn('class:"atlas-pacific-seam"',script)
        self.assertIn('data-secret",',script.replace('"data-secret":', 'data-secret",', 1))
        self.assertIn('id:"pacific-handoff"',script)
        self.assertIn('regions:["east-asia","us-west"]',script)
        # The last planned route is Liverpool -> Halifax -> Grand Turk, with two
        # Atlantic legs and precisely three existing region IDs.
        self.assertIn('const westboundLegs=[',script)
        self.assertIn('[-3.05,53.43]',script)
        self.assertIn('[-63.57,44.65]',script)
        self.assertIn('[-71.13,21.47]',script)
        self.assertIn('westboundLegs.map(chartPath).join(" ")',script)
        self.assertIn('Liverpool to Halifax, Nova Scotia, to Grand Turk',script)
        self.assertNotIn('Plymouth to Halifax to San Juan',script)
        self.assertIn('id:"westbound-manifest"',script)
        self.assertIn('regions:["atlantic-europe","canada-east","caribbean"]',script)
        self.assertIn('class:"atlas-westbound-crossing"',script)
        self.assertIn('class:"atlas-westbound-port"',script)
        self.assertIn('.atlas-westbound-crossing',css)
        self.assertIn('.atlas-westbound-port',css)
        self.assertIn('.atlas-pacific-crossing',css)
        self.assertIn('.atlas-pacific-seam',css)

        self.assertIn('360+335*(lon/180)*interpolate(robinX,lat)',script)
        self.assertIn('routePath.setAttribute("d",routeParts.join(" "))',script)
        self.assertIn('node.setAttribute("cx",point[0].toFixed(1))',script)
        self.assertIn('class:"atlas-secret-route-highlight"',script)
        self.assertIn('if(fromKeyboard)heading.focus({preventScroll:true})',script)
        self.assertIn('for(const hot of hotspots)hot.toggleAttribute("data-active",hot===node)',script)
        self.assertNotIn('card.scrollIntoView',script)
        self.assertIn('.atlas-secret-route-highlight',css)
        self.assertIn('stroke-width:22;pointer-events:stroke',css)
        self.assertIn('parent.insertBefore(layer,engraving.nextSibling)',script)
        # Picking a route replaces manual and previous-route regions outright.
        self.assertIn('action.textContent="PICK THESE REGIONS"',script)
        self.assertIn('crateSelected.clear();',script)
        self.assertIn('const picked=[...new Set(active.regions)].filter(id=>validCrateRegions.has(id))',script)
        self.assertIn('for(const id of picked)crateSelected.add(id)',script)
        self.assertIn('action.textContent=same?"ALREADY PICKED":"REGIONS PICKED"',script)
        self.assertNotIn('ADD THESE REGIONS',script)
        self.assertIn("updateCrateMap();",script)
        self.assertIn('"aria-hidden":"true"',script)
        self.assertIn('tabindex",visible?"0":"-1"',script)
        self.assertIn('event.key==="Escape"',script)
        self.assertIn('event.key==="Enter"||event.key===" "',script)
        self.assertIn("THE CARTOGRAPHER'S MISTAKES",script)
        self.assertIn("CLERK'S ANNOTATION",script)
        self.assertIn("CONTRABAND ROUTE",script)
        self.assertIn('atlas-secret-route-touch',css)
        self.assertIn('#crateAtlasMap[data-details=true] .atlas-secrets-layer',css)
        self.assertIn('.atlas-secret-card[hidden]{display:none!important}',css)
        self.assertIn('@media(prefers-reduced-motion:reduce)',css)
        # Antarctica remains explicit-only, not a suggested contraband route.
        section=script.split('function installAtlasSecrets(){',1)[1].split('\ninstallAtlasSecrets();',1)[0]
        self.assertNotIn('regions:["antarctica"',section)

    def test_selection_ticket_and_clean_receipt_idle_state(self):
        base=(ROOT/"launcher/index.html").read_text()
        generated=(BASE/"index.html").read_text()
        script=(ROOT/"launcher/assets/app.js").read_text()
        css=(ROOT/"launcher/assets/hipster.css").read_text()
        for page in (base,generated):
            self.assertIn('id="selectionTicket"',page)
            self.assertIn('id="selectionTicketShort"',page)
            self.assertIn('id="selectionTicketRegionShort"',page)
            self.assertIn('class="ticket-brief"',page)
            self.assertIn('id="receiptCopy" hidden',page)
            self.assertNotIn("REQUEST DRAFT",page)
        self.assertIn('firstAiChoice=doc.querySelector(".service-counter .panel")',script)
        self.assertIn('firstAiChoice.getBoundingClientRect().bottom>0',script)
        self.assertNotIn('moodChoices.getBoundingClientRect().bottom<=0',script)
        self.assertIn('receiptTicketDock',script)
        self.assertIn('receipt.getBoundingClientRect().top<=window.innerHeight-88',script)
        self.assertNotIn('dock.getBoundingClientRect().top<=window.innerHeight-20',script)
        self.assertIn('dock.appendChild(ticket)',script)
        self.assertIn('doc.body.insertBefore(ticket,site)',script)
        self.assertIn('details.open=false',script)
        self.assertNotIn('details.open=true;\n   }\n   ticket.hidden=false',script)
        self.assertNotIn('receiptSummary.getBoundingClientRect()',script)
        self.assertIn('mark.hidden=state==="idle"',script)
        self.assertIn('COPIED TO CLIPBOARD',script)
        self.assertIn('receipt-feed', (BASE/"edition.css").read_text())
        self.assertIn('selection-ticket[hidden]',css)
        self.assertIn('ticket-region-short',css)
        self.assertIn('receipt-ticket-dock .selection-ticket.is-docked',css)
        # Docking preserves the ticket's ink-offset shadow rather than flattening it.
        self.assertIn('box-shadow:3px 3px 0 var(--ink)',css)
        self.assertIn('receipt-ticket-dock .ticket-kicker{display:none}',css)
        self.assertIn('min-height:52px;padding:6px 9px',css)
        self.assertIn('receipt-ticket-dock{margin:6px 1px 8px}',css)
        self.assertNotIn('.receipt-ticket-dock:empty{display:none}',css)
        self.assertIn('.receipt-ticket-dock:empty{height:0',css)
        for page in (base,generated):
            self.assertEqual(page.count('id="receiptSummary"'),1)
            self.assertEqual(page.count('id="receiptRegions"'),1)
            self.assertIn('id="receiptTicketDock"',page)
            self.assertNotIn('id="selectionTicketPair"',page)
            self.assertLess(page.index('id="receiptSummary"'),page.index('id="receiptTicketDock"'))
        edition=(BASE/"edition.css").read_text()
        self.assertIn('receipt-feed',edition)
        self.assertIn('receipt-final-stamp',edition)
        for token in ('ticketAiCodes','ticketServiceCodes','ticketMoodCodes',
                      'ticketTempoCodes','ticketRegionCodes','shortTicketRegions',
                      'ART:','HARD:','ticketRegionShort.title'):
            with self.subTest(token=token):
                self.assertIn(token,script)
        self.assertIn('"antarctica":"ANTARCTICA"',script)
        self.assertIn('active.slice(0,2)',script)



    def test_country_music_regions_match_map_and_projection(self):
        """Country primary listening regions agree with musical routes, not assumed cultural borders."""
        base=(ROOT/"launcher/index.html").read_text()
        generated=(BASE/"index.html").read_text()
        expect={"TUR":("middle-east","asia"),
                "BRA":("southern-south-america","americas-south"),
                "SDN":("north-africa","africa"),
                "MDG":("east-africa","africa"),
                "ESP":("mediterranean-europe","europe"),
                "PRT":("atlantic-europe","europe"),
                "FRA":("atlantic-europe","europe"),
                "CYP":("mediterranean-europe","europe"),
                "SSD":("east-africa","africa")}
        for page in (base,generated):
            self.assertGreaterEqual(page.count('data-atlas-country='),180)
            for country,(region,continent) in expect.items():
                with self.subTest(page="poster" if page==generated else "source",country=country):
                    tag=re.search(
                        r'<path d="([^"]+)" data-atlas-country="'+country+
                        r'" data-atlas-region="([^"]+)" data-atlas-continent="([^"]+)"',page)
                    self.assertIsNotNone(tag,country)
                    self.assertEqual((tag.group(2),tag.group(3)),(region,continent))
                    nearest_group=page.rfind('<g class="crate-map-zone" data-atlas-zone=',0,tag.start())
                    self.assertGreaterEqual(nearest_group,0)
                    self.assertIn('data-atlas-zone="'+region+'"',page[nearest_group:tag.start()])
        nav_match=re.search(
            r'<script type="application/json" id="atlasNavigationGeometry">([^<]+)</script>',
            generated)
        self.assertIsNotNone(nav_match)
        nav=json.loads(nav_match.group(1))
        self.assertEqual(nav["version"],1)
        self.assertGreaterEqual(len(nav["anchors"]),300)
        self.assertGreaterEqual(len(nav["shapes"]),200)
        # Every moved whole-country shape has a matching projected bounding box
        # under its new region, so the autofocus cannot use a stale cached region.
        for country in ("TUR","BRA","SDN","MDG"):
            tag=re.search(
                r'<path d="([^"]+)" data-atlas-country="'+country+
                r'" data-atlas-region="([^"]+)"',generated)
            self.assertIsNotNone(tag)
            coords=re.findall(r'[ML](-?[\d.]+)\s+(-?[\d.]+)',tag.group(1).split("M",2)[1])
            # Reconstruct the first ring (a single-part country or mainland).
            first="M"+tag.group(1).split("M",2)[1]
            points=[(float(x),float(y)) for x,y in
                    re.findall(r'[ML](-?[\d.]+)\s+(-?[\d.]+)',first)]
            self.assertGreaterEqual(len(points),3)
            min_x,min_y=min(x for x,y in points),min(y for x,y in points)
            self.assertTrue(
                any(row[0]==tag.group(2) and abs(row[1]-min_x)<.01
                    and abs(row[2]-min_y)<.01 for row in nav["shapes"]),
                f"{country}: cached autofocus outline must use {tag.group(2)}")

    def test_jukebox_layout_keeps_atlas_unchanged(self):
        edition=(BASE/"index.html").read_text()
        builder=(ROOT/"scripts/build_gig_poster.py").read_text()
        css=(BASE/"edition.css").read_text()
        mood=edition.index('class="mood-grid"')
        tempo=edition.index('id="tempoControl"')
        atlas=edition.index('id="crateGeo"')
        self.assertLess(mood,tempo)
        self.assertLess(tempo,atlas)
        self.assertIn('tempo_block=s[tempo_start:mood_start]',builder)
        self.assertIn('min-height:56px;padding-block:6px',css)
        self.assertIn('.handoff #openAi[aria-disabled=false]',css)
        self.assertIn('The illustrated atlas and its viewport geometry remain unchanged.',css)

    def test_brand_headline_persists_and_return_stamp_is_discreet(self):
        original=(ROOT/"launcher/index.html").read_text()
        built=(BASE/"index.html").read_text()
        builder=(ROOT/"scripts/build_gig_poster.py").read_text()
        shared=(ROOT/"launcher/assets/hipster.css").read_text()
        edition=(BASE/"edition.css").read_text()
        self.assertIn('YOUR TASTE<br> IS A <em>PROBLEM.</em>',original)
        for page in (original,built):
            self.assertEqual(page.count('class="return-stamp">NO REFUNDS'),1)
            self.assertNotIn('BACK FOR',page)
            self.assertNotIn('class="return-sleeve"',page)
        self.assertIn('<span class="poster-line">YOUR TASTE</span>',built)
        self.assertIn('<span class="return-stamp">NO REFUNDS</span>',builder)
        self.assertIn('html[data-returning=true] body[data-page=launch] .hero-title .return-stamp',shared)
        self.assertIn('html[data-returning=true] body.gig-poster[data-page=launch] .poster-hero .return-stamp',edition)
        self.assertIn('opacity:.75;transform:rotate(-3deg)',edition)

    def test_first_visit_ticket_and_copied_go_handoff(self):
        original=(ROOT/"launcher/index.html").read_text()
        built=(BASE/"index.html").read_text()
        script=(ROOT/"launcher/assets/app.js").read_text()
        builder=(ROOT/"scripts/build_gig_poster.py").read_text()
        for page in (original,built):
            with self.subTest(page="poster" if page is built else "base"):
                self.assertEqual(page.count('id="welcomeSetup"'),1)
                self.assertLess(page.index('id="routeStatus"'),page.index('id="welcomeSetup"'))
                self.assertLess(page.index('id="welcomeSetup"'),page.index('id="tempoControl"'))
                for name in ('beginSetup','dismissWelcome','setupJourney','stripSetupPrompt',
                             'openSetupAi','finishSetup','handoffGuidance','handoffTitle',
                             'handoffInstruction'):
                    self.assertIn('id="'+name+'"',page)
                self.assertIn('id="setupJourney" hidden',page)
                self.assertIn('id="handoffGuidance" hidden',page)
                self.assertIn('data-atlas-zone="antarctica"',page)
        self.assertIn("welcome+'    <h2 class=",builder)
        self.assertNotIn("welcome-invitation.html",builder)
        self.assertIn("copiedSetupPrompt===setupPrompt(ai,service)",script)
        self.assertIn('guide.hidden=!ready',script)
        self.assertIn("The playlist isn't saved yet",script)

    def test_artwork_and_controls_remain_separate(self):
        css=(BASE/"edition.css").read_text()
        index=(BASE/"index.html").read_text()
        self.assertIn("assets/weird-v18.webp",css)
        self.assertIn("assets/engraved-six-clerks.webp",css)
        self.assertNotIn("data:image/webp;base64",css)
        for token in ('id="includeCover"','id="goHard"','id="goButton"'):
            self.assertIn(token,index)

if __name__=="__main__":
    unittest.main()
