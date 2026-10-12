import test from 'node:test';
import assert from 'node:assert/strict';
import { initWorld } from '../src/world.js';

test('world initialises a closeup fallback and interaction controls before optional WebGL',async()=>{
  const previous={document:globalThis.document,Image:globalThis.Image,matchMedia:globalThis.matchMedia,addEventListener:globalThis.addEventListener,scrollY:globalThis.scrollY,innerHeight:globalThis.innerHeight};
  const wired=[];
  const node=(id)=>({id,style:{width:'',opacity:'',setProperty:()=>{}},classList:{add:()=>{},remove:()=>{},toggle:()=>{}},offsetTop:0,offsetHeight:5400,hidden:false,textContent:'',innerHTML:'',firstElementChild:{textContent:''},addEventListener:(name,fn)=>wired.push([id,name,fn]),getBoundingClientRect:()=>({width:850,height:900}),setAttribute:()=>{}});
  const cache=new Map();const get=id=>{if(!cache.has(id))cache.set(id,node(id));return cache.get(id)};
  globalThis.document={getElementById:get,querySelector:sel=>get(sel),querySelectorAll:()=>[]};
  globalThis.Image=class{constructor(){this.complete=false;this.naturalWidth=0}set src(v){this._src=v}get src(){return this._src}addEventListener(){} };
  globalThis.matchMedia=()=>({matches:false});
  globalThis.addEventListener=(name,fn)=>wired.push(['global',name,fn]);
  globalThis.scrollY=0;
  globalThis.innerHeight=900;
  const previousConsoleError=console.error;console.error=()=>{};
  try{
    assert.doesNotThrow(()=>initWorld());
    assert.equal(get('worldPreview').src,undefined); // Image elements have real src in the HTML, mocked here.
    assert.ok(wired.some(([id,event])=>id==='global'&&event==='scroll'));
    assert.ok(wired.some(([id,event])=>id==='cameraNext'&&event==='click'));
    assert.ok(wired.some(([id,event])=>id==='worldCanvas'&&event==='pointerdown'));
    const scroll=wired.find(([id,event])=>id==='global'&&event==='scroll')[2];
    globalThis.scrollY=2200;
    assert.doesNotThrow(()=>scroll());
    await new Promise(resolve=>setTimeout(resolve,35));
  }finally{
    console.error=previousConsoleError;
    for(const [k,v] of Object.entries(previous)){
      if(v===undefined)delete globalThis[k]; else globalThis[k]=v;
    }
  }
});
