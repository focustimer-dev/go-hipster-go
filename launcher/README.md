# Hipster GO — unified phone launcher

Live site: https://hipster-go.samelling.workers.dev/

This folder preserves the source of the unified Android-friendly launcher. The main page includes selectors for **ChatGPT/Gemini** and **Spotify/YouTube Music**, four mood shortcuts, a curated-copy prompt, native-app-first Gemini navigation, and a collapsible **Setup & downloads** section with installation guides and current release ZIP links.

A copy-to-clipboard action plus tapping the AI app is required: there is no verified Android ChatGPT/Gemini deep link that selects skills and submits prompts. The launcher does **not** handle API keys, directly publish music, or guarantee that Gemini's generated YouTube Music playlist matches an exact tracklist. Only **ChatGPT → Spotify** and **Gemini → YouTube Music** are documented publishing paths; cross-pairs remain available for text-only use with an explicit warning.

The live instance is a Cloudflare Worker. Its deployment contains `index.html`, both PWA manifests and the existing icon routes; copying this folder into another host requires configuring the root `/manifest.webmanifest`, `/icon.svg` and `/gemini/` routes. The source files do **not** self-deploy when committed. Keep host behavior honest and avoid adding an API service for this simple launcher.
