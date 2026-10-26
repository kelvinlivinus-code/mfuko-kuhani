/* Mfuko wa Kuhani COT: kiunganishi cha tovuti na Supabase (kuingia, hifadhidata, nembo, kupakua). */
(function(){
"use strict";
const CFG=window.MFUKO_CONFIG||{};
const SITE=window.SITE={role:null,email:"",name:"",uid:null,sb:null};
let ready;const readyP=new Promise(r=>ready=r);
window.claude={use:async n=>{await readyP;return(SITE.caps||{})[n]||null;}};

/* ---------- auth screen ---------- */
const css=`.auth{position:fixed;inset:0;z-index:100;background:var(--bg,#f8f5ec);display:grid;place-items:center;padding:24px 16px;overflow:auto;font-family:"Quicksand","Nunito","Segoe UI",Tahoma,sans-serif;color:var(--ink,#2c3e4c)}
.auth[hidden]{display:none}
.auth .box{width:min(420px,100%);background:var(--surface,#fffdf7);border:1px solid var(--line,#e3ddcf);border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,.12);padding:28px 26px;display:flex;flex-direction:column;gap:14px}
.auth .crest{width:92px;height:92px;margin:0 auto;border-radius:14px;background:#fff;border:1px solid #d8e3ea;display:grid;place-items:center;font:700 1.2rem inherit;color:var(--olive,#1d4f73);overflow:hidden}
.auth .crest img{width:88%;height:88%;object-fit:contain}
.auth h1{margin:0;text-align:center;font-size:1.25rem;letter-spacing:.08em;text-transform:uppercase;color:var(--olive,#1d4f73)}
.auth p{margin:0;text-align:center;color:var(--muted,#5f6f7c)}
.auth label{display:flex;flex-direction:column;gap:4px;font-size:.88rem;font-weight:600;color:var(--muted,#5f6f7c)}
.auth input{font:inherit;color:inherit;background:var(--bg,#f8f5ec);border:1px solid var(--line,#e3ddcf);border-radius:6px;padding:10px 12px}
.auth input:focus{outline:2px solid var(--olive,#1d4f73);border-color:transparent}
.auth .go{font:inherit;font-weight:600;cursor:pointer;border:0;border-radius:999px;padding:11px;background:var(--userbtn,#1f5f8b);color:#fff}
.auth .go[disabled]{opacity:.6}
.auth .links{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}
.auth .links button{all:unset;cursor:pointer;color:var(--olive,#1d4f73);font-weight:600;font-size:.92rem}
.auth .msg{font-size:.92rem;text-align:center;min-height:1.2em}
.auth .msg.err{color:var(--bad,#c23a3a)} .auth .msg.ok{color:var(--ok,#23824a)}`;
const st=document.createElement("style");st.textContent=css;document.head.append(st);
const wrap=document.createElement("div");wrap.className="auth";wrap.hidden=true;
function el(tag,attrs,...kids){const e=document.createElement(tag);for(const [k,v] of Object.entries(attrs||{})){if(k.startsWith("on"))e.addEventListener(k.slice(2),v);else e.setAttribute(k,v);}kids.forEach(c=>e.append(c instanceof Node?c:document.createTextNode(c)));return e;}
function field(label,id,type,ac){return el("label",{for:id},label,el("input",{id,type,autocomplete:ac,required:""}));}
function showAuth(mode,info){
  const box=el("div",{class:"box"});const msg=el("p",{class:"msg",role:"status"});
  const crest=el("div",{class:"crest","aria-hidden":"true"},el("img",{src:"nembo.svg",alt:""}));
  box.append(crest,el("h1",{},"Mfuko wa Kuhani COT"));
  const say=(t,k)=>{msg.textContent=t;msg.className="msg "+(k||"");};
  const form=(fields,btnText,onSubmit,links)=>{const f=el("form",{novalidate:""});f.style.cssText="display:flex;flex-direction:column;gap:12px";fields.forEach(x=>f.append(x));
    const b=el("button",{class:"go",type:"submit"},btnText);f.append(b,msg);
    f.addEventListener("submit",async e=>{e.preventDefault();b.disabled=true;say("");try{await onSubmit(f);}catch(err){say(err.message||String(err),"err");}b.disabled=false;});
    box.append(f);if(links)box.append(el("div",{class:"links"},...links));};
  const val=id=>document.getElementById(id).value.trim();
  const link=(t,m)=>el("button",{type:"button",onclick:()=>showAuth(m)},t);
  if(mode==="setup"){box.append(el("p",{},"Tovuti bado haijaunganishwa na hifadhidata. Fungua faili config.js uweke anwani ya Supabase na ufunguo wa umma (anon key), kama maelekezo yanavyoeleza."));}
  else if(mode==="login"){box.append(el("p",{},"Ingia kwa barua pepe na neno la siri"));
    form([field("Barua pepe","a_email","email","username"),field("Neno la siri","a_pass","password","current-password")],"Ingia",async()=>{
      const {data,error}=await SITE.sb.auth.signInWithPassword({email:val("a_email"),password:document.getElementById("a_pass").value});
      if(error)throw new Error(/confirm/i.test(error.message)?"Thibitisha barua pepe yako kwanza kupitia kiungo tulichokutumia.":"Barua pepe au neno la siri si sahihi.");
      await afterLogin(data.user);},[link("Jisajili","register"),link("Umesahau neno la siri?","forgot")]);}
  else if(mode==="register"){box.append(el("p",{},"Fungua akaunti. Msimamizi wa mfuko ataidhinisha kabla hujaona taarifa."));
    form([field("Jina kamili","a_name","text","name"),field("Barua pepe","a_email","email","username"),field("Neno la siri (herufi 8 au zaidi)","a_pass","password","new-password")],"Jisajili",async()=>{
      const pass=document.getElementById("a_pass").value;if(pass.length<8)throw new Error("Neno la siri liwe na herufi 8 au zaidi.");if(!val("a_name"))throw new Error("Andika jina lako kamili.");
      const {data,error}=await SITE.sb.auth.signUp({email:val("a_email"),password:pass,options:{data:{full_name:val("a_name")},emailRedirectTo:location.href.split("#")[0]}});
      if(error)throw new Error(/registered/i.test(error.message)?"Barua pepe hii tayari imesajiliwa. Ingia.":"Usajili haukufanikiwa: "+error.message);
      if(data.session)await afterLogin(data.user);else say("Tumekutumia barua pepe. Bofya kiungo kilichomo ili kuthibitisha, kisha uingie.","ok");},[link("Nina akaunti tayari","login")]);}
  else if(mode==="forgot"){box.append(el("p",{},"Andika barua pepe yako. Tutakutumia kiungo cha kuweka neno jipya la siri."));
    form([field("Barua pepe","a_email","email","username")],"Tuma kiungo",async()=>{const {error}=await SITE.sb.auth.resetPasswordForEmail(val("a_email"),{redirectTo:location.href.split("#")[0]});if(error)throw new Error("Haikutumwa: "+error.message);say("Kiungo kimetumwa. Angalia barua pepe yako.","ok");},[link("Rudi kuingia","login")]);}
  else if(mode==="newpass"){box.append(el("p",{},"Weka neno jipya la siri"));
    form([field("Neno jipya la siri","a_pass","password","new-password")],"Hifadhi",async()=>{const p=document.getElementById("a_pass").value;if(p.length<8)throw new Error("Neno la siri liwe na herufi 8 au zaidi.");const {data,error}=await SITE.sb.auth.updateUser({password:p});if(error)throw new Error(error.message);await afterLogin(data.user);});}
  else if(mode==="pending"){box.append(el("p",{},`Akaunti yako (${info||""}) imesajiliwa lakini inasubiri kuidhinishwa na msimamizi wa mfuko. Ukishaidhinishwa, pakia ukurasa upya.`),
    el("button",{class:"go",type:"button",onclick:()=>location.reload()},"Pakia upya"),el("div",{class:"links"},el("button",{type:"button",onclick:logout},"Toka")));}
  if(window.setLang)box.append(el("div",{class:"links",style:"margin-top:14px"},el("button",{type:"button",onclick:()=>setLang(window.MFUKO_LANG==="en"?"sw":"en")},window.MFUKO_LANG==="en"?"Kiswahili":"English")));
  wrap.replaceChildren(box);wrap.hidden=false;
  setTimeout(()=>{const i=wrap.querySelector("input");i&&i.focus();},30);}
async function logout(){try{await SITE.sb.auth.signOut();}catch(e){}location.reload();}
SITE.logout=logout;

/* ---------- data store over Supabase ---------- */
function mapErr(e){const c=e&&(e.code||"");if(c==="42501"||/row-level security|permission/i.test(e&&e.message||""))return{code:"invalid_argument",message:e.message};return{code:"unavailable",message:(e&&e.message)||"unavailable"};}
const newId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
function mkDb(sb){const cols=new Map(),subs=new Set();const get=c=>{if(!cols.has(c))cols.set(c,new Map());return cols.get(c);};
  let t=0;const notify=()=>{if(t)return;t=setTimeout(()=>{t=0;subs.forEach(f=>f());},0);};
  async function loadAll(){for(let from=0;;from+=1000){const {data,error}=await sb.from("docs").select("col,id,data").range(from,from+999);if(error)throw mapErr(error);data.forEach(r=>get(r.col).set(r.id,r.data));if(data.length<1000)break;}}
  function live(){sb.channel("docs-live").on("postgres_changes",{event:"*",schema:"public",table:"docs"},p=>{if(p.eventType==="DELETE"){if(p.old&&p.old.col)get(p.old.col).delete(p.old.id);}else if(p.new&&p.new.col)get(p.new.col).set(p.new.id,p.new.data);notify();}).subscribe();
    document.addEventListener("visibilitychange",async()=>{if(document.visibilityState==="visible"){try{cols.clear();await loadAll();notify();}catch(e){}}});}
  const docRef=(c,id)=>({id,path:c+"/"+id,
    get:async()=>{const m=get(c);return{id,exists:m.has(id),data:()=>m.get(id)};},
    set:async d=>{const {error}=await sb.from("docs").upsert({col:c,id,data:d,updated_at:new Date().toISOString(),updated_by:SITE.uid});if(error)throw mapErr(error);get(c).set(id,d);notify();},
    delete:async()=>{const {error}=await sb.from("docs").delete().eq("col",c).eq("id",id);if(error)throw mapErr(error);get(c).delete(id);notify();},
    onSnapshot:next=>{const f=()=>{const m=get(c);next({id,exists:m.has(id),data:()=>m.get(id),metadata:{}});};subs.add(f);f();return()=>subs.delete(f);}});
  const colRef=c=>({path:c,doc:id=>docRef(c,id||newId()),add:async d=>{const r=docRef(c,newId());await r.set(d);return r;},
    onSnapshot:next=>{const f=()=>{const m=get(c);const docs=[...m].map(([id,d])=>({id,exists:true,data:()=>d,metadata:{}}));next({docs,size:docs.length,empty:!docs.length,docChanges:()=>[],metadata:{}});};subs.add(f);f();return()=>subs.delete(f);}});
  return{doc:p=>{const [c,id]=p.split("/");return docRef(c,id);},collection:colRef,loadAll,live,_cols:cols};}

/* ---------- capabilities the app uses ---------- */
function caps(sb,db){const write=["msimamizi","mhazini","malipo","katibu"].includes(SITE.role);
  return{db,
    user:{id:async()=>SITE.uid,canEdit:async()=>write,can:async()=>write,isOwner:async()=>SITE.role==="msimamizi",me:async()=>({id:SITE.uid,name:SITE.name,email:SITE.email,isOwner:SITE.role==="msimamizi",canEdit:write})},
    assets:SITE.role==="msimamizi"?{upload:async file=>{const ext=(file.name.split(".").pop()||"png").toLowerCase().replace(/[^a-z0-9]/g,"");const path=`nembo-${Date.now()}.${ext}`;
      const {error}=await sb.storage.from("nembo").upload(path,file,{upsert:true,contentType:file.type});if(error)throw{code:"unavailable",message:error.message};return{id:path,url:SITE.logoUrl(path)};}}:null,
    downloads:{save:async({filename,data})=>{const blob=data instanceof Blob?data:new Blob([data],{type:/\.json$/.test(filename)?"application/json":"text/csv;charset=utf-8"});
      const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=filename;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500);return{status:"saved"};}}};}
SITE.logoUrl=path=>SITE.sb?SITE.sb.storage.from("nembo").getPublicUrl(path).data.publicUrl:"";

/* ---------- users admin (msimamizi) ---------- */
SITE.listUsers=async()=>{const {data,error}=await SITE.sb.from("profiles").select("*").order("created_at",{ascending:true});if(error)throw mapErr(error);return data;};
SITE.setMember=async(uid,member_id)=>{const {error}=await SITE.sb.from("profiles").update({member_id}).eq("user_id",uid);if(error)throw mapErr(error);};
SITE.setRole=async(uid,role)=>{const {error}=await SITE.sb.from("profiles").update({role}).eq("user_id",uid);if(error)throw mapErr(error);};

/* ---------- import a backup (JSON exported from the system) ---------- */
SITE.importBackup=async(obj,onProgress)=>{const COLS=["members","payments","events","loans","projects","cabinet","meetings","notices","ledger"];const rows=[];
  if(obj.settings){const {logoId,...st}=obj.settings;rows.push({col:"config",id:"settings",data:st});}if(obj.about)rows.push({col:"config",id:"about",data:obj.about});
  for(const c of COLS)for(const r of obj[c]||[]){const {id,...d}=r;if(id)rows.push({col:c,id:String(id),data:d});}
  for(let i=0;i<rows.length;i+=200){const {error}=await SITE.sb.from("docs").upsert(rows.slice(i,i+200).map(r=>({...r,updated_at:new Date().toISOString(),updated_by:SITE.uid})));if(error)throw mapErr(error);onProgress&&onProgress(Math.min(rows.length,i+200),rows.length);}
  return rows.length;};

/* ---------- boot ---------- */
async function afterLogin(u){SITE.uid=u.id;SITE.email=u.email||"";
  const {data:prof,error}=await SITE.sb.from("profiles").select("*").eq("user_id",u.id).maybeSingle();
  if(error)throw new Error("Imeshindwa kusoma akaunti yako. Jaribu tena.");
  if(!prof||prof.role==="anasubiri"){showAuth("pending",u.email);return;}
  SITE.role=prof.role;SITE.memberId=prof.member_id||"";SITE.name=prof.full_name||"";
  const db=mkDb(SITE.sb);await db.loadAll();db.live();SITE.caps=caps(SITE.sb,db);wrap.hidden=true;ready();}
async function boot(){document.body.append(wrap);
  if(!CFG.supabaseUrl||!CFG.supabaseAnonKey||!window.supabase){showAuth("setup");return;}
  SITE.sb=window.supabase.createClient(CFG.supabaseUrl,CFG.supabaseAnonKey);
  let recovering=/type=recovery/.test(location.hash);
  SITE.sb.auth.onAuthStateChange(ev=>{if(ev==="PASSWORD_RECOVERY"){recovering=true;showAuth("newpass");}});
  const {data:{session}}=await SITE.sb.auth.getSession();
  if(recovering){showAuth("newpass");return;}
  if(!session){showAuth("login");return;}
  try{await afterLogin(session.user);}catch(e){showAuth("login");}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
