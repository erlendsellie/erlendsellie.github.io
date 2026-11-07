const COLORS=['#7db7ff','#ffb86b','#87e39b','#d7a5ff','#ff86a8','#74d9d0','#f0d26f','#a7b0ff','#e7a6ff','#9be073','#f4a261','#71c8ff'];
const STORAGE_KEY='ballistikk-state-v3';
const CLICK_MOA=0.25;
const loads=[
  {id:'jm120',cal:'6.5x55',type:'training',name:'Norma Jaktmatch Elektron 7,8 g / 120 gr',short:'JM 120',v0:820,bc:.428,mass:7.8,badge:'eldre',badgeClass:'old',source:'Norma eldre katalog'},
  {id:'jm124',cal:'6.5x55',type:'training',name:'Norma Jaktmatch 8,0 g / 124 gr',short:'JM 124',v0:820,bc:.331,mass:8.0,source:'Norma'},
  {id:'gt13065',cal:'6.5x55',type:'training',name:'Norma Golden Target 8,4 g / 130 gr',short:'GT 130',v0:830,bc:.548,mass:8.42,badge:'match',badgeClass:'new',source:'Norma'},
  {id:'gt14365',cal:'6.5x55',type:'training',name:'Norma Golden Target 9,27 g / 143 gr',short:'GT 143',v0:810,bc:.635,mass:9.27,badge:'match',badgeClass:'new',source:'Norma'},
  {id:'oryx65',cal:'6.5x55',type:'hunting',name:'Norma Oryx 10,1 g / 156 gr',short:'Oryx 156',v0:760,bc:.348,mass:10.1,source:'Norma'},
  {id:'oryxs65',cal:'6.5x55',type:'hunting',name:'Norma Oryx Silencer 10,1 g / 156 gr',short:'Oryx Sil.',v0:780,bc:.348,mass:10.1,badge:'utgått 2026',badgeClass:'old',source:'Norma'},
  {id:'vulkan65',cal:'6.5x55',type:'hunting',name:'Norma Vulkan 10,1 g / 156 gr',short:'Vulkan',v0:760,bc:.354,mass:10.1,source:'Norma'},
  {id:'whitetail65',cal:'6.5x55',type:'hunting',name:'Norma Whitetail 10,1 g / 156 gr',short:'Whitetail',v0:770,bc:.276,mass:10.1,source:'Norma'},
  {id:'evo65',cal:'6.5x55',type:'hunting',name:'Norma EVOSTRIKE 6,0 g / 93 gr',short:'EVOSTRIKE',v0:1000,bc:.309,mass:6.0,badge:'utgått 2026',badgeClass:'old',source:'Norma'},
  {id:'odin65',cal:'6.5x55',type:'hunting',name:'Norma ODIN 7,8 g / 120 gr',short:'ODIN 120',v0:860,bc:.350,mass:7.8,badge:'ny 2026',badgeClass:'new',source:'Norma'},
  {id:'jm308',cal:'308',type:'training',name:'Norma Jaktmatch 9,7 g / 150 gr',short:'JM .308',v0:810,bc:.423,mass:9.7,source:'Norma'},
  {id:'gt168308',cal:'308',type:'training',name:'Norma Golden Target 10,9 g / 168 gr',short:'GT 168',v0:800,bc:.424,mass:10.9,badge:'match',badgeClass:'new',source:'Norma'},
  {id:'gt175308',cal:'308',type:'training',name:'Norma Golden Target 11,3 g / 175 gr',short:'GT 175',v0:790,bc:.547,mass:11.3,badge:'match',badgeClass:'new',source:'Norma'},
  {id:'oryx308',cal:'308',type:'hunting',name:'Norma Oryx 11,7 g / 180 gr',short:'Oryx .308',v0:796,bc:.354,mass:11.7,source:'Norma'},
  {id:'eco308',cal:'308',type:'hunting',name:'Norma ECOSTRIKE 9,7 g / 150 gr',short:'ECO .308',v0:860,bc:.376,mass:9.7,source:'Norma'},
  {id:'tip308',cal:'308',type:'hunting',name:'Norma TIPSTRIKE 11,0 g / 170 gr',short:'TIP .308',v0:800,bc:.454,mass:11.0,source:'Norma'},
  {id:'bond308',cal:'308',type:'hunting',name:'Norma BONDSTRIKE 11,7 g / 180 gr',short:'BOND .308',v0:800,bc:.615,mass:11.7,source:'Norma'},
  {id:'odin150308',cal:'308',type:'hunting',name:'Norma ODIN 9,7 g / 150 gr',short:'ODIN 150',v0:870,bc:.419,mass:9.7,badge:'ny 2026',badgeClass:'new',source:'Norma'},
  {id:'odin162308',cal:'308',type:'hunting',name:'Norma ODIN 10,5 g / 162 gr',short:'ODIN 162',v0:825,bc:.416,mass:10.5,badge:'ny 2026',badgeClass:'new',source:'Norma'},
  {id:'tac22',cal:'22lr',type:'training',name:'Norma TAC-22 2,6 g / 40 gr',short:'TAC-22',v0:330,bc:.132,mass:2.6,source:'Norma'},
  {id:'bio22',cal:'22lr',type:'training',name:'Norma Biathlon Match-22 2,6 g / 40 gr',short:'Biathlon',v0:320,bc:.135,mass:2.6,source:'Norma'},
  {id:'match22',cal:'22lr',type:'training',name:'Norma Match-22 2,6 g / 40 gr',short:'Match-22',v0:330,bc:.1062,bcInferred:true,mass:2.6,source:'Effektiv G1 fra Norma V0/V100'},
  {id:'sub22',cal:'22lr',type:'training',name:'Norma Subsonic-22 2,6 g / 40 gr',short:'Subsonic',v0:315,bc:.1103,bcInferred:true,mass:2.6,source:'Effektiv G1 fra Norma V0/V100'}
];
const CAL_NAMES={'6.5x55':'6,5×55 SE','308':'.308 Winchester','22lr':'.22 LR'};
const DEFAULT_LOADS={'6.5x55':['jm120','jm124','oryx65'],'308':['jm308','gt168308','gt175308'],'22lr':['tac22','match22']};
const G1=[[4230,1.477404177730177e-4,1.9565],[3680,1.920339268755614e-4,1.925],[3450,2.894751026819746e-4,1.875],[3295,4.349905111115636e-4,1.825],[3130,6.520421871892662e-4,1.775],[2960,9.748073694078696e-4,1.725],[2830,1.453721560187286e-3,1.675],[2680,2.162887202930376e-3,1.625],[2460,3.209559783129881e-3,1.575],[2225,3.904368218691249e-3,1.55],[2015,3.222942271262336e-3,1.575],[1890,2.203329542297809e-3,1.625],[1810,1.511001028891904e-3,1.675],[1730,8.609957592468259e-4,1.75],[1595,4.086146797305117e-4,1.85],[1520,1.954473210037398e-4,1.95],[1420,5.431896266462351e-5,2.125],[1360,8.847742581674416e-6,2.375],[1315,1.456922328720298e-6,2.625],[1280,2.419485191895565e-7,2.875],[1220,1.657956321067612e-8,3.25],[1185,4.745469537157371e-10,3.75],[1150,1.379746590025088e-11,4.25],[1100,4.070157961147882e-13,4.75],[1060,2.938236954847331e-14,5.125],[1025,1.228597370774746e-14,5.25],[980,2.916938264100495e-14,5.125],[945,3.855099424807451e-13,4.75],[905,1.185097045689854e-11,4.25],[860,3.566129470974951e-10,3.75],[810,1.045513263966272e-8,3.25],[780,1.291159200846216e-7,2.875],[750,6.824429329105383e-7,2.625],[700,3.569169672385163e-6,2.375],[640,1.839015095899579e-5,2.125],[600,5.71117468873424e-5,1.95],[550,9.226557091973427e-5,1.875],[250,9.337991957131389e-5,1.875],[100,7.225247327590413e-5,1.925],[65,5.792684957074546e-5,1.975],[0,5.206214107320588e-5,2]];
const g=9.80665,$=id=>document.getElementById(id);
let currentSeries=[];
const chartStates=new Map();

function defaultState(){
  return {
    profiles:[{id:'rifle-65',name:'6,5×55-rifle',caliber:'6.5x55',zero:100,sight:40,selectedLoadIds:[...DEFAULT_LOADS['6.5x55']],primaryLoadId:'jm120'}],
    activeProfileId:'rifle-65',
    ui:{typeFilter:'all',wind:12,windAngle:90,temp:15,pressure:1013,v0Offset:0,maxRange:300,readRange:150}
  };
}
function loadState(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    if(!raw)return defaultState();
    const parsed=JSON.parse(raw);
    if(!parsed||!Array.isArray(parsed.profiles)||!parsed.profiles.length)return defaultState();
    parsed.ui={...defaultState().ui,...(parsed.ui||{})};
    parsed.profiles=parsed.profiles.map((p,i)=>({
      id:p.id||`profile-${Date.now()}-${i}`,
      name:p.name||`Profil ${i+1}`,
      caliber:CAL_NAMES[p.caliber]?p.caliber:'6.5x55',
      zero:clamp(p.zero,10,500,100),
      sight:clamp(p.sight,0,120,40),
      selectedLoadIds:Array.isArray(p.selectedLoadIds)?p.selectedLoadIds.filter(id=>loads.some(l=>l.id===id&&l.cal===(CAL_NAMES[p.caliber]?p.caliber:'6.5x55'))):[],
      primaryLoadId:p.primaryLoadId||null
    }));
    if(!parsed.profiles.some(p=>p.id===parsed.activeProfileId))parsed.activeProfileId=parsed.profiles[0].id;
    return parsed;
  }catch{return defaultState()}
}
let state=loadState();
function activeProfile(){return state.profiles.find(p=>p.id===state.activeProfileId)||state.profiles[0]}
function saveState(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));const el=$('saveState');if(el){el.textContent='Lagret lokalt';el.classList.remove('dirty')}}catch{const el=$('saveState');if(el)el.textContent='Kunne ikke lagre'}
}
function markDirty(){const el=$('saveState');if(el){el.textContent='Lagrer…';el.classList.add('dirty')}}
function transition(fn){
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(document.startViewTransition&&!reduce)return document.startViewTransition(fn);
  fn();return null;
}
function clamp(v,min,max,fallback){v=Number(v);return Number.isFinite(v)?Math.min(max,Math.max(min,v)):fallback}
function fmt(n,d=2){return Number(n).toLocaleString('nb-NO',{minimumFractionDigits:d,maximumFractionDigits:d})}
function densityFactor(){let p=clamp($('pressure').value,750,1100,1013.25),t=clamp($('temp').value,-40,50,15);return(p/1013.25)*(288.15/(273.15+t))}
function retard(sp,bc){let fps=sp/0.3048;for(const[th,A,M]of G1){if(fps>th)return A*Math.pow(fps,M)/bc*0.3048*densityFactor()}return 0}
function deriv(s,bc,wind){let[x,y,z,vx,vy,vz]=s,rx=vx,ry=vy,rz=vz-wind,sp=Math.hypot(rx,ry,rz),am=retard(sp,bc);if(sp<1e-9)return[vx,vy,vz,0,-g,0];return[vx,vy,vz,-am*rx/sp,-am*ry/sp-g,-am*rz/sp]}
function add(a,b,k=1){return a.map((v,i)=>v+b[i]*k)}
function rk4(s,dt,bc,wind){let k1=deriv(s,bc,wind),k2=deriv(add(s,k1,dt/2),bc,wind),k3=deriv(add(s,k2,dt/2),bc,wind),k4=deriv(add(s,k3,dt),bc,wind);return s.map((v,i)=>v+dt*(k1[i]+2*k2[i]+2*k3[i]+k4[i])/6)}
function simulate(load,angle,wind,maxX){let dt=load.cal==='22lr'?.0005:.001,v0=Math.max(50,load.v0+clamp($('v0Offset').value,-150,150,0)),s=[0,0,0,v0*Math.cos(angle),v0*Math.sin(angle),0],out=[s.slice()],guard=0;while(s[0]<maxX+3&&s[1]>-300&&guard++<4000000){s=rk4(s,dt,load.bc,wind);out.push(s.slice())}return out}
function atX(rec,x){if(x<=0)return rec[0];let lo=0,hi=rec.length-1;while(lo+1<hi){let m=(lo+hi)>>1;if(rec[m][0]<x)lo=m;else hi=m}let a=rec[lo],b=rec[hi],den=b[0]-a[0],t=den?(x-a[0])/den:0;return a.map((v,i)=>v+(b[i]-a[i])*t)}
function zeroAngle(load,zero,h){let lo=-.08,hi=.12;for(let n=0;n<42;n++){let m=(lo+hi)/2,rec=simulate(load,m,0,zero),y=atX(rec,zero)[1];if(y<h)lo=m;else hi=m}return(lo+hi)/2}
function solve(load,maxRange,step=5){let p=activeProfile(),zero=clamp(p.zero,10,500,100),h=clamp(p.sight,0,120,40)/1000,windRaw=clamp($('wind').value,-60,60,12),wind=windRaw*Math.sin(clamp($('windAngle').value,0,180,90)*Math.PI/180),ang=zeroAngle(load,zero,h),rec=simulate(load,ang,wind,maxRange),rows=[];for(let x=0;x<=maxRange+.001;x+=step){let s=atX(rec,x),vel=Math.hypot(s[3],s[4],s[5]),energy=.5*(load.mass/1000)*vel*vel;rows.push({x,drop:(s[1]-h)*1000,wind:s[2]*1000,vel,energy})}return rows}
function interp(rows,x,key){x=Math.max(0,Math.min(rows[rows.length-1].x,x));let i=Math.min(rows.length-2,Math.max(0,Math.floor(x/5))),a=rows[i],b=rows[i+1]||a,t=(x-a.x)/(b.x-a.x||1);return a[key]+(b[key]-a[key])*t}
function angleMoa(mm,rangeM){if(!rangeM)return 0;return Math.atan((mm/1000)/rangeM)*180/Math.PI*60}
function dialForImpact(mm,rangeM,axis){
  const raw=angleMoa(mm,rangeM),mag=Math.abs(raw),clicks=Math.round(mag/CLICK_MOA),clicked=clicks*CLICK_MOA;
  let dir='';
  if(axis==='elev')dir=mm<0?'UP':mm>0?'DOWN':'HOLD';
  else dir=mm>0?'LEFT':mm<0?'RIGHT':'HOLD';
  return{raw,mag,dir,clicks,clicked};
}
function niceRange(vals,key){let arr=vals.flatMap(s=>s.rows.map(r=>r[key])).filter(Number.isFinite),min=Math.min(...arr),max=Math.max(...arr);if(key!=='vel'&&key!=='energy'){min=Math.min(0,min);max=Math.max(0,max)}if(max-min<1){max+=1;min-=1}let pad=(max-min)*.1;return[min-pad,max+pad]}
function drawChart(canvas,series,key,yLabel,unit,hoverX=null){if(!series.length)return;let ctx=canvas.getContext('2d'),W=canvas.width,H=canvas.height,p={l:66,r:20,t:18,b:40},[min,max]=niceRange(series,key),maxX=Math.max(1,...series.flatMap(s=>s.rows.map(r=>r.x))),X=x=>p.l+(W-p.l-p.r)*(x/maxX),Y=y=>p.t+(H-p.t-p.b)*(1-(y-min)/(max-min));ctx.clearRect(0,0,W,H);ctx.fillStyle='#0f1318';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#2e3742';ctx.lineWidth=1;ctx.fillStyle='#9aa5b1';ctx.font='12px system-ui';ctx.textBaseline='middle';for(let i=0;i<=5;i++){let x=maxX*i/5,px=X(x);ctx.beginPath();ctx.moveTo(px,p.t);ctx.lineTo(px,H-p.b);ctx.stroke();ctx.fillText(Math.round(x)+' m',px-13,H-17)}for(let i=0;i<=5;i++){let y=min+(max-min)*i/5,py=Y(y);ctx.beginPath();ctx.moveTo(p.l,py);ctx.lineTo(W-p.r,py);ctx.stroke();let display=key==='drop'||key==='wind'?(y/10).toFixed(1):Math.round(y);ctx.fillText(display,7,py)}if(min<0&&max>0){ctx.strokeStyle='#78828e';ctx.beginPath();ctx.moveTo(p.l,Y(0));ctx.lineTo(W-p.r,Y(0));ctx.stroke()}series.forEach((s,idx)=>{ctx.strokeStyle=COLORS[idx%COLORS.length];ctx.lineWidth=2.5;ctx.beginPath();s.rows.forEach((r,i)=>{let px=X(r.x),py=Y(r[key]);i?ctx.lineTo(px,py):ctx.moveTo(px,py)});ctx.stroke()});ctx.save();ctx.translate(17,H/2);ctx.rotate(-Math.PI/2);ctx.fillStyle='#9aa5b1';ctx.fillText(yLabel+' ('+unit+')',0,0);ctx.restore();if(hoverX!=null){let px=X(hoverX);ctx.strokeStyle='#d5dce5aa';ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(px,p.t);ctx.lineTo(px,H-p.b);ctx.stroke();ctx.setLineDash([]);series.forEach((s,idx)=>{let py=Y(interp(s.rows,hoverX,key));ctx.fillStyle=COLORS[idx%COLORS.length];ctx.beginPath();ctx.arc(px,py,4,0,Math.PI*2);ctx.fill()})}chartStates.set(canvas,{series,key,yLabel,unit,p,maxX,X})}
function valueText(key,v){if(key==='drop'||key==='wind')return(v/10).toFixed(1)+' cm';if(key==='vel')return Math.round(v)+' m/s';return Math.round(v)+' J'}
function tooltipHTML(st,x){return'<div class="tt-range">'+Math.round(x)+' m</div>'+st.series.map((s,i)=>'<div class="tt-row"><span class="tt-name"><span class="sw" style="background:'+COLORS[i%COLORS.length]+'"></span>'+s.load.short+'</span><strong>'+valueText(st.key,interp(s.rows,x,st.key))+'</strong></div>').join('')}
function bindChart(canvas,tip){let pinned=false;function eventX(e){let r=canvas.getBoundingClientRect(),cx=(e.clientX-r.left)*(canvas.width/r.width),st=chartStates.get(canvas),raw=(cx-st.p.l)/(canvas.width-st.p.l-st.p.r)*st.maxX;return Math.max(0,Math.min(st.maxX,Math.round(raw/5)*5))}function show(e,force=false){if(pinned&&!force)return;let st=chartStates.get(canvas);if(!st)return;let x=eventX(e);drawChart(canvas,st.series,st.key,st.yLabel,st.unit,x);tip.innerHTML=tooltipHTML(st,x);let r=canvas.getBoundingClientRect(),w=canvas.parentElement.getBoundingClientRect(),px=st.X(x)*(r.width/canvas.width)+(r.left-w.left);tip.style.left=Math.min(Math.max(6,px+12),Math.max(6,w.width-250))+'px';tip.style.top='14px';tip.style.display='block'}canvas.addEventListener('pointermove',show);canvas.addEventListener('pointerleave',()=>{if(!pinned){let st=chartStates.get(canvas);if(st)drawChart(canvas,st.series,st.key,st.yLabel,st.unit);tip.style.display='none'}});canvas.addEventListener('click',e=>{pinned=!pinned;show(e,true);if(!pinned)tip.style.display='none'})}

function renderProfiles(){
  const sel=$('profileSelect');sel.innerHTML='';
  for(const p of state.profiles){const o=document.createElement('option');o.value=p.id;o.textContent=`${p.name} · ${CAL_NAMES[p.caliber]}`;sel.appendChild(o)}
  sel.value=activeProfile().id;
}
function normalizeProfileSelection(p){
  p.selectedLoadIds=(p.selectedLoadIds||[]).filter(id=>loads.some(l=>l.id===id&&l.cal===p.caliber));
  if(!p.selectedLoadIds.includes(p.primaryLoadId))p.primaryLoadId=p.selectedLoadIds[0]||null;
}
function loadProfileIntoUI(){
  const p=activeProfile();normalizeProfileSelection(p);
  $('profileCaliber').value=p.caliber;$('zero').value=p.zero;$('sight').value=p.sight;
  $('typeFilter').value=state.ui.typeFilter;$('wind').value=state.ui.wind;$('windAngle').value=state.ui.windAngle;$('temp').value=state.ui.temp;$('pressure').value=state.ui.pressure;$('v0Offset').value=state.ui.v0Offset;$('maxRange').value=state.ui.maxRange;$('readRange').value=state.ui.readRange;
  $('ammoCaliberLabel').textContent=CAL_NAMES[p.caliber];
  renderLoadList();renderPrimaryPicker();update(false);
}
function renderLoadList(){
  const p=activeProfile(),type=$('typeFilter').value,root=$('loadList');root.innerHTML='';
  const matches=loads.filter(l=>l.cal===p.caliber&&(type==='all'||l.type===type));
  const group=document.createElement('div');group.className='ammo-group';group.innerHTML='<div class="ammo-head">'+CAL_NAMES[p.caliber]+'</div><div class="ammo-list"></div>';
  const list=group.querySelector('.ammo-list');
  for(const l of matches){
    const row=document.createElement('label');row.className='loadrow';const badge=l.badge?'<span class="pill '+(l.badgeClass||'')+'">'+l.badge+'</span>':'';
    row.innerHTML='<input type="checkbox" '+(p.selectedLoadIds.includes(l.id)?'checked':'')+'><span><strong>'+l.name+badge+'</strong><br><small>V0 '+l.v0+' m/s · '+(l.bcInferred?'eff. ':'')+'G1 BC '+l.bc+' · '+(l.type==='hunting'?'jakt':'trening/match')+'</small></span>';
    const cb=row.querySelector('input');cb.addEventListener('change',()=>transition(()=>{markDirty();if(cb.checked){if(!p.selectedLoadIds.includes(l.id))p.selectedLoadIds.push(l.id)}else p.selectedLoadIds=p.selectedLoadIds.filter(id=>id!==l.id);normalizeProfileSelection(p);renderLoadList();renderPrimaryPicker();update(false);saveState()}));list.appendChild(row)
  }
  root.appendChild(group);
}
function renderPrimaryPicker(){
  const p=activeProfile(),sel=$('primaryLoadSelect');normalizeProfileSelection(p);sel.innerHTML='';
  const chosen=p.selectedLoadIds.map(id=>loads.find(l=>l.id===id)).filter(Boolean);
  for(const l of chosen){const o=document.createElement('option');o.value=l.id;o.textContent=l.name;sel.appendChild(o)}
  if(p.primaryLoadId)sel.value=p.primaryLoadId;
  sel.disabled=!chosen.length;
}
function syncProfileFromInputs(){const p=activeProfile();p.zero=clamp($('zero').value,10,500,100);p.sight=clamp($('sight').value,0,120,40)}
function syncUiState(){state.ui.typeFilter=$('typeFilter').value;state.ui.wind=clamp($('wind').value,-60,60,12);state.ui.windAngle=clamp($('windAngle').value,0,180,90);state.ui.temp=clamp($('temp').value,-40,50,15);state.ui.pressure=clamp($('pressure').value,750,1100,1013);state.ui.v0Offset=clamp($('v0Offset').value,-150,150,0);state.ui.maxRange=clamp($('maxRange').value,50,1000,300);state.ui.readRange=clamp($('readRange').value,10,state.ui.maxRange,150)}
function clearCharts(){for(const id of ['dropChart','windChart','velChart']){const c=$(id),ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height)}chartStates.clear()}
function update(persist=true){
  syncProfileFromInputs();syncUiState();const p=activeProfile();
  let maxR=state.ui.maxRange;$('maxRange').value=maxR;let rr=$('readRange');rr.max=maxR;if(+rr.value>maxR)rr.value=maxR;state.ui.readRange=clamp(rr.value,10,maxR,150);$('rangeLabel').textContent=state.ui.readRange;
  normalizeProfileSelection(p);const active=p.selectedLoadIds.map(id=>loads.find(l=>l.id===id)).filter(Boolean);
  if(!active.length){$('cards').innerHTML='<div class="card"><div class="v">Velg ammunisjon</div></div>';$('tbody').innerHTML='';clearCharts();$('fieldLoad').textContent='Velg minst én patron for å lage feltkort.';if(persist)saveState();return}
  currentSeries=active.map(l=>({load:l,rows:solve(l,maxR)}));
  drawChart($('dropChart'),currentSeries,'drop','Bane','cm');drawChart($('windChart'),currentSeries,'wind','Vind','cm');drawChart($('velChart'),currentSeries,'vel','Hastighet','m/s');
  $('legend').innerHTML=currentSeries.map((s,i)=>'<span><span class="dot" style="background:'+COLORS[i%COLORS.length]+'"></span>'+s.load.short+'</span>').join('');
  const main=currentSeries.find(s=>s.load.id===p.primaryLoadId)||currentSeries[0];p.primaryLoadId=main.load.id;const r=state.ui.readRange,d=interp(main.rows,r,'drop'),w=interp(main.rows,r,'wind'),v=interp(main.rows,r,'vel'),e=interp(main.rows,r,'energy'),elev=dialForImpact(d,r,'elev'),windDial=dialForImpact(w,r,'wind');
  $('fieldDistance').textContent=r+' m';$('fieldZero').textContent=p.zero+' m innskutt';$('elevDial').textContent=elev.dir+' '+fmt(elev.mag)+' MOA';$('elevClicks').textContent=elev.clicks+' klikk · ¼ MOA'+(elev.clicks?` = ${fmt(elev.clicked)} MOA`:'');$('elevImpact').textContent=fmt(d/10,1)+' cm treffavvik';$('windDial').textContent=windDial.dir+' '+fmt(windDial.mag)+' MOA';$('windClicks').textContent=windDial.clicks+' klikk · ¼ MOA'+(windDial.clicks?` = ${fmt(windDial.clicked)} MOA`:'');$('windImpact').textContent=fmt(w/10,1)+' cm treffavvik';$('fieldLoad').textContent=main.load.name+' · profil: '+p.name+' · siktehøyde '+p.sight+' mm';
  $('cards').innerHTML='<div class="card"><div class="v">'+fmt(d/10,1)+' cm</div><div class="k">kulebane</div></div><div class="card"><div class="v">'+fmt(w/10,1)+' cm</div><div class="k">vindavdrift</div></div><div class="card"><div class="v">'+fmt(elev.mag)+' MOA</div><div class="k">høyde · '+elev.clicks+' klikk</div></div><div class="card"><div class="v">'+Math.round(v)+' m/s</div><div class="k">hastighet</div></div><div class="card"><div class="v">'+Math.round(e)+' J</div><div class="k">energi</div></div>';
  let html='';for(let x=25;x<=maxR;x+=25){let drop=interp(main.rows,x,'drop'),wind=interp(main.rows,x,'wind'),vel=interp(main.rows,x,'vel'),energy=interp(main.rows,x,'energy'),ed=dialForImpact(drop,x,'elev'),wd=dialForImpact(wind,x,'wind');html+='<tr><td>'+x+'</td><td>'+fmt(drop/10,1)+'</td><td>'+ed.dir+' '+fmt(ed.mag)+'</td><td>'+ed.clicks+'</td><td>'+fmt(wind/10,1)+'</td><td>'+wd.dir+' '+fmt(wd.mag)+'</td><td>'+wd.clicks+'</td><td>'+Math.round(vel)+'</td><td>'+Math.round(energy)+'</td></tr>'}$('tbody').innerHTML=html;
  if(persist)saveState();
}

function createProfile(){
  const base=activeProfile(),name=prompt('Navn på våpenprofil:',`Ny ${CAL_NAMES[base.caliber]}-profil`);if(!name)return;
  const id='p-'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),p={id,name:name.trim()||'Ny profil',caliber:base.caliber,zero:base.zero,sight:base.sight,selectedLoadIds:[...DEFAULT_LOADS[base.caliber]],primaryLoadId:DEFAULT_LOADS[base.caliber][0]};state.profiles.push(p);state.activeProfileId=id;saveState();renderProfiles();loadProfileIntoUI();
}
function renameProfile(){const p=activeProfile(),name=prompt('Nytt navn:',p.name);if(!name)return;p.name=name.trim()||p.name;saveState();renderProfiles();$('profileSelect').value=p.id;update(false)}
function deleteProfile(){if(state.profiles.length===1)return alert('Du må ha minst én våpenprofil.');const p=activeProfile();if(!confirm(`Slett profilen «${p.name}»?`))return;state.profiles=state.profiles.filter(x=>x.id!==p.id);state.activeProfileId=state.profiles[0].id;saveState();renderProfiles();loadProfileIntoUI()}

function init(){
  renderProfiles();loadProfileIntoUI();
  $('profileSelect').addEventListener('change',()=>transition(()=>{state.activeProfileId=$('profileSelect').value;saveState();loadProfileIntoUI()}));
  $('addProfileBtn').addEventListener('click',()=>transition(createProfile));
  $('renameProfileBtn').addEventListener('click',()=>transition(renameProfile));
  $('deleteProfileBtn').addEventListener('click',()=>transition(deleteProfile));
  $('profileCaliber').addEventListener('change',()=>transition(()=>{const p=activeProfile();p.caliber=$('profileCaliber').value;p.selectedLoadIds=[...DEFAULT_LOADS[p.caliber]];p.primaryLoadId=p.selectedLoadIds[0];saveState();renderProfiles();$('profileSelect').value=p.id;$('ammoCaliberLabel').textContent=CAL_NAMES[p.caliber];renderLoadList();renderPrimaryPicker();update(false)}));
  $('typeFilter').addEventListener('change',()=>transition(()=>{state.ui.typeFilter=$('typeFilter').value;saveState();renderLoadList()}));
  $('primaryLoadSelect').addEventListener('change',()=>transition(()=>{activeProfile().primaryLoadId=$('primaryLoadSelect').value;saveState();update(false)}));
  for(const id of ['wind','windAngle','zero','sight','temp','pressure','v0Offset','maxRange']){$(id).addEventListener('change',()=>transition(()=>{markDirty();update(true)}))}
  $('readRange').addEventListener('input',()=>{markDirty();update(false)});$('readRange').addEventListener('change',()=>saveState());
  $('clearBtn').addEventListener('click',()=>transition(()=>{const p=activeProfile();p.selectedLoadIds=[];p.primaryLoadId=null;saveState();renderLoadList();renderPrimaryPicker();update(false)}));
  $('defaultAmmoBtn').addEventListener('click',()=>transition(()=>{const p=activeProfile();p.selectedLoadIds=[...DEFAULT_LOADS[p.caliber]];p.primaryLoadId=p.selectedLoadIds[0];saveState();renderLoadList();renderPrimaryPicker();update(false)}));
  bindChart($('dropChart'),$('dropTip'));bindChart($('windChart'),$('windTip'));bindChart($('velChart'),$('velTip'));update(false);
}
init();