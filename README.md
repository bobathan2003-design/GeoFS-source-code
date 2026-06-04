# GeoFS Playable Web Demo

This repository contains GeoFS source code from the official 3.31 update plus a new self-contained playable browser demo.

> Note: the archived `GeoFS.js` file is very large and is not enough by itself to run the complete original GeoFS simulator. The full simulator expects missing production assets, Cesium configuration, UI markup, and backend services. The included `index.html`/`src/simple-flight.js` demo is a static-site-friendly playable flight experience that can be hosted immediately.

## Run locally

Start any static file server from the repository root:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Controls

- `W` / `S`: increase/decrease throttle
- `↑` / `↓`: pitch down/up
- `←` / `→`: bank left/right
- `Space`: level aircraft
- `R`: reset flight

## Host it

This is now a static website, so you can host it on:

- GitHub Pages
- Cloudflare Pages
- Netlify
- Vercel

For the simplest route, push the repository to GitHub, enable GitHub Pages for the current branch, and set the site root to `/`.

## Making the original GeoFS code playable

To run the complete original GeoFS experience instead of the lightweight demo, you would need to restore or replace the missing pieces referenced by `GeoFS.js`, including:

- Cesium and a Cesium Ion token (`geofs.ionkey`)
- the expected HTML/UI shell, including the `geofs-ui-3dview` viewer element
- model, image, skybox, runway, instrument, and sound assets
- backend endpoints for weather, accounts/API responses, geocoding, and multiplayer services
