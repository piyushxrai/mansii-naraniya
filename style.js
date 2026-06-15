// ─────────────────────────────────────────────────────────
//  HEAT WAVES — Glass Animals
//  ⚠️  Paste the 11-char YouTube video ID from the URL here:
//  e.g. youtube.com/watch?v=XXXXXXXXXXX  →  "XXXXXXXXXXX"
//  Find it by searching "Heat Waves Glass Animals" on YouTube.
// ─────────────────────────────────────────────────────────
const MUSIC_VIDEO_ID = "mRD0-GxqHVo";

// ─── SCREEN MANAGEMENT ───────────────────────────────────
let currentScreen = "welcome";
const inited = new Set(["welcome"]);

function goTo(name) {
  document.getElementById("screen-" + currentScreen).classList.remove("active");
  currentScreen = name;
  const el = document.getElementById("screen-" + name);
  el.classList.add("active");
  if (!inited.has(name)) { inited.add(name); INITS[name](); }
}

const INITS = { cake: initCake, fireworks: initFireworks, garden: initGarden, final: initFinal };

// ─── HELPERS ─────────────────────────────────────────────
function r(a, b)    { return a + Math.random() * (b - a); }
function pick(arr)  { return arr[Math.floor(Math.random() * arr.length)]; }

function show(el, delay = 0) {
  setTimeout(() => { el.classList.remove("anim-hidden"); el.classList.add("anim-show"); }, delay);
}

function typewriter(el, text, speed, onDone) {
  let i = 0;
  el.innerHTML = "";
  const cursor = document.createElement("span");
  cursor.style.cssText = "animation:blinkCursor .8s step-end infinite;display:inline-block;margin-left:2px";
  cursor.textContent = "|";
  el.appendChild(cursor);
  (function tick() {
    if (i < text.length) {
      el.insertBefore(document.createTextNode(text[i++]), cursor);
      setTimeout(tick, speed);
    } else {
      cursor.remove();
      if (onDone) onDone();
    }
  })();
}

function makeStars(container, n) {
  for (let i = 0; i < n; i++) {
    const d = document.createElement("div");
    d.className = "star";
    const s = r(1, 3.5);
    d.style.cssText = `width:${s}px;height:${s}px;top:${r(0,90)}%;left:${r(0,100)}%;--dur:${r(2,5).toFixed(2)}s;--del:${r(0,4).toFixed(2)}s`;
    container.appendChild(d);
  }
}

function makePetals(container, n, colors, cls, opts = {}) {
  const palette = colors || ["#ff8fa3","#e91e8c","#ce93d8","#f48fb1","#c77dff","#ff69b4"];
  for (let i = 0; i < n; i++) {
    const p = document.createElement("div");
    p.className = "petal " + cls;
    const color = pick(palette);
    const sz = opts.sz ? r(opts.sz[0], opts.sz[1]) : r(5, 11);
    const pos = opts.bottom ? `bottom:-20px` : `top:-20px`;
    p.style.cssText = `
      ${pos};left:${r(0,100)}%;
      width:${sz}px;height:${sz*1.4}px;
      background:radial-gradient(ellipse,${color},${color}88);
      box-shadow:0 0 8px ${color}55;
      --dur:${r(opts.dmin||5, opts.dmax||11).toFixed(2)}s;
      --del:${r(0, opts.dlmax||7).toFixed(2)}s;
      --drift:${(Math.random()-.5)*140}px;
      --spin:${Math.random()>.5?'':'-'}${r(200,500).toFixed(0)}deg;
      --hdrift:${(Math.random()-.5)*180}px;
      --gspin:${Math.random()>.5?'':'-'}${r(180,450).toFixed(0)}deg;
    `;
    container.appendChild(p);
  }
}

// ─── WELCOME ─────────────────────────────────────────────
(function initWelcome() {
  makeStars(document.getElementById("welcome-stars"), 60);
  makePetals(document.getElementById("welcome-petals"), 28,
    ["#ff8fa3","#c77dff","#f48fb1","#ab47bc"], "petal-up", { bottom: true });
  show(document.getElementById("welcome-title"), 300);
  show(document.getElementById("welcome-sub"),   1200);
  show(document.getElementById("welcome-btn"),   2000);
})();

// ─── CAKE ────────────────────────────────────────────────
const CANDLE_XS = [148, 172, 200, 228, 252];
let candleBlown = [false,false,false,false,false];
let allBlownDone = false;

function initCake() {
  const NS = "http://www.w3.org/2000/svg";
  const flameG = document.getElementById("candle-flames");
  const smokeG = document.getElementById("candle-smoke");
  const rub = CANDLE_XS.map(() => ({ on:false, lx:0, ly:0, d:0 }));

  function blow(i) {
    if (candleBlown[i]) return;
    candleBlown[i] = true;
    const fg = document.getElementById("cflame-" + i);
    if (fg) fg.remove();

    const smk = document.createElementNS(NS, "g");
    smk.style.animation = "smokeUp 1.4s ease forwards";
    const se = document.createElementNS(NS, "ellipse");
    se.setAttribute("cx", CANDLE_XS[i]); se.setAttribute("cy", 100);
    se.setAttribute("rx", 4); se.setAttribute("ry", 6);
    se.setAttribute("fill", "rgba(200,200,200,0.6)");
    smk.appendChild(se); smokeG.appendChild(smk);

    const blown = candleBlown.filter(Boolean).length;
    document.getElementById("cake-status").textContent = blown + " / 5 candles blown";
    document.getElementById("cake-hint").textContent =
      blown === 5 ? "🎉 Make a wish!" : "Tap or rub the flames 🌬️";

    if (candleBlown.every(Boolean) && !allBlownDone) {
      allBlownDone = true;
      setTimeout(burstPetals, 400);
      setTimeout(() => show(document.getElementById("btn-cake-next")), 2400);
    }
  }

  CANDLE_XS.forEach((cx, i) => {
    const g = document.createElementNS(NS, "g");
    g.id = "cflame-" + i;
    g.setAttribute("class", "flame-g");
    g.setAttribute("filter", "url(#glow)");
    g.style.transformOrigin = cx + "px 103px";

    function svgPath(d, fill, opacity) {
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", d); p.setAttribute("fill", fill);
      if (opacity) p.setAttribute("opacity", opacity);
      return p;
    }
    function svgLine(x1,y1,x2,y2,stroke,sw) {
      const l = document.createElementNS(NS,"line");
      ["x1","y1","x2","y2"].forEach((a,k)=>l.setAttribute(a,[x1,y1,x2,y2][k]));
      l.setAttribute("stroke",stroke); l.setAttribute("stroke-width",sw);
      l.setAttribute("stroke-linecap","round"); return l;
    }
    const hit = document.createElementNS(NS,"ellipse");
    hit.setAttribute("cx",cx); hit.setAttribute("cy",87);
    hit.setAttribute("rx",16); hit.setAttribute("ry",18);
    hit.setAttribute("fill","transparent");

    g.appendChild(svgLine(cx,103,cx,100,"#555",1.5));
    g.appendChild(svgPath(`M${cx} 100 C${cx-9} 93 ${cx-11} 82 ${cx-5} 74 C${cx} 67 ${cx+5} 74 ${cx+11} 82 C${cx+11} 90 ${cx+9} 93 ${cx} 100`,"#ff9500","0.9"));
    g.appendChild(svgPath(`M${cx} 100 C${cx-6} 94 ${cx-7} 85 ${cx-2} 78 C${cx} 73 ${cx+2} 78 ${cx+7} 85 C${cx+7} 92 ${cx+6} 94 ${cx} 100`,"#ffe066"));
    g.appendChild(svgPath(`M${cx} 100 C${cx-3} 96 ${cx-3} 90 ${cx} 85 C${cx+3} 90 ${cx+3} 96 ${cx} 100`,"rgba(255,255,255,0.9)"));
    g.appendChild(hit);

    g.addEventListener("click", () => blow(i));
    g.addEventListener("pointerdown", e => {
      rub[i] = { on:true, lx:e.clientX, ly:e.clientY, d:0 };
      g.setPointerCapture(e.pointerId);
    });
    g.addEventListener("pointermove", e => {
      const s = rub[i];
      if (!s.on || candleBlown[i]) return;
      const dx = e.clientX - s.lx, dy = e.clientY - s.ly;
      s.d += Math.sqrt(dx*dx + dy*dy); s.lx = e.clientX; s.ly = e.clientY;
      if (s.d > 12) { s.on = false; blow(i); }
    });
    g.addEventListener("pointerup", () => { rub[i].on = false; });
    flameG.appendChild(g);
  });
}

function burstPetals() {
  const c = document.getElementById("cake-petals");
  const colors = ["#ff8fa3","#e91e8c","#ab47bc","#f48fb1","#ce93d8","#ff69b4"];
  for (let i = 0; i < 30; i++) {
    const p = document.createElement("div");
    p.className = "petal petal-burst";
    const color = pick(colors);
    p.style.cssText = `
      left:${r(10,90)}%;bottom:35%;
      width:14px;height:20px;
      background:${color};box-shadow:0 0 6px ${color}88;
      --dur:${r(1.5,3).toFixed(2)}s;
      --del:${r(0,.8).toFixed(2)}s;
      --drift:${(Math.random()-.5)*120}px;
      --spin:${Math.random()>.5?'':'-'}${r(200,500).toFixed(0)}deg;
    `;
    c.appendChild(p);
  }
}

// ─── FIREWORKS ───────────────────────────────────────────
const FW_COLORS = [
  "#ffd700","#ff6b9d","#ff8e53","#a78bfa","#34d399","#60a5fa",
  "#f472b6","#fb923c","#e879f9","#38bdf8","#fbbf24","#4ade80",
  "#ff4499","#ffec99","#c4b5fd","#ff8fa3",
];
const SCHEDULE = [
  {t:0,k:"burst"},{t:350,k:"willow"},{t:650,k:"heart"},
  {t:950,k:"burst"},{t:950,k:"star"},{t:1250,k:"willow"},
  {t:1250,k:"burst"},{t:1550,k:"heart"},{t:1550,k:"burst"},
  {t:1850,k:"burst"},{t:1850,k:"willow"},{t:2150,k:"heart"},
  {t:2150,k:"star"},{t:2450,k:"burst"},{t:2450,k:"burst"},
  {t:2750,k:"burst"},{t:2800,k:"willow"},{t:2850,k:"heart"},
  {t:2900,k:"burst"},{t:2950,k:"star"},{t:3000,k:"burst"},
  {t:3050,k:"heart"},{t:3100,k:"willow"},{t:3150,k:"burst"},
  {t:3200,k:"star"},{t:3250,k:"burst"},{t:3300,k:"heart"},
  {t:4200,k:"heart"},{t:4600,k:"willow"},{t:5000,k:"burst"},
  {t:5400,k:"heart"},{t:5800,k:"star"},{t:6200,k:"burst"},
];

function initFireworks() {
  const canvas = document.getElementById("fw-canvas");
  const ctx = canvas.getContext("2d");
  const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
  resize(); window.addEventListener("resize", resize);

  let rockets = [], particles = [];

  function launch(type) {
    const x = canvas.width * (.1 + Math.random() * .8);
    const ty = canvas.height * (.05 + Math.random() * .45);
    const dur = 1200 + Math.random() * 600;
    rockets.push({
      x, y: canvas.height, vx:(Math.random()-.5)*1.5,
      vy: -(canvas.height - ty) / (dur / 16),
      ty, color: pick(FW_COLORS), type, trail: [],
    });
  }

  function explode(r) {
    const {x:cx, y:cy, color:col} = r;
    if (r.type === "heart") {
      for (let t = 0; t <= Math.PI*2; t += .18) {
        const hx = 16 * Math.sin(t)**3;
        const hy = -(13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t));
        push(cx,cy, hx*.38+(Math.random()-.5)*.5, hy*.38+(Math.random()-.5)*.5,
          col, 2.5+Math.random(), .04, .011, "h");
      }
      for (let i=0;i<30;i++) {
        const a=Math.random()*Math.PI*2,s=Math.random()*2.5;
        push(cx,cy,Math.cos(a)*s,Math.sin(a)*s,"#ffd700",1.5,.04,.018,"n");
      }
    } else if (r.type === "willow") {
      for (let i=0;i<110;i++) {
        const a=Math.random()*Math.PI*2,s=Math.random()*5+1;
        push(cx,cy,Math.cos(a)*s*.75,Math.sin(a)*s-2.5,col,1.8+Math.random(),.1,.006,"w");
      }
    } else if (r.type === "star") {
      for (let p=0;p<5;p++) {
        const ba=(p/5)*Math.PI*2-Math.PI/2;
        for (let j=0;j<14;j++) {
          const sp=((j/14)-.5)*.5,sp2=Math.random()*3.5+3.5;
          push(cx,cy,Math.cos(ba+sp)*sp2,Math.sin(ba+sp)*sp2,"#fff",2,.05,.009,"n");
        }
        const ma=ba+Math.PI/5;
        for (let j=0;j<7;j++) {
          const sp=((j/7)-.5)*.4;
          push(cx,cy,Math.cos(ma+sp)*(Math.random()*2+2),Math.sin(ma+sp)*(Math.random()*2+2),col,1.5,.05,.013,"n");
        }
      }
    } else {
      for (let i=0;i<95;i++) {
        const a=(i/95)*Math.PI*2+(Math.random()-.5)*.3,s=Math.random()*5.5+2.5;
        push(cx,cy,Math.cos(a)*s,Math.sin(a)*s,col,Math.random()*2.5+1,.055,.013,"n");
      }
      for (let i=0;i<20;i++) {
        const a=Math.random()*Math.PI*2;
        push(cx,cy,Math.cos(a)*(Math.random()*2+1),Math.sin(a)*(Math.random()*2+1),"#fff",1.2,.04,.02,"n");
      }
    }
  }

  function push(x,y,vx,vy,color,radius,gravity,decay,type) {
    particles.push({x,y,vx,vy,color,radius,gravity,decay,type,alpha:1,tx:[],ty:[]});
  }

  (function animate() {
    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    rockets = rockets.filter(rk => {
      rk.trail.push({x:rk.x,y:rk.y});
      if (rk.trail.length>14) rk.trail.shift();
      rk.trail.forEach((pt,i)=>{
        ctx.globalAlpha=(i/rk.trail.length)*.6;
        ctx.fillStyle=rk.color; ctx.beginPath();
        ctx.arc(pt.x,pt.y,1.8,0,Math.PI*2); ctx.fill();
      });
      ctx.globalAlpha=1;
      rk.x+=rk.vx; rk.y+=rk.vy; rk.vy+=.08;
      ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(rk.x,rk.y,2.5,0,Math.PI*2); ctx.fill();
      if (rk.y<=rk.ty) { explode(rk); return false; }
      return true;
    });

    particles = particles.filter(p => {
      if (p.type==="w") {
        p.tx.push(p.x); p.ty.push(p.y);
        if (p.tx.length>12) { p.tx.shift(); p.ty.shift(); }
        if (p.tx.length>1) {
          ctx.beginPath(); ctx.moveTo(p.tx[0],p.ty[0]);
          for (let i=1;i<p.tx.length;i++) ctx.lineTo(p.tx[i],p.ty[i]);
          ctx.strokeStyle=p.color; ctx.globalAlpha=p.alpha*.35;
          ctx.lineWidth=1.5; ctx.stroke(); ctx.globalAlpha=1;
        }
      }
      p.x+=p.vx; p.y+=p.vy; p.vy+=p.gravity; p.vx*=.985; p.alpha-=p.decay;
      ctx.globalAlpha=Math.max(0,p.alpha); ctx.fillStyle=p.color;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.radius,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha=1;
      return p.alpha>.01;
    });

    requestAnimationFrame(animate);
  })();

  SCHEDULE.forEach(({t,k}) => setTimeout(()=>launch(k), t));

  setTimeout(() => {
    const txt = document.getElementById("fw-text");
    txt.classList.remove("anim-hidden");
    txt.style.opacity = "1";
    typewriter(txt, "HAPPY BIRTHDAY MANSI ❤️", 110, () => {
      setTimeout(() => show(document.getElementById("fw-btn")), 2600);
    });
  }, 3500);
}

// ─── GARDEN ──────────────────────────────────────────────
const TULIPS = [
  {color:"#e53935",lp:4, sc:.72,d:.1,sd:2.6,sdl:0.0},
  {color:"#e91e8c",lp:11,sc:.88,d:.3,sd:3.1,sdl:0.4},
  {color:"#9c27b0",lp:19,sc:.78,d:.5,sd:2.8,sdl:0.8},
  {color:"#f06292",lp:28,sc:.95,d:.2,sd:3.3,sdl:0.2},
  {color:"#ab47bc",lp:38,sc:1.05,d:0,sd:2.5,sdl:0.6},
  {color:"#e53935",lp:48,sc:.85,d:.4,sd:2.9,sdl:1.0},
  {color:"#ce93d8",lp:58,sc:.98,d:.6,sd:3.2,sdl:0.3},
  {color:"#e91e8c",lp:67,sc:.80,d:.3,sd:2.7,sdl:0.7},
  {color:"#9c27b0",lp:76,sc:.90,d:.5,sd:3.0,sdl:0.1},
  {color:"#f48fb1",lp:85,sc:.75,d:.2,sd:2.4,sdl:0.5},
  {color:"#e53935",lp:93,sc:.82,d:.4,sd:3.1,sdl:0.9},
];
const QUOTE = `"If flowers could choose a queen,\nthe tulips would step aside for you.\nThey may have beautiful colors,\nbut none carry the grace you do."`;

function initGarden() {
  makePetals(document.getElementById("garden-petals"), 18, null, "petal-garden",
    {dmin:4,dmax:8,dlmax:5});

  const tc = document.getElementById("garden-tulips");
  TULIPS.forEach(t => {
    const wrap = document.createElement("div");
    wrap.style.cssText = `position:absolute;left:${t.lp}%;bottom:0;transform-origin:center bottom;
      animation:fadeInUp 1.2s ${t.d}s ease both`;
    const inner = document.createElement("div");
    inner.style.cssText = `transform-origin:center bottom;
      animation:sway ${t.sd}s ${t.sdl}s ease-in-out infinite alternate`;
    inner.innerHTML = tulipSVG(t.color, t.sc);
    wrap.appendChild(inner); tc.appendChild(wrap);
  });

  // Grass
  const gs = document.getElementById("garden-grass");
  let paths = "";
  for (let i=0;i<40;i++) {
    const x=(i/40)*800+Math.random()*20-10, h=20+Math.random()*30, b=(Math.random()-.5)*15;
    paths+=`<path d="M${x} 60 Q${x+b} ${60-h/2} ${x+b*1.5} ${60-h}"
      stroke="#3a7d35" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.7"/>`;
  }
  gs.innerHTML = paths;

  setTimeout(() => {
    const q = document.getElementById("garden-quote");
    q.classList.remove("anim-hidden"); q.style.opacity = "1";
    typewriter(document.getElementById("garden-quote-text"), QUOTE, 42, () => {
      setTimeout(() => show(document.getElementById("btn-garden-next")), 2800);
    });
  }, 2700);
}

function tulipSVG(color, scale) {
  const w = Math.round(80*scale), h = Math.round(190*scale);
  return `<svg viewBox="-40 -185 80 195" width="${w}" height="${h}" style="overflow:visible;display:block">
    <path d="M0 0 C-4 -38 4 -78 0 -118" stroke="#3d6b47" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M-1 -48 C-22 -64 -34 -80 -18 -98" stroke="#3d6b47" stroke-width="1.5" fill="#5a9467" opacity="0.9"/>
    <path d="M1 -64 C24 -78 34 -94 18 -112" stroke="#3d6b47" stroke-width="1.5" fill="#5a9467" opacity="0.9"/>
    <path d="M0 -118 C-28 -130 -33 -156 -18 -172 C-10 -182 0 -168 0 -148" fill="${color}" opacity="0.72"/>
    <path d="M0 -118 C28 -130 33 -156 18 -172 C10 -182 0 -168 0 -148" fill="${color}" opacity="0.72"/>
    <path d="M0 -118 C-17 -133 -19 -158 -8 -172 C-3 -180 0 -166 0 -148" fill="${color}" opacity="0.9"/>
    <path d="M0 -118 C17 -133 19 -158 8 -172 C3 -180 0 -166 0 -148" fill="${color}" opacity="0.9"/>
    <path d="M0 -118 C-9 -140 -7 -164 0 -175 C7 -164 9 -140 0 -118" fill="${color}"/>
    <path d="M-2 -125 C-7 -142 -5 -160 0 -170" stroke="rgba(255,255,255,0.38)" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  </svg>`;
}

// ─── FINAL ───────────────────────────────────────────────
const FINAL_MSG = [
  "If life ever lets me gift you something,",
  "I would place my eyes in your hands.",
  "Not flowers that fade, not even words,",
  "But the sight itself.",
  "Look at yourself through them and you will",
  "understand that",
  "Every flaw softened into light.",
  "",
  "Lots of Love... Thank You 🫶",
].join("\n");

function initFinal() {
  makeStars(document.getElementById("final-stars"), 50);
  makePetals(document.getElementById("final-petals"), 32,
    ["#ff8fa3","#e91e8c","#ce93d8","#f48fb1","#c77dff","#ff69b4","#ffa0c5","#e879f9"],
    "petal-garden", {sz:[10,18], dmin:5, dmax:11, dlmax:8});

  setTimeout(() => {
    typewriter(document.getElementById("final-text"), FINAL_MSG, 55, () => {
      setTimeout(() => {
        show(document.getElementById("final-heart"));
        show(document.getElementById("final-note"));
      }, 800);
    });
  }, 800);
}

// ─── MUSIC ───────────────────────────────────────────────
let musicOn = false;
function toggleMusic() {
  musicOn = !musicOn;
  const wrap  = document.getElementById("music-frame-wrap");
  const frame = document.getElementById("music-frame");
  const btn   = document.getElementById("music-btn");
  if (musicOn) {
    frame.src = `https://www.youtube-nocookie.com/embed/${MUSIC_VIDEO_ID}?autoplay=1&loop=1&playlist=${MUSIC_VIDEO_ID}&controls=1&modestbranding=1&rel=0`;
    wrap.style.display = "block";
    btn.textContent = "🔇 Mute";
  } else {
    frame.src = "";
    wrap.style.display = "none";
    btn.textContent = "🎵 Music";
  }
}
