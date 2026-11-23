/* Shared drawing: a Go board that replays real game records, and a small 3D renderer for
   protein chains drawn from deposited coordinates. */
(function () {
  const { clamp, lerp, rgba } = U;

  /* ---------------------------------------------------------------- Go */
  /* Board state after n moves of a game record, with captures (no ko or suicide checks needed:
     the records are legal games). Returns {grid: 19x19 of 0|'B'|'W', order: move number per point}. */
  const boardCache = {};
  function boardAt(gameKey, n) {
    const key = gameKey + ':' + n; if (boardCache[key]) return boardCache[key];
    const moves = DATA_GO[gameKey].moves; const g = Array.from({ length: 19 }, () => Array(19).fill(0)); const ord = Array.from({ length: 19 }, () => Array(19).fill(0));
    const nb = (x, y) => [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].filter(([a, b]) => a >= 0 && a < 19 && b >= 0 && b < 19);
    function group(x, y) {
      const c = g[y][x], seen = new Set([x + ',' + y]), st = [[x, y]], stones = []; let libs = 0; const lib = new Set();
      while (st.length) { const [a, b] = st.pop(); stones.push([a, b]);
        for (const [p, q] of nb(a, b)) { if (g[q][p] === 0) { if (!lib.has(p + ',' + q)) { lib.add(p + ',' + q); libs++; } } else if (g[q][p] === c && !seen.has(p + ',' + q)) { seen.add(p + ',' + q); st.push([p, q]); } } }
      return { stones, libs };
    }
    let captured = 0;
    for (let k = 0; k < Math.min(n, moves.length); k++) {
      const [c, x, y] = moves[k]; g[y][x] = c; ord[y][x] = k + 1;
      for (const [p, q] of nb(x, y)) if (g[q][p] && g[q][p] !== c) { const gr = group(p, q); if (gr.libs === 0) for (const [a, b] of gr.stones) { g[b][a] = 0; ord[b][a] = 0; captured++; } }
    }
    return (boardCache[key] = { grid: g, order: ord, captured });
  }

  /* Draw a board. o: {x, y, size, game, n (moves shown, may be fractional: the last stone fades in),
     marks: [{move|pt:[x,y], color, ring, label}], lines: {third, fourth, fifth} alpha, dimOthers} */
  function drawBoard(ctx, o) {
    const P = Deck.pal(); const N = 19; const cell = o.size / (N - 1); const x0 = o.x, y0 = o.y;
    const px = (i) => x0 + i * cell, py = (j) => y0 + j * cell;
    ctx.save();
    if (!o.bare) { const pad = cell * 0.9; ctx.fillStyle = P.bg2; ctx.globalAlpha = (o.panel == null ? 1 : o.panel); ctx.beginPath(); ctx.roundRect(x0 - pad, y0 - pad, o.size + 2 * pad, o.size + 2 * pad, 10); ctx.fill(); ctx.globalAlpha = 1; }
    ctx.lineWidth = 1.4; ctx.strokeStyle = rgba(P.dim, P.light ? 0.75 : 0.5);
    ctx.beginPath();
    for (let i = 0; i < N; i++) { ctx.moveTo(px(i), py(0)); ctx.lineTo(px(i), py(N - 1)); ctx.moveTo(px(0), py(i)); ctx.lineTo(px(N - 1), py(i)); }
    ctx.stroke();
    ctx.lineWidth = 2.4; ctx.strokeStyle = rgba(P.dim, 0.9); ctx.strokeRect(px(0), py(0), o.size, o.size);
    ctx.fillStyle = rgba(P.dim, 0.9);
    for (const i of [3, 9, 15]) for (const j of [3, 9, 15]) { ctx.beginPath(); ctx.arc(px(i), py(j), 4.2, 0, 7); ctx.fill(); }
    /* optional highlighted lines (counted from each edge) */
    if (o.lines) for (const [k, a, col] of o.lines) { if (a <= 0) continue; const i = k - 1, j = N - k;
      ctx.strokeStyle = rgba(col || P.blue, a); ctx.lineWidth = 3.2; ctx.strokeRect(px(i), py(i), (j - i) * cell, (j - i) * cell); }
    if (o.game) {
      const nFull = Math.floor(o.n + 1e-9), frac = o.n - nFull;
      const b = boardAt(o.game, nFull); const moves = DATA_GO[o.game].moves; const r = cell * 0.47;
      const stone = (x, y, c, a, scale) => {
        ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(px(x), py(y), r * (scale || 1), 0, 7);
        if (c === 'B') { ctx.fillStyle = P.stoneB; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = P.stoneBEdge; ctx.stroke(); }
        else { ctx.fillStyle = P.stoneW; ctx.fill(); if (P.light) { ctx.lineWidth = 2; ctx.strokeStyle = P.ink; ctx.stroke(); } }
        ctx.globalAlpha = 1;
      };
      const dim = o.dim == null ? 1 : o.dim;
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (b.grid[y][x]) stone(x, y, b.grid[y][x], dim);
      if (frac > 0 && nFull < moves.length) { const [c, x, y] = moves[nFull]; stone(x, y, c, U.out(frac), lerp(1.5, 1, U.out(frac))); }
    }
    if (o.marks) for (const m of o.marks) {
      const a = m.alpha == null ? 1 : m.alpha; if (a <= 0) continue;
      const [x, y] = m.pt || DATA_GO[o.game].moves[m.move - 1].slice(1);
      const r = cell * 0.47;
      ctx.globalAlpha = a;
      if (m.ring) { ctx.lineWidth = m.width || 5; ctx.strokeStyle = m.color; ctx.beginPath(); ctx.arc(px(x), py(y), r * (m.ring === true ? 1.38 : m.ring), 0, 7); ctx.stroke(); }
      if (m.dot) { ctx.fillStyle = m.color; ctx.beginPath(); ctx.arc(px(x), py(y), r * 0.3, 0, 7); ctx.fill(); }
      if (m.label) { U.text(ctx, m.label, px(x) + (m.dx == null ? r * 1.9 : m.dx), py(y) + (m.dy == null ? 10 : m.dy), { size: m.size || 30, w: 500, color: m.color, align: m.align || 'left' }); }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    return { px, py, cell };
  }

  /* ------------------------------------------------------- molecules */
  const rotY = (p, a) => { const c = Math.cos(a), s = Math.sin(a); return [c * p[0] + s * p[2], p[1], -s * p[0] + c * p[2]]; };
  const rotX = (p, a) => { const c = Math.cos(a), s = Math.sin(a); return [p[0], c * p[1] - s * p[2], s * p[1] + c * p[2]]; };

  /* Catmull-Rom through CA atoms, k samples per residue */
  function spline(pts, k = 6) {
    const out = []; const n = pts.length;
    for (let i = 0; i < n - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
      for (let j = 0; j < k; j++) { const t = j / k, t2 = t * t, t3 = t2 * t;
        out.push([0, 1, 2].map((d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3))); }
    }
    out.push(pts[n - 1].slice()); return out;
  }

  /* Draw smooth backbone tubes for several chains with depth cueing.
     chains: [{pts (already splined), color, width, alpha, upto (0..1 fraction drawn)}]
     view: {cx, cy, scale (px per angstrom), ry, rx} */
  function drawTubes(ctx, chains, view) {
    const P = Deck.pal(); const segs = [];
    for (const ch of chains) {
      if (!ch.pts || (ch.alpha != null && ch.alpha <= 0)) continue;
      const n = Math.max(2, Math.floor(ch.pts.length * (ch.upto == null ? 1 : ch.upto)));
      let prev = null;
      for (let i = 0; i < n; i++) { let p = rotX(rotY(ch.pts[i], view.ry), view.rx || 0);
        if (prev && !(ch.breaks && ch.breaks.has(i))) segs.push([prev, p, ch]); prev = p; }
    }
    segs.sort((a, b) => (a[0][2] + a[1][2]) - (b[0][2] + b[1][2]));
    const depth = view.depth || 30;
    ctx.lineJoin = 'round';
    for (const [a, b, ch] of segs) {
      const z = (a[2] + b[2]) / 2; const f = clamp(0.5 + z / (2 * depth)); /* 0 far .. 1 near */
      const w = (ch.width || 9) * lerp(0.7, 1.2, f);
      const ax = view.cx + a[0] * view.scale, ay = view.cy - a[1] * view.scale, bx = view.cx + b[0] * view.scale, by = view.cy - b[1] * view.scale;
      ctx.globalAlpha = (ch.alpha == null ? 1 : ch.alpha);
      /* a rim in the background colour separates a near strand from the one behind it; butt caps keep it off its own neighbours */
      ctx.lineCap = 'butt'; ctx.strokeStyle = P.bg; ctx.lineWidth = w + 6; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      ctx.lineCap = 'round'; ctx.strokeStyle = U.mix(P.bg, ch.color, lerp(0.38, 1, f)); ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  /* One flat-shaded sphere per residue: a coarse surface in the manner of molecular illustration.
     groups: [{pts, color, alpha, r (angstrom)}] */
  function drawBlobs(ctx, groups, view) {
    const P = Deck.pal(); const all = [];
    for (const g of groups) { if (!g.pts || (g.alpha != null && g.alpha <= 0.002)) continue;
      for (let i = 0; i < g.pts.length; i++) { const q = g.pts[i]; let p = rotX(rotY(q, view.ry), view.rx || 0); all.push([p, g, i]); } }
    all.sort((a, b) => a[0][2] - b[0][2]);
    const depth = view.depth || 45;
    for (const [p, g, i] of all) {
      const f = clamp(0.5 + p[2] / (2 * depth)); const R = (g.r || 3.4) * view.scale;
      const x = view.cx + p[0] * view.scale, y = view.cy - p[1] * view.scale;
      ctx.globalAlpha = g.alpha == null ? 1 : g.alpha;
      ctx.beginPath(); ctx.arc(x, y, R, 0, 7);
      ctx.fillStyle = U.mix(P.bg, typeof g.color === 'function' ? g.color(i) : g.color, lerp(0.34, 0.95, f)); ctx.fill();
      ctx.lineWidth = 1.2; ctx.strokeStyle = rgba(P.bg, 0.55); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  window.Lib = { boardAt, drawBoard, spline, drawTubes, drawBlobs, rotX, rotY };
})();
