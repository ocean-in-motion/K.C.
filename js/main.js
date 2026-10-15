/* K.C. Long link page: falling Rocky pile, flush rope and explosion */
(function () {
  var HEAD = "assets/rocky-head.svg";
  var CAR = "assets/car.svg";
  var TRUCK = "assets/truck.svg";
  var KEY = "assets/key.svg";
  var KINDS = [
    { src: HEAD,  aspect: 550 / 657.4,     rad: 0.41, scale: 1,    weight: 0.5 },
    { src: CAR,   aspect: 64 / 120,        rad: 0.30, scale: 1.15, weight: 0.17 },
    { src: TRUCK, aspect: 66 / 132,        rad: 0.30, scale: 1.2,  weight: 0.17 },
    { src: KEY,   aspect: 290 / 280,       rad: 0.40, scale: 0.85, weight: 0.16 }
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

  var scroller = document.getElementById("scroller");
  function W() { return rain.clientWidth || window.innerWidth || 0; }
  function H() { return rain.clientHeight || window.innerHeight || 0; }
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

  var realLogo = btn.querySelector(".logo");
  var blastEl = document.getElementById("logoBlast");
  var heliRig = document.getElementById("heliRig");
  var heliEl = document.getElementById("heli");
  var carrier = document.getElementById("carrier");
  var cableEl = document.getElementById("cable");
  var carryLogo = document.getElementById("carryLogo");
  var HOOK_X = 230 / 420, HOOK_Y = 118 / 170, HELI_RATIO = 170 / 420;

  function easeInOut(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
  function easeOut(p) { return 1 - Math.pow(1 - p, 3); }
  function easeIn(p) { return p * p * p; }
  function lerp(a, b, p) { return a + (b - a) * p; }

  function blowUpLogo() {
    var r = btn.getBoundingClientRect();
    blastEl.src = realLogo.currentSrc || realLogo.src;
    blastEl.style.width = realLogo.offsetWidth + "px";
    blastEl.style.left = r.left + "px"; blastEl.style.top = r.top + "px";
    blastEl.classList.remove("go"); void blastEl.offsetWidth; blastEl.classList.add("go");
    realLogo.style.visibility = "hidden";
  }

  function deliverLogo(onLanded, onDone) {
    var T_IN = 2300, T_SETTLE = 700, T_WINCH = 450, T_OUT = 1500;
    var t0 = performance.now(), prev = t0;
    var lastX = null, lastVX = 0, theta = 0.25, omega = 0, tilt = 0, landed = false;
    carryLogo.src = realLogo.currentSrc || realLogo.src;
    carryLogo.style.visibility = "visible";
    heliRig.hidden = false;

    function frame(now) {
      var t = now - t0, dt = Math.min(0.05, (now - prev) / 1000) || 0.016; prev = now;
      var r = btn.getBoundingClientRect();
      var lw = realLogo.offsetWidth, lh = realLogo.offsetHeight;
      var cx = r.left + r.width / 2, top = r.top;
      var vw = W(), vh = H();
      var room = top - 6 - 18;
      var hw = Math.max(150, Math.min(340, lw * 1.25, room / (HOOK_Y * HELI_RATIO))), hh = hw * HELI_RATIO;
      var cable = Math.max(18, Math.min(lh * 0.3, top - 6 - HOOK_Y * hh));
      var landHook = top - cable;
      var startX = -hw * 0.6, startY = Math.min(vh * 0.42, landHook + vh * 0.3);
      var x, y, cableLen = cable;

      if (t < T_IN) {
        var p = t / T_IN;
        x = lerp(startX, cx, easeOut(p));
        y = lerp(startY, landHook - 22, easeInOut(p));
      } else if (t < T_IN + T_SETTLE) {
        var ps = (t - T_IN) / T_SETTLE;
        x = cx; y = lerp(landHook - 22, landHook, easeInOut(ps));
      } else if (t < T_IN + T_SETTLE + T_WINCH) {
        var pw = (t - T_IN - T_SETTLE) / T_WINCH;
        x = cx; y = landHook;
        if (!landed) { landed = true; theta = 0; omega = 0; carryLogo.style.visibility = "hidden"; onLanded(); }
        cableLen = lerp(cable, 4, easeInOut(pw));
      } else if (t < T_IN + T_SETTLE + T_WINCH + T_OUT) {
        var po = (t - T_IN - T_SETTLE - T_WINCH) / T_OUT;
        x = lerp(cx, vw + hw, easeIn(po));
        y = lerp(landHook, -hh * 1.6, easeInOut(po));
        cableLen = 4;
      } else {
        heliRig.hidden = true;
        onDone();
        return;
      }

      var vx = lastX === null ? 0 : (x - lastX) / dt;
      var ax = (vx - lastVX) / dt;
      lastX = x; lastVX = vx;

      if (!landed) {
        var L = cable + lh * 0.5;
        var damp = t > T_IN ? 7 : 1.6;
        var acc = -(2600 / L) * Math.sin(theta) - damp * omega - (ax / L) * Math.cos(theta);
        omega += acc * dt; theta += omega * dt;
        if (theta > 0.45) { theta = 0.45; omega = 0; } else if (theta < -0.45) { theta = -0.45; omega = 0; }
        if (t > T_IN + T_SETTLE * 0.6) theta *= 0.85;
      }

      var targetTilt = Math.max(-8, Math.min(16, vx / 45));
      tilt += (targetTilt - tilt) * Math.min(1, dt * 6);

      heliEl.style.width = hw + "px";
      heliEl.style.transformOrigin = (HOOK_X * 100) + "% " + (HOOK_Y * 100) + "%";
      heliEl.style.transform = "translate(" + (x - HOOK_X * hw) + "px," + (y - HOOK_Y * hh) + "px) rotate(" + tilt + "deg)";
      carrier.style.transform = "translate(" + x + "px," + y + "px) rotate(" + (-theta * 180 / Math.PI) + "deg)";
      cableEl.style.height = cableLen + "px";
      carryLogo.style.width = lw + "px";
      carryLogo.style.left = (-lw / 2) + "px";
      carryLogo.style.top = cableLen + "px";
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function explode() {
    exploding = true;
    try { if (scroller.scrollTop > 0) scroller.scrollTo({ top: 0, behavior: "smooth" }); } catch (e) { scroller.scrollTop = 0; }
    if (window.scrollY) window.scrollTo(0, 0);
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
    blowUpLogo();
    setTimeout(function () { flashEl.classList.add("on"); }, 380);
    setTimeout(function () {
      for (var i = 0; i < drops.length; i++) drops[i].el.remove();
      drops = []; pending = 0; flushUntil = 0;
      boomEl.classList.remove("go");
    }, 650);
    setTimeout(function () { flashEl.classList.remove("on"); }, 800);
    setTimeout(function () {
      blastEl.classList.remove("go");
      deliverLogo(function () {
        realLogo.style.visibility = "";
        btn.classList.remove("squish"); void btn.offsetWidth; btn.classList.add("squish");
        exploding = false;
      }, function () {});
    }, 1050);
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

  function place(d) {
    d.el.style.transform = "translate(" + (d.x - d.size / 2) + "px," + (d.y - d.size * d.aspect / 2) + "px) rotate(" + d.a + "deg)";
  }

  var floorH = 0;
  function syncFloor() {
    var h = H();
    if (h < 100) return;
    if (!floorH) { floorH = h; return; }
    var dh = h - floorH;
    if (Math.abs(dh) < 0.5) return;
    floorH = h;
    if (Math.abs(dh) > 260) { wake(); return; }
    for (var i = 0; i < drops.length; i++) {
      var d = drops[i];
      if (!d.entered) continue;
      d.y += dh; d.py += dh;
      place(d);
    }
  }

  function tick(now) {
    var dt = Math.min(2, (now - last) / 16.67); last = now;
    var w = W(), h = H(), i, d;
    if (w < 100 || h < 100) { requestAnimationFrame(tick); return; }
    syncFloor();
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
      place(d);
      keep.push(d);
    }
    drops = keep;

    still = (maxMove < 1.2 && !flushing && pending === 0) ? still + 1 : 0;
    var keepGoing = pending > 0 || flushing || (drops.length && still < 45 && now - wokeAt < 10000);
    if (keepGoing) requestAnimationFrame(tick); else running = false;
  }

  function onViewportChange() {
    var before = floorH;
    syncFloor();
    if (drops.length && W() !== lastW) { lastW = W(); wake(); }
    else if (drops.length && before && Math.abs(H() - before) > 260) wake();
  }
  var lastW = W();
  window.addEventListener("resize", onViewportChange);
  window.addEventListener("scroll", function () { if (window.scrollY) window.scrollTo(0, 0); syncFloor(); }, { passive: true });
  window.addEventListener("orientationchange", function () { setTimeout(onViewportChange, 250); });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", syncFloor);
    window.visualViewport.addEventListener("scroll", syncFloor);
  }

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
