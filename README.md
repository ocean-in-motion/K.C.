# K.C. Long

A one-page link hub for K.C. Long, starring Rocky.

When the page opens, a shower of Rocky heads, cars and trucks falls from the top and piles up at the bottom. Visitors can play with it:

- **Tap Rocky** to drop another batch onto the pile.
- **Pull the Flush rope** (top right) to drain the pile out the bottom of the screen.
- **Fill the pile up** and Rocky starts to rumble. The next three taps add nothing but make Rocky shake harder ("Keep tapping…", "Almost…", "One more!"). The fourth sets off an explosion, the screen flashes white, and the page fades back to empty.

The pile never covers the links in a way that blocks them. Taps pass straight through to the buttons underneath.

## Files

```
index.html          page markup and links
css/style.css       colors, fonts and layout
js/main.js          falling pile, flush rope and explosion
assets/
  rocky-logo.svg    main logo
  rocky-head.svg    falling Rocky head
  car.svg           falling car
  truck.svg         falling truck
  favicon.svg       browser tab icon (the same Rocky head, squared up)
  favicon-32.png    tab icon fallback for older browsers
  apple-touch-icon.png  icon used when someone adds the page to their phone's home screen
```

No build step and no dependencies. The only outside request is the Google Fonts stylesheet.

## Editing

**Links:** open `index.html` and change the `href` on each button inside `<nav>`. The CARS button goes to https://skylinedecatur.com/. The Call button dials 678-850-7599 (`tel:+16788507599`) and the Email button opens a new message to Kclong@skylinedecatur.com (`mailto:`). If you change the number or address, update both the `href` and the text shown under the label. The Instagram, YouTube, Facebook and TikTok buttons still point at each site's home page, so swap in K.C.'s profile URLs.

**Name and tagline:** in `index.html`, edit the `<h1>` and the line under it. Update `<title>` and the `description` and `og:` tags in the `<head>` to match.

**Colors:** the color tokens are at the top of `css/style.css`. `--bg` is the blue background.

**How much falls:** near the top of `js/main.js`:

- The `weight` values in `KINDS` set the mix. The default is 60% Rocky heads, 20% cars, 20% trucks.
- `EMPTY_TAPS` is how many taps it takes to set off the explosion once the pile is full (default 3, then the next tap explodes).
- `MAX` is the most pieces allowed on screen: 110 on phones, 200 on larger screens. The pile also counts as full once it covers about half the screen, whichever comes first.
- `G` and `VMAX` set how fast pieces fall (gravity and top speed). `PER_FRAME` sets how many new pieces can enter per frame.

## Deploying

**GitHub Pages:** push this folder to a repository, then go to Settings → Pages, choose "Deploy from a branch," and pick `main` with the `/ (root)` folder.

**Netlify:** drag this folder onto the Netlify dashboard, or connect the repository. No build command is needed and the publish directory is the root.

## Notes

- The animation runs for everyone, including visitors with "Reduce Motion" turned on in their device settings.
- The animation pauses on its own about 10 seconds after the pile settles, so it doesn't drain phone batteries.
- To show a preview image when the link is shared, add a 1200×630 PNG to `assets/` and an `og:image` tag in `<head>` with its full URL (for example `https://yourdomain.com/assets/preview.png`).
