import test from 'node:test';
import assert from 'node:assert/strict';
import {particleStage,particleTimelineLabels} from '../src/particles.js';
test('the real particles form every explicitly requested state in order',()=>{
 const expected=[['logo','logo'],['looking','looking'],['searching','searching'],['house','house'],['buySell','buySell']];
 for(const [label,target] of expected){
  const stage=particleStage(particleTimelineLabels[label]);
  assert.equal(stage.from,target);
  assert.equal(stage.to,target);
 }
});
test('each message actually dissolves into dispersed particles before the next shape',()=>{
 for(const t of [.16,.35,.54,.71]){
  assert.equal(particleStage(t).to,'cloud');
 }
});
test('the final house changes into an expanding cloud that reveals the 3D model',()=>{
 assert.equal(particleStage(.96).from,'house');
 assert.equal(particleStage(.96).to,'explode');
 assert.ok(particleStage(.96).fraction>0);
});
test('particle scene can scrub backwards without losing deterministic phase identity',()=>{
 for(let t=0;t<=1;t+=.01){const s=particleStage(t);assert.ok(s.fraction>=0&&s.fraction<=1)}
 const a=particleStage(.285),b=particleStage(.48);assert.deepEqual(particleStage(.285),a);assert.notDeepEqual(a,b);
});
