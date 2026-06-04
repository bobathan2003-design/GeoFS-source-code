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


## Cesium Ion token

GeoFS uses Cesium for the 3D globe, terrain, and imagery layer setup. To start the launcher, you need your own Cesium Ion access token:

1. Create or sign in to a Cesium Ion account at <https://ion.cesium.com/>.
2. Open **Access Tokens** in Cesium Ion.
3. Create a token, or copy the default token from your account.
4. Paste that token into the **Cesium Ion token** field in the launcher.
5. Click **Save settings**, then **Start GeoFS**.

Keep the token scoped to the minimum permissions Cesium Ion recommends for browser apps. This repository stores the token only in your browser `localStorage` so you do not have to paste it every time. Do not commit a real token into this repository.

## Hosting

This is a static site, so the launcher can be hosted on GitHub Pages, Cloudflare Pages, Netlify, Vercel, or any ordinary static web host.


## Troubleshooting `geofs.start is not a function`

That message means the launcher tried to start before the archived `GeoFS.js` file had fully defined its public boot functions, or `GeoFS.js` hit an earlier runtime error while loading. The launcher now waits for both `geofs.init` and `geofs.start` before dispatching GeoFS startup.

If it still happens:

1. Hard-refresh the page so the updated `src/geofs-launcher.js` is loaded.
2. Confirm your static server can serve `GeoFS.js` at `http://localhost:8000/GeoFS.js`.
3. Open the browser console and look for the first error before the `geofs.start` message.
4. Make sure the CDN scripts for jQuery and Cesium loaded successfully.

## Important limitation

`GeoFS.js` is not a complete standalone game bundle. The full original simulator still depends on production resources that are not present in this repository, including:

- aircraft definitions from `/models/aircraft/load.php`
- model, image, skybox, runway, instrument, and sound assets
- weather, geocoding, account, and multiplayer backend endpoints
- a valid Cesium Ion token (`geofs.ionkey`)

The launcher defaults the asset/API origin to `https://www.geo-fs.com` so the archived code can try to use the original service paths. If those endpoints block cross-origin requests, change, require authentication, or are unavailable, the full simulator will not finish loading until those services are mirrored or reimplemented.
