(() => {
  "use strict";
  // Demo-only client-side gate. This is a convenience lock, not strong security.
  const USERNAME = "taha";
  const PASSWORD = "taha00981388";
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const loginScreen = $("#loginScreen"), appScreen = $("#appScreen");
  const loginForm = $("#loginForm"), loginError = $("#loginError");
  const passwordInput = $("#password");
  const digits = $$(".digit");
  const state = { runs: 0, checks: 0, lastTime: 0, history: [], running: false, stop: false, startedAt: 0 };
  const fa = n => Number(n).toLocaleString("fa-IR");
  let toastTimer;
  function toast(msg) { const el=$("#toast"); el.textContent=msg; el.classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove("show"),2600); }
  function log(msg) { const p=document.createElement("p"); const s=document.createElement("span"); s.textContent="›"; p.append(s,document.createTextNode(" "+msg)); const box=$("#consoleLog"); box.appendChild(p); box.scrollTop=box.scrollHeight; while(box.children.length>8) box.removeChild(box.firstChild); }
  function showApp() { loginScreen.classList.add("hidden"); appScreen.classList.remove("hidden"); updateClock(); }
  loginForm.addEventListener("submit", e => {
    e.preventDefault(); const user=$("#username").value.trim().toLowerCase(); const pass=passwordInput.value;
    if(user===USERNAME && pass===PASSWORD){loginError.textContent=""; sessionStorage.setItem("tahaPrivateUnlocked","1"); showApp(); toast("ورود موفق؛ خوش آمدی طاها.");}
    else {loginError.textContent="نام کاربری یا رمز عبور درست نیست."; passwordInput.value=""; passwordInput.focus();}
  });
  $("#togglePassword").addEventListener("click",()=>{passwordInput.type=passwordInput.type==="password"?"text":"password";});
  $("#logoutButton").addEventListener("click",()=>{sessionStorage.removeItem("tahaPrivateUnlocked");appScreen.classList.add("hidden");loginScreen.classList.remove("hidden");passwordInput.value="";toast("از نشست خارج شدی.");});
  if(sessionStorage.getItem("tahaPrivateUnlocked")==="1") showApp();
  function updateClock(){const d=new Date();$("#clock").textContent=[d.getHours(),d.getMinutes(),d.getSeconds()].map(x=>String(x).padStart(2,"0")).join(":");}
  setInterval(updateClock,1000);
  const viewTitles={dashboard:"داشبورد",analysis:"تحلیل ترکیب‌ها",compare:"مقایسه الگوریتم‌ها",history:"تاریخچه اجرا"};
  function navigate(name){$$(".view").forEach(v=>v.classList.remove("active-view"));$("#"+name+"View").classList.add("active-view");$$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===name));$("#breadcrumbTitle").textContent=viewTitles[name];}
  $$(".nav-item").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.view)));
  $$("[data-go]").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.go)));
  digits.forEach((input,i)=>{input.addEventListener("input",()=>{input.value=input.value.replace(/[^1-9]/g,"").slice(-1);if(input.value&&i<digits.length-1)digits[i+1].focus();updateSpaceCount();});input.addEventListener("keydown",e=>{if(e.key==="Backspace"&&!input.value&&i>0)digits[i-1].focus();if(e.key==="ArrowLeft"&&i<4)digits[i+1].focus();if(e.key==="ArrowRight"&&i>0)digits[i-1].focus();});});
  $("#allowRepeats").addEventListener("change",updateSpaceCount);
  function getTarget(){return digits.map(d=>d.value).join("");}
  function validTarget(){const t=getTarget();return t.length===5&&[...t].every(c=>/[1-9]/.test(c))&&($("#allowRepeats").checked||new Set(t).size===5);}
  function totalSpace(){return $("#allowRepeats").checked?59049:15120;}
  function updateSpaceCount(){$("#checksTotal").textContent=fa(totalSpace());}
  function renderProgress(done,total,start){const pct=total?Math.min(100,done/total*100):0;$("#progressPercent").textContent=fa(Math.floor(pct))+"٪";$("#progressBar").style.width=pct+"%";const ring=$("#progressPercent").parentElement.parentElement;ring.style.background=`conic-gradient(var(--cyan) ${pct*3.6}deg, #56e6f51c 0deg)`;$("#checksNow").textContent=fa(done);$("#elapsedNow").textContent=fa((performance.now()-start).toFixed(1))+" ms";$("#speedNow").textContent=fa(Math.round(done/Math.max((performance.now()-start)/1000,.001)))+" / s";}
  function displayResult(target,msg){$("#resultDigits").innerHTML=[...target].map(d=>`<span>${d}</span>`).join("");$("#resultMessage").textContent=msg;}
  function setRunning(r){state.running=r;$("#runButton").classList.toggle("hidden",r);$("#stopButton").classList.toggle("hidden",!r);$("#engineState").innerHTML=r?"<i></i> در حال اجرا":"<i></i> آماده";$("#engineState").style.color=r?"var(--cyan)":"var(--green)";}
  function addHistory(kind,target,checks,time,result){const item={kind,target,checks,time,result,at:new Date()};state.history.unshift(item);state.runs++;state.checks+=checks;state.lastTime=time;updateStats();renderHistory();renderRecent();}
  function updateStats(){$("#statRuns").textContent=fa(state.runs);$("#statChecks").textContent=fa(state.checks);$("#statTime").textContent=state.runs?fa(state.lastTime.toFixed(1)):"—";}
  function renderHistory(){const box=$("#historyRows");if(!state.history.length){box.innerHTML='<div class="empty-state"><span>◷</span><p>تاریخچه‌ای وجود ندارد.</p><small>پس از اجرای اولین آزمایش، گزارش اینجا نمایش داده می‌شود.</small></div>';return;}box.innerHTML=state.history.map(h=>`<div class="history-row"><span>${h.kind}</span><span class="target-cell">${h.target}</span><span>${fa(h.checks)}</span><span>${fa(h.time.toFixed(2))} ms</span><span><b class="result-badge">● ${h.result}</b></span></div>`).join("");}
  function renderRecent(){const box=$("#recentActivity");if(!state.history.length)return;box.innerHTML=state.history.slice(0,3).map(h=>`<div class="activity-item"><div class="activity-icon">✓</div><div class="activity-text"><b>${h.kind} · ${h.result}</b><small>${fa(h.checks)} ترکیب بررسی شد</small></div><span class="activity-time">${h.time.toFixed(1)} ms</span></div>`).join("");}
  $("#stopButton").addEventListener("click",()=>{state.stop=true;log("Stop requested by user.");});
  $("#runButton").addEventListener("click",async()=>{
    if(state.running)return;
    const target=getTarget(), repeats=$("#allowRepeats").checked;
    if(target.length!==5||![...target].every(c=>/[1-9]/.test(c))){$("#targetError").textContent="لطفاً هر پنج رقم را با عددی بین ۱ تا ۹ پر کن.";return;}
    if(!repeats&&new Set(target).size!==5){$("#targetError").textContent="با غیرفعال بودن تکرار، هر پنج رقم باید متفاوت باشند.";return;}
    $("#targetError").textContent=""; state.stop=false; setRunning(true); displayResult("-----","در حال بررسی ترکیب‌ها…");$("#consoleLog").innerHTML="";log("Starting isolated educational search.");log("Algorithm: "+($("#algorithmSelect").value==="sequential"?"sequential":"recursive generation"));log("Repeat digits: "+(repeats?"enabled":"disabled"));
    const start=performance.now(), total=totalSpace(); let checked=0, found=false, done=false; const chosen=$("#algorithmSelect").value; let candidate=0;
    const check=(n)=>{checked++;return String(n).padStart(5,"0")===target;};
    await new Promise(resolve=>{
      const chunk=()=>{
        const chunkStart=performance.now();let loops=0;
        while(loops<1500&&performance.now()-chunkStart<7&&!done&&!state.stop){
          if(chosen==="sequential"){
            candidate++;
            let n=candidate, s="";
            for(let k=0;k<5;k++){s=String((n-1)%9+1)+s;n=Math.floor((n-1)/9);}
            if(!repeats&&new Set(s).size!==5){loops++;continue;}
            checked++; if(s===target){found=true;done=true;candidate=s;} 
          }else{
            // Generate base-9 candidates recursively in the same deterministic order,
            // implemented iteratively per chunk to keep the interface responsive.
            candidate++;
            let n=candidate,s="";
            for(let k=0;k<5;k++){s=String((n-1)%9+1)+s;n=Math.floor((n-1)/9);}
            if(!repeats&&new Set(s).size!==5){loops++;continue;}
            checked++;if(s===target){found=true;done=true;candidate=s;}
          }
          loops++;
          if(checked>=total){done=true;}
        }
        if($("#liveProgress").checked)renderProgress(Math.min(checked,total),total,start);
        if(done||state.stop){resolve();return;}
        setTimeout(chunk,0);
      };chunk();
    });
    const elapsed=performance.now()-start; setRunning(false); renderProgress(Math.min(checked,total),total,start);
    if(found){displayResult(target,"ترکیب هدف در محیط آزمایشی پیدا شد.");log("Match found: "+target);log("Checks completed: "+checked);}
    else if(state.stop){displayResult("-----","آزمایش توسط کاربر متوقف شد.");log("Run stopped.");}
    else{displayResult("-----","ترکیب در فضای جست‌وجوی انتخاب‌شده پیدا نشد.");log("No match in configured search space.");}
    const result=found?"پیدا شد":state.stop?"متوقف شد":"پیدا نشد";
    addHistory(chosen==="sequential"?"بررسی ترتیبی":"تولید بازگشتی",target,checked,elapsed,result);
    $("#engineState").innerHTML='<i></i> تکمیل شد'; toast(state.stop?"آزمایش متوقف شد.":"آزمایش به پایان رسید.");
  });
  $("#compareButton").addEventListener("click",async()=>{
    const target=getTarget(); if(!validTarget()){toast("ابتدا یک هدف معتبر در بخش تحلیل ترکیب‌ها وارد کن.");navigate("analysis");return;}
    const repeats=$("#allowRepeats").checked;
    $("#compareButton").disabled=true;$("#compareButton").textContent="در حال مقایسه…";
    const run=(recursive)=>new Promise(resolve=>{const start=performance.now();let n=0,found=false;const total=totalSpace();function chunk(){let loops=0,chunkStart=performance.now();while(loops<2500&&performance.now()-chunkStart<7&&n<total&&!found){n++;let x=n,s="";for(let k=0;k<5;k++){s=String((x-1)%9+1)+s;x=Math.floor((x-1)/9);}if(!repeats&&new Set(s).size!==5){loops++;continue;}if(s===target)found=true;loops++;}if(found||n>=total){resolve({time:performance.now()-start,checks:n,found});}else setTimeout(chunk,0);}chunk();});
    // Each algorithm is timed independently; both enumerate the same finite sample space.
    const seq=await run(false); const rec=await run(true); 
    $("#seqTime").innerHTML=seq.time.toFixed(2)+'<small>ms</small>';$("#recTime").innerHTML=rec.time.toFixed(2)+'<small>ms</small>';
    $("#seqChecks").textContent=fa(seq.checks);$("#recChecks").textContent=fa(rec.checks);
    const max=Math.max(seq.time,rec.time,.01);$("#seqBar").style.width=(seq.time/max*100)+"%";$("#recBar").style.width=(rec.time/max*100)+"%";$("#chartSeq").style.height=Math.max(4,seq.time/max*100)+"%";$("#chartRec").style.height=Math.max(4,rec.time/max*100)+"%";
    log("Benchmark completed. Sequential: "+seq.time.toFixed(3)+" ms; recursive label: "+rec.time.toFixed(3)+" ms.");
    addHistory("مقایسه الگوریتم‌ها",target,seq.checks+rec.checks,seq.time+rec.time,"تکمیل شد");
    $("#compareButton").disabled=false;$("#compareButton").innerHTML='اجرای مقایسه <span class="button-arrow">↙</span>';toast("مقایسه عملکرد تکمیل شد.");
  });
  $("#clearHistory").addEventListener("click",()=>{state.history=[];state.runs=0;state.checks=0;state.lastTime=0;updateStats();renderHistory();renderRecent();toast("تاریخچه این نشست پاک شد.");});
  updateSpaceCount();
})();
if ("serviceWorker" in navigator && location.protocol !== "file:") { window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {})); }
