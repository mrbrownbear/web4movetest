# M0VE | Particle Story and Fullscreen Neighbourhood

## Local run

Run `python3 -m http.server 4173` in this folder and open `http://localhost:4173/` in a network enabled WebGL capable browser.

No API keys, build system or user accounts are needed to run this landing page. Three.js and its standard GLTFLoader / OrbitControls are loaded from pinned CDN URLs in the HTML import map. The included model, textures, page design, and film fallback are local files.

## The visitor experience

The sticky hero now spans the entire viewport. Scroll guides one deterministic, reversible particle cloud through the exact following sequence:

1. M0VE logo reconstructed using the authentic supplied brand image as a particle mask
2. Looking for a home?
3. Searching for a home?
4. A particle house with a roof, windows and door
5. Buy or Sell with m0ve
6. House particles expand into the real fullscreen neighbourhood view

Shapes are drawn with thousands of illuminated Canvas 2D particles; there are no ordinary words swapped in and out as a fake particle effect. Every phase is driven by the visitor's scroll position. The engine starts immediately without waiting for external fonts, Three.js, or the 3D download. The camera later moves through close house and street views, and the model can be rotated with the mouse after the reveal. There is only one local neighbourhood model. The former 3D children and all substitute child artwork are absent.

On browsers where WebGL is unavailable, the 72 frame camera film (rendered from the actual model) carries the same post reveal story. The fallback image is hidden as soon as real 3D becomes ready, so two overlapping copies are never shown. Motion sensitive visitors see the neighbourhood immediately.

## Features retained

Navigation, location search, sales history, interactive valuation, area comparison, mortgage, stamp duty, offer scenario, rental yield, EPC and postcode information, buyer/seller/investor content and contact links are preserved from Living Street.

## Files

* `index.html`: page
* `style.css`: design, responsive layout, fullscreen world and particle scene
* `src/particles.js`: deterministic animation, logo mask, cloud, text, house, responsive particle sampling and reveal
* `src/world.js`: camera progress, one local GLTF, orbit and fallback integration
* `src/camera-path.js`: closeup camera positions and continuous interpolation
* `src/main.js`, `src/math.js`: interface and calculator logic
* `assets/world/scene.gltf`, `scene.bin`, textures: supplied replacement model
* `assets/world/film`: 72 offline rendered model frames
* `PREVIEWS/M0VE_particle_story_preview.mp4`: browser captured particle and reveal walkthrough

## Checks

`npm test` executes the calculation, camera, particle timeline and startup tests.

The browser screenshots and preview video were captured from a local inline test harness that used the real page markup, styles and application JavaScript with network independent asset embedding. Live CDN loaded Three.js could not be verified here. The browser preview uses the actual model derived fallback at the reveal. See `QA_REPORT.md` for this distinction.
