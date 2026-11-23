/* SPACE for the Dawson Astronomical Society: the certificate, meeting credits, what's coming up. */
(function () {
  const { io, seg, rgba } = U;
  const C = window.CONFIG;

  /* A marked placeholder for something Joel has to confirm. It shows on the projected slide on purpose. */
  const todo = (q) => `<div class="todo"><div class="label">To confirm · Joel</div><p class="cap">${q}</p></div>`;

  /* ------------------------------------------------------------- title */
  Deck.add({
    id: 'title', act: 'SPACE', title: 'Title', steps: 1,
    html: `
      <img class="abs" src="media/space-logo.png" alt="SPACE" style="left:150px; top:110px; height:87px">
      <div class="abs" style="left:150px; top:330px; right:150px">
        <div class="label" style="margin-bottom:44px">${C.audience}</div>
        <h1 class="q" style="font-size:124px; max-width:1400px">${C.title}</h1>
      </div>
      <div class="abs cap dim" style="left:150px; bottom:120px; line-height:1.5">${C.speaker}${C.date ? ' · ' + C.date : ''}<br>This year’s theme: ${C.theme}</div>`,
  });

  /* A simple drawing of a Voyager spacecraft, centred on the bus. s = pixels per unit. */
  function drawVoyager(ctx, cx, cy, s, P, labels) {
    const X = (x) => cx + x * s, Y = (y) => cy + y * s, line = (x0, y0, x1, y1, w, col) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(X(x0), Y(y0)); ctx.lineTo(X(x1), Y(y1)); ctx.stroke(); };
    const metal = U.mix(P.bg, P.ink, 0.62), dark = U.mix(P.bg, P.ink, 0.33), light = U.mix(P.bg, P.ink, 0.88), thin = U.mix(P.bg, P.dim, 0.7), gold = '#d8b257';
    ctx.save(); ctx.lineCap = 'round';
    /* long, thin booms first: magnetometer boom and the two radio antennas */
    line(14, 14, 175, 120, 1.5, thin); ctx.fillStyle = thin; ctx.beginPath(); ctx.arc(X(175), Y(120), 3, 0, 7); ctx.fill();
    line(-10, 16, -105, 105, 1.2, thin); line(-10, 16, -25, 125, 1.2, thin);
    /* power boom with three generators */
    line(-36, 4, -150, 36, 3, metal);
    for (const f of [0.6, 0.75, 0.9]) { const x = -36 - 114 * f, y = 4 + 32 * f; ctx.save(); ctx.translate(X(x), Y(y)); ctx.rotate(Math.atan2(32, -114));
      ctx.fillStyle = metal; ctx.fillRect(-7 * s, -7 * s, 12 * s, 14 * s); ctx.strokeStyle = P.bg; ctx.lineWidth = 1.2; ctx.strokeRect(-7 * s, -7 * s, 12 * s, 14 * s); ctx.restore(); }
    /* science boom, scan platform, cameras */
    line(36, 4, 140, 22, 3, metal);
    ctx.fillStyle = metal; ctx.fillRect(X(138), Y(8), 34 * s, 24 * s);
    ctx.fillStyle = dark; ctx.fillRect(X(143), Y(32), 8 * s, 18 * s); ctx.fillRect(X(156), Y(32), 6 * s, 12 * s);
    /* the ten-sided bus, with the Golden Record on its side */
    ctx.fillStyle = dark; ctx.fillRect(X(-38), Y(-6), 76 * s, 24 * s);
    ctx.strokeStyle = U.mix(P.bg, P.ink, 0.5); ctx.lineWidth = 1; for (const k of [-23, -8, 8, 23]) { ctx.beginPath(); ctx.moveTo(X(k), Y(-6)); ctx.lineTo(X(k), Y(18)); ctx.stroke(); }
    ctx.fillStyle = gold; ctx.beginPath(); ctx.arc(X(16), Y(6), 7 * s, 0, 7); ctx.fill();
    ctx.fillStyle = '#7a5c18'; ctx.beginPath(); ctx.arc(X(16), Y(6), 1.4 * s, 0, 7); ctx.fill();
    /* the 3.7 m dish on top: bowl, rim, inner surface, feed */
    ctx.fillStyle = metal; ctx.beginPath(); ctx.ellipse(X(0), Y(-42), 92 * s, 40 * s, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = light; ctx.beginPath(); ctx.ellipse(X(0), Y(-42), 92 * s, 22 * s, 0, 0, 7); ctx.fill();
    ctx.fillStyle = U.mix(P.bg, P.ink, 0.66); ctx.beginPath(); ctx.ellipse(X(0), Y(-41), 80 * s, 17 * s, 0, 0, 7); ctx.fill();
    line(-55, -44, 0, -92, 1.3, light); line(55, -44, 0, -92, 1.3, light); line(0, -30, 0, -92, 1.3, light);
    ctx.fillStyle = light; ctx.beginPath(); ctx.arc(X(0), Y(-94), 5 * s, 0, 7); ctx.fill();
    if (labels) {
      /* [text, text x, baseline y, align, anchor x, anchor y, colour] in drawing units; the leader stops at the text */
      for (const [txt, tx, ty, al, ax, ay, col] of [['3.7 m dish', -112, -92, 'right', -74, -50], ['cameras', 188, -18, 'left', 160, 8], ['plutonium power', -150, 82, 'center', -128, 34], ['Golden Record', 42, 96, 'center', 16, 13, gold]]) {
        const ex = al === 'right' ? X(tx) + 8 : al === 'left' ? X(tx) - 8 : X(tx), ey = al === 'center' ? Y(ty) - 26 : Y(ty) - 8;
        ctx.strokeStyle = U.mix(P.bg, P.dim, 0.65); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X(ax), Y(ay)); ctx.lineTo(ex, ey); ctx.stroke();
        U.text(ctx, txt, X(tx), Y(ty), { size: 23, color: col || P.dim, align: al });
      }
    }
    ctx.restore();
  }

  /* ------------------------------------------------- Voyager's mission */
  Deck.add({
    id: 'mission', act: 'Voyager 1', title: 'Voyager 1 and 2', steps: 2, dur: [900, 9000],
    html: `
      <div class="abs" style="left:150px; top:150px; width:700px">
        <p class="q m" style="margin:0">Voyager 1 and 2</p>
        <p class="cap" style="margin-top:24px">Launched 20 August and 5 September 1977</p>
        <p class="cap dim" style="margin-top:6px">Built to last five years</p>
      </div>
      <div class="credit">Seen from above the planets, distances compressed, paths simplified; planets where they were at the flybys. Dates: NASA.</div>`,
    setup(el) {
      const ctx = U.canvas(el);
      /* the map: Sun-centred, radius proportional to the square root of distance, rotated 180° so the paths leave at the top */
      const MX = 1330, MY = 560, K = 78.4, ROT = 180;
      const pt = (lon, rpx) => { const a = (lon + ROT) * Math.PI / 180; return [MX + rpx * Math.cos(a), MY - rpx * Math.sin(a)]; };
      /* heliocentric longitudes from JPL's approximate orbital elements; one position per planet for both spacecraft */
      const PL = [['Jupiter', 5.2, 132.5, '1979', 10], ['Saturn', 9.54, 187, '1980, 1981', 9], ['Uranus', 19.2, 258.9, '1986', 7], ['Neptune', 30.1, 281.4, '1989', 7]];
      /* waypoints: [year, longitude (unwrapped, increasing), distance in AU] */
      const V1 = [[1977.68, 342.6, 1], [1979.17, 492.5, 5.2], [1980.87, 547, 9.54], [1990.0, 616, 36]];
      const V2 = [[1977.64, 327.2, 1], [1979.52, 492.5, 5.2], [1981.65, 547, 9.54], [1986.07, 618.9, 19.2], [1989.65, 641.4, 30.1], [1991.5, 650, 36]];
      const at = (W, y) => { if (y <= W[0][0]) return pt(W[0][1], K * Math.sqrt(W[0][2]));
        for (let i = 0; i < W.length - 1; i++) { const [t0, l0, a0] = W[i], [t1, l1, a1] = W[i + 1]; if (y <= t1) { const f = (y - t0) / (t1 - t0); return pt(U.lerp(l0, l1, f), K * U.lerp(Math.sqrt(a0), Math.sqrt(a1), f)); } }
        const L = W[W.length - 1]; return pt(L[1], K * Math.sqrt(L[2])); };
      const reached = (name) => ({ Jupiter: 1979.17, Saturn: 1980.87, Uranus: 1986.07, Neptune: 1989.65 })[name];
      function path(W, y, col, w) {
        if (y <= W[0][0]) return; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.beginPath();
        for (let t = W[0][0]; t <= Math.min(y, W[W.length - 1][0]) + 1e-9; t += 0.02) { const [x, yy] = at(W, t); t === W[0][0] ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); }
        const [ex, ey] = at(W, Math.min(y, W[W.length - 1][0])); ctx.lineTo(ex, ey); ctx.stroke();
      }
      function craft(W, y, col) { const [x, yy] = at(W, Math.min(y, W[W.length - 1][0])); const g = ctx.createRadialGradient(x, yy, 0, x, yy, 20); g.addColorStop(0, rgba(col, 1)); g.addColorStop(1, rgba(col, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, yy, 20, 0, 7); ctx.fill(); }
      return {
        render(step, p) {
          U.clear(ctx); const P = Deck.pal();
          drawVoyager(ctx, 430, 700, 1.6, P, true);
          /* orbits, Sun, planets */
          ctx.setLineDash([2, 8]); ctx.lineWidth = 1.6; ctx.strokeStyle = rgba(P.dim, 0.7);
          for (const a of [1, 5.2, 9.54, 19.2, 30.1]) { ctx.beginPath(); ctx.arc(MX, MY, K * Math.sqrt(a), 0, 7); ctx.stroke(); }
          ctx.setLineDash([]);
          const sg = ctx.createRadialGradient(MX, MY, 0, MX, MY, 30); sg.addColorStop(0, P.amber); sg.addColorStop(0.45, P.amber); sg.addColorStop(1, rgba(P.amber, 0)); ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(MX, MY, 30, 0, 7); ctx.fill();
          const y = step === 0 ? 1977.0 : step === 1 ? U.lerp(1977.6, 1991.5, p) : 1991.5;
          const [ex, ey] = pt(335, K); ctx.fillStyle = P.blue; ctx.beginPath(); ctx.arc(ex, ey, 6, 0, 7); ctx.fill();
          U.text(ctx, step >= 1 ? 'Earth · 1977' : 'Earth', ex, ey - 18, { size: 22, color: P.dim, align: 'center' });
          for (const [name, a, lon, yrs, r] of PL) {
            const [x, yy] = pt(lon, K * Math.sqrt(a)); ctx.fillStyle = U.mix(P.bg, P.ink, 0.8); ctx.beginPath(); ctx.arc(x, yy, r, 0, 7); ctx.fill();
            if (name === 'Saturn') { ctx.strokeStyle = U.mix(P.bg, P.ink, 0.8); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(x, yy, r * 2, r * 0.6, -0.35, 0, 7); ctx.stroke(); }
            const shown = step >= 1 && y >= reached(name);
            const [dx, dy, al] = { Jupiter: [22, 8, 'left'], Saturn: [24, 8, 'left'], Uranus: [-16, 40, 'right'], Neptune: [-22, 8, 'right'] }[name];
            U.text(ctx, name + (shown ? ' · ' + yrs : ''), x + dx, yy + dy, { size: 24, color: P.ink, align: al });
          }
          if (step < 1) return;
          path(V2, y, rgba(P.blue, 0.9), 3); path(V1, y, rgba(P.ink, 0.9), 3);
          if (y < 1991.5) { craft(V2, y, P.blue); craft(V1, y, P.ink); }
          if (y >= 1990.0) { const [x, yy] = at(V1, 1990.0); U.text(ctx, 'Voyager 1', x + 14, yy - 6, { size: 26, w: 500, color: P.ink, alpha: U.seg(y, 1990.0, 1990.6) }); }
          if (y >= 1991.5 - 1e-6) { const [x, yy] = at(V2, 1991.5); U.text(ctx, 'Voyager 2', x - 14, yy - 6, { size: 26, w: 500, color: P.blue, align: 'right' }); }
        },
      };
    },
  });

  /* ----------------------------------------------------------- Voyager 1 */
  Deck.add({
    id: 'voyager', act: 'Voyager 1', title: 'Voyager 1, one light-day', steps: 2, dur: [1400, 8000],
    html: `
      <div class="abs" style="left:150px; top:200px; width:1000px">
        <p class="num" style="font-size:84px; margin:0">18 November 2026</p>
        <p class="cap" style="margin-top:30px">Voyager 1 reaches one light-day from Earth: 25.9 billion km.</p>
        <p class="cap dim" style="margin:30px 0 0">Outside the Sun’s bubble of solar wind since 2012: interstellar space</p>
        <p class="cap dim" style="margin:6px 0 0">Still inside the solar system: about 300 years to the Oort cloud</p>
        <p class="cap dim" style="margin:6px 0 0">About 30,000 years to pass beyond it</p>
      </div>
      <div class="credit">Light travel time from Earth, to scale along one line (directions not shown). One light-day: 25,902,068,356 km (NASA, 19 November 2026).</div>`,
    setup(el) {
      /* hours of light travel from Earth along one axis; Voyager 1 at 24 h, Neptune at about 4.2 h (30 AU) */
      const ctx = U.canvas(el); const X0 = 230, X1 = 1690, Y = 730, NEPTUNE = 4.17;
      const x = (h) => X0 + (X1 - X0) * h / 24;
      function pulse(h, col, dir) {
        const px = x(h), tail = Math.max(X0, Math.min(X1, px - dir * 160));
        const g = ctx.createLinearGradient(tail, 0, px, 0); g.addColorStop(0, rgba(col, 0)); g.addColorStop(1, rgba(col, 0.9));
        ctx.strokeStyle = g; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(tail, Y); ctx.lineTo(px, Y); ctx.stroke();
        const r = ctx.createRadialGradient(px, Y, 0, px, Y, 26); r.addColorStop(0, rgba(col, 0.95)); r.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = r; ctx.beginPath(); ctx.arc(px, Y, 26, 0, 7); ctx.fill();
      }
      return {
        render(step, p) {
          U.clear(ctx); const P = Deck.pal();
          const ax = step === 0 ? io(p) : 1;
          ctx.strokeStyle = P.dim; ctx.lineWidth = 2.5; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(X0, Y); ctx.lineTo(U.lerp(X0, X1, ax), Y); ctx.stroke();
          [6, 12, 18, 24].forEach((h) => { const a = seg(ax, h / 24 - 0.12, h / 24); if (a <= 0) return;
            ctx.globalAlpha = a; ctx.strokeStyle = P.dim; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x(h), Y - 10); ctx.lineTo(x(h), Y + 10); ctx.stroke(); ctx.globalAlpha = 1;
            U.text(ctx, h + ' h', x(h), Y + 50, { size: 24, color: P.faint, align: 'center', alpha: a }); });
          ctx.fillStyle = P.blue; ctx.beginPath(); ctx.arc(X0, Y, 11, 0, 7); ctx.fill();
          U.text(ctx, 'Earth', X0, Y + 50, { size: 26, color: P.dim, align: 'center' });
          const an = seg(ax, 0.15, 0.35);
          if (an > 0) { ctx.globalAlpha = an; ctx.strokeStyle = P.dim; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x(NEPTUNE), Y - 10); ctx.lineTo(x(NEPTUNE), Y + 10); ctx.stroke(); ctx.globalAlpha = 1;
            U.text(ctx, 'Neptune', x(NEPTUNE), Y - 26, { size: 24, color: P.dim, align: 'center', alpha: an }); }
          const av = seg(ax, 0.85, 1);
          if (av > 0) { ctx.globalAlpha = av; ctx.fillStyle = P.ink; ctx.beginPath(); ctx.arc(X1, Y, 8, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
            U.text(ctx, 'Voyager 1', X1, Y - 28, { size: 30, w: 500, color: P.ink, align: 'center', alpha: av }); }
          if (step < 1) return;
          /* state 1: a signal goes out at the speed of light and a reply comes back; the clock counts the hours */
          const q = step === 1 ? p : 1, out = seg(q, 0.03, 0.47), back = seg(q, 0.53, 0.97);
          const hrs = q < 0.5 ? 24 * out : 24 + 24 * back;
          if (q < 0.5) pulse(24 * out, P.ink, 1); else if (back < 1) pulse(24 - 24 * back, P.blue, -1);
          U.text(ctx, Math.floor(hrs + 1e-6) + ' h', X1 + 80, 470, { serif: true, w: 300, size: 150, align: 'right', alpha: seg(q, 0, 0.04) });
        },
      };
    },
  });

  /* --------------------------------------------------- the Golden Record */
  Deck.add({
    id: 'record', act: 'Voyager 1', title: 'The Golden Record', steps: 2, dur: [900, 900],
    html: `
      <div class="abs" style="left:1040px; top:200px; width:730px">
        <p class="q m" style="margin:0">The Golden Record</p>
        <p class="cap" style="margin:30px 0 0">Gold-plated copper, 30 cm across</p>
        <p class="cap" style="margin:26px 0 0">115 images</p>
        <p class="cap" style="margin:8px 0 0">Greetings in 55 languages</p>
        <p class="cap" style="margin:8px 0 0">90 minutes of music</p>
        <p class="cap" style="margin:8px 0 0">Surf, wind, thunder, birds, whales</p>
        <p class="cap dim" style="margin:26px 0 0">Chosen by a committee chaired by Carl Sagan</p>
        <p class="q s rise" data-at="1" style="margin-top:70px">Why send a record that may never be played?</p>
      </div>
      <div class="credit">A drawing of the record. Contents: NASA, Voyager Golden Record pages.</div>`,
    setup(el) {
      const ctx = U.canvas(el); const CX = 560, CY = 545, R = 335;
      return {
        render() {
          U.clear(ctx); const P = Deck.pal();
          /* the disc: a conic sheen in gold, then the grooves */
          let g; try { g = ctx.createConicGradient(-0.4, CX, CY); ['#9c7a2a', '#e9cd7f', '#b8923b', '#f4e1a1', '#a3802e', '#e2c171', '#9c7a2a'].forEach((c, k, a) => g.addColorStop(k / (a.length - 1), c)); } catch (e) { g = '#cfa94e'; }
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(CX, CY, R, 0, 7); ctx.fill();
          ctx.lineWidth = 1; for (let r = 112; r < R - 6; r += 3.2) { ctx.strokeStyle = `rgba(70,45,5,${r % 6.4 < 3.2 ? 0.16 : 0.09})`; ctx.beginPath(); ctx.arc(CX, CY, r, 0, 7); ctx.stroke(); }
          ctx.strokeStyle = 'rgba(70,45,5,0.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(CX, CY, R - 1.5, 0, 7); ctx.stroke();
          /* the label */
          const lg = ctx.createRadialGradient(CX - 30, CY - 30, 10, CX, CY, 104); lg.addColorStop(0, '#f1dc98'); lg.addColorStop(1, '#c9a24c'); ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(CX, CY, 104, 0, 7); ctx.fill();
          ctx.strokeStyle = 'rgba(70,45,5,0.4)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(CX, CY, 104, 0, 7); ctx.stroke();
          U.text(ctx, 'THE SOUNDS', CX, CY - 26, { serif: true, size: 22, w: 500, color: '#4a3410', align: 'center', ls: '2px' });
          U.text(ctx, 'OF EARTH', CX, CY + 44, { serif: true, size: 22, w: 500, color: '#4a3410', align: 'center', ls: '2px' });
          ctx.fillStyle = P.bg; ctx.beginPath(); ctx.arc(CX, CY, 7, 0, 7); ctx.fill();
        },
      };
    },
  });

  /* ------------------------------------------------------- certificate */
  Deck.add({
    id: 'certificate', act: 'SPACE', title: 'The certificate', steps: 1,
    html: `
      <div class="kicker label">The certificate</div>
      <div class="abs" style="left:150px; right:150px; top:330px; display:grid; grid-template-columns:repeat(3, 1fr); gap:90px">
        <div class="req">
          <p class="q s">Foundational knowledge</p>
          <p class="cap dim">An approved course, or a small project of your own with a short reflection</p>
        </div>
        <div class="req">
          <p class="q s">15 activity credits</p>
          <p class="cap dim">12 if you take one cross-listed course, 9 if you take two</p>
        </div>
        <div class="req">
          <p class="q s">A capstone</p>
          <p class="cap dim">Your program’s integrating activity, or an independent project, presented or published through SPACE</p>
        </div>
      </div>
      <div class="credit">space.dawsoncollege.qc.ca/certificate</div>`,
  });

  /* ------------------------------------------------------ meeting credits */
  Deck.add({
    id: 'credits', act: 'SPACE', title: 'Meeting credits', steps: 1,
    html: `
      <div class="kicker label">Astronomical Society meetings and events</div>
      <div class="abs" style="left:150px; top:200px; width:1060px">
        ${C.meetingCredits.rule.length ? C.meetingCredits.rule.map((r) => `<p class="q m" style="margin:0 0 6px">${r}</p>`).join('') : todo('How many meetings make a credit?')}
        <p class="cap dim" style="margin-top:28px">${C.meetingCredits.max}</p>
        <ol class="steps" style="margin-top:44px">
          <li><span class="cap">Enroll in the certificate on MyDawson, under Certificates of Study</span></li>
          <li><span class="cap">Report your meetings and events on the SPACE Activities Form</span></li>
        </ol>
      </div>
      <div class="abs qr" style="left:1330px; top:250px; width:440px">
        <img src="${C.claimForm}" alt="QR code: SPACE Activities Form">
        <p class="cap dim">SPACE Activities Form:<br>Certificate Credit</p>
        <p class="faint" style="font-size:21px; text-align:center; margin-top:10px">${C.claimFormLink}</p>
      </div>`,
  });

  /* ------------------------------------------------------------ Apophis */
  Deck.add({
    id: 'apophis', act: 'Coming up', title: 'Apophis, 13 April 2029', steps: 2, dur: [5200, 900],
    html: `
      <div class="abs" style="left:150px; top:230px; width:780px">
        <p class="num" style="font-size:84px; margin:0">13 April 2029</p>
        <p class="cap" style="margin-top:30px">The asteroid Apophis, about 340 m across, passes inside the ring of geostationary satellites.</p>
        <p class="q s rise" data-at="1" style="margin-top:70px">What would a CubeSat camera see during the flyby?</p>
      </div>
      <div class="credit">Earth, the geostationary ring (35,786 km up), Apophis at closest approach (about 31,600 km up; NASA/JPL).</div>`,
    setup(el) {
      /* the drawing from the AI for Science deck (scene "space", state 2) */
      const ctx = U.canvas(el); const CX = 1400, CY = 560, S = 370 / 42164;      /* pixels per km */
      return {
        render(step, p) {
          U.clear(ctx); const P = Deck.pal();
          const RE = 6371 * S, RG = 42164 * S, RA = (6371 + 31600) * S;
          ctx.strokeStyle = rgba(P.dim, 0.8); ctx.lineWidth = 2; ctx.setLineDash([3, 9]); ctx.beginPath(); ctx.arc(CX, CY, RG, 0, 7); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = P.blue; ctx.beginPath(); ctx.arc(CX, CY, RE, 0, 7); ctx.fill();
          U.text(ctx, 'geostationary satellites', CX, CY - RG - 22, { size: 24, color: P.dim, align: 'center' });
          /* flyby: a shallow hyperbola-like path whose closest point is at the true distance */
          const f = step === 0 ? io(p) : 1; ctx.strokeStyle = P.amber; ctx.lineWidth = 3.5; ctx.beginPath(); let last = null;
          for (let i = 0; i <= 200 * f; i++) { const u = -1.9 + 3.8 * i / 200; const xx = CX - RA + RA * 0.5 * (Math.cosh(u) - 1), y = CY + RA * 0.95 * u; i ? ctx.lineTo(xx, y) : ctx.moveTo(xx, y); last = [xx, y]; }
          ctx.stroke(); if (last) { ctx.fillStyle = P.amber; ctx.beginPath(); ctx.arc(last[0], last[1], 8, 0, 7); ctx.fill(); }
          if (f > 0.5) U.text(ctx, 'Apophis', CX - RA + 18, CY + 9, { size: 26, color: P.amber, align: 'left', alpha: seg(f, 0.5, 0.7) });      /* inside the path, clear of the question */
          U.text(ctx, 'Earth', CX, CY + RE + 34, { size: 24, color: P.dim, align: 'center' });
        },
      };
    },
  });

  /* ----------------------------------------------------------- get involved */
  Deck.add({
    id: 'involved', act: 'Coming up', title: 'Projects and internships', steps: 1,
    html: `
      <div class="abs" style="left:150px; top:170px; width:800px">
        <p class="label" style="margin:0 0 22px">Projects</p>
        <p class="q s">Apophis 2029</p><p class="cap dim" style="margin:6px 0 0">A student CubeSat initiative: mission concept, simulations, a prototype on the ground</p>
        <p class="q s" style="margin-top:36px">Astro Pi</p><p class="cap dim" style="margin:6px 0 0">An experiment of yours, run on a computer aboard the International Space Station</p>
        <p class="q s" style="margin-top:36px">MakerSPACE and robotics</p><p class="cap dim" style="margin:6px 0 0">Build a system, predict its behaviour, find out what you missed</p>
        <p class="q s" style="margin-top:36px">Your idea</p><p class="cap dim" style="margin:6px 0 0">A project you propose</p>
      </div>
      <div class="abs" style="left:1100px; top:170px; width:670px">
        <p class="label" style="margin:0 0 26px">Internships</p>
        ${C.routes.map((r) => `<p class="serif" style="font-size:44px; margin:18px 0 0; line-height:1.2">${r.name} <span class="dim" style="font-family:var(--sans); font-size:28px">&nbsp;${r.tag}</span></p>`).join('')}
      </div>`,
  });

  /* ---------------------------------------------------------------- drop in */
  Deck.add({
    id: 'dropin', act: 'Coming up', title: 'Drop in', steps: 1,
    html: `
      <img class="abs" src="media/space-logo.png" alt="SPACE" style="right:150px; top:68px; height:70px">
      <div class="abs" style="left:150px; top:250px; width:1000px">
        <p class="label">Drop in</p>
        <p class="num" style="font-size:200px; line-height:1; margin:24px 0 0">${C.dropin.room}</p>
        <p class="q s" style="margin-top:28px">${C.dropin.day}, ${C.dropin.time}</p>
        <p class="cap dim" style="margin-top:90px">MIO: Joel Trudeau</p>
      </div>
      <div class="abs qr" style="left:1330px; top:250px; width:440px">
        <img src="${C.discord}" alt="QR code: SPACE Discord">
        <p class="cap dim">SPACE Discord</p>
      </div>`,
  });
})();
