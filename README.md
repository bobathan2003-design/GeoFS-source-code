# GeoFS Source Launcher

This repository contains GeoFS source code from the official 3.31 update and a browser launcher that attempts to run the archived `GeoFS.js` directly.

The launcher is intentionally **not** a replacement simulator. It loads the archived source file and supplies the minimum browser shell that the file expects:

- a full-screen `geofs-ui-3dview` container
- Cesium from a CDN
- jQuery from a CDN
- small compatibility shims for GeoFS UI helpers
- fields for a Cesium Ion token and GeoFS asset/API origin

## Run locally

Start any static file server from the repository root:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Paste a Cesium Ion token into the launcher and click **Start GeoFS**.

## Hosting

This is a static site, so the launcher can be hosted on GitHub Pages, Cloudflare Pages, Netlify, Vercel, or any ordinary static web host.

## Important limitation

`GeoFS.js` is not a complete standalone game bundle. The full original simulator still depends on production resources that are not present in this repository, including:

- aircraft definitions from `/models/aircraft/load.php`
- model, image, skybox, runway, instrument, and sound assets
- weather, geocoding, account, and multiplayer backend endpoints
- a valid Cesium Ion token (`geofs.ionkey`)

The launcher defaults the asset/API origin to `https://www.geo-fs.com` so the archived code can try to use the original service paths. If those endpoints block cross-origin requests, change, require authentication, or are unavailable, the full simulator will not finish loading until those services are mirrored or reimplemented.
