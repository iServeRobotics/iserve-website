# iServe Robotics — draft preview

A private, light-theme preview of an iServe Robotics marketing site. It is not the public website, and it does not publish anything to iserve.ai.

The line on the page is the work: **Deploy robots. Scale fleets.** iServe bridges pilot deployment, site integration, daily operations, and ongoing support — connecting robotics technology to real sites and keeping it working.

## Run it

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:3847](http://127.0.0.1:3847).

Production:

```bash
npm run build
npm start
```

`npm start` also listens on port 3847.

## What you are looking at

- Ivory field, near-black type, cobalt route. This is a new composition, separate from the current dark site.
- The opening is a scroll-driven perspective camera through one court. Three illustrated machines stand on the ground and turn to face the camera. They are concept plates — rounded chassis, wheels, and sensors drawn for this draft — not photoreal product models, and not a pre-rendered character film. As the camera passes, a plate that would leave the frame is hidden, with its contact shadow, so it does not slice across the lens.
- Further along the same camera path, the approved street and hall stills sit behind stone openings. The photograph is the back wall of the opening. The camera holds in front of each opening, then pulls back onto the three machines. Fog hides the openings once the camera is far enough away that a side view would show the edge of the picture.
- This is not a photograph pan, and it is not equivalent to a production character reel. The court itself is simple geometry.
- Two films — commercial patrol and indoor cleaning — pin further down the page. Scroll on each film moves from the cobalt route, through the site as structure, to the still daylight scene.
- On each daylight scene a different original concept machine rolls away from the camera. Commercial patrol uses a cream robot with a sensor mast and cameras, and no weapons. Indoor cleaning uses a low floor scrubber with a deck, disc brushes, and a roller. They are built for this draft. They are not the black model published at iserve.ai, they are not a recolor of that file, and they are not customer products. The machine already printed in the photograph stays still. At the far end the body, wheel marks, brushes, and shadow fade out together, the model stays fully hidden while its position returns to the start, then the whole model fades in there. Wheels spin by the distance traveled; the scrubber’s brushes spin with them. There is no outline. The roll pauses offscreen, and it does not run while the route or the wireframe is up. Reduced motion (system setting, or `/?motion=reduce`) parks the model and does not roll it.
- Play, Pause, and Replay sit on each film. There is no audio and nothing autoplays.
- If seeking fails, scroll moves through stills taken from the film and Play still runs the video. Add `?film=frames` to force that path.
- Reduced motion also holds the opening camera still, shows every passage, and shows the film poster. Play runs a film only when you ask.

The films in `public/media` are the approved pictures, re-encoded so each frame can be sought, and trimmed so playback starts when the route is already visible. The untouched files are in `media/source/`. The pages label these as concept visuals. They are not live deployment footage and they are not performance claims.

## Contact

This preview does not submit a form. The mail links use addresses published on the public site as of 7 November 2026:

- [info@iserve.ai](mailto:info@iserve.ai) on [iserve.ai](https://iserve.ai)
- [bona@iserve.ai](mailto:bona@iserve.ai) on [iserve.ai/services.html](https://iserve.ai/services.html)

No phone number is published there.

## Stack

Next.js, TypeScript, Tailwind, shadcn/ui (Button), and Three.js for the opening camera and the rolling model.
