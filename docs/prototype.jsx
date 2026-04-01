import { useState, useEffect, useRef, useCallback } from "react";

const ATM = {
  stormy:     { gradient: "radial-gradient(ellipse at 50% 0%, #0a1f35 0%, #040d18 70%)",    particles: "rain",   audio: "rain",    label: "⛈ Stormy",     accent: "#6ab0f5", glow: "rgba(100,160,240,0.12)", border: "rgba(100,160,240,0.25)", pageFilter: "brightness(0.82) saturate(0.55) hue-rotate(195deg)" },
  autumn:     { gradient: "radial-gradient(ellipse at 50% 30%, #2a1100 0%, #120800 70%)",   particles: "leaves", audio: "wind",    label: "🍂 Autumn",     accent: "#e8a045", glow: "rgba(220,140,40,0.12)",  border: "rgba(220,140,40,0.25)",  pageFilter: "sepia(0.55) saturate(1.4) brightness(0.92)" },
  thriller:   { gradient: "radial-gradient(ellipse at 50% 100%, #150004 0%, #020202 60%)",  particles: "none",   audio: "tension", label: "😨 Suspense",   accent: "#d43f3f", glow: "rgba(180,30,30,0.15)",   border: "rgba(180,30,30,0.30)",   pageFilter: "invert(1) brightness(0.88) hue-rotate(175deg)", flicker: true },
  peaceful:   { gradient: "radial-gradient(ellipse at 50% 50%, #0a1f30 0%, #040f1e 70%)",   particles: "motes",  audio: "silence", label: "🌅 Peaceful",   accent: "#5cc8a0", glow: "rgba(80,190,150,0.10)",  border: "rgba(80,190,150,0.22)",  pageFilter: "brightness(0.96) saturate(0.85) hue-rotate(140deg)" },
  action:     { gradient: "radial-gradient(ellipse at 50% 80%, #200600 0%, #0d0200 60%)",   particles: "embers", audio: "tension", label: "⚡ Action",     accent: "#f07020", glow: "rgba(240,100,20,0.15)",  border: "rgba(240,100,20,0.30)",  pageFilter: "brightness(0.85) sepia(0.4) saturate(1.5)" },
  mysterious: { gradient: "radial-gradient(ellipse at 30% 40%, #100828 0%, #04030e 70%)",   particles: "dust",   audio: "silence", label: "🌙 Mysterious", accent: "#9d72e8", glow: "rgba(150,100,230,0.12)", border: "rgba(150,100,230,0.25)", pageFilter: "invert(1) brightness(0.8) hue-rotate(250deg) saturate(0.7)" },
  romantic:   { gradient: "radial-gradient(ellipse at 60% 30%, #1e0415 0%, #0d0208 70%)",   particles: "petals", audio: "silence", label: "🌹 Romantic",   accent: "#d46090", glow: "rgba(200,80,130,0.12)",  border: "rgba(200,80,130,0.25)",  pageFilter: "sepia(0.35) saturate(1.3) hue-rotate(330deg) brightness(0.94)" },
  neutral:    { gradient: "radial-gradient(ellipse at 50% 50%, #141a24 0%, #0a0d14 70%)",   particles: "none",   audio: "silence", label: "📖 Reading",    accent: "#8090a8", glow: "rgba(130,150,180,0.08)", border: "rgba(130,150,180,0.18)", pageFilter: "none" },
};

function spawnP(type, w, h, init) {
  switch (type) {
    case "rain":   return { x: Math.random()*w*1.2-w*0.1, y: init?Math.random()*h:Math.random()*h*-0.5, len: Math.random()*22+8, speed: Math.random()*18+22, op: Math.random()*0.35+0.08, lw: Math.random()*0.9+0.2 };
    case "leaves": return { x: Math.random()*w, y: init?Math.random()*h:-20, rot: Math.random()*Math.PI*2, rs: (Math.random()-0.5)*2.5, sz: Math.random()*13+5, vy: Math.random()*1.2+0.4, vx: (Math.random()-0.5)*1.2, sa: Math.random()*35+8, sf: Math.random()*1.2+0.4, sp: Math.random()*Math.PI*2, hue: Math.random()*40+8, sat: 60+Math.random()*30, lit: 35+Math.random()*20, op: Math.random()*0.55+0.3 };
    case "dust":   return { x: Math.random()*w, y: init?Math.random()*h:h+10, sz: Math.random()*1.8+0.4, vy: -(Math.random()*0.25+0.08), vx: (Math.random()-0.5)*0.2, op: Math.random()*0.2+0.04, tp: Math.random()*Math.PI*2, ts: Math.random()*2.5+0.8 };
    case "motes":  return { x: Math.random()*w, y: init?Math.random()*h:h+10, sz: Math.random()*2.2+0.5, vy: -(Math.random()*0.15+0.05), vx: (Math.random()-0.5)*0.1, op: Math.random()*0.25+0.04, ph: Math.random()*Math.PI*2, fr: Math.random()*1.5+0.3 };
    case "embers": return { x: Math.random()*w, y: h+10, vx: (Math.random()-0.5)*2.5, vy: -(Math.random()*4+1.5), life: 0, maxLife: Math.random()*120+60, sz: Math.random()*2.5+0.8, col: Math.random()>0.5?"#f07020":"#f8c030" };
    case "petals": return { x: Math.random()*w, y: init?Math.random()*h:-10, rot: Math.random()*Math.PI*2, rs: (Math.random()-0.5)*1.2, pw: Math.random()*8+3, ph2: Math.random()*5+2, vy: Math.random()*0.7+0.3, vx: (Math.random()-0.5)*0.8, sa: Math.random()*25+8, sf: Math.random()*0.8+0.3, sp: Math.random()*Math.PI*2, op: Math.random()*0.5+0.25, hue: Math.random()*30+340 };
    default:       return {};
  }
}

function initParticles(type, w, h) {
  const n = { rain:200, leaves:35, dust:50, motes:40, embers:70, petals:40, none:0 }[type] || 0;
  return Array.from({ length: n }, () => spawnP(type, w, h, true));
}

function tick(type, ps, ctx, w, h, dt, t) {
  ctx.clearRect(0, 0, w, h);
  if (!ps.length || type === "none") return;
  if (type === "rain") {
    ctx.save();
    for (const p of ps) {
      p.x += p.speed*0.18*dt; p.y += p.speed*dt;
      if (p.y > h+p.len) Object.assign(p, spawnP("rain",w,h,false));
      ctx.beginPath(); ctx.strokeStyle=`rgba(170,205,255,${p.op})`; ctx.lineWidth=p.lw;
      ctx.moveTo(p.x,p.y); ctx.lineTo(p.x+p.len*0.18,p.y+p.len); ctx.stroke();
    }
    ctx.restore();
  } else if (type === "leaves") {
    for (const p of ps) {
      const sw=Math.sin(t*p.sf+p.sp)*p.sa*0.015;
      p.x+=(p.vx+sw)*dt*60; p.y+=p.vy*dt*60; p.rot+=p.rs*dt;
      if (p.y>h+30) Object.assign(p,spawnP("leaves",w,h,false));
      if (p.x<-60) p.x=w+60; if (p.x>w+60) p.x=-60;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.globalAlpha=p.op;
      ctx.fillStyle=`hsl(${p.hue},${p.sat}%,${p.lit}%)`; ctx.beginPath();
      ctx.ellipse(0,0,p.sz,p.sz*0.52,0,0,Math.PI*2); ctx.fill(); ctx.restore();
    }
  } else if (type === "dust") {
    for (const p of ps) {
      p.x+=p.vx*dt*60; p.y+=p.vy*dt*60; p.tp+=p.ts*dt;
      if (p.y<-10) Object.assign(p,spawnP("dust",w,h,false));
      ctx.beginPath(); ctx.fillStyle=`rgba(175,140,235,${p.op*(0.7+Math.sin(p.tp)*0.3)})`;
      ctx.arc(p.x,p.y,p.sz,0,Math.PI*2); ctx.fill();
    }
  } else if (type === "motes") {
    for (const p of ps) {
      p.x+=(p.vx+Math.sin(t*p.fr+p.ph)*0.08)*dt*60; p.y+=p.vy*dt*60; p.ph+=p.fr*dt*0.5;
      if (p.y<-10) Object.assign(p,spawnP("motes",w,h,false));
      const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.sz*2.5);
      g.addColorStop(0,`rgba(100,220,170,${p.op*(0.7+Math.sin(p.ph*2)*0.3)})`);
      g.addColorStop(1,"rgba(100,220,170,0)");
      ctx.beginPath(); ctx.fillStyle=g; ctx.arc(p.x,p.y,p.sz*2.5,0,Math.PI*2); ctx.fill();
    }
  } else if (type === "embers") {
    ctx.save();
    for (const p of ps) {
      p.life++; if(p.life>p.maxLife) Object.assign(p,spawnP("embers",w,h,false));
      p.x+=p.vx*dt*60; p.y+=p.vy*dt*60; p.vy+=0.03*dt*60; p.vx+=(Math.random()-0.5)*0.04;
      ctx.globalAlpha=(1-p.life/p.maxLife)*0.75; ctx.fillStyle=p.col;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.sz,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  } else if (type === "petals") {
    for (const p of ps) {
      p.x+=(p.vx+Math.sin(t*p.sf+p.sp)*p.sa*0.01)*dt*60; p.y+=p.vy*dt*60; p.rot+=p.rs*dt;
      if(p.y>h+20) Object.assign(p,spawnP("petals",w,h,false));
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.globalAlpha=p.op;
      ctx.fillStyle=`hsla(${p.hue},70%,75%,1)`; ctx.beginPath();
      ctx.ellipse(0,0,p.pw,p.ph2,0,0,Math.PI*2); ctx.fill(); ctx.restore();
    }
  }
}

class AudioEng {
  constructor() { this.ac=null; this.master=null; this.nodes=[]; this.cur=null; }
  init() {
    if (!this.ac) {
      this.ac=new (window.AudioContext||window.webkitAudioContext)();
      this.master=this.ac.createGain(); this.master.gain.value=0; this.master.connect(this.ac.destination);
    }
    if (this.ac.state==="suspended") this.ac.resume();
  }
  vol(v,r=1.5) { if(!this.ac)return; this.master.gain.cancelScheduledValues(this.ac.currentTime); this.master.gain.linearRampToValueAtTime(v,this.ac.currentTime+r); }
  play(type) {
    if(type===this.cur)return; this.stop(); this.cur=type;
    if(!this.ac||type==="silence")return;
    if(type==="rain")    { this._n(3200,0.6,0.35); this._n(800,2.5,0.2); }
    if(type==="wind")    { this._n(280,6,0.5); this._n(120,3,0.25); }
    if(type==="tension") { this._d(52,0.25); this._d(55.5,0.12); this._p(); }
  }
  _n(freq,q,gain) {
    const len=this.ac.sampleRate*4, buf=this.ac.createBuffer(2,len,this.ac.sampleRate);
    for(let c=0;c<2;c++){const d=buf.getChannelData(c);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;}
    const src=this.ac.createBufferSource(); src.buffer=buf; src.loop=true;
    const f=this.ac.createBiquadFilter(); f.type="bandpass"; f.frequency.value=freq; f.Q.value=q;
    const g=this.ac.createGain(); g.gain.value=gain;
    src.connect(f); f.connect(g); g.connect(this.master); src.start(); this.nodes.push(src);
  }
  _d(freq,gain) {
    const o=this.ac.createOscillator(); o.type="sine"; o.frequency.value=freq;
    const g=this.ac.createGain(); g.gain.value=gain; o.connect(g); g.connect(this.master); o.start(); this.nodes.push(o);
  }
  _p() {
    const lfo=this.ac.createOscillator(); lfo.frequency.value=1.1;
    const lg=this.ac.createGain(); lg.gain.value=0.06;
    const d=this.ac.createOscillator(); d.type="sine"; d.frequency.value=80;
    const g=this.ac.createGain(); g.gain.value=0.08;
    lfo.connect(lg); lg.connect(d.frequency); d.connect(g); g.connect(this.master);
    lfo.start(); d.start(); this.nodes.push(lfo,d);
  }
  stop() { this.nodes.forEach(n=>{try{n.stop()}catch(e){}}); this.nodes=[]; this.cur=null; }
  dispose() { this.stop(); if(this.ac) this.ac.close(); }
}

function useFlicker(on) {
  const [op, setOp] = useState(0);
  useEffect(() => {
    if (!on) { setOp(0); return; }
    let t;
    const run = () => { t=setTimeout(()=>{setOp(Math.random()*0.06+0.01);setTimeout(()=>{setOp(0);run();},80+Math.random()*120);},3000+Math.random()*8000); };
    run(); return ()=>clearTimeout(t);
  }, [on]);
  return op;
}

export default function App() {
  const [phase,     setPhase]     = useState("upload");
  const [pdfDoc,    setPdfDoc]    = useState(null);
  const [page,      setPage]      = useState(1);
  const [total,     setTotal]     = useState(0);
  const [atm,       setAtm]       = useState("neutral");
  const [analyzing, setAnalyzing] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [audioOn,   setAudioOn]   = useState(false);
  const [ready,     setReady]     = useState(false);
  const [reason,    setReason]    = useState("");
  const [dragging,  setDragging]  = useState(false);

  const pdfRef   = useRef(null);
  const atmRef   = useRef(null);
  const eng      = useRef(new AudioEng());
  const animId   = useRef(null);
  const parts    = useRef([]);
  const busy     = useRef(false);
  const flicker  = useFlicker(atm === "thriller");

  useEffect(() => {
    const load = () => {
      if (window.pdfjsLib) { setReady(true); return; }
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      s.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"; setReady(true); };
      document.head.appendChild(s);
    };
    load();
    return () => eng.current.dispose();
  }, []);

  useEffect(() => {
    if (phase !== "reading") return;
    const canvas = atmRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width=window.innerWidth; canvas.height=window.innerHeight;
      parts.current=initParticles(ATM[atm].particles,canvas.width,canvas.height);
    };
    resize(); window.addEventListener("resize",resize);
    let last=performance.now(), t=0;
    const loop = (now) => {
      const dt=Math.min((now-last)/1000,0.05); last=now; t+=dt;
      tick(ATM[atm].particles,parts.current,canvas.getContext("2d"),canvas.width,canvas.height,dt,t);
      animId.current=requestAnimationFrame(loop);
    };
    animId.current=requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(animId.current); window.removeEventListener("resize",resize); };
  }, [phase, atm]);

  useEffect(() => { if(phase==="reading") eng.current.play(ATM[atm].audio); }, [atm, phase]);

  useEffect(() => {
    const fn = (e) => {
      if(phase!=="reading") return;
      if(e.key==="ArrowRight"||e.key==="ArrowDown") setPage(p=>Math.min(total,p+1));
      if(e.key==="ArrowLeft"||e.key==="ArrowUp")    setPage(p=>Math.max(1,p-1));
    };
    window.addEventListener("keydown",fn); return ()=>window.removeEventListener("keydown",fn);
  }, [phase, total]);

  const openFile = useCallback(async (file) => {
    if (!file || !ready) return;
    try {
      const buf = await file.arrayBuffer();
      const doc = await window.pdfjsLib.getDocument({ data: buf }).promise;
      setPdfDoc(doc); setTotal(doc.numPages); setPage(1); setPhase("reading");
    } catch(e) { console.error(e); alert("Couldn't open PDF. Try another file."); }
  }, [ready]);

  const analyzeMood = useCallback(async (text, canvas) => {
    setAnalyzing(true);
    try {
      const words = text.trim().split(/\s+/).filter(Boolean).length;
      const PROMPT = `Return ONLY a JSON object like this (no markdown, no extra text):
{"atmosphere":"stormy","reason":"characters flee in heavy rain"}

Choose atmosphere from: stormy, autumn, thriller, peaceful, action, mysterious, romantic, neutral
Keep reason to 6 words or fewer.`;

      let messages;
      if (words >= 8) {
        messages = [{ role:"user", content: PROMPT + "\n\nBook page:\n" + text.slice(0,2500) }];
      } else {
        const b64 = canvas.toDataURL("image/jpeg",0.75).split(",")[1];
        messages = [{ role:"user", content:[
          { type:"image", source:{ type:"base64", media_type:"image/jpeg", data:b64 }},
          { type:"text",  text: PROMPT + "\n\nRead the text in the image above." },
        ]}];
      }

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-6", max_tokens:120, messages }),
      });

      if (!res.ok) throw new Error("API " + res.status);
      const data = await res.json();
      const raw = (data.content?.find(b=>b.type==="text")?.text||"{}").replace(/```[a-z]*\n?/g,"").trim();
      const parsed = JSON.parse(raw);
      if (parsed?.atmosphere && ATM[parsed.atmosphere]) { setAtm(parsed.atmosphere); setReason(parsed.reason||""); }
    } catch(e) { console.error("Mood:",e); }
    finally { setAnalyzing(false); }
  }, []);

  const renderPage = useCallback(async (num) => {
    if (!pdfDoc || !pdfRef.current || busy.current) return;
    busy.current = true; setRendering(true);
    try {
      const pg     = await pdfDoc.getPage(num);
      const canvas = pdfRef.current;
      const maxW   = Math.min(window.innerWidth*0.60, 760);
      const maxH   = window.innerHeight*0.78;
      const vp     = pg.getViewport({ scale:1 });
      const scale  = Math.min(maxW/vp.width, maxH/vp.height);
      const svp    = pg.getViewport({ scale });
      canvas.width=svp.width; canvas.height=svp.height;
      await pg.render({ canvasContext:canvas.getContext("2d"), viewport:svp }).promise;
      setRendering(false);
      const tc   = await pg.getTextContent();
      const text = tc.items.map(i=>i.str).join(" ");
      await analyzeMood(text, canvas);
    } catch(e) { console.error(e); setRendering(false); }
    finally { busy.current=false; }
  }, [pdfDoc, analyzeMood]);

  useEffect(() => { if(pdfDoc && phase==="reading") renderPage(page); }, [pdfDoc, page, phase, renderPage]);

  const toggleAudio = () => {
    eng.current.init(); const next=!audioOn; setAudioOn(next);
    eng.current.vol(next?0.45:0); if(next) eng.current.play(ATM[atm].audio);
  };

  const A = ATM[atm];

  if (phase === "upload") return (
    <div style={{width:"100vw",height:"100vh",background:"radial-gradient(ellipse at 40% 30%,#0d1520 0%,#060a0f 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"#dce4ef",userSelect:"none"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        *{box-sizing:border-box}
        .uz{transition:all 0.3s}
        .uz:hover{border-color:#5a7fa0!important;background:rgba(90,127,160,0.05)!important;transform:scale(1.01)}
        .tag{transition:background 0.2s}
        .tag:hover{background:rgba(255,255,255,0.06)!important}
      `}</style>
      <div style={{textAlign:"center",marginBottom:"3rem"}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:300,fontSize:"3.5rem",letterSpacing:"0.12em",color:"#c8d8e8",textShadow:"0 0 40px rgba(100,160,220,0.25)"}}>Atmospheric</div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:"1rem",color:"#607080",letterSpacing:"0.08em",marginTop:"0.4rem"}}>a living reading experience</div>
      </div>
      <div className="uz" onClick={()=>document.getElementById("_pf").click()}
        onDragOver={e=>{e.preventDefault();setDragging(true)}}
        onDragLeave={()=>setDragging(false)}
        onDrop={e=>{e.preventDefault();setDragging(false);const f=e.dataTransfer.files[0];if(f?.type==="application/pdf")openFile(f);}}
        style={{width:380,height:220,border:`1.5px dashed ${dragging?"#6a9fcc":"#2a3d52"}`,borderRadius:12,background:dragging?"rgba(80,130,190,0.06)":"rgba(255,255,255,0.015)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",gap:"0.75rem"}}>
        <div style={{fontSize:"2.8rem",opacity:dragging?1:0.7}}>📄</div>
        <div style={{color:"#7a98b0",fontSize:"0.95rem",letterSpacing:"0.04em"}}>Drop a PDF here</div>
        <div style={{color:"#3a5060",fontSize:"0.82rem"}}>or click to browse</div>
      </div>
      <input id="_pf" type="file" accept=".pdf" hidden onChange={e=>{if(e.target.files[0])openFile(e.target.files[0]);}} />
      {!ready && <div style={{marginTop:"1.5rem",color:"#304050",fontSize:"0.8rem",letterSpacing:"0.06em"}}>loading pdf engine…</div>}
      <div style={{display:"flex",gap:"0.65rem",marginTop:"2.2rem",flexWrap:"wrap",justifyContent:"center",maxWidth:480}}>
        {[["⛈","Stormy seas"],["🍂","Autumn wind"],["😨","Dark suspense"],["🌙","Mysterious"],["⚡","Intense action"],["🌹","Romance"]].map(([i,l])=>(
          <span key={l} className="tag" style={{padding:"0.3rem 0.85rem",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:999,fontSize:"0.8rem",color:"#607080"}}>{i} {l}</span>
        ))}
      </div>
      <div style={{marginTop:"2rem",color:"#253545",fontSize:"0.77rem",letterSpacing:"0.05em",maxWidth:320,textAlign:"center",lineHeight:1.75}}>
        Claude reads each page and transforms the environment —<br/>particles, colors, and ambient sound shift with the story.
      </div>
    </div>
  );

  return (
    <div style={{width:"100vw",height:"100vh",overflow:"hidden",position:"relative",background:A.gradient,transition:"background 2.5s ease",fontFamily:"'Cormorant Garamond','Palatino Linotype',serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        *{box-sizing:border-box}
        .btn{transition:all 0.25s;cursor:pointer}
        .btn:hover:not(:disabled){background:rgba(255,255,255,0.12)!important}
        .btn:disabled{opacity:0.3;cursor:not-allowed}
        @keyframes spin    {to{transform:rotate(360deg)}}
        @keyframes pulse-d {0%,100%{opacity:0.4}50%{opacity:1}}
        @keyframes page-in {from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}
      `}</style>

      <canvas ref={atmRef} style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:15}} />
      <div style={{position:"absolute",inset:0,zIndex:2,background:A.glow,transition:"background 2.5s ease",pointerEvents:"none"}} />
      <div style={{position:"absolute",inset:0,zIndex:3,background:"radial-gradient(ellipse at 50% 50%,transparent 35%,rgba(0,0,0,0.75) 100%)",pointerEvents:"none"}} />
      {atm==="thriller" && <div style={{position:"absolute",inset:0,zIndex:4,background:`rgba(255,40,40,${flicker})`,pointerEvents:"none",transition:"background 0.05s"}} />}

      {/* Top bar */}
      <div style={{position:"absolute",top:0,left:0,right:0,zIndex:20,padding:"1rem 1.4rem",display:"flex",alignItems:"center",justifyContent:"space-between",background:"linear-gradient(to bottom,rgba(0,0,0,0.5),transparent)"}}>
        <button className="btn" onClick={()=>setPhase("upload")} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#8090a8",padding:"0.3rem 0.85rem",borderRadius:6,fontSize:"0.82rem",letterSpacing:"0.05em"}}>← close</button>
        <div style={{display:"flex",alignItems:"center",gap:"0.55rem",background:"rgba(0,0,0,0.45)",backdropFilter:"blur(10px)",padding:"0.38rem 1rem",borderRadius:999,border:`1px solid ${A.border}`,color:A.accent,fontSize:"0.85rem",transition:"all 1.5s ease",boxShadow:`0 0 20px ${A.glow}`}}>
          {analyzing
            ? <><span style={{width:6,height:6,borderRadius:"50%",background:A.accent,display:"inline-block",animation:"pulse-d 1s infinite"}}/><span style={{opacity:0.7,fontStyle:"italic",fontSize:"0.8rem"}}>reading atmosphere…</span></>
            : <><span>{A.label}</span>{reason&&<span style={{opacity:0.5,fontStyle:"italic",fontSize:"0.78rem"}}>· {reason}</span>}</>
          }
        </div>
        <button className="btn" onClick={toggleAudio} style={{background:audioOn?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.05)",border:`1px solid ${audioOn?A.border:"rgba(255,255,255,0.1)"}`,color:audioOn?A.accent:"#607080",padding:"0.3rem 0.85rem",borderRadius:6,fontSize:"0.82rem",letterSpacing:"0.05em",transition:"all 0.3s"}}>
          {audioOn?"🔊 sound":"🔇 sound"}
        </button>
      </div>

      {/* Page canvas */}
      <div style={{position:"absolute",inset:0,zIndex:10,display:"flex",alignItems:"center",justifyContent:"center",paddingTop:60,paddingBottom:80}}>
        {rendering
          ? <div style={{width:38,height:38,border:`2px solid rgba(255,255,255,0.08)`,borderTopColor:A.accent,borderRadius:"50%",animation:"spin 1s linear infinite"}} />
          : <div key={page} style={{animation:"page-in 0.5s ease"}}><canvas ref={pdfRef} style={{display:"block",borderRadius:2,filter:A.pageFilter,transition:"filter 2s ease, box-shadow 2s ease",boxShadow:`0 40px 100px rgba(0,0,0,0.85),0 0 0 1px rgba(255,255,255,0.04),0 0 60px ${A.glow}`}}/></div>
        }
      </div>

      {/* Bottom nav */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:20,background:"linear-gradient(to top,rgba(0,0,0,0.65),transparent)",padding:"1.4rem 2rem 1rem",display:"flex",alignItems:"center",justifyContent:"center",gap:"2rem"}}>
        <button className="btn" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"#c0ccd8",padding:"0.45rem 1.3rem",borderRadius:6,fontSize:"0.85rem",letterSpacing:"0.07em"}}>← prev</button>
        <div style={{color:"#506070",fontSize:"0.82rem",letterSpacing:"0.1em",minWidth:80,textAlign:"center",fontStyle:"italic"}}>{page} / {total}</div>
        <button className="btn" onClick={()=>setPage(p=>Math.min(total,p+1))} disabled={page>=total} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"#c0ccd8",padding:"0.45rem 1.3rem",borderRadius:6,fontSize:"0.85rem",letterSpacing:"0.07em"}}>next →</button>
      </div>
    </div>
  );
}
