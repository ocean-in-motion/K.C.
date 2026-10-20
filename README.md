# K.C. Long

A one-page link hub for K.C. Long, starring Roscoe.

When the page opens, a shower of Roscoe heads, cars, trucks and key fobs falls from the top and piles up at the bottom. Visitors can play with it:

- **Tap Roscoe** to drop another batch onto the pile.
- **Pull the Flush rope** (top right) to drain the pile out the bottom of the screen.
- **Fill the pile up** and Roscoe starts to rumble. The next three taps add nothing but make Roscoe shake harder ("Keep tapping…", "Almost…", "One more!"). The fourth sets off an explosion: Roscoe and the whole pile blow apart, the screen flashes white, and a helicopter flies in with a fresh Roscoe hanging from a cable, sets him back in place and flies off.

The pile never covers the links in a way that blocks them. Taps pass straight through to the buttons underneath.

## Files

```
index.html          page markup, links and contact form
thanks/index.html   thank-you page shown after the form is sent (lives at /thanks)
game/index.html     "Let's Go Roscoe" game (lives at /game)
css/style.css       colors, fonts and layout
js/main.js          falling pile, flush rope and explosion
assets/
  roscoe-logo.svg    main logo
  roscoe-head.svg    falling Roscoe head
  car.svg           falling car
  truck.svg         falling truck
  key.svg           falling key fob
  roscoe-car-bandit7.png  Roscoe in his car with the BANDIT 7 door decal, used by the game
  skyline-logo.jpg  Skyline Automotive Group logo on the game's highway signs
  favicon.svg       browser tab icon (the same Roscoe head, squared up)
  favicon-32.png    tab icon fallback for older browsers
  apple-touch-icon.png  icon used when someone adds the page to their phone's home screen
```

No build step and no dependencies. The only outside request is the Google Fonts stylesheet.

## Editing

**Links:** open `index.html` and change the `href` on each button inside `<nav>`. The CARS button goes to https://skylinedecatur.com/. The CARS banner sits at the top; the Call button (678-850-7599, `tel:+16788507599`) and the Instagram, YouTube, Facebook and TikTok buttons (the @kcandroscoe profiles) sit below the contact form.

**CARS banner:** the car lot scene is drawn right inside the CARS button in `index.html` (the `<svg class="lot">` block), so it needs no image file. To use a real photo of the lot instead, put it in `assets/` (for example `assets/lot.jpg`), delete the `<svg class="lot">…</svg>` block, and add `background: url(../assets/lot.jpg) center / cover;` to `nav a.cars-btn` in `css/style.css`.

**Contact form:** the "Need a quick response?" form at the bottom sends through [Web3Forms](https://web3forms.com). Messages go to the email address the access key was created with; the key is the `access_key` field in the form. Name and phone are required, email and the message are optional. After a successful send, visitors land on the thank-you page at `/thanks`; if sending fails, they see an error with K.C.'s phone number and stay on the page. Clicking into the form drains the pile so nothing covers the fields. Change the email subject or sender name with the `subject` and `from_name` fields.

**Thank-you page:** `thanks/index.html` (address: `/thanks`) has Roscoe shaking a pair of maracas (drawn inline, the two `<svg class="maraca">` blocks), the white starburst, and black-and-white confetti that bursts out on arrival and keeps falling. Edit the headline and message in its `<main>` section. It's set to `noindex` so search engines skip it.

**Game:** `game/index.html` (address: `/game`) is reached from the "Let's Go Roscoe →" button on the thank-you page. Roscoe drives left; tap, click, or press Space (or the up arrow) to jump trash bags, bag piles and dumpsters. After the first couple of obstacles, more than half the dumpsters are on fire (only dumpsters burn). The road speeds up over time; on phones held upright the top speed is capped so there's always about half a second to react, and the start card suggests turning the phone sideways. Distance counts up in meters as he drives, and the best run is saved in the visitor's browser. At 50, 100, 200, 300, 500, 750 and 1,000 m, then every 500 m after that, a Skyline Automotive highway sign rolls by on the roadside showing the distance (change the list in `MILESTONES`). Tuning lives at the top of the game's script: `JUMP_T` and `JUMP_H` (jump time and height), `SPEED0`, `SPEED_MAX` and `ACCEL` (starting speed, top speed and how fast it ramps up), and `TYPES` (obstacle sizes and how often each appears).

**Name and bio:** in `index.html`, edit the `<h1>` and the bio line under it (`<p class="tag">`). Update `<title>` and the `description` and `og:` tags in the `<head>` to match.

**Footer:** the copyright line and the "Built by O.I.M." credit sit in `<footer class="foot">` at the bottom of `index.html`. Update the year there when it changes.

**Colors:** the color tokens are at the top of `css/style.css`. `--bg` is the blue background.

**How much falls:** near the top of `js/main.js`:

- The `weight` values in `KINDS` set the mix. The default is 50% Roscoe heads, 17% cars, 17% trucks and 16% key fobs.
- `EMPTY_TAPS` is how many taps it takes to set off the explosion once the pile is full (default 3, then the next tap explodes).
- `MAX` is the most pieces allowed on screen: 110 on phones, 200 on larger screens. The pile also counts as full once it covers about half the screen, whichever comes first.
- `G` and `VMAX` set how fast pieces fall (gravity and top speed). `PER_FRAME` sets how many new pieces can enter per frame.

**Helicopter:** it's drawn inline in `index.html` (the `<svg class="heli">` block), so it needs no extra file. Its timing is set by `T_IN`, `T_SETTLE`, `T_WINCH` and `T_OUT` in `deliverLogo()` in `js/main.js`, all in milliseconds.

## Deploying

**GitHub Pages:** push this folder to a repository, then go to Settings → Pages, choose "Deploy from a branch," and pick `main` with the `/ (root)` folder. The `CNAME` file points the site at **kcandroscoe.com**; in the domain registrar's DNS, add the GitHub Pages records, then tick "Enforce HTTPS" in Settings → Pages once it's available. If you deploy somewhere else or change domains, update or delete `CNAME`.

**Thank-you page URL:** https://kcandroscoe.com/thanks. It lives in its own folder (`thanks/index.html`) so the address needs no `.html` on any host. The form already sends visitors there after a successful send; the same URL is in the form's hidden `redirect` field so visitors without JavaScript land there too.

**Netlify:** drag this folder onto the Netlify dashboard, or connect the repository. No build command is needed and the publish directory is the root.

## Notes

- The animation runs for everyone, including visitors with "Reduce Motion" turned on in their device settings.
- The animation pauses on its own about 10 seconds after the pile settles, so it doesn't drain phone batteries.
- The page content scrolls inside a full-screen panel (`<div class="scroller">`) rather than scrolling the browser window. This is on purpose: iOS 26 Safari has a bug where layers pinned to the screen slide with the page when the address bar shrinks or grows ([WebKit bug 297779](https://bugs.webkit.org/show_bug.cgi?id=297779)), which left the pile floating mid-screen. Keep new content inside `.scroller` so it scrolls normally.
- When you replace an image, give the new file a new name (as with `roscoe-car-bandit7.png`). Browsers and GitHub Pages cache images by name, so reusing a name can keep showing the old picture for a while.
- To show a preview image when the link is shared, add a 1200×630 PNG to `assets/` and an `og:image` tag in `<head>` with its full URL (for example `https://yourdomain.com/assets/preview.png`).
