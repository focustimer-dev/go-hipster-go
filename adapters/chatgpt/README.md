# Use Hipster Music Generator in ChatGPT

> **Preferred:** [install as a ChatGPT plugin](PLUGIN_INSTALL.md) with one-time onboarding and optional streaming-service capability discovery. The Project workflow below is a fallback for hosts without plugin support.

**Status:** Project-based installation guide; not a native one-click ChatGPT skill installation and not a streaming integration. No ChatGPT Project has been created on the user's account by this repository.

## Quick setup (works from phone or desktop)

1. Open ChatGPT and create a **Project** named `Hipster Music Generator` from **New project** in the sidebar. This keeps the skill scoped to music discussions.
2. Open the project menu (**⋯**) and go to **Project settings**. Copy the entire body of [`PROJECT_INSTRUCTIONS.md`](PROJECT_INSTRUCTIONS.md) into **Project instructions**. The first heading is optional.
3. In the project's files/sources area, upload **one file**: [`CHATGPT_KNOWLEDGE.md`](CHATGPT_KNOWLEDGE.md). Download it from GitHub using the file's **Raw / Download raw file** action if needed; do not paste its GitHub URL as though that guarantees full-file retrieval.
4. Start a **new conversation inside that Project**, not a regular chat, and say: `Use the Hipster Music Generator skill: go.`
5. Run [`SMOKE_TEST.md`](SMOKE_TEST.md) to check music fit and verification honesty. These are behavioral tests that require a human review; passing the offline repository tests does not imply they passed in your account.

If the project menu differs on your device, open [ChatGPT Projects documentation](https://help.openai.com/en/articles/10169521-using-projects-in-chatgpt). ChatGPT interface availability and project file limits vary by plan and version.

## What is actually installed?

- **Project instructions** are behavior guidance; they tell ChatGPT *when* and *how* to curate.
- **CHATGPT_KNOWLEDGE.md** is a generated, consolidated snapshot of `SKILL.md` and supporting reference files, so ChatGPT has the music taxonomy and verification policy without many individual uploads.
- This does **not** automatically install GitHub code, run Python, authorize web searches, provide music recognition, or connect Spotify/YouTube Music accounts.
- Changing GitHub files does **not** automatically update the Project upload. Regenerate and re-upload the bundle after a source change.

## Keep it updated

From the repository root, with Python 3.10+:

```bash
python scripts/build_chatgpt_bundle.py
python -m unittest discover -s tests -v
```

Commit the refreshed `CHATGPT_KNOWLEDGE.md`, then replace the older knowledge file in the ChatGPT Project and adjust Project instructions if changed. No personal data, tokens, or listening history belong in the public bundle.

## Other ChatGPT environments

- **ChatGPT API/Agents API:** Supports versioned Agent Skills through supported API workflows, but this is separate from installing this Project in the consumer app. See [OpenAI Skills API documentation](https://developers.openai.com/api/docs/guides/tools-skills).
- **Custom GPTs:** Availability for creating/publishing GPTs depends on plan and workspace permissions. This Project-based route avoids relying on the GPT builder.
- **Tool permissions:** If later connecting a publishing plugin, explicitly verify the supported tools, scopes, and successful provider response before claiming publication.
