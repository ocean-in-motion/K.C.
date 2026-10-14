/* K.C. Long link page: falling Rocky pile, flush rope and explosion */
(function () {
  var HEAD = "assets/rocky-head.svg";
  var CAR = "assets/car.svg";
  var TRUCK = "assets/truck.svg";
  var KINDS = [
    { src: HEAD,  aspect: 800.53 / 688.39, rad: 0.44, scale: 1,    weight: 0.6 },
    { src: CAR,   aspect: 64 / 120,        rad: 0.30, scale: 1.15, weight: 0.2 },
    { src: TRUCK, aspect: 66 / 132,        rad: 0.30, scale: 1.2,  weight: 0.2 }
  ];
  function pickKind() {
    var r = Math.random(), acc = 0;
    for (var k = 0; k < KINDS.length; k++) { acc += KINDS[k].weight; if (r < acc) return KINDS[k]; }
    return KINDS[0];
  }

  var reduce = false;
  var rain = document.getElementById("rain");
  var btn = document.getElementById("logoBtn");
  var rope = document.getElementById("rope");
  var hint = document.getElementById("hint");

  var MAX = window.innerWidth < 600 ? 110 : 200;
  var G = 0.7, VMAX = 22, PER_FRAME = 6, slot = Math.random();
  var drops = [], pending = 0;
  var running = false, last = 0, still = 0, wokeAt = 0, flushUntil = 0;

  function W() { return window.innerWidth || document.documentElement.clientWidth || 0; }
  function H() { return window.innerHeight || document.documentElement.clientHeight || 0; }
  function sizeReady() { return W() >= 100 && H() >= 100; }

  function makeDrop() {
    var w = W();
    var kind = pickKind();
    var scale = Math.max(0.6, Math.min(1, w / 760));
    var size = (44 + Math.random() * 66) * scale * kind.scale;
    var r = size * kind.rad;
    var img = new Image();
    img.src = kind.src; img.alt = ""; img.draggable = false;
    img.style.width = size + "px";
    img.style.transform = "translate(-9999px,0)";
    rain.appendChild(img);
    drops.push({
      el: img, size: size, r: r, aspect: kind.aspect,
      x: r + (slot = (slot + 0.618034) % 1) * Math.max(1, w - 2 * r),
      y: -r - Math.random() * 140,
      vx: (Math.random() - 0.5) * 2,
      vy: 7 + Math.random() * 4,
      a: Math.random() * 360,
      va: (Math.random() - 0.5) * 6,
      px: 0, py: 0, grounded: false, flushed: false, entered: false
    });
  }

  function wake() {
    still = 0; wokeAt = performance.now();
    if (!running) { running = true; last = performance.now(); requestAnimationFrame(tick); }
  }

  function pileRoom() {
    var w = W(), h = H();
    var scale = Math.max(0.6, Math.min(1, w / 760));
    var avgR = 0.4 * 77 * scale;
    var used = pending * 3.5 * avgR * avgR, live = 0;
    for (var i = 0; i < drops.length; i++) if (!drops[i].flushed) { live++; used += 3.5 * drops[i].r * drops[i].r; }
    var free = 0.5 * w * h - used;
    var byArea = Math.floor(free / (3.5 * avgR * avgR));
    var byCount = MAX - live - pending;
    return Math.max(0, Math.min(byArea, byCount));
  }

  function queue(n) {
    if (!sizeReady()) return;
    var room = pileRoom();
    pending += Math.min(n, room);
    wake();
    if (pileRoom() <= 0) setFull(true);
  }

  var EMPTY_TAPS = 3;
  var FULL_HINTS = ["Pile's full!", "Keep tapping\u2026", "Almost\u2026", "One more!"];
  var exploding = false, isFull = false, fullTaps = 0;
  var hintText = document.getElementById("hintText");
  var boomEl = document.getElementById("boom");
  var flashEl = document.getElementById("flash");

  function setFull(on) {
    if (on === isFull) return;
    isFull = on;
    fullTaps = 0;
    setRumble(0);
    btn.classList.toggle("full", on);
    btn.setAttribute("aria-label", on ? "Blow up the pile" : "Drop more Rockys");
    if (on) { hintText.textContent = FULL_HINTS[0]; hint.classList.remove("done"); }
    else { hint.classList.add("done"); }
  }

  function setRumble(level) {
    var deg = [3, 5, 8, 12][Math.min(level, 3)];
    var speed = [0.5, 0.36, 0.24, 0.14][Math.min(level, 3)];
    btn.style.setProperty("--ra", deg + "deg");
    btn.style.setProperty("--rs", speed + "s");
  }

  function emptyTap() {
    fullTaps++;
    if (fullTaps > EMPTY_TAPS) { explode(); return; }
    setRumble(fullTaps);
    hintText.textContent = FULL_HINTS[Math.min(fullTaps, FULL_HINTS.length - 1)];
    hint.classList.remove("bump"); void hint.offsetWidth; hint.classList.add("bump");
  }

  function explode() {
    exploding = true;
    setFull(false);
    pending = 0;
    var b = btn.getBoundingClientRect();
    var cx = (b.left + b.right) / 2, cy = (b.top + b.bottom) / 2;
    boomEl.style.left = cx + "px"; boomEl.style.top = cy + "px";
    boomEl.classList.remove("go"); void boomEl.offsetWidth; boomEl.classList.add("go");
    for (var i = 0; i < drops.length; i++) {
      var d = drops[i];
      var dx = d.x - cx, dy = d.y - cy, len = Math.sqrt(dx * dx + dy * dy) || 1;
      var power = 14 + Math.random() * 10;
      d.exploded = true; d.flushed = true;
      d.vx = dx / len * power; d.vy = dy / len * power - 6;
      d.va = (Math.random() - 0.5) * 16;
    }
    wake();
    setTimeout(function () { flashEl.classList.add("on"); }, 380);
    setTimeout(function () {
      for (var i = 0; i < drops.length; i++) drops[i].el.remove();
      drops = []; pending = 0; flushUntil = 0;
      boomEl.classList.remove("go");
    }, 650);
    setTimeout(function () { flashEl.classList.remove("on"); }, 800);
    setTimeout(function () { exploding = false; }, 1700);
  }

  var grid = new Map();
  function collide(flushing, cell) {
    grid.clear();
    var i, d;
    for (i = 0; i < drops.length; i++) {
      d = drops[i];
      if (!d.entered || d.exploded) continue;
      var key = (Math.floor(d.x / cell) + 2) * 4096 + (Math.floor(d.y / cell) + 2);
      var list = grid.get(key);
      if (list) list.push(i); else grid.set(key, [i]);
    }
    for (i = 0; i < drops.length; i++) {
      var p = drops[i];
      if (!p.entered || p.exploded) continue;
      var cx = Math.floor(p.x / cell) + 2, cy = Math.floor(p.y / cell) + 2;
      for (var gx = cx - 1; gx <= cx + 1; gx++) {
        for (var gy = cy - 1; gy <= cy + 1; gy++) {
          var list = grid.get(gx * 4096 + gy);
          if (!list) continue;
          for (var k = 0; k < list.length; k++) {
            var j = list[k];
            if (j <= i) continue;
            var q = drops[j];
            var dx = q.x - p.x, dy = q.y - p.y, min = p.r + q.r;
            var dist2 = dx * dx + dy * dy;
            if (dist2 >= min * min) continue;
            var dist = Math.sqrt(dist2) || 0.01, nx = dx / dist, ny = dy / dist;
            var push = Math.min((min - dist) / 2, min * 0.25);
            p.x -= nx * push; p.y -= ny * push;
            q.x += nx * push; q.y += ny * push;
            if (!p.flushed && !q.flushed) { p.vx *= 0.9; p.vy *= 0.9; q.vx *= 0.9; q.vy *= 0.9; }
            var rel = (q.vx - p.vx) * nx + (q.vy - p.vy) * ny;
            if (rel < 0) {
              var imp = -rel * 0.6;
              p.vx -= nx * imp; p.vy -= ny * imp;
              q.vx += nx * imp; q.vy += ny * imp;
              p.va *= 0.8; q.va *= 0.8;
            }
          }
        }
      }
    }
  }

  function bounds(d, w, h) {
    if (!d.flushed && d.y + d.r > h) {
      d.y = h - d.r;
      if (d.vy > 0) d.vy *= -0.35;
      d.vx *= 0.88; d.va *= 0.6; d.grounded = true;
    }
    if (d.exploded) return;
    if (d.x - d.r < 0) { d.x = d.r; d.vx = Math.abs(d.vx) * 0.5; }
    if (d.x + d.r > w) { d.x = w - d.r; d.vx = -Math.abs(d.vx) * 0.5; }
  }

  function tick(now) {
    var dt = Math.min(2, (now - last) / 16.67); last = now;
    var w = W(), h = H(), i, d;
    if (w < 100 || h < 100) { requestAnimationFrame(tick); return; }
    var flushing = now < flushUntil;

    if (pending > 0) {
      var n = Math.min(pending, PER_FRAME);
      for (i = 0; i < n; i++) makeDrop();
      pending -= n;
    }

    var maxR = 1;
    for (i = 0; i < drops.length; i++) {
      d = drops[i];
      d.px = d.x; d.py = d.y;
      if (d.r > maxR) maxR = d.r;
      d.vy += G * dt;
      if (d.flushed) d.vx += (w / 2 - d.x) * 0.0015 * dt;
      if (!d.exploded) {
        if (d.vy > VMAX) d.vy = VMAX;
        if (d.vx > 8) d.vx = 8; else if (d.vx < -8) d.vx = -8;
      }
      d.x += d.vx * dt; d.y += d.vy * dt; d.a += d.va * dt;
      if (!d.entered && d.y > -d.r) d.entered = true;
      bounds(d, w, h);
    }

    for (var pass = 0; pass < 3; pass++) {
      collide(flushing, maxR * 2);
      for (i = 0; i < drops.length; i++) bounds(drops[i], w, h);
    }

    var keep = [], maxMove = 0;
    for (i = 0; i < drops.length; i++) {
      d = drops[i];
      d.va *= d.grounded ? 0.85 : 0.99;
      if (!d.exploded) { if (d.va > 6) d.va = 6; else if (d.va < -6) d.va = -6; }
      d.grounded = false;
      if (d.y - d.r > h + 40) { d.el.remove(); continue; }
      var mv = !d.entered ? 99 : Math.abs(d.x - d.px) + Math.abs(d.y - d.py) + Math.abs(d.va) * 0.2;
      if (mv > maxMove) maxMove = mv;
      d.el.style.transform = "translate(" + (d.x - d.size / 2) + "px," + (d.y - d.size * d.aspect / 2) + "px) rotate(" + d.a + "deg)";
      keep.push(d);
    }
    drops = keep;

    still = (maxMove < 1.2 && !flushing && pending === 0) ? still + 1 : 0;
    var keepGoing = pending > 0 || flushing || (drops.length && still < 45 && now - wokeAt < 10000);
    if (keepGoing) requestAnimationFrame(tick); else running = false;
  }

  window.addEventListener("resize", function () { if (drops.length) wake(); });

  function flush() {
    if (exploding) return;
    pending = 0;
    setFull(false);
    flushUntil = performance.now() + 3000;
    for (var i = 0; i < drops.length; i++) {
      var d = drops[i];
      d.flushed = true;
      d.vy = Math.max(d.vy, 2 + Math.random() * 3);
    }
    wake();
  }

  function setPull(px) { rope.style.setProperty("--pull", px + "px"); }
  var startY = null, dragged = false;
  rope.addEventListener("pointerdown", function (e) {
    startY = e.clientY; dragged = false;
    rope.classList.remove("spring");
    try { rope.setPointerCapture(e.pointerId); } catch (err) {}
  });
  rope.addEventListener("pointermove", function (e) {
    if (startY === null) return;
    var ext = Math.max(0, Math.min(90, e.clientY - startY));
    if (ext > 6) dragged = true;
    setPull(ext);
  });
  function release(e) {
    if (startY === null) return;
    var ext = Math.max(0, Math.min(90, e.clientY - startY));
    startY = null;
    rope.classList.add("spring");
    setPull(0);
    if (dragged && ext > 25) flush();
  }
  rope.addEventListener("pointerup", release);
  rope.addEventListener("pointercancel", release);
  rope.addEventListener("click", function () {
    if (dragged) { dragged = false; return; }
    rope.classList.add("spring");
    setPull(36);
    setTimeout(function () { setPull(0); }, 140);
    flush();
  });

  btn.addEventListener("click", function () {
    if (reduce || exploding) return;
    if (isFull) { emptyTap(); return; }
    hint.classList.add("done");
    btn.classList.remove("squish"); void btn.offsetWidth; btn.classList.add("squish");
    queue(Math.round(Math.min(30, Math.max(14, W() / 40))));
  });

  function start() {
    if (started) return;
    if (!sizeReady()) return;
    started = true;
    MAX = W() < 600 ? 110 : 200;
    queue(Math.round(Math.min(45, Math.max(22, W() / 28))));
  }
  var started = false;
  start();
  if (!started) {
    window.addEventListener("resize", start);
    window.addEventListener("load", start);
    var waitTimer = setInterval(function () { start(); if (started) clearInterval(waitTimer); }, 200);
  }
})();
