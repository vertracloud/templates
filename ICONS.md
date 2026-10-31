# Icons

Where each template icon comes from, when it was taken (27/10/2026) and the rule that applies. Official logos are used **unmodified**
(no recolor, crop, redraw or minification) and only to identify the packaged software. Listing a template does not mean the project
endorses Vertra Cloud or the template. Do not edit an official icon: replace the file by a newer official one and update this table.

| Template | File | Origin | Rule that applies |
|---|---|---|---|
| `n8n` | `icon.svg` | Classic n8n logo (the connected nodes, pink `#EA4B71`): the symbol of the official logo in the repository README (<https://github.com/n8n-io/n8n/blob/master/assets/n8n-logo.png>), as a 24x24 vector. Chosen over the newer symbol of the brand system (<https://guidelines.n8n.design/logo>) because it is the mark users recognize. | Do not alter it. The n8n license (Sustainable Use) covers the software, not the brand: the legal review of the catalog entry also covers this icon. |
| `openclaw` | `icon.svg` | `ui/public/favicon.svg` of <https://github.com/openclaw/openclaw> (branch `main`) | MIT, Copyright (c) 2026 OpenClaw Foundation. No separate trademark or brand policy found in the repository. Keep the notice; do not alter. |
| `hermes-agent` | `icon.png` (180x180) | `website/static/img/apple-touch-icon.png` of <https://github.com/NousResearch/hermes-agent> (branch `main`) | MIT, Copyright (c) 2025 Nous Research. No separate brand policy found. The official vector (`assets/icon-master.svg`, 116 KB) is over the platform's 64 KB icon limit and was not minified, so the official PNG is used. |
| `uptime-kuma` | `icon.svg` | `public/icon.svg` of <https://github.com/louislam/uptime-kuma> (branch `master`) | MIT, Copyright (c) 2021 Louis Lam. The project README shows it as "Uptime Kuma Logo". No separate brand policy found. |
| `open-webui` | `icon.png` (512x512) | `static/static/favicon.png` of <https://github.com/open-webui/open-webui> (branch `main`) | `static/BRANDING.md` and clause 4 of the license (kept in `docker/LICENSE`): the Open WebUI branding must not be altered, removed, obscured or replaced. The icon is shown unaltered and the template does not change the product's own branding. The official `favicon.svg` embeds a raster `<image>` with a `data:` URL, which the platform refuses in SVG icons, hence the PNG. |
| `evolution-api` | `icon.svg` (own) | Original drawing by Vertra Cloud | **Official logo not used.** `TRADEMARKS.md` of the project protects the name, the "evolution-api" wordmark and logo, the neon-green palette and the copyright line, and only lets unmodified official builds carry the brand assets; this template ships a modified image (own Dockerfile). The project only ships the logo as PNG inside the manager build. The icon is a neutral chat-bubble drawing in a different palette. The product name is used only to say what the template packages (nominative use). |
| `discord-bot-js` | `icon.svg` (own) | Original drawing by Vertra Cloud | These are Vertra's own starter projects that use a library; the library's logo would suggest that the project made or endorses the template. Neutral robot icon. |
| `discord-bot-python` | `icon.svg` (own) | Original drawing by Vertra Cloud | Same as above. |

The own icons (MIT, like the rest of this repository) are simple geometric drawings and are not meant to look like any project's logo.
