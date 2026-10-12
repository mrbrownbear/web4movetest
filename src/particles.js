/* M0VE Particle Story. Deterministic, scrubbed, reversible scroll choreography.
   Genuine point cloud, not DOM text faded in over a background. */
const limit=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=x=>{const t=limit(x);return t*t*(3-2*t)};
const mix=(a,b,t)=>a+(b-a)*t;
const stages=[
 [0,.075,'cloud','logo'],
 [.075,.13,'logo','logo'],
 [.13,.185,'logo','cloud'],
 [.185,.255,'cloud','looking'],
 [.255,.32,'looking','looking'],
 [.32,.375,'looking','cloud'],
 [.375,.45,'cloud','searching'],
 [.45,.515,'searching','searching'],
 [.515,.565,'searching','cloud'],
 [.565,.635,'cloud','house'],
 [.635,.685,'house','house'],
 [.685,.735,'house','cloud'],
 [.735,.81,'cloud','buySell'],
 [.81,.865,'buySell','buySell'],
 [.865,.925,'buySell','house'],
 [.925,1,'house','explode']
];
export function particleStage(time){
 const t=limit(time);
 const item=stages.find((s,i)=>t>=s[0]&&(t<s[1]||i===stages.length-1))||stages.at(-1);
 return {from:item[2],to:item[3],fraction:ease((t-item[0])/(item[1]-item[0]))};
}
export const particleTimelineLabels={logo:.105,looking:.285,searching:.48,house:.655,buySell:.835,model:1};

export function createParticleStory({canvas,stage,hero,heroBottom,preview,webglCanvas,reducedMotion=false}){
 const nothing={update(){},setReady(){},destroy(){}};
 if(!canvas||!stage||typeof canvas.getContext!=='function')return nothing;
 const ctx=canvas.getContext('2d',{alpha:true});
 if(!ctx)return nothing;
 const wrapper=document.getElementById('particleStory');
 const isReduced=!!reducedMotion;
 const hash=x=>{let n=(x*1664525+1013904223)>>>0;n^=n>>>15;n=Math.imul(n,2246822519)>>>0;n^=n>>>13;return(n>>>0)/4294967295};
 const colors=['#f2fff9','#a8ffeb','#63dfd2','#def3fa','#52c2d9'];
 let width=0,height=0,dpr=1,points=[],targets={},p=0,shownModel=0,webglReady=false,raf=0,frame=0;
 let loadedLogo=null,visible=true;
 function count(){return width<=640?1050:width<=1024?1800:2750}
 function sample(context,step){
  const {data,width:w,height:h}=context.getImageData(0,0,width,height),out=[];
  for(let y=0;y<h;y+=step)for(let x=0;x<w;x+=step){
   const pos=(y*w+x)*4;if(data[pos+3]>80&&hash(x*439+y*37)>.12)out.push([x,y]);
  }
  return out;
 }
 function makeTargets(pixels,n){
  if(!pixels.length)pixels=[[width/2,height/2]];
  const result=new Float32Array(n*2);
  const stride=Math.max(1,Math.floor(pixels.length/n));
  for(let i=0;i<n;i++){
   const q=pixels[Math.floor((i*stride+hash(i+101)*stride)%pixels.length)];
   result[i*2]=q[0]+(hash(i+201)-.5)*2;
   result[i*2+1]=q[1]+(hash(i+301)-.5)*2;
  }
  return result;
 }
 function drawMask(draw,n,fontSize){
  const c=document.createElement('canvas');c.width=width;c.height=height;
  const b=c.getContext('2d',{willReadFrequently:true});
  if(!b)return new Float32Array(n*2);
  b.clearRect(0,0,width,height); b.fillStyle='#fff';b.strokeStyle='#fff';b.textAlign='center';b.textBaseline='middle';
  draw(b,width,height,fontSize);
  return makeTargets(sample(b,width<600?4:5),n);
 }
 function letterMask(label,n,desired,options={}){
  const lines=Array.isArray(label)?label:[label];
  return drawMask((b,w,h)=>{
   let size=desired;
   const max=w*(w<600?.88:.83);
   do{b.font=`700 ${size}px Space Grotesk, Arial, sans-serif`;if(Math.max(...lines.map(t=>b.measureText(t).width))<=max)break;size-=2}while(size>18);
   const lineH=size*1.17;
   const y=h*.5-(lines.length-1)*lineH*.5;
   lines.forEach((t,i)=>b.fillText(t,w*.5,y+i*lineH));
  },n,desired);
 }
 function roofMask(n){
  return drawMask((b,w,h)=>{
   const s=Math.min(w*.57,h*.68,480), cx=w*.5,cy=h*.52;
   b.lineWidth=Math.max(8,s*.044);b.lineCap='round';b.lineJoin='round';
   b.beginPath();b.moveTo(cx-s*.55,cy-s*.08);b.lineTo(cx,cy-s*.56);b.lineTo(cx+s*.55,cy-s*.08);b.stroke();
   b.strokeRect(cx-s*.45,cy-s*.07,s*.9,s*.59);
   b.strokeRect(cx-s*.115,cy+s*.12,s*.23,s*.40);
   b.strokeRect(cx-s*.32,cy+s*.065,s*.15,s*.16);
   b.strokeRect(cx+s*.17,cy+s*.065,s*.15,s*.16);
  },n);
 }
 function logoMask(n){
  return drawMask((b,w,h)=>{
   const ratio=(loadedLogo?.naturalHeight||112)/(loadedLogo?.naturalWidth||376);
   const ww=Math.min(w*.73,w<700?330:500),hh=ww*ratio;
   if(loadedLogo?.naturalWidth){
    b.drawImage(loadedLogo,(w-ww)/2,(h-hh)/2,ww,hh);
    // The supplied logo has an opaque white rectangle. Mask that background out.
    const image=b.getImageData(0,0,w,h);
    for(let i=0;i<image.data.length;i+=4){
      const r=image.data[i],g=image.data[i+1],bl=image.data[i+2];
      // Ink / compass content only; white and near-white are made transparent.
      const colour=Math.min(r,g,bl);
      image.data[i+3]=colour<214?255:0;
      image.data[i]=image.data[i+1]=image.data[i+2]=255;
    }
    b.putImageData(image,0,0);
   }else{
    b.font=`700 ${Math.min(140,w*.2)}px Space Grotesk, Arial, sans-serif`;
    b.fillText('M0VE',w*.5,h*.5);
   }
  },n);
 }
 function cloudTargets(n){
  const cloud=new Float32Array(n*2),explode=new Float32Array(n*2);
  for(let i=0;i<n;i++){
   const angle=hash(i+11)*Math.PI*2;
   const radius=Math.sqrt(hash(i+19))*Math.max(width,height)*.63;
   cloud[i*2]=width*.5+Math.cos(angle)*radius;
   cloud[i*2+1]=height*.5+Math.sin(angle)*radius*.74;
   explode[i*2]=width*.5+Math.cos(angle)*Math.max(width,height)*1.15;
   explode[i*2+1]=height*.5+Math.sin(angle)*Math.max(width,height)*.88;
  }
  return {cloud,explode};
 }
 function setup(){
  const r=(wrapper||stage).getBoundingClientRect();
  width=Math.max(280,Math.round(r.width||innerWidth||1280));height=Math.max(250,Math.round(r.height||innerHeight||720));
  dpr=Math.min(devicePixelRatio||1,1.75);
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
  canvas.style.width=width+'px';canvas.style.height=height+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const n=count(); const movement=cloudTargets(n);
  targets={...movement,
   logo:logoMask(n),looking:letterMask('Looking for a home?',n,width<600?40:Math.min(75,width*.057)),
   searching:letterMask('Searching for a home?',n,width<600?37:Math.min(71,width*.052)),
   house:roofMask(n),buySell:letterMask(width<700?['Buy or Sell','with m0ve']:'Buy or Sell with m0ve',n,width<700?44:Math.min(71,width*.057))};
  points=Array.from({length:n},(_,i)=>({speed:.6+hash(i+501)*.5,seed:hash(i+3011)*6.283,rad:width<700?1.7+hash(i+190)*.8:1.65+hash(i+190)*1.25,colour:colors[i%colors.length]}));
 }
 function setReady(value){webglReady=!!value;update(p,true)}
 function update(pageProgress,force=false){
  p=isReduced?1:limit(pageProgress);
  const reveal=ease((p-.615)/.087);
  shownModel=reveal;
  const opacityHero=ease((p-.695)/.065);
  if(hero){hero.style.opacity=opacityHero.toFixed(3);hero.style.setProperty('--intro-enter',`${Math.round((1-opacityHero)*20)}px`);hero.style.pointerEvents=opacityHero>.8?'auto':'none';}
  if(heroBottom)heroBottom.style.opacity=opacityHero.toFixed(3);
  if(wrapper){wrapper.style.opacity=(1-ease((p-.636)/.079)).toFixed(3);wrapper.style.visibility=p>.725?'hidden':'visible';}
  if(stage){stage.style.opacity=reveal.toFixed(3);stage.style.pointerEvents=p>.68?'auto':'none';stage.style.clipPath=`circle(${(reveal*90).toFixed(2)}% at 50% 50%)`;stage.style.setProperty('--world-reveal',reveal.toFixed(3));stage.style.setProperty('--arrival-scale',(1.12-.12*reveal).toFixed(4));}
  if(preview){preview.style.opacity=webglReady?'0':'1';}
  if(webglCanvas){webglCanvas.style.opacity=webglReady?'1':'0';}
  if(force)draw();
 }
 function draw(){
  if(!ctx||!width||!targets.logo)return;
  ctx.clearRect(0,0,width,height);
  if(p>.74&&!isReduced)return;
  const t=limit(p/.69),ph=particleStage(t);
  const a=targets[ph.from],b=targets[ph.to];if(!a||!b)return;
  const n=points.length,s=ph.fraction;
  // Soft glow under the point cloud makes individual dots readable on dark blue.
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(let i=0;i<n;i++){
   const u=a[i*2],v=a[i*2+1],x=b[i*2],y=b[i*2+1];
   const particle=points[i];
   const drift=ph.from!==ph.to ?Math.sin(s*Math.PI)*Math.sin(particle.seed+t*12)*Math.min(width*.038,28):0;
   const xx=mix(u,x,s)+drift, yy=mix(v,y,s)+Math.cos(s*Math.PI*2+particle.seed)*Math.abs(drift)*.65;
   const breathing=Math.sin(frame*.027+particle.seed)*.32;
   let alpha=.55+hash(i+471)*.42;
   if(ph.to==='explode')alpha*=1-s*.96;
   if(ph.to==='cloud'||ph.from==='cloud')alpha*=.7;
   ctx.fillStyle=particle.colour;
   ctx.globalAlpha=alpha;
   ctx.beginPath();ctx.arc(xx,yy,Math.max(.5,particle.rad+breathing),0,Math.PI*2);ctx.fill();
   if(i%17===0){ctx.globalAlpha=alpha*.32;ctx.beginPath();ctx.arc(xx,yy,particle.rad*2.4,0,Math.PI*2);ctx.fill()}
  }
  ctx.restore();
  frame++;
 }
 function loop(){raf=requestAnimationFrame(loop);if(visible&&p<.74)draw()}
 function onResize(){setup();update(p,true)}
 const onVisibility=()=>{visible=!document.hidden};
 const firstLogo=new Image();
 firstLogo.onload=()=>{loadedLogo=firstLogo;setup();update(p,true)};
 firstLogo.src='./assets/brand/m0ve.png';
 setup();update(0,true);
 window.addEventListener('resize',onResize,{passive:true});
 document.addEventListener('visibilitychange',onVisibility);
 // No font or remote dependency blocks the animation. A later font load simply refines letter spacing.
 document.fonts?.ready?.then(()=>{setup();update(p,true)}).catch(()=>{});
 if(!isReduced)raf=requestAnimationFrame(loop);
 return {update,setReady,destroy(){cancelAnimationFrame(raf);window.removeEventListener('resize',onResize);document.removeEventListener('visibilitychange',onVisibility)}};
}
