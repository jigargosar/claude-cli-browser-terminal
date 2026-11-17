# Showcase video

The source of the demo in the main README. `index.html` is one HyperFrames composition: eight scenes on one GSAP timeline, 63 s, 1280x720.

`../showcase-storyboard.html` is the same thing as a page that plays in a browser without a render. Use it to try a change quickly, then copy the change here.

## Render

Run these from this folder. ffmpeg must be on the PATH.

```
pnpm exec hyperframes snapshot --at 4,16,27,38,49,58
pnpm exec hyperframes render -o ../../media/ccw-showcase.mp4
ffmpeg -y -i ../../media/ccw-showcase.mp4 -vf "fps=12,scale=960:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" ../../media/ccw-showcase.gif
```

The snapshot writes still frames under `.hyperframes/`. Look at them before the render, which takes about two minutes.

## Rules the composition follows

- One thing moves at a time, and every motion is followed by a hold.
- No callback sets text. Typed text is written from a tween's progress, and each key press has its own element. A frame then looks the same however the renderer reaches it.
- When the timeline changes length, update `data-duration` on `#stage` and `DURATION` in the script. The page throws if the timeline is longer than `DURATION`.

## Known

- `hyperframes lint` reports one error: Cascadia Code has no `@font-face`. The local render uses the installed font or a fallback.
- `gsap.min.js` and `lucide.min.js` are copies from `node_modules`, so the render needs no network.
