/* 星尘层 —— 微尘 / 亮星 / 星芒三层，带一条缓慢横移的斜向星带
   另外提供首页右下角的「星空」按钮：点一下只剩背景，再点恢复。
   依赖：无。用法：<canvas id="sd"></canvas> + 本脚本
*/
(function () {
  var cv = document.getElementById('sd');
  if (!cv) return;
  var ctx = cv.getContext('2d');
  var DPR = Math.min(2, window.devicePixelRatio || 1);
  var W = 0, H = 0, pts = [], run = true, last = 0;

  var HUE = [
    [255, 250, 244],
    [229, 142, 176],
    [0, 158, 157],
    [220, 217, 209],
    [109, 127, 181]
  ];

  var SPR = [], SPRX = [];
  function sprite(rgb, cross) {
    var s = 64, c = document.createElement('canvas');
    c.width = c.height = s;
    var g = c.getContext('2d'), h = s / 2, col = rgb.join(',');
    var gr = g.createRadialGradient(h, h, 0, h, h, h);
    gr.addColorStop(0, 'rgba(255,255,255,.95)');
    gr.addColorStop(.18, 'rgba(' + col + ',.70)');
    gr.addColorStop(.55, 'rgba(' + col + ',.16)');
    gr.addColorStop(1, 'rgba(' + col + ',0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, s, s);
    if (cross) {
      g.globalCompositeOperation = 'lighter';
      var lg = g.createLinearGradient(0, h, s, h);
      lg.addColorStop(0, 'rgba(' + col + ',0)');
      lg.addColorStop(.5, 'rgba(' + col + ',.85)');
      lg.addColorStop(1, 'rgba(' + col + ',0)');
      g.fillStyle = lg;
      g.fillRect(0, h - .8, s, 1.6);
      var lg2 = g.createLinearGradient(h, 0, h, s);
      lg2.addColorStop(0, 'rgba(' + col + ',0)');
      lg2.addColorStop(.5, 'rgba(' + col + ',.85)');
      lg2.addColorStop(1, 'rgba(' + col + ',0)');
      g.fillStyle = lg2;
      g.fillRect(h - .8, 0, 1.6, s);
    }
    return c;
  }
  HUE.forEach(function (c) { SPR.push(sprite(c, false)); SPRX.push(sprite(c, true)); });

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function build() {
    W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * DPR);
    cv.height = Math.round(H * DPR);
    cv.style.width = W + 'px';
    cv.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    var n = Math.round(Math.min(1600, W * H / 1100));
    pts = [];
    for (var i = 0; i < n; i++) {
      var ci = Math.random() < 0.62 ? 0 : (1 + (Math.random() * 4 | 0));
      var belt = Math.random() < 0.34;
      var x, y;
      if (belt) {
        var t = Math.random();
        x = t * W;
        y = H * 0.12 + t * H * 0.72 + rnd(-H * 0.11, H * 0.11);
      } else {
        x = Math.random() * W;
        y = Math.random() * H;
      }
      var kind = Math.random() < 0.035 ? 2 : (Math.random() < 0.22 ? 1 : 0);
      pts.push({
        x: x, y: y,
        ci: ci,
        kind: kind,
        belt: belt,
        // 星带上的点额外横向漂移，整条带子会慢慢往右流
        dx: belt ? rnd(0.10, 0.30) : 0,
        r: kind === 0 ? rnd(0.5, 1.7) : rnd(0.7, 1.5),
        v: rnd(0.02, 0.11) * (kind === 0 ? 1 : 0.7),
        p: Math.random() * 6.283,
        a: kind === 0 ? rnd(0.14, 0.5) : rnd(0.3, 0.72),
        s: rnd(0.5, 1.9)
      });
    }
  }

  function frame(now) {
    if (!run) return;
    requestAnimationFrame(frame);
    if (now - last < 32) return;
    last = now;
    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      p.y -= p.v;
      if (p.y < -20) { p.y = H + 20; p.x = Math.random() * W; }
      if (p.dx) {
        p.x += p.dx;
        if (p.x > W + 40) p.x -= W + 80;
      }
      var x = p.x + Math.sin(now * 0.00035 + p.p) * (p.kind ? 0.5 : 1.1);
      var tw = 0.55 + 0.45 * Math.sin(now * 0.0015 * p.s + p.p);
      var a = p.a * tw;

      if (p.kind === 0) {
        ctx.globalAlpha = a * 0.85;
        ctx.fillStyle = 'rgba(' + HUE[p.ci].join(',') + ',1)';
        ctx.fillRect(x, p.y, p.r, p.r);
      } else {
        var sp = p.kind === 2 ? SPRX[p.ci] : SPR[p.ci];
        var d = p.r * (p.kind === 2 ? 11 : 4.6);
        ctx.globalAlpha = a;
        ctx.drawImage(sp, x - d / 2, p.y - d / 2, d, d);
      }
    }
    ctx.globalAlpha = 1;
  }

  build();
  requestAnimationFrame(frame);

  var rt;
  addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(build, 180);
  });
  document.addEventListener('visibilitychange', function () {
    run = !document.hidden;
    if (run) { last = 0; requestAnimationFrame(frame); }
  });

  /* ---- 星空模式：只留背景 ---- */
  var btn = document.getElementById('sdBtn');
  function toggle(on) {
    document.body.classList.toggle('sd-only', on === undefined ? !document.body.classList.contains('sd-only') : on);
    if (btn) {
      var on2 = document.body.classList.contains('sd-only');
      btn.setAttribute('aria-pressed', on2 ? 'true' : 'false');
      btn.querySelector('span').textContent = on2 ? '回来' : '星空';
    }
  }
  if (btn) btn.addEventListener('click', function () { toggle(); });
  addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('sd-only')) toggle(false);
  });
})();
