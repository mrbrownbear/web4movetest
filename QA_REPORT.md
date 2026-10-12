# M0VE | Release check

### Executed

* 16 out of 16 Node tests passed for math, camera movement, particle phase order and startup.
* Source syntax checks passed for `src/particles.js` and `src/world.js`.
* Browser rendered real particle canvas at 1440 × 900 and 390 × 844, with no uncaught page errors in both tested widths.
* Particle canvas screenshots were checked at the exact logo, Looking for a home?, Searching for a home?, house and Buy or Sell with m0ve stages. Each was formed from lit circles.
* Transition to model tested: both viewports show the neighbourhood full screen; inline browser smoke test shows no horizontal overflow.
* Menu and search interactions opened correctly and the existing valuation default remains £416,100 in the browser smoke test.
* Confirmed no avatars or duplicate neighbourhood source scene present in the final project.

### Architecture correction

* The previous particle intro could stall waiting for a font or image, and its logo mask included white pixels. The new engine starts synchronously, masks background from the brand logo and renders particles independently of 3D loading.
* The former narrow model pane is replaced by one full viewport canvas and one matching fallback image. The background is never a second duplicate neighbourhood.
* The last section uses a circular full screen reveal while the particle house expands into a cloud.
* Camera sampling now begins after the intro has finished so the model journey has its own scroll distance.

### Not certified

The restricted test environment blocks normal local / external browser navigation and the Three.js module CDN. The real WebGL rendering and GPU performance are therefore not certified by these browser screenshots. The model fallback and particle animations were verified through inline browser execution. The actual source and original full model are included for testing in Chrome, Edge or Firefox with normal network and WebGL access.
