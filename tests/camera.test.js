import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMERA_POSES, CAMERA_STOPS, sampleStreetCamera } from '../src/camera-path.js';

test('opening is a real architectural closeup, not a miniature neighbourhood',()=>{
 assert.equal(CAMERA_POSES.length,5);
 assert.equal(CAMERA_STOPS.length,5);
 assert.ok(CAMERA_POSES[0].view < 7);
 const houseHeight=2.6378293;
 assert.ok(houseHeight/CAMERA_POSES[0].view>.40);
 assert.ok(houseHeight/CAMERA_POSES[1].view>.60);
});
test('camera traverses the street with a real approach and wider ending',()=>{
 assert.ok(CAMERA_POSES[1].view<CAMERA_POSES[0].view);
 assert.ok(CAMERA_POSES[4].view>CAMERA_POSES[0].view);
 assert.ok(CAMERA_POSES[3].eye[0]-CAMERA_POSES[0].eye[0]>20);
});
test('camera path is finite, continuous, reversible and respects endpoints',()=>{
 for(let i=0;i<=1000;i++){
  const p=i/1000;
  const camera=sampleStreetCamera(p);
  assert.ok([camera.view,...camera.eye,...camera.at].every(Number.isFinite));
  assert.ok(camera.view>3&&camera.view<13);
 }
 for(const stop of CAMERA_STOPS.slice(1,-1)){
  const left=sampleStreetCamera(stop-.000001),right=sampleStreetCamera(stop+.000001);
  for(let axis=0;axis<3;axis++){
   assert.ok(Math.abs(left.eye[axis]-right.eye[axis])<.001);
   assert.ok(Math.abs(left.at[axis]-right.at[axis])<.001);
  }
  assert.ok(Math.abs(left.view-right.view)<.001);
 }
 assert.deepEqual(sampleStreetCamera(0).eye,CAMERA_POSES[0].eye);
 assert.deepEqual(sampleStreetCamera(1).at,CAMERA_POSES.at(-1).at);
});
