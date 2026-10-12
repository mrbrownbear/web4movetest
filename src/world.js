import {createParticleStory} from './particles.js';
import { CAMERA_POSES as pose, CAMERA_STOPS as stops, sampleStreetCamera as samplePose } from './camera-path.js';
const $=id=>document.getElementById(id);
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
const lerpArray=(a,b,t)=>a.map((v,i)=>mix(v,b[i],t));
const chapters=[
 {small:'The street, seen differently',title:'Your street.<br><em>Up close.</em>',body:'A closer look at the homes, the neighbourhood and the prices behind every move.',label:'Merynton Avenue',cta:'Discover your property value',href:'#valuation'},
 {small:'Take a closer look',title:'More than<br><em>front doors.</em>',body:'There is more to an address than its asking price. See the spaces that make each home different.',label:'The homes',cta:'See the local market',href:'#market'},
 {small:'Life on the road',title:'Where the<br><em>street comes alive.</em>',body:'A street is never just a line on a map. It is scale, space, rhythm and character.',label:'Around the street',cta:'Discover the neighbourhood',href:'#living'},
 {small:'Homes in context',title:'A whole new<br><em>perspective.</em>',body:'A house is never just an average. Compare the road with the surrounding postcode and city.',label:'See the difference',cta:'Compare sold prices',href:'#comparison'},
 {small:'Make your next move',title:'Know the costs.<br><em>Feel the possibilities.</em>',body:'Turn a closer look at the street into a clearer plan for your next home.',label:'Your next move',cta:'Calculate your next move',href:'#tools'}
];
export function initWorld(){
 const canvas=$('worldCanvas'),stage=$('worldStage'),section=document.querySelector('.cinematic'),fallback=$('worldEmpty'),status=$('worldStatus');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const small=$('heroSmall'),title=$('heroTitle'),body=$('heroBody'),cta=$('heroCta'),position=$('worldPosition'),line=$('worldLine');
 const heroCopy=$('heroCopy'),heroBottom=$('heroBottom'),preview=$('worldPreview');
 let THREE,scene,renderer,camera,controls,world,ready=false,progress=0,index=-1,manual=false;
 let visualProgress=0,lastTime=0,viewChangeTimer=0;
 let dusk=false,streetLights=[],points=[],raycaster,mouse; let sun,fill;
 const film=preview,filmLength=72,filmCache=new Map(); let lastFrame=-1,pendingFrame=-1;
 const particleStory=createParticleStory({canvas:$('particleCanvas'),stage,hero:heroCopy,heroBottom,fallback,preview,webglCanvas:canvas});
 const filmSrc=i=>`./assets/world/film/frame-${String(i).padStart(3,'0')}.webp`;
 const warmFrame=i=>{
   if(i<0||i>=filmLength||filmCache.has(i))return;
   const img=new Image();filmCache.set(i,img);img.decoding='async';img.src=filmSrc(i);
   img.addEventListener('load',()=>{if(pendingFrame===i && !ready && film) film.src=img.src;},{once:true});
 };
 function updateFilm(p){
   if(ready||!film)return;
   const target=clamp(Math.round(p*(filmLength-1)),0,filmLength-1);
   if(target===lastFrame)return;
   lastFrame=target;pendingFrame=target;
   const cached=filmCache.get(target);
   if(cached?.complete&&cached.naturalWidth>0)film.src=cached.src; else warmFrame(target);
   for(let j=1;j<=4;j++){warmFrame(target+j);warmFrame(target-j);}
 }
 for(let i=0;i<7;i++) warmFrame(i);
 const updateProgress=()=>{
  const nextProgress=clamp((scrollY-section.offsetTop)/Math.max(1,section.offsetHeight-innerHeight),0,1);
  if(Math.abs(nextProgress-progress)>.004 && manual){manual=false;if(controls)controls.enabled=false;$('resetCamera').hidden=true;}
  progress=nextProgress;
  document.querySelector('.model-controls')?.classList.toggle('intro-hidden',progress<.69);
  const tourProgress=clamp((progress-.69)/.31,0,1);
  const next=stops.reduce((best,stop,j)=>tourProgress>=stop-.015?j:best,0);
  if(next!==index){
    index=next;
    const d=chapters[next];
    heroCopy?.classList.add('is-crossfading');
    clearTimeout(viewChangeTimer);
    viewChangeTimer=setTimeout(()=>{
      title.innerHTML=d.title;small.textContent=d.small;body.textContent=d.body;cta.firstElementChild.textContent=d.cta;cta.href=d.href;position.textContent=d.label;
      heroCopy?.classList.remove('is-crossfading');
    },reduced.matches?0:130);
  }
  if(progress>.61)updateFilm(tourProgress);
  particleStory.update(progress);
  if(line) line.style.width=(tourProgress*100)+'%';
  document.querySelector('.cinema-background')?.style?.setProperty('--scroll-progress',progress.toFixed(3));
 };
 updateProgress();addEventListener('scroll',updateProgress,{passive:true});
 const toChapter=i=>{const scrollRange=section.offsetHeight-innerHeight;scrollTo({top:section.offsetTop+(.69+stops[clamp(i,0,4)]*.31)*scrollRange+2,behavior:reduced.matches?'auto':'smooth'});manual=false;controls&&(controls.enabled=false);$('resetCamera').hidden=true;};
 $('cameraNext')?.addEventListener('click',()=>toChapter(index<4?index+1:0));
 $('cameraPrev')?.addEventListener('click',()=>toChapter(index>0?index-1:0));
 $('resetCamera')?.addEventListener('click',()=>{manual=false;if(controls)controls.enabled=false;$('resetCamera').hidden=true;$('worldDetails').hidden=true;});
 $('detailsClose')?.addEventListener('click',()=>$('worldDetails').hidden=true);
 $('duskToggle')?.addEventListener('click',()=>{dusk=!dusk;document.querySelector('.cinema-fixed')?.classList.toggle('is-dusk',dusk);$('duskToggle').textContent=dusk?'Daylight':'Dusk';});
 const hotspotFacts=[
  {text:'Average recorded sale',value:'£435,500',note:'Based on 18 completed transactions since 2021.'},
  {text:'Homes on the street',value:'56',note:'Across CV4 7BL and CV4 7BN.'},
  {text:'Typical floor area',value:'1,351 sq ft',note:'Average recorded floor area in the supplied snapshot.'}
 ];
 const revealFact=k=>{const f=hotspotFacts[k%hotspotFacts.length];$('detailLabel').textContent=f.text;$('detailValue').textContent=f.value;$('detailNote').textContent=f.note;$('worldDetails').hidden=false;};
 function activateDrag(event){if(event.target!==canvas||!controls||event.button>0)return;manual=true;controls.enabled=true;controls.enableDamping=true;$('resetCamera').hidden=false;}
 canvas?.addEventListener('pointerdown',activateDrag,{capture:true});
 canvas?.addEventListener('pointerup',()=>{if(controls&&manual)controls.update();});
 load();
 async function load(){try{
  THREE=await import('three');
  const [{GLTFLoader},{OrbitControls}]=await Promise.all([
   import('three/addons/loaders/GLTFLoader.js'),import('three/addons/controls/OrbitControls.js')
  ]);
  const loader=new GLTFLoader();
  scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x143d47,.0009);
  const a=stage.getBoundingClientRect();let aspect=Math.max(.25,a.width/a.height);
  camera=new THREE.OrthographicCamera(-25*aspect,25*aspect,25,-25,.05,1200);
  scene.add(new THREE.HemisphereLight(0xe9f8ff,0x32505c,3.1));
  sun=new THREE.DirectionalLight(0xffe1b1,4);sun.position.set(-22,60,32);scene.add(sun);
  fill=new THREE.DirectionalLight(0x75eadd,2.4);fill.position.set(27,15,-23);scene.add(fill);
  scene.add(new THREE.AmbientLight(0xffffff,.42));
  renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.5;
  renderer.setClearColor(0x000000,0);
  controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.07;controls.enablePan=false;controls.enabled=false;controls.rotateSpeed=.65;controls.minZoom=1;controls.maxZoom=8;controls.maxPolarAngle=Math.PI*.49;
  const gltf=await new Promise((res,rej)=>loader.load('./assets/world/scene.gltf',res,undefined,rej));
  world=gltf.scene;
  const bbox=new THREE.Box3().setFromObject(world),center=bbox.getCenter(new THREE.Vector3());
  world.position.set(-center.x,-bbox.min.y,-center.z);
  world.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;o.frustumCulled=true;}});
  scene.add(world);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(220,100),new THREE.MeshStandardMaterial({color:0x144452,roughness:1,metalness:0}));ground.rotation.x=-Math.PI/2;ground.position.y=-.07;scene.add(ground);
  const lineShape=new THREE.BufferGeometry().setFromPoints([
   new THREE.Vector3(-64,.15,-10),new THREE.Vector3(-64,.15,10),new THREE.Vector3(64,.15,10),new THREE.Vector3(64,.15,-10)
  ]);
  scene.add(new THREE.Line(lineShape,new THREE.LineBasicMaterial({color:0x4ee4d5,transparent:true,opacity:.12})));
  for(const xx of [-32,0,32]){const light=new THREE.PointLight(0xffb878,0,14,2);light.position.set(xx,4.2,0);scene.add(light);streetLights.push(light);}
  raycaster=new THREE.Raycaster();mouse=new THREE.Vector2();
  canvas.addEventListener('dblclick',event=>{
   const rect=canvas.getBoundingClientRect();mouse.x=(event.clientX-rect.left)/rect.width*2-1;mouse.y=-(event.clientY-rect.top)/rect.height*2+1;
   raycaster.setFromCamera(mouse,camera);
   const hits=raycaster.intersectObjects([world],true);
   if(hits.length){const impact=hits[0].point;const choice=impact.x<-15?0:impact.x<17?1:2;revealFact(choice);}
  });
  for(const [i,x] of [[0,-33],[1,4],[2,33]]){
   const button=document.createElement('button');button.type='button';button.className='scene-dot';button.setAttribute('aria-label',`See street insight ${i+1}`);button.textContent='+';stage.append(button);
   button.addEventListener('click',()=>revealFact(i));points.push({button,x});
  }
  const resize=()=>{if(!renderer)return;const rect=stage.getBoundingClientRect(),aspect=Math.max(.3,rect.width/Math.max(1,rect.height));const initialView=pose[0].view;camera.left=-aspect*initialView/2;camera.right=aspect*initialView/2;camera.top=initialView/2;camera.bottom=-initialView/2;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<700?1.25:1.6));renderer.setSize(rect.width,rect.height,false);};
  addEventListener('resize',resize,{passive:true});resize();
  fallback.style.opacity='0';canvas.style.opacity='1';status.textContent='';ready=true;particleStory.setReady(true);
  const initial=samplePose(0);camera.position.set(...initial.eye);camera.lookAt(...initial.at);
  renderer.setAnimationLoop(t=>{
    if(scrollY>section.offsetTop+section.offsetHeight+innerHeight || scrollY+innerHeight<section.offsetTop-innerHeight)return;
    const dt=clamp((t-lastTime)/1000,0,.075);lastTime=t;
    if(!manual){
      const smoothing=reduced.matches?1:(1-Math.exp(-dt*4.5));
      const tourProgress=clamp((progress-.69)/.31,0,1);
      visualProgress+= (tourProgress-visualProgress)*smoothing;
      if(Math.abs(tourProgress-visualProgress)<.00015)visualProgress=tourProgress;
      const p=samplePose(visualProgress);
      camera.position.set(...p.eye);
      controls.target.set(...p.at);
      const aspect=stage.clientWidth/Math.max(1,stage.clientHeight);
      const vh=p.view * (innerWidth<700?.98:1);
      camera.left=-vh*aspect/2;camera.right=vh*aspect/2;camera.top=vh/2;camera.bottom=-vh/2;
      camera.updateProjectionMatrix();camera.lookAt(controls.target);
    }else{controls.update();}
    sun.position.x=mix(-32,34,progress);sun.intensity=mix(sun.intensity,dusk?.65:4,.028);fill.intensity=mix(fill.intensity,dusk?.9:2.5,.04);streetLights.forEach(l=>l.intensity=mix(l.intensity,dusk?6:0,.04));
    for(const pin of points){const pos=new THREE.Vector3(pin.x,2.7,0).project(camera);pin.button.hidden=pos.z>1||pos.z< -1||pos.x<-1||pos.x>1;pin.button.style.left=((pos.x+1)*.5*100)+'%';pin.button.style.top=((1-pos.y)*.5*100)+'%';}
    renderer.render(scene,camera);
  });
 }catch(error){console.error('M0VE 3D unavailable:',error);status.textContent='';canvas.style.opacity='0';fallback.style.opacity='1';particleStory.setReady(false);}
 }
}
