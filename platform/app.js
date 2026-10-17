const SUBJ=[
 {id:"math",n:"الرياضيات",g:"∑",c:"#2a5db0"},
 {id:"eng",n:"اللغة الإنجليزية",g:"Aa",c:"#0f8f8f"},
 {id:"lugh",n:"لغتي",g:"ع",c:"#c8920a"},
 {id:"sci",n:"العلوم",g:"⚛",c:"#8a4fb3"}];
const A=document.getElementById("app");
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const n=x=>Number(x).toLocaleString("ar-EG");
// كسر: ⟦البسط|المقام⟧   أُس: س^٢ أو س^{ن+١}
const rich=s=>esc(s).replace(/\n/g,"<br>").replace(/\[\[([^\]]+)\]\]/g,"<u>$1</u>").replace(/⟦([^|⟧]*)\|([^⟧]*)⟧/g,'<span class="fr"><span>$1</span><span>$2</span></span>')
  .replace(/\^(\{[^}]+\}|[^\s)\]،,.=+\-])/g,(m,x)=>"<sup>"+x.replace(/[{}]/g,"")+"</sup>");
const norm=s=>String(s).replace(/[\u064b-\u065f\u0670\u0640]/g,"").replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/٫/g,".").replace(/[\s{}\[\]()،,.?!'’"]/g,"")
  .replace(/[أإآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").replace(/[−–]/g,"-").toLowerCase();
const LS={g:k=>{try{return localStorage.getItem(k)}catch(e){return null}},s:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
const S={sid:LS.g("sid")||(window.crypto&&crypto.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random().toString(36).slice(2)),name:LS.g("name"),cls:LS.g("cls")};
LS.s("sid",S.sid);
Object.values(window.DATA||{}).forEach(d=>d.chapters.forEach(c=>c.items.forEach(i=>{i.ch=c.id;i.src=i.src||i.t})));

function track(kind,subject,chapter,data){
  if(!(window.CFG&&CFG.url&&CFG.key&&S.name))return;
  fetch(CFG.url+"/rest/v1/events",{method:"POST",keepalive:true,
    headers:{apikey:CFG.key,"Content-Type":"application/json",Prefer:"return=minimal"},
    body:JSON.stringify({student_id:S.sid,student_name:S.name,class_name:S.cls,kind,subject:subject||null,chapter:chapter||null,data:data||{}})}).catch(()=>{});
}
const best=(s,id)=>LS.g("best:"+s+":"+id);

/* ---------- الرسومات (SVG) ---------- */
const nn=v=>(v<0?"\u2212":"")+n(Math.abs(v));
const tx=(x,y,t,a)=>`<text x="${x}" y="${y}" font-size="12" direction="ltr" unicode-bidi="bidi-override" text-anchor="${a||"middle"}" fill="currentColor">${t}</text>`;
let FID=0;
function fig(f){
  if(!f)return"";
  const id=++FID;
  const lab=f.alt?` role="img" aria-label="${esc(f.alt)}"`:"";
  if(f.k==="emo")return `<div class="emo" role="img" aria-label="${esc(f.alt||"picture")}">${f.e}</div>`;
  if(f.k==="tbl"){const c=v=>typeof v==="string"?esc(v):nn(v),h=f.h||["س","ص"];return `<div class="tw"><table class="tb" dir="rtl"><tr><th>${esc(h[0])}</th>${f.x.map(v=>`<td>${c(v)}</td>`).join("")}</tr><tr><th>${esc(h[1])}</th>${f.y.map(v=>`<td>${c(v)}</td>`).join("")}</tr></table></div>`}
  if(f.k==="map"){ // a: عناصر س (يمين) ، b: عناصر ص (يسار) ، ar: [[i,j]] أسهم
    const H=Math.max(f.a.length,f.b.length,2)*36+30,P=(m,k)=>m>1?32+(H-64)*k/(m-1):H/2,ya=k=>P(f.a.length,k),yb=k=>P(f.b.length,k);
    let t=`<svg viewBox="0 0 300 ${H}" class="fig"${lab}><defs><marker id="ah${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>`+
      `<rect x="14" y="18" width="90" height="${H-36}" rx="30" fill="none" stroke="currentColor" stroke-width="2"/><rect x="196" y="18" width="90" height="${H-36}" rx="30" fill="none" stroke="currentColor" stroke-width="2"/>`+tx(59,12,"ص")+tx(241,12,"س");
    f.a.forEach((v,i)=>t+=tx(241,ya(i)+5,nn(v)));f.b.forEach((v,j)=>t+=tx(59,yb(j)+5,nn(v)));
    (f.ar||[]).forEach(([i,j])=>t+=`<line x1="222" y1="${ya(i)}" x2="82" y2="${yb(j)}" stroke="currentColor" stroke-width="1.8" marker-end="url(#ah${id})"/>`);
    return t+"</svg>";
  }
  if(f.k==="nl"){ // خط الأعداد: segs:[{a,b}] (بدون a أو b = يمتد للنهاية) ، pts:[{v,o:true للدائرة المفرغة}]
    const a=f.from,b=f.to,X=v=>20+(v-a)/(b-a)*320;
    let s=`<svg viewBox="0 0 360 72" class="fig"${lab}><line x1="8" y1="36" x2="352" y2="36" stroke="currentColor" stroke-width="2"/>`;
    for(let v=a;v<=b;v++)s+=`<line x1="${X(v)}" y1="31" x2="${X(v)}" y2="41" stroke="currentColor"/>`+((b-a<=12||(v-a)%2===0)?tx(X(v),60,nn(v)):"");
    (f.segs||[]).forEach(g=>s+=`<line x1="${X(g.a===undefined?a:g.a)}" y1="36" x2="${X(g.b===undefined?b:g.b)}" y2="36" stroke="var(--tl)" stroke-width="6"/>`);
    (f.pts||[]).forEach(p=>s+=`<circle cx="${X(p.v)}" cy="36" r="6" fill="${p.o?"var(--sf)":"var(--tl)"}" stroke="var(--tl)" stroke-width="2.5"/>`);
    return s+"</svg>";
  }
  if(f.k==="xy"){ // المستوى الإحداثي: r نصف المدى ، lines:[{p:[[x1,y1],[x2,y2]]}|{m,b}|{x:ثابت}] ، pts:[[x,y,"اسم"]]
    const r=f.r||5,Z=300,c=Z/2,u=(Z-36)/2/r,X=v=>c+v*u,Y=v=>c-v*u,R=r+.4;
    let s=`<svg viewBox="0 0 ${Z} ${Z}" class="fig sq"${lab}>`;
    for(let v=-r;v<=r;v++){s+=`<line x1="${X(v)}" y1="${Y(-r)}" x2="${X(v)}" y2="${Y(r)}" stroke="var(--ln)"/><line x1="${X(-r)}" y1="${Y(v)}" x2="${X(r)}" y2="${Y(v)}" stroke="var(--ln)"/>`;
      if(v&&(r<=6||v%2===0))s+=tx(X(v),c+14,nn(v))+tx(c-6,Y(v)+4,nn(v),"end");}
    s+=`<line x1="${X(-R)}" y1="${c}" x2="${X(R)}" y2="${c}" stroke="currentColor" stroke-width="1.6"/><line x1="${c}" y1="${Y(-R)}" x2="${c}" y2="${Y(R)}" stroke="currentColor" stroke-width="1.6"/>`+tx(X(R)-2,c-6,"س","end")+tx(c+10,Y(R)+10,"ص","start");
    (f.lines||[]).forEach(l=>{let p,q;
      if(l.x!==undefined){p=[l.x,-R];q=[l.x,R]}
      else if(l.m!==undefined){p=[-R,l.m*-R+l.b];q=[R,l.m*R+l.b]}
      else{[p,q]=l.p;if(p[0]===q[0]){p=[p[0],-R];q=[p[0],R]}else{const m=(q[1]-p[1])/(q[0]-p[0]),b=p[1]-m*p[0];p=[-R,-m*R+b];q=[R,m*R+b]}}
      s+=`<line x1="${X(p[0])}" y1="${Y(p[1])}" x2="${X(q[0])}" y2="${Y(q[1])}" stroke="var(--br)" stroke-width="2.4" clip-path="url(#cp${id})"/>`});
    (f.segs||[]).forEach(g=>s+=`<line x1="${X(g[0])}" y1="${Y(g[1])}" x2="${X(g[2])}" y2="${Y(g[3])}" stroke="var(--br)" stroke-width="2.4"/>`);
    (f.curves||[]).forEach(c=>{const fx=new Function("t","return "+c.fx),fy=new Function("t","return "+c.fy);let d="";for(let i=0;i<=60;i++){const t=c.t[0]+(c.t[1]-c.t[0])*i/60;d+=(i?"L":"M")+X(fx(t)).toFixed(1)+" "+Y(fy(t)).toFixed(1)}s+=`<path d="${d}" fill="none" stroke="var(--br)" stroke-width="2.4"/>`});
    (f.pts||[]).forEach(p=>s+=`<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="4.5" fill="var(--tl)"/>`+(p[2]?tx(X(p[0])+8,Y(p[1])-7,p[2]===true?"("+nn(p[0])+" , "+nn(p[1])+")":p[2],"start"):""));
    return s.replace(`<svg viewBox="0 0 ${Z} ${Z}" class="fig sq"${lab}>`,`<svg viewBox="0 0 ${Z} ${Z}" class="fig sq"${lab}><defs><clipPath id="cp${id}"><rect x="${X(-r)}" y="${Y(r)}" width="${2*r*u}" height="${2*r*u}"/></clipPath></defs>`)+"</svg>";
  }
  return"";
}

/* ---------- الشاشات ---------- */
function gate(){
  A.innerHTML=`<div class="hero"><h1>منصة التهيئة للاختبارات المركزية</h1><p>الصف الثالث المتوسط – الفصل الدراسي الأول</p></div>
  <form class="card" onsubmit="return login(event)"><h2>سجّل دخولك</h2>
  <label for="nm">الاسم الثلاثي</label><input id="nm" required maxlength="60" autocomplete="name" value="${esc(S.name||"")}">
  <label for="cl">الفصل (مثال: ٣/أ)</label><input id="cl" required maxlength="20" value="${esc(S.cls||"")}">
  <p class="mu">يُسجَّل نشاطك لمتابعة تقدّمك مع معلميك.</p>
  <button class="btn" type="submit">ابدأ المراجعة</button></form>`;
}
function login(e){
  e.preventDefault();
  S.name=document.getElementById("nm").value.trim();S.cls=document.getElementById("cl").value.trim();
  LS.s("name",S.name);LS.s("cls",S.cls);track("login");hub();return false;
}
function hub(){
  stopT();
  A.innerHTML=`<div class="hero"><h1>أهلًا ${esc(S.name)}</h1><p>اختر المادة وابدأ المراجعة.</p></div><div class="grid">`+
  SUBJ.map(s=>{const d=window.DATA&&DATA[s.id];const chs=d?d.chapters.filter(c=>c.items.length):[];const done=chs.filter(c=>best(s.id,c.id)!==null).length;
    return `<button class="subj" style="--c:${s.c}" ${chs.length?`onclick="subj('${s.id}')"`:"disabled"}>
    <span class="g">${s.g}</span><b>${s.n}</b>
    <small>${chs.length?`أنجزت ${n(done)} من ${n(chs.length)} ${d.labels||"فصول"}`:"المحتوى قيد الإعداد"}</small></button>`}).join("")+
  `</div><p><button class="lnk" onclick="gate()">تغيير الاسم</button></p>`;
}
const nw=it=>it._w||(it.t==="match"?it.l.length:(it.mk||1));
const poolAll=(sub,e)=>DATA[sub].chapters.filter(c=>e.ch.includes(c.id)).flatMap(c=>c.items);
const pool=(sub,e)=>poolAll(sub,e).filter(i=>i.t!=="ws");
const secReady=(sub,e)=>{const a=poolAll(sub,e);return e.secs.every(s=>s.picks.every(p=>a.some(i=>i.src===p.src)))};
const r2=x=>Math.round(x*2)/2;
function examCard(sub,e){
  const ready=e.secs?secReady(sub,e):pool(sub,e).length>0,b=best(sub,e.id);
  const info=e.secs?n(e.secs.reduce((a,s)=>a+s.marks,0))+" درجة · "+n(e.min)+" دقيقة":(()=>{const p=pool(sub,e).length;return n(Math.min(e.n,p))+" سؤالًا · "+n(e.min)+" دقيقة"+(p<e.n?" (المتاح حاليًا)":"")})();
  return `<div class="card row"><div><b>${esc(e.title)}</b><br><span class="mu">${ready?info+(b!==null?" · أفضل نتيجة "+n(b)+"٪":""):"قريبًا"}</span></div>
  <button class="btn" ${ready?`onclick="startExam('${sub}','${e.id}')"`:"disabled"}>ابدأ الاختبار</button></div>`;
}
function subj(id){
  stopT();
  const s=SUBJ.find(x=>x.id===id),d=DATA[id],ex=d.exams||[],L=d.label||"الفصل";track("open",id);
  A.innerHTML=`<div class="bar"><button class="lnk" onclick="hub()">رجوع</button></div><div class="hero" style="background:${s.c}"><h1>${s.n}</h1></div>
  <h2 class="sec">تدريب حسب ${L}</h2>`+
  d.chapters.map((c,i)=>{const b=best(id,c.id),k=c.items.length,cap=d.practice&&k>d.practice;
    return `<div class="card row"><div><b dir="auto">${L} ${n(i+1)}: ${esc(c.title)}</b><br><span class="mu">${k?(cap?n(d.practice)+" سؤالًا عشوائيًا من "+n(k):n(k)+" سؤالًا")+(b!==null?" · أفضل نتيجة "+n(b)+"٪":""):"قريبًا"}</span></div>
    <button class="btn" ${k?`onclick="startQ('${id}',${i})"`:"disabled"}>ابدأ</button></div>`}).join("")+
  `<h2 class="sec">اختبارات الفترات</h2>`+ex.filter(e=>/^p/.test(e.id)).map(e=>examCard(id,e)).join("")+
  `<h2 class="sec">الاختبار المركزي النهائي</h2>`+ex.filter(e=>e.id==="fin").map(e=>examCard(id,e)).join("")+
  (ex.some(e=>/^z/.test(e.id))?`<h2 class="sec">نماذج مركزية أخرى (قالب الفصل الأول)</h2>`+ex.filter(e=>/^z/.test(e.id)).map(e=>examCard(id,e)).join(""):"");
}

/* ---------- محرك الأسئلة ---------- */
let Q=null,T=null;
const stopT=()=>{if(T){clearInterval(T);T=null}};
const shuf=a=>a.slice().sort(()=>Math.random()-.5);
function startQ(sub,ci,only){
  const d=DATA[sub],ch=d.chapters[ci],all=shuf(ch.items);
  Q={sub,ci,id:ch.id,title:ch.title,items:only||(d.practice&&all.length>d.practice?all.slice(0,d.practice):all),i:0,res:[],t0:Date.now(),all:!only,exam:null};
  track("start",sub,ch.id,{n:Q.items.length,retry:!!only});showQ();
}
function spread(arr,n,sub){
  const order=DATA[sub].chapters.map(c=>c.id),g={};
  shuf(arr).forEach(i=>(g[i.ch]=g[i.ch]||[]).push(i));
  const ks=shuf(Object.keys(g)),out=[];let k=0;
  while(out.length<n&&ks.some(c=>g[c].length)){const c=ks[k++%ks.length];if(g[c].length)out.push(g[c].shift())}
  return out.sort((x,y)=>order.indexOf(x.ch)-order.indexOf(y.ch));
}
function buildSec(sub,e){
  const all=poolAll(sub,e),out=[],used=new Set();
  e.secs.forEach((s,si)=>{
    const groups=[];
    s.picks.forEach(p=>{
      if(p.src==="read"||p.src==="poem"){
        const ids=[...new Set(all.filter(i=>i.src===p.src).map(i=>i.pid))],pid=ids[Math.floor(Math.random()*ids.length)],ps=all.filter(i=>i.pid===pid);
        [["fill",p.wr],["mc",p.mc],["tf",p.tf],["ws",p.ws]].forEach(([t,k])=>{if(k)groups.push({its:shuf(ps.filter(i=>i.t===t)).slice(0,k),m:p.mw?p.mw[t]:undefined})});
      }else{
        const pk=spread(all.filter(i=>i.src===p.src&&(!p.t||i.t===p.t)&&!used.has(i.id)),p.n,sub);pk.forEach(i=>used.add(i.id));groups.push({its:pk,m:p.m});
      }
    });
    const explicit=groups.every(g=>g.m!=null);
    if(explicit)groups.forEach(g=>{const ew=i=>i.t==="match"?i.l.length:1,tw=g.its.reduce((a,i)=>a+ew(i),0);g.its.forEach(i=>out.push({...i,_si:si,_w:g.m*ew(i)/tw}))});
    else{const got=groups.flatMap(g=>g.its),tw=got.reduce((a,i)=>a+nw(i),0);got.forEach(i=>out.push({...i,_si:si,_w:s.marks*nw(i)/tw}))}
  });
  return out;
}
function startExam(sub,eid){
  const e=DATA[sub].exams.find(x=>x.id===eid),items=e.secs?buildSec(sub,e):shuf(pool(sub,e)).slice(0,e.n);
  Q={sub,id:e.id,title:e.title,items,i:0,res:[],t0:Date.now(),all:true,exam:e,end:Date.now()+e.min*60000};
  track("start",sub,e.id,{n:items.length,exam:true});showQ();
  stopT();T=setInterval(tick,1000);tick();
}
function tick(){
  const left=Math.max(0,Q.end-Date.now()),el=document.getElementById("tm");
  if(el)el.textContent=n(Math.floor(left/60000))+":"+String(Math.floor(left/1000)%60).padStart(2,"0").replace(/\d/g,d=>n(d));
  if(!left)done();
}
const tfl=it=>it.dir==="ltr"?["True","False"]:["صحيحة","خاطئة"];
const LT=it=>it.dir==="ltr"?"ABCD":"أبجد";
function showQ(){
  const it=Q.items[Q.i],tot=Q.items.length,ex=Q.exam&&Q.exam.secs,P=it.pid&&DATA[Q.sub].pas&&DATA[Q.sub].pas[it.pid];
  const sh=ex&&(Q.i===0||Q.items[Q.i-1]._si!==it._si)?`<p dir="${it.dir||"rtl"}" class="shd">${esc(Q.exam.secs[it._si].t)} <span>(${it.dir==="ltr"?Q.exam.secs[it._si].marks+" marks":n(Q.exam.secs[it._si].marks)+" درجة"})</span></p>`:"";
  let h=`<div class="bar"><button class="lnk" onclick="${Q.exam?"if(confirm('الخروج سيلغي الاختبار. تأكيد؟')){subj('"+Q.sub+"')}":"subj('"+Q.sub+"')"}">خروج</button>
  <span class="mu">${Q.exam?`<b id="tm"></b> · `:""}${n(Q.i+1)} من ${n(tot)}</span></div><div class="prog"><i style="width:${Q.i/tot*100}%"></i></div>
  <div class="card"${it.dir?` dir="${it.dir}"`:""}>${sh}${P?`<div class="pas${P.poem?" poem":""}"><b>${esc(P.t)}</b><br>${esc(P.p).replace(/\n/g,"<br>")}</div>`:""}<p class="q">${rich(it.q)}</p>${fig(it.fig)}`;
  if(it.t==="mc"||it.t==="tf"){
    const o=it.t==="tf"?tfl(it):it.o;
    h+=`<div class="opts">`+o.map((x,k)=>`<button class="opt" onclick="pick(${k})"><b>${it.t==="tf"?(k?"✗":"✓"):LT(it)[k]}</b><span>${typeof x==="object"?fig(x):rich(x)}</span></button>`).join("")+`</div>`;
  }else if(it.t==="fill"){
    h+=`<input id="fi" dir="${it.dir||"auto"}" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="${it.dir==="ltr"?"Type your answer":"اكتب إجابتك"}" onkeydown="if(event.key==='Enter')chk()"><p><button class="btn" onclick="chk()">تأكيد</button></p>`;
  }else if(it.t==="match"){
    h+=it.l.map((l,i)=>`<div class="mrow"><span>${n(i+1)}. ${rich(l)}</span><select id="ms${i}"><option value="">${it.dir==="ltr"?"Choose…":"اختر…"}</option>${it.r.map((r,j)=>`<option value="${j}">${esc(r.replace(/⟦([^|⟧]*)\|([^⟧]*)⟧/g,"$1/$2"))}</option>`).join("")}</select></div>`).join("")+`<p><button class="btn" onclick="chk()">تأكيد</button></p><p id="mm" class="mu"></p>`;
  }else if(it.wc){
    h+=`<textarea id="wt" class="ta" rows="9" dir="ltr" placeholder="Write here..." oninput="wcount()"></textarea><p class="mu" id="wcn" dir="ltr">Words: 0 / ${it.wc}</p><button class="btn" onclick="sol()">اعرض النموذج وقيّم نفسك</button>`;
  }else{
    h+=`<p class="mu">حاول تحلها على ورقة، وبعدين اعرض الحل النموذجي وقيّم نفسك.</p><button class="btn" onclick="sol()">اعرض الحل النموذجي</button>`;
  }
  A.innerHTML=h+`<div id="fb"></div></div>`;
  Q.tq=Date.now();Q.wait=false;
}
function wcount(){const it=Q.items[Q.i],w=document.getElementById("wt").value.trim().split(/\s+/).filter(Boolean).length;document.getElementById("wcn").textContent="Words: "+w+" / "+it.wc;Q.wcn=w}
function ansText(it){
  return it.t==="mc"?it.o[it.a]:it.t==="tf"?tfl(it)[it.a]:it.t==="fill"?it.ans:it.t==="match"?it.l.map((l,i)=>n(i+1)+" ← "+it.r[it.a[i]]).join("،  "):it.s;
}
function ansHtml(it){return it.t==="mc"&&typeof it.o[it.a]==="object"?"الاختيار ("+LT(it)[it.a]+") "+fig(it.o[it.a]):rich(ansText(it))}
function pick(k){
  if(Q.wait)return;Q.wait=true;const it=Q.items[Q.i];
  A.querySelectorAll(".opt").forEach((b,j)=>{b.disabled=true;if(!Q.exam){if(j===it.a)b.classList.add("good");else if(j===k)b.classList.add("bad")}});
  fin(k===it.a?1:0);
}
function chk(){
  if(Q.wait)return;const it=Q.items[Q.i];let p;
  if(it.t==="fill"){const v=norm(document.getElementById("fi").value);if(!v)return;p=it.acc.some(a=>norm(a)===v)?1:0;document.getElementById("fi").disabled=true}
  else{const v=it.l.map((_,i)=>document.getElementById("ms"+i).value);if(v.includes("")){document.getElementById("mm").textContent=it.dir==="ltr"?"Choose an answer for every item.":"اختر إجابة لكل بند.";return}
    p=v.filter((x,i)=>+x===it.a[i]).length/v.length;it.l.forEach((_,i)=>document.getElementById("ms"+i).disabled=true)}
  Q.wait=true;fin(p);
}
function sol(){
  if(Q.wait)return;Q.wait=true;const it=Q.items[Q.i];
  const g=it.wc?`<button class="btn" onclick="mark(1)">ممتاز: استوفيت المعايير</button><button class="btn alt" onclick="mark(.6)">جيد</button><button class="btn alt" onclick="mark(.25)">محتاج مراجعة</button>`
   :`<button class="btn" onclick="mark(1)">حليتها صح</button><button class="btn alt" onclick="mark(.5)">نصف الحل</button><button class="btn alt" onclick="mark(0)">محتاج مراجعة</button>`;
  document.getElementById("fb").innerHTML=`<div class="fb"><b>${it.wc?"Model answer:":"الحل النموذجي:"}</b> ${it.ruq?`<div class="ruq">${esc(it.s)}</div>`:rich(it.s)}${it.tip?`<p class="mu">${rich(it.tip)}</p>`:""}${fig(it.sf)}</div><p>قيّم نفسك:</p><p class="row" style="justify-content:flex-start">${g}</p>`;
}
function mark(p){Q.res.push({it:Q.items[Q.i],p,w:nw(Q.items[Q.i])});log(p,true);nx()}
function log(p,self){const it=Q.items[Q.i];track("answer",Q.sub,it.ch,{q:it.id,ok:p>=1,p:p>0&&p<1?p:undefined,wc:self&&Q.wcn?Q.wcn:undefined,ms:Date.now()-Q.tq,ex:Q.exam?Q.exam.id:undefined,self:self||undefined})}
function fin(p){
  const it=Q.items[Q.i];Q.res.push({it,p,w:nw(it)});log(p);
  if(Q.exam)return nx();
  const ok=p>=1,part=p>0&&p<1;
  document.getElementById("fb").innerHTML=`<div class="fb ${ok?"ok":"no"}"><b>${ok?"إجابة صحيحة.":part?"إجابة صحيحة جزئيًا.":"إجابة غير صحيحة."}</b>${ok?"":" الإجابة الصحيحة: "+ansHtml(it)} ${rich(it.e||"")}</div>
  <p><button class="btn" onclick="nx()">${Q.i+1>=Q.items.length?"عرض النتيجة":"السؤال التالي"}</button></p>`;
}
function nx(){Q.i++;Q.i>=Q.items.length?done():showQ()}
function done(){
  stopT();
  Q.items.slice(Q.res.length).forEach(it=>Q.res.push({it,p:0,w:nw(it)}));
  const tot=Q.res.reduce((a,r)=>a+r.w,0),sc=Q.res.reduce((a,r)=>a+r.p*r.w,0),pct=Math.round(sc/tot*100),wr=Q.res.filter(r=>r.p<1).map(r=>r.it);
  if(Q.all){const b=best(Q.sub,Q.id);if(b===null||pct>+b)LS.s("best:"+Q.sub+":"+Q.id,pct)}
  track("finish",Q.sub,Q.id,{score:r2(sc),total:r2(tot),secs:Math.round((Date.now()-Q.t0)/1000),exam:!!Q.exam});
  Q.wrong=wr;
  const st=Q.exam&&Q.exam.secs?`<div class="card"><h2>الدرجات حسب القسم</h2>`+Q.exam.secs.map((s,si)=>`<div class="mrow"><span dir="${Q.items[0].dir||"rtl"}">${esc(s.t)}</span><b>${n(r2(Q.res.filter(r=>r.it._si===si).reduce((a,r)=>a+r.p*r.w,0)))} / ${n(s.marks)}</b></div>`).join("")+`</div>`:"";
  A.innerHTML=`<div class="card"><p class="mu">${esc(Q.title)}</p><div class="score">${n(pct)}٪</div><p>${Q.exam&&Q.exam.secs?"الدرجة: "+n(r2(sc))+" من "+n(r2(tot)):"حصلت على "+n(r2(sc))+" من "+n(r2(tot))}.</p>
  <p class="row" style="justify-content:flex-start">`+
  (Q.exam?`<button class="btn" onclick="startExam('${Q.sub}','${Q.exam.id}')">أعد الاختبار بأسئلة جديدة</button>`:
   `<button class="btn" onclick="startQ('${Q.sub}',${Q.ci})">أعد التدريب</button>${wr.length?`<button class="btn alt" onclick="startQ('${Q.sub}',${Q.ci},Q.wrong)">أعد الأخطاء فقط</button>`:""}`)+
  `<button class="btn alt" onclick="subj('${Q.sub}')">رجوع</button></p></div>`+st+
  (wr.length?`<div class="card"><h2>راجع أخطاءك</h2>`+wr.map(it=>`<div class="wrong"${it.dir?` dir="${it.dir}"`:""}><b>${rich(it.q)}</b>${fig(it.fig)}<br>الإجابة الصحيحة: ${ansHtml(it)}<br><span class="mu">${rich(it.e||"")}</span></div>`).join("")+`</div>`:"");
}

S.name&&S.cls?(track("login"),hub()):gate();
