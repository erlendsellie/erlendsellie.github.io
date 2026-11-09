import * as THREE from 'three';

/* Echoes of the Vale: original third-person action-adventure.
   Geometry, dialogue, melody and mechanics are original. No Nintendo assets. */
const $ = id => document.getElementById(id);
const canvas = $('scene'), viewport = $('viewport');
const modalEl = $('modal'), startBtn = $('start'), continueBtn = $('continue');
const SAVE = 'echoes-of-the-vale-3d-v2';
const SIZE = { x: 66, z: 40 };
const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
const distance = (a,b,c,d) => Math.hypot(a-c,b-d);
const PI2 = Math.PI * 2;
const places = [
  {name:'WHISPERWOOD', spawn:[8,22]},
  {name:'THE DUSK RUINS', spawn:[7,22]},
  {name:'THE STARWELL', spawn:[7,22]}
];
const POI = {
  altar:[19,16], chest0:[47,12], gate0:[62,21],
  well:[14,14], chest1:[51,12], gate1:[62,21], back:[3.5,21],
  shrine:[15,23], keeper:[45,21], final:[61,21]
};
const ENEMIES = [
  [{id:'w1',kind:'moss',x:31,z:23,hp:3},{id:'w2',kind:'moss',x:42,z:23,hp:3},{id:'w3',kind:'ghost',x:51,z:24,hp:2}],
  [{id:'r1',kind:'moss',x:17,z:28,hp:3},{id:'r2',kind:'ghost',x:45,z:23,hp:3},{id:'r3',kind:'moss',x:55,z:27,hp:3}],
  [{id:'s1',kind:'ghost',x:29,z:17,hp:3},{id:'s2',kind:'moss',x:34,z:28,hp:3},{id:'keeper',kind:'boss',x:45,z:21,hp:12}]
];
function fresh(){
  return {scene:0,x:8,z:22,hp:6,maxHp:6,song:false,phase:0,fragments:[false,false,false],vanquished:[],minutes:0,camYaw:-Math.PI/2,won:false};
}
function load(){
  try{
    const o=JSON.parse(localStorage.getItem(SAVE));
    if(!o||o.won||!Number.isInteger(o.scene)||o.scene<0||o.scene>2||!Number.isFinite(o.x)||!Number.isFinite(o.z)||!Array.isArray(o.fragments)||o.fragments.length!==3)return null;
    const r={...fresh(),...o};
    r.x=clamp(o.x,2,64);r.z=clamp(o.z,2,38);r.hp=clamp(Number(o.hp)||6,1,6);
    r.fragments=o.fragments.map(Boolean);r.vanquished=Array.isArray(o.vanquished)?o.vanquished.filter(v=>typeof v==='string'):[];
    r.phase=o.phase===1?1:0;r.camYaw=Number.isFinite(o.camYaw)?o.camYaw:-Math.PI/2;return r;
  }catch{return null}
}
let s=fresh(), running=false, paused=false, dead=false, win=false, world, enemyActors=[], interactables=[], props=[], arrows=[], sparks=[], bridge=null;
let time=0, last=0, toastUntil=0, noteUntil=0, lastSave=0, cameraYaw=-Math.PI/2, cameraPitch=.61, facing={x:1,z:0}, moving=false, swing=0, swordCool=0, bowCool=0, invuln=0, shotAt=0, screenW=0, screenH=0;
const controls=new Set();
let pointer=null;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(64,1,.1,150);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.25;
scene.background=new THREE.Color(0x98b9b2);
scene.fog=new THREE.Fog(0x98b9b2,29,83);
const hemi=new THREE.HemisphereLight(0xfff3da,0x1c3030,2.3);scene.add(hemi);
const sunlight=new THREE.DirectionalLight(0xffd4a0,2.7);sunlight.position.set(-20,31,12);scene.add(sunlight);
const amber=new THREE.PointLight(0xfbd18a,6,24,2);amber.position.set(19,6,16);scene.add(amber);
world=new THREE.Group();scene.add(world);

function mat(color,rough=.87,emissive=null,emission=.7){
  return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:.02,emissive:emissive||0x000000,emissiveIntensity:emissive?emission:0,flatShading:true});
}
const M={
  bark:mat(0x58483e),tree:mat(0x2e6b59),leaf:mat(0x539677),grass:mat(0x4c866c),
  stone:mat(0x858f8c),stoneLight:mat(0xa9b7a6),darkStone:mat(0x53636b),
  sand:mat(0xa58b67),gold:mat(0xe1bd77,.36,0x6d431b,.25),darkGold:mat(0x7b6245),
  wood:mat(0x6b5141),water:mat(0x297d9b,.25,0x164d66,.45),
  ghost:mat(0xa89ce1,.32,0x7460d5,.95),moss:mat(0x4d8e70),
  tunic:mat(0x207d70),tunicLight:mat(0x5ab7a3),cloak:mat(0x204e57),
  skin:mat(0xe8bc91),hair:mat(0x67472c),leather:mat(0x573e35),
  boot:mat(0x332b30),metal:mat(0xd9e1d8,.2),eye:mat(0x192b2a),
  boss:mat(0x707b86),bossLight:mat(0xa7aca3),
  pink:mat(0xf6ad9c,.4,0xba6859,.5),light:mat(0xffecb6,.24,0xe7ae6a,1.1),
  rune:mat(0xcbb6fb,.28,0x8266d3,.9)
};
const boxGeo=(x,y,z)=>new THREE.BoxGeometry(x,y,z);
function mesh(g,m,parent=world,x=0,y=0,z=0){
  const a=new THREE.Mesh(g,m);a.position.set(x,y,z);parent.add(a);return a;
}
function box(x,y,z,w,h,d,m,parent=world){return mesh(boxGeo(w,h,d),m,parent,x,y,z)}
function ball(x,y,z,r,m,parent=world,detail=9){return mesh(new THREE.SphereGeometry(r,detail,7),m,parent,x,y,z)}
function cone(x,y,z,r,h,m,parent=world,edges=7){return mesh(new THREE.ConeGeometry(r,h,edges),m,parent,x,y,z)}
function cyl(x,y,z,rTop,rBot,h,m,parent=world,edges=10){return mesh(new THREE.CylinderGeometry(rTop,rBot,h,edges),m,parent,x,y,z)}
function torus(x,y,z,r,t,m,parent=world,rot=0){let o=mesh(new THREE.TorusGeometry(r,t,7,40),m,parent,x,y,z);o.rotation.x=rot;return o}
function lightAt(x,y,z,col=0xffe1ac,int=3,range=13){const l=new THREE.PointLight(col,int,range,2);l.position.set(x,y,z);world.add(l);return l}
function seeded(i,k=1){let v=Math.sin(i*127.1+k*311.7)*43758.5453;return v-Math.floor(v)}
function particle(x,y,z,color,count=15){
  for(let i=0;i<count;i++){
    let a=seeded(i+time*345,12)*PI2,b=seeded(i+time*97,35)*PI2,v=2+seeded(i,4)*4;
    const ob=ball(x,y,z,.07+seeded(i,20)*.07,new THREE.MeshBasicMaterial({color,transparent:true,opacity:.95}),scene,6);
    sparks.push({mesh:ob,vx:Math.cos(a)*v,vy:1+seeded(i,27)*3,vz:Math.sin(a)*v,life:.7+seeded(i,14)*.45,max:1.15});
  }
}
function clearScene(){
  for(const p of sparks){scene.remove(p.mesh);p.mesh.geometry.dispose();p.mesh.material.dispose()}sparks=[];
  for(const p of arrows){scene.remove(p.mesh);p.mesh.geometry.dispose()}arrows=[];
  scene.remove(world);world.traverse(o=>{if(o.isMesh&&o.geometry&&!Object.values(M).includes(o.material)){o.geometry.dispose();if(o.material&&o.material.dispose)o.material.dispose()}});world=new THREE.Group();scene.add(world);
  enemyActors=[];interactables=[];props=[];bridge=null;
}
function ground(hex){
  const g=mesh(new THREE.PlaneGeometry(SIZE.x,SIZE.z),mat(hex),world,SIZE.x/2,-.055,SIZE.z/2);
  g.rotation.x=-Math.PI/2;
  for(let k=0;k<4;k++) {
    const e=box(SIZE.x/2,-.45,k%2?SIZE.z:0,SIZE.x, .8,.9,mat(0x364e45));
    e.visible=k<2;
  }
}
function path(x,z,w,d,material=M.sand){
  const m=box(x,.006,z,w,.025,d,material);
  return m;
}
function tree(x,z,scale=1){
  const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);
  cyl(0,1.3,0,.26,.37,2.6,M.bark,g,8);
  cone(0,2.7,0,1.45,2.5,M.tree,g);
  cone(0,3.9,0,1.13,2.4,M.leaf,g);
  cone(0,5.05,0,.77,2,M.tree,g);
  world.add(g);
  return {x,z,r:1.05*scale};
}
function stone(x,z,scale=1){
  const g=ball(x,.34*scale,z,.55*scale,Math.round(scale*10)%2?M.stone:M.darkStone,world,6);g.scale.set(1.25,.65,1);
}
function ruinColumn(x,z,size=3.4){
  box(x,.25,z,1.65,.5,1.65,M.darkStone);
  cyl(x,size/2+.35,z,.53,.64,size,M.stone,world,8);
  box(x,size+.5,z,1.3,.4,1.3,M.stoneLight);
  props.push({x,z,r:.83});
}
function beacon(x,z,tint=M.light){
  const g=new THREE.Group();g.position.set(x,0,z);world.add(g);
  const ring=torus(0,2.45,0,1.45,.14,tint,g,0);ring.rotation.y=Math.PI/2;
  const inner=torus(0,2.45,0,.86,.065,M.rune,g,0);inner.rotation.y=Math.PI/2;
  const crystal=mesh(new THREE.OctahedronGeometry(.42),tint,g,0,2.45,0);
  const base=cyl(0,.35,0,1.6,1.8,.65,M.darkStone,g);
  const aura=ball(0,2.45,0,.48,tint,g);
  lightAt(x,3,z,0xd8c6ff,3,13);
  return {x,z,g,ring,inner,crystal,aura,base,kind:'gate'};
}
function altar(x,z){
  const o=new THREE.Group();o.position.set(x,0,z);world.add(o);
  cyl(0,.35,0,2,2.15,.7,M.darkStone,o);
  cyl(0,.8,0,1.4,1.55,.3,M.stone,o);
  torus(0,1.0,0,1.2,.07,M.gold,o,Math.PI/2);
  const orb=mesh(new THREE.OctahedronGeometry(.78),M.rune,o,0,2.23,0);
  lightAt(x,3,z,0xb1a0ff,4,13);
  return {kind:'altar',x,z,g:o,orb};
}
function chest(x,z,idx){
  const g=new THREE.Group();g.position.set(x,0,z);world.add(g);
  box(0,.65,0,1.65,.9,1.05,M.wood,g);
  box(0,1.17,0,1.8,.27,1.18,M.gold,g);
  box(0,.67,.56,.21,.95,.12,M.gold,g);
  box(0,.9,.65,.2,.27,.1,M.light,g);
  const shard=mesh(new THREE.TetrahedronGeometry(.57),M.light,g,0,2.1,0);
  g.userData.shard=shard;shard.visible=!s.fragments[idx];
  return {kind:'chest',idx,x,z,g,shard};
}
function well(x,z){
  cyl(x,.27,z,1.9,1.9,.6,M.stone);
  cyl(x,.55,z,1.47,1.47,.08,M.water);
  torus(x,.69,z,1.64,.18,M.stoneLight,world,Math.PI/2);
  lightAt(x,2.2,z,0x7fcce7,2,10);
  return {kind:'heal',x,z};
}
function sign(x,z){
  cyl(x,1,z,.1,.16,2,M.wood);
  box(x,2.1,z,2.1,.6,.18,M.wood);
}
function flower(x,z,c){
  cyl(x,.21,z,.035,.06,.43,M.tree,world,6);
  ball(x,.5,z,.15,c,world,5);
}
function makeForest(){
  ground(0x467763);
  path(32,21,62,4.6);
  path(19,18,5,17);
  path(46,17,5,16);
  for(let i=0;i<125;i++){
    const x=2+seeded(i,4)*62,z=2+seeded(i,5)*36;
    if((z>15.2&&z<27.2)||(x>16&&x<22&&z>8&&z<31)||(x>43&&x<51&&z>7&&z<29)||distance(x,z,47,12)<5||distance(x,z,19,16)<5||x>58)continue;
    let t=tree(x,z,.7+seeded(i,7)*.72);props.push(t);
  }
  for(let i=0;i<90;i++){
    const x=seeded(i,17)*SIZE.x,z=seeded(i,18)*SIZE.z;
    if(x>1&&x<65&&z>1&&z<39){flower(x,z,seeded(i,4)>.5?M.pink:M.light)}
  }
  interactables.push(altar(...POI.altar));
  interactables.push(chest(...POI.chest0,0));
  let gate=beacon(...POI.gate0,M.light);gate.kind='gate0';interactables.push(gate);
  sign(8,28);stone(10,29,1.2);
  amber.position.set(19,5,16);amber.intensity=5;
}
function makeRuins(){
  ground(0x59645e);
  for(let i=0;i<300;i++){
    let x=1+seeded(i,33)*64,z=1+seeded(i,34)*38;
    if(x>29&&x<40)continue;
    if(seeded(i,35)>.4)box(x,.006,z,.4+seeded(i,9)*1.1,.025,.3+seeded(i,8)*.9,M.stone);
  }
  path(18,21,31,3.9,M.stone);
  path(51,21,24,3.9,M.stone);
  const river=box(34.5,.015,20,9.7,.05,39.4,M.water);
  for(let i=0;i<18;i++){let x=30.5+seeded(i,9)*8,z=seeded(i,10)*38+.5;const ripple=torus(x,.07,z,.25+seeded(i,2)*.4,.03,M.stoneLight,world,Math.PI/2);ripple.material=M.stoneLight}
  bridge=new THREE.Group();world.add(bridge);
  for(let i=0;i<11;i++){
    let x=30.1+i*.89;
    box(x,.28,21.2,.76,.36,6,M.wood,bridge);
    box(x,.52,18.4,.65,.12,.16,M.darkGold,bridge);
    box(x,.52,24,.65,.12,.16,M.darkGold,bridge);
  }
  bridge.visible=s.phase===1;
  for(const p of [[9,9],[18,31],[25,9],[25,31],[44,9],[44,31],[57,8],[57,32]])ruinColumn(...p,3+seeded(p[0],p[1]));
  interactables.push(well(...POI.well));
  interactables.push(chest(...POI.chest1,1));
  let exit=beacon(...POI.gate1,M.rune);exit.kind='gate1';interactables.push(exit);
  let back=beacon(...POI.back,M.light);back.kind='back0';interactables.push(back);
  amber.position.set(50,5,15);amber.intensity=3;
}
function makeSanctum(){
  ground(0x4a5b65);
  path(34,21,62,6,M.stone);
  for(let r of [5.5,10.2,14])torus(45,.06,21,r,.13,M.gold,world,Math.PI/2);
  for(const p of [[25,8],[25,33],[39,8],[39,33],[55,8],[55,33]])ruinColumn(...p,4.2);
  for(let k=0;k<12;k++){let a=k/12*PI2;const x=45+12.2*Math.cos(a),z=21+12.2*Math.sin(a);cyl(x,.3,z,.7,.8,.6,M.darkStone)}
  interactables.push(well(...POI.shrine));
  let fin=beacon(...POI.final,M.light);fin.kind='final';interactables.push(fin);
  let back=beacon(...POI.back,M.rune);back.kind='back1';interactables.push(back);
  amber.position.set(44,7,21);amber.intensity=5;
}
function makeCreature(data){
  const boss=data.kind==='boss';const ghost=data.kind==='ghost';
  const model=new THREE.Group();model.position.set(data.x,0,data.z);world.add(model);
  let parts=[];
  if(boss){
    const torso=box(0,2.75,0,2.8,3.4,1.55,M.boss,model);
    box(0,4.9,0,2.2,1.55,1.55,M.bossLight,model);
    for(let k of [-1,1]){
      const arm=new THREE.Group();arm.position.set(k*2.12,3.5,0);model.add(arm);
      box(0,-.77,0,.94,2.15,1.05,M.boss,arm);ball(0,-1.85,0,.7,M.stone,arm);parts.push(arm);
      ball(k*.5,5,.83,.19,M.pink,model);
      cone(k*2.2,5.5,0,.65,1.6,M.darkGold,model,5);
    }
    cyl(0,.67,0,1.5,1.7,1.3,M.darkStone,model);
    const crown=mesh(new THREE.OctahedronGeometry(.9),M.light,model,0,4.3,1.1);
    parts.push(crown);
  }else if(ghost){
    ball(0,1.4,0,1.02,M.ghost,model,9);
    cone(0,.62,0,1.0,1.4,M.ghost,model,8);
    ball(-.35,1.45,.8,.12,M.eye,model);ball(.35,1.45,.8,.12,M.eye,model);
  }else{
    ball(0,.9,0,.92,M.moss,model);
    cone(0,1.78,0,.73,1.5,M.tree,model,8);
    ball(-.36,1.1,.7,.13,M.light,model);ball(.36,1.1,.7,.13,M.light,model);
    cone(-.7,1.2,0,.33,.7,M.leaf,model,6);
    cone(.7,1.2,0,.33,.7,M.leaf,model,6);
  }
  return {...data,max:data.hp,model,parts,attack:0,hit:0,walk:0,fire:0};
}
function playerModel(){
  const g=new THREE.Group();scene.add(g);
  const cloak=cone(0,1.03,.28,.7,1.6,M.cloak,g,8);cloak.rotation.x=.12;
  box(0,1.56,0,1.22,1.26,.7,M.tunic,g);
  box(0,1.91,-.1,1.35,.25,.83,M.tunicLight,g);
  box(0,1.11,.01,1.15,.16,.77,M.darkGold,g);
  const head=new THREE.Group();head.position.y=2.4;g.add(head);
  ball(0,0,0,.55,M.skin,head,12);
  ball(0,.34,-.18,.57,M.hair,head,10);
  ball(-.21,.02,-.47,.05,M.eye,head);ball(.21,.02,-.47,.05,M.eye,head);
  cone(-.58,-.03,0,.15,.43,M.skin,head,3).rotation.z=-1.35;
  cone(.58,-.03,0,.15,.43,M.skin,head,3).rotation.z=1.35;
  const legs=[];
  for(const side of [-1,1]){
    const pivot=new THREE.Group();pivot.position.set(side*.32,.97,0);g.add(pivot);
    box(0,-.45,0,.35,.84,.37,M.leather,pivot);
    box(0,-.83,-.15,.42,.25,.65,M.boot,pivot);
    legs.push(pivot);
  }
  const arms=[];
  for(const side of [-1,1]){
    const pivot=new THREE.Group();pivot.position.set(side*.78,1.92,0);g.add(pivot);
    box(0,-.39,0,.37,.77,.39,M.tunic,pivot);
    ball(0,-.86,0,.24,M.skin,pivot);
    arms.push(pivot);
  }
  const sword=new THREE.Group();
  sword.position.set(0,-1.05,-.06);arms[1].add(sword);
  cyl(0,-.33,0,.095,.10,.6,M.darkGold,sword,8);
  box(0,-.62,0,.65,.16,.17,M.gold,sword);
  box(0,-1.42,0,.17,1.56,.18,M.metal,sword);
  cone(0,-2.23,0,.17,.42,M.metal,sword,4);
  const ocarina=ball(0,0,0,.3,M.rune,g);ocarina.visible=false;
  const shadow=mesh(new THREE.CircleGeometry(.77,18),new THREE.MeshBasicMaterial({color:0x08171b,transparent:true,opacity:.24,depthWrite:false}),g,0,.025,0);shadow.rotation.x=-Math.PI/2;
  return {g,legs,arms,head,ocarina,sword};
}
const hero=playerModel();
let musicContext=null,musicNext=0,musicStep=0,muted=false,activeSong=0;
function unlockSound(){
  if(muted)return;
  try{musicContext??=new(window.AudioContext||window.webkitAudioContext)();if(musicContext.state==='suspended')musicContext.resume();musicNext=musicContext.currentTime+.25}catch{muted=true}
}
function tone(freq,dur=.28,vol=.06,delay=0,shape='sine'){
  if(muted||!musicContext)return;
  const t=musicContext.currentTime+delay;
  const osc=musicContext.createOscillator(),env=musicContext.createGain();
  osc.type=shape;osc.frequency.setValueAtTime(freq,t);
  osc.frequency.linearRampToValueAtTime(freq*1.003,t+Math.min(.17,dur*.6));
  env.gain.setValueAtTime(.0001,t);
  env.gain.exponentialRampToValueAtTime(vol,t+.026);
  env.gain.exponentialRampToValueAtTime(.0001,t+dur);
  osc.connect(env);env.connect(musicContext.destination);osc.start(t);osc.stop(t+dur+.03);
}
function sfx(which){
  if(which==='sword'){tone(210,.08,.065,0,'sawtooth');tone(325,.06,.035,.04)}
  if(which==='hurt'){tone(140,.24,.12,0,'triangle')}
  if(which==='bow'){tone(440,.07,.06,0,'triangle')}
  if(which==='get'){[523,659,784,1046].forEach((n,i)=>tone(n,.27,.085,i*.12))}
  if(which==='portal'){[220,330,440].forEach((n,i)=>tone(n,.35,.08,i*.1))}
}
const songNotes=[392,466.16,587.33,698.46,783.99,698.46,523.25,587.33];
function playSong(){
  unlockSound();
  songNotes.forEach((f,i)=>{tone(f,.37,.13,i*.22,'sine');tone(f*2,.22,.022,i*.22,'sine')});
  activeSong=2.7;noteUntil=performance.now()+2700;$('notes').classList.add('visible');
}
function music(){
  if(!running||muted||!musicContext)return;
  let now=musicContext.currentTime;
  if(now<musicNext)return;
  const seq=s.phase?[196,293.67,349.23,440,349.23,293.67,261.63,220]:[196,246.94,293.66,392,293.66,246.94,329.63,293.66];
  tone(seq[musicStep%seq.length],.44,.019,.015,'sine');
  if(musicStep%4===0)tone(seq[musicStep%seq.length]/2,.7,.015,.04,'triangle');
  musicStep++;musicNext=now+.69;
}
function say(text,sec=3.5){$('notice').textContent=text;$('notice').classList.add('visible');toastUntil=performance.now()+sec*1000}
function hidePop(){if(performance.now()>toastUntil)$('notice').classList.remove('visible');if(performance.now()>noteUntil)$('notes').classList.remove('visible')}
function updateUI(){
  $('area').textContent=places[s.scene].name;
  $('hearts').textContent='♥ '.repeat(Math.max(0,s.hp))+'♡ '.repeat(Math.max(0,s.maxHp-s.hp));
  $('realm').textContent=s.phase?'☾ SKUMRING':'☀ DAGGRY';
  $('relics').textContent=s.fragments.map(f=>f?'▲':'△').join('  ');
  $('quest').textContent=!s.song?'Finn ocarinaen ved alteret i skogen.':!s.fragments[0]?'Spill ocarinaen og finn første Triforce-bit.':!s.fragments[1]?'Kryss tidsbrua i ruinene.':!s.fragments[2]?'Bekjemp vokteren i Starwell.':'Aktiver seglet helt øst og bli ung igjen.';
}
function save(){if(!running||win)return;s.camYaw=cameraYaw;try{localStorage.setItem(SAVE,JSON.stringify(s))}catch{}}
function phaseMood(){
  const dusk=s.phase===1;
  scene.background.setHex(dusk?0x424465:s.scene===0?0x9cb6a3:s.scene===1?0xb5ab8d:0x879bb8);
  scene.fog.color.copy(scene.background);
  hemi.intensity=dusk?1.55:2.3;
  sunlight.intensity=dusk?1.25:2.7;
  sunlight.color.setHex(dusk?0xa9b2e5:0xffd4a0);
  if(bridge)bridge.visible=dusk;
  for(const e of enemyActors)if(e.kind==='ghost')e.model.visible=dusk&&e.hp>0;
  updateUI();
}
function enterScene(n,x,z){
  s.scene=n;s.x=x;s.z=z;s.phase=0;cameraYaw=-Math.PI/2;
  clearScene();if(n===0)makeForest();else if(n===1)makeRuins();else makeSanctum();
  enemyActors=ENEMIES[n].filter(e=>!s.vanquished.includes(e.id)).map(makeCreature);
  phaseMood();hero.g.position.set(x,0,z);camera.position.set(x-10,6,z);camera.lookAt(x,1.4,z);
  updateUI();save();
}
function startGame(option='new'){
  s=option==='continue'&&load()||fresh();
  running=true;paused=false;dead=false;win=false;
  cameraYaw=s.camYaw;screenW=0;screenH=0;
  keysClear();swing=0;swordCool=0;bowCool=0;invuln=0;shotAt=0;
  enterScene(s.scene,s.x,s.z);
  cameraYaw=s.camYaw;modalEl.style.display='none';$('pause').textContent='Ⅱ';
  unlockSound();
  say(s.song?'Du e tebake! Triforce-bitene vente på dæ.':'Snakk med det lysende alteret. Denne turen går vi på BEINA, kompis.',5);
  updateUI();
}
function showModal(title,desc,button,mode){
  running=false;
  modalEl.style.display='flex';
  $('modalTitle').textContent=title;$('modalDesc').textContent=desc;
  startBtn.textContent=button;startBtn.dataset.mode=mode;startBtn.disabled=false;
  continueBtn.hidden=true;$('pause').textContent='▶';
}
function pauseGame(){
  if(!running)return;
  paused=true;save();showModal('Pause i eventyret','Prolapsen får kvil sæ litt. Fremdrifta e lagra på den her enheten.','Fortsett','resume');
}
function revive(){
  s.hp=s.maxHp;s.x=places[s.scene].spawn[0];s.z=places[s.scene].spawn[1];invuln=3;
  running=true;dead=false;paused=false;
  enterScene(s.scene,s.x,s.z);modalEl.style.display='none';$('pause').textContent='Ⅱ';unlockSound();say('Du overlevde. Ryggen va visst ikke det eneste problemet.',4);
}
function newScene(n,x,z,msg){
  enterScene(n,x,z);sfx('portal');say(msg,4.7);
}
function getNearby(){
  let best=null,dd=3.3;
  for(const p of interactables){const d=distance(s.x,s.z,p.x,p.z);if(d<dd){best=p;dd=d}}
  return best;
}
function hint(p){
  if(!p)return '';
  if(p.kind==='altar')return s.song?'E · Kvil ved alteret':'E · Lær ocarina-melodien';
  if(p.kind==='chest')return 'E · '+(s.fragments[p.idx]?'Se i tom kiste':'Åpne kista');
  if(p.kind==='heal')return 'E · Helbred hjertene';
  if(p.kind==='gate0')return 'E · Reis til ruinene';
  if(p.kind==='gate1')return 'E · Reis til Starwell';
  if(p.kind==='final')return 'E · Bruk Triforce';
  if(p.kind.startsWith('back'))return 'E · Reis tilbake';
  return '';
}
function interact(){
  if(!running)return;
  const p=getNearby();
  if(!p){say('Gå nærmere et alter, en kiste eller en portal, og trykk E.',2.1);return}
  if(p.kind==='altar'){
    if(!s.song){s.song=true;playSong();particle(p.x,2,p.z,0xd6b9ff,35);say('OCARINA LÆRT! Trykk O eller F for å spille melodien og veksle mellom dag og skumring. Nå må du finn Triforce.',6)}
    else{s.hp=s.maxHp;playSong();say('Den gamle melodien helbrede hjertene. Ryggen derimot...');}
    updateUI();save();return;
  }
  if(p.kind==='chest'){
    if(s.fragments[p.idx]){say('Tom kiste. Du har allerede røska med dæ innholdet.');return}
    if(!s.song){say('Kista kreve musikken fra det gamle alteret.');return}
    if(!s.phase){say('Kista e låst i daggry. Spill ocarinaen: O eller F.');return}
    s.fragments[p.idx]=true;p.shard.visible=false;particle(p.x,2,p.z,0xf4ca83,48);sfx('get');updateUI();save();
    say(p.idx===0?'FØRSTE TRIFORCE-BIT! Én ned, to igjen. Ruinene ligg østover.':'ANDRE TRIFORCE-BIT! Finn portalen øst i ruinene. Vokteren har den siste.',5.5);return;
  }
  if(p.kind==='heal'){s.hp=s.maxHp;updateUI();sfx('get');say('Hjertene e full igjen. Som ny, sånn bortsett fra ryggen.');save();return}
  if(p.kind==='gate0'){newScene(1,7,22,'DUSK RUINS. Elva kan bare krysses når du spille ocarinaen i skumring.');return}
  if(p.kind==='back0'){newScene(0,59,21,'Tilbake i Whisperwood.');return}
  if(p.kind==='gate1'){
    if(!s.fragments[0]||!s.fragments[1]){say('Portalen kreve de to første Triforce-bitan.');return}
    newScene(2,7,22,'THE STARWELL. Vokteren har siste Triforce-bit.');return;
  }
  if(p.kind==='back1'){newScene(1,59,21,'Tilbake i ruinene.');return}
  if(p.kind==='final'){
    if(!s.fragments.every(Boolean)){say('Seglet kreve alle TRE bitan av Triforce.');return}
    win=true;s.won=true;sfx('get');playSong();particle(p.x,2,p.z,0xfde09c,75);
    try{localStorage.removeItem(SAVE)}catch{}
    showModal('UNG IGJEN!','Du samla Triforce of Youth. Ryggprolapsen e borte, ungdommen e tilbake, og limbo e fortsatt forbudt. Eventyret e fullført.','Spill på nytt','new');return;
  }
}
function shift(){
  if(!running)return;
  if(!s.song){say('Først må du lær ocarinaen ved alteret i skogen.',3);return}
  if(s.scene===1&&s.phase===1&&s.x>29.6&&s.x<39.4){say('Du kan itj avslutt melodien mens du står på tidsbrua!');return}
  s.phase=s.phase?0:1;playSong();phaseMood();particle(s.x,1.6,s.z,s.phase?0xa79cf3:0xf3d7a1,23);
  say(s.phase?'SKUMRING. Skjulte kister og den magiske brua kommer fram.':'DAGGRY. Verden går tilbake til normalt.',3);save();
}
function solid(x,z,r=.53){
  if(x<1+r||x>65-r||z<1+r||z>39-r)return true;
  if(s.scene===0){for(const p of props)if(distance(x,z,p.x,p.z)<r+p.r*.75)return true}
  if(s.scene===1){
    if(x>29.65-r&&x<39.4+r&&!(s.phase===1&&z>18.4+r&&z<24-r))return true;
    for(const p of props)if(distance(x,z,p.x,p.z)<r+p.r*.78)return true;
  }
  if(s.scene===2)for(const p of props)if(distance(x,z,p.x,p.z)<r+p.r*.7)return true;
  return false;
}
function moveEntity(e,dx,dz,r=.53){
  if(!solid(e.x+dx,e.z,r))e.x+=dx;
  if(!solid(e.x,e.z+dz,r))e.z+=dz;
}
function attack(){
  if(!running||swordCool>0)return;
  swing=.31;swordCool=.42;sfx('sword');
  for(const e of enemyActors){
    if(e.hp<=0||!e.model.visible)continue;
    const d=distance(s.x,s.z,e.x,e.z),vx=(e.x-s.x)/Math.max(d,.01),vz=(e.z-s.z)/Math.max(d,.01);
    if(d<(e.kind==='boss'?4.0:3.15)&&vx*facing.x+vz*facing.z>.1)hitEnemy(e,1);
  }
}
function shoot(){
  if(!running||bowCool>0)return;
  bowCool=.55;sfx('bow');
  const o=mesh(new THREE.SphereGeometry(.19,9,7),M.light,scene,s.x+facing.x*.75,1.43,s.z+facing.z*.75);
  arrows.push({mesh:o,x:o.position.x,z:o.position.z,dx:facing.x,dz:facing.z,life:1.3,friend:true});
}
function hitEnemy(e,amount){
  if(e.hp<=0)return;
  e.hp-=amount;e.hit=.18;
  particle(e.x,e.kind==='boss'?3:1.4,e.z,e.kind==='boss'?0xf0a07e:0x94e7c8,8);
  if(e.hp<=0){
    e.model.visible=false;s.vanquished.push(e.id);
    particle(e.x,1.7,e.z,0xffe7b0,30);
    if(e.kind==='boss'){s.fragments[2]=true;sfx('get');say('SISTE TRIFORCE-BIT! Gå øst og aktiver det lysende seglet. Tid for å få tebake ryggen.',6)}
    else if(seeded(Math.floor(e.x),Math.floor(e.z))>.51){s.hp=Math.min(s.maxHp,s.hp+1)}
    updateUI();save();
  }
}
function hurt(dx,dz){
  if(invuln>0||!running)return;
  s.hp--;invuln=1.25;sfx('hurt');
  moveEntity(s,dx*1.1,dz*1.1,.55);updateUI();
  if(s.hp<=0){dead=true;showModal('Ryggen tok kveld','Du vart slått i bakken. Triforce-bitan du fant e fortsatt dine. Prøv igjen, bare litt mindre limbo.','Prøv igjen','retry')}
  else say('Au! Vokteran bit faktisk fra sæ.',1.5);
}
function updateEnemy(e,dt){
  if(e.hp<=0)return;
  if(e.kind==='ghost'&&!s.phase){e.model.visible=false;return}
  e.model.visible=true;e.hit=Math.max(0,e.hit-dt);e.attack-=dt;e.fire-=dt;
  const d=distance(s.x,s.z,e.x,e.z);
  if(d<19&&d>(e.kind==='boss'?3.7:1.7)){
    const speed=e.kind==='boss'?2.15:e.kind==='ghost'?3.2:2.6;
    moveEntity(e,(s.x-e.x)/d*speed*dt,(s.z-e.z)/d*speed*dt,e.kind==='boss'?1.4:.8);
    e.model.rotation.y=Math.atan2(-(s.x-e.x),-(s.z-e.z));
    e.walk+=dt*4;
  }
  if(d<(e.kind==='boss'?3.5:1.55)&&e.attack<=0){
    hurt((s.x-e.x)/Math.max(.1,d),(s.z-e.z)/Math.max(.1,d));
    e.attack=e.kind==='boss'?1.85:1.55;
  }
  if(e.kind==='boss'&&d<17&&e.fire<=0){
    for(let a of [-.18,0,.18]){
      const vx=(s.x-e.x)/Math.max(d,.1),vz=(s.z-e.z)/Math.max(d,.1),cx=Math.cos(a),sn=Math.sin(a);
      const dx=vx*cx-vz*sn,dz=vx*sn+vz*cx;
      let b=mesh(new THREE.SphereGeometry(.28,8,7),M.pink,scene,e.x,2.2,e.z);
      arrows.push({mesh:b,x:e.x,z:e.z,dx,dz,life:2.8,friend:false});
    }
    e.fire=2.35;
  }
  e.model.position.set(e.x,0,e.z);
  if(e.kind==='ghost')e.model.position.y=Math.sin(time*2.5+e.x)*.3+.45;
  else if(e.kind==='boss'){e.model.position.y=Math.sin(time*1.3)*.07;for(let i=0;i<2;i++)e.parts[i].rotation.x=Math.sin(time*2+i)*.25}
  else e.model.position.y=Math.sin(time*4+e.x)*.11;
  const glow=1+(e.hit>0?.35:0);
  e.model.scale.setScalar(e.kind==='boss'?glow:glow);
}
function updateArrows(dt){
  for(let i=arrows.length-1;i>=0;i--){
    const p=arrows[i],speed=p.friend?23:9.8;
    p.x+=p.dx*speed*dt;p.z+=p.dz*speed*dt;p.life-=dt;
    p.mesh.position.set(p.x,p.friend?1.4:2.15,p.z);
    if(p.life<0||p.x<0||p.x>66||p.z<0||p.z>40){removeArrow(i);continue}
    if(p.friend){
      let e=enemyActors.find(e=>e.hp>0&&e.model.visible&&distance(p.x,p.z,e.x,e.z)<(e.kind==='boss'?1.8:1.0));
      if(e){hitEnemy(e,1);removeArrow(i)}
    }else if(distance(p.x,p.z,s.x,s.z)<.85){hurt(p.dx,p.dz);removeArrow(i)}
  }
}
function removeArrow(i){const p=arrows[i];scene.remove(p.mesh);p.mesh.geometry.dispose();arrows.splice(i,1)}
function updateSparks(dt){
  for(let i=sparks.length-1;i>=0;i--){const p=sparks[i];p.life-=dt;p.mesh.position.x+=p.vx*dt;p.mesh.position.y+=p.vy*dt;p.mesh.position.z+=p.vz*dt;p.vy-=6*dt;p.mesh.material.opacity=clamp(p.life/p.max,0,1);if(p.life<=0){scene.remove(p.mesh);p.mesh.geometry.dispose();p.mesh.material.dispose();sparks.splice(i,1)}}
}
function updatePlayer(dt){
  let forward=(controls.has('up')?1:0)-(controls.has('down')?1:0),side=(controls.has('right')?1:0)-(controls.has('left')?1:0);
  const len=Math.hypot(forward,side);moving=len>0;
  if(moving){
    forward/=len;side/=len;
    const dx=-Math.sin(cameraYaw)*forward+Math.cos(cameraYaw)*side;
    const dz=-Math.cos(cameraYaw)*forward-Math.sin(cameraYaw)*side;
    const speed=7.4;
    moveEntity(s,dx*speed*dt,dz*speed*dt,.55);
    const a=Math.atan2(-dx,-dz);
    let diff=((a-hero.g.rotation.y+Math.PI*3)%PI2)-Math.PI;
    hero.g.rotation.y+=diff*Math.min(1,dt*12);
    facing={x:dx,z:dz};
  }
  swing=Math.max(0,swing-dt);swordCool=Math.max(0,swordCool-dt);bowCool=Math.max(0,bowCool-dt);invuln=Math.max(0,invuln-dt);
  hero.g.position.set(s.x,0,s.z);
  hero.g.visible=!(invuln>0&&Math.floor(time*12)%2===0);
  const stride=moving?Math.sin(time*11)*.62:Math.sin(time*2)*.018;
  hero.legs[0].rotation.x=stride;hero.legs[1].rotation.x=-stride;
  hero.arms[0].rotation.x=-stride*.62+(activeSong>0?-1.0:0);
  hero.arms[1].rotation.x=stride*.62+(swing>0?-2.1*Math.sin((.31-swing)/.31*Math.PI):-.2);
  hero.ocarina.visible=activeSong>0;hero.ocarina.position.set(0,activeSong>0?1.85:0,-.74);
  hero.head.rotation.z=moving?Math.sin(time*11)*.025:0;
  activeSong=Math.max(0,activeSong-dt);
}
function animateWorld(dt){
  for(const p of interactables){
    if(p.orb){p.orb.rotation.y+=dt*.75;p.orb.position.y=2.23+Math.sin(time*2.3)*.18;}
    if(p.crystal){p.crystal.rotation.y+=dt;p.crystal.position.y=2.45+Math.sin(time*2)*.21;p.inner.rotation.z+=dt*.26}
    if(p.shard&&p.shard.visible){p.shard.rotation.y+=dt*1.5;p.shard.position.y=2.1+Math.sin(time*3)*.22}
  }
  for(const e of enemyActors){if(e.hp>0&&e.kind==='ghost')e.model.position.y=.45+Math.sin(time*3+e.x)*.22}
}
function cameraFollow(dt){
  const d=window.innerWidth<620?11.8:10.8;
  const pitch=clamp(cameraPitch,.38,1.01),behind=d*Math.cos(pitch),height=2.5+d*Math.sin(pitch);
  const wanted=new THREE.Vector3(s.x+Math.sin(cameraYaw)*behind,height,s.z+Math.cos(cameraYaw)*behind);
  camera.position.lerp(wanted,Math.min(1,dt*6));
  const focus=new THREE.Vector3(s.x,1.55,s.z);
  camera.lookAt(focus);
}
function showHint(){
  const o=getNearby();const text=hint(o);$('interactHint').textContent=text;
  $('interactHint').classList.toggle('show',Boolean(o));
}
function resize(){
  const w=viewport.clientWidth,h=viewport.clientHeight;
  if(w===screenW&&h===screenH)return;if(w<1||h<1)return;
  screenW=w;screenH=h;camera.aspect=w/h;camera.fov=h>w?69:62;camera.updateProjectionMatrix();
  renderer.setSize(w,h,false);
}
function tick(t){
  requestAnimationFrame(tick);
  let dt=Math.min(.043,(t-last)/1000||.016);last=t;time+=dt;
  resize();
  if(running){
    s.minutes+=dt/60;
    updatePlayer(dt);
    for(const e of enemyActors)updateEnemy(e,dt);
    updateArrows(dt);updateSparks(dt);
    showHint();music();hidePop();
    if(t-lastSave>8500){lastSave=t;save()}
  }else{updateSparks(dt)}
  animateWorld(dt);cameraFollow(dt);
  renderer.render(scene,camera);
}
function keysClear(){controls.clear()}
function onKeyDown(e){
  const k=e.key.toLowerCase();
  if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();
  const dirs={w:'up',arrowup:'up',s:'down',arrowdown:'down',a:'left',arrowleft:'left',d:'right',arrowright:'right'};
  if(dirs[k])controls.add(dirs[k]);
  if(e.repeat)return;
  if(k===' '||k==='j')attack();
  if(k==='k')shoot();
  if(k==='e')interact();
  if(k==='f'||k==='o')shift();
  if(k==='p'||k==='escape')pauseGame();
  if('12345'.includes(k)&&k.length===1){unlockSound();tone(songNotes[Number(k)-1],.32,.13)}
}
function onKeyUp(e){const k=e.key.toLowerCase();const dirs={w:'up',arrowup:'up',s:'down',arrowdown:'down',a:'left',arrowleft:'left',d:'right',arrowright:'right'};if(dirs[k])controls.delete(dirs[k])}
window.addEventListener('keydown',onKeyDown);
window.addEventListener('keyup',onKeyUp);
window.addEventListener('blur',keysClear);
document.addEventListener('visibilitychange',()=>{if(document.hidden){keysClear();if(running)pauseGame()}});
canvas.addEventListener('pointerdown',e=>{pointer={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!pointer||pointer.id!==e.pointerId)return;cameraYaw-=clamp(e.clientX-pointer.x,-130,130)*.006;cameraPitch=clamp(cameraPitch+(e.clientY-pointer.y)*.003,.38,.98);pointer.x=e.clientX;pointer.y=e.clientY});
for(const k of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(k,()=>{pointer=null});
for(const b of document.querySelectorAll('[data-control]')){
  const k=b.dataset.control;
  if(['up','down','left','right'].includes(k)){
    b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);controls.add(k)});
    for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>controls.delete(k));
  }else b.addEventListener('pointerdown',e=>{
    e.preventDefault();
    if(k==='sword')attack();
    if(k==='bow')shoot();
    if(k==='use')interact();
    if(k==='song')shift();
    if(k==='heal')pauseGame();
    if(k==='camera')cameraYaw+=Math.PI/3;
  });
}
startBtn.addEventListener('click',()=>{
  const mode=startBtn.dataset.mode;
  if(mode==='resume'){running=true;paused=false;modalEl.style.display='none';$('pause').textContent='Ⅱ';unlockSound()}
  else if(mode==='retry')revive();
  else startGame('new');
});
continueBtn.addEventListener('click',()=>startGame('continue'));
$('pause').addEventListener('click',pauseGame);
$('sound').addEventListener('click',()=>{muted=!muted;$('sound').textContent=muted?'♫ Av':'♫ På';if(!muted)unlockSound()});
$('continue').hidden=!load();
$('start').disabled=false;$('start').textContent='Start eventyret';$('start').dataset.mode='new';
window.__echoReady=true;
enterScene(0,8,22);
updateUI();
requestAnimationFrame(tick);
