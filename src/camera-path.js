/* Source-model calibrated camera choreography. Pure and testable. */
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
 // All points are in the model's real, unscaled coordinates after centering its bounds.
 // Opening vertical span: 6.2 units for houses that are 2.64 units high.
 // The same street is filmed at three scales: establishing, intimate and wider context.
export const CAMERA_POSES=[
  {eye:[-12.2,4.3,-20.2],at:[-18,1.22,-5.4],view:6.2},
  {eye:[-16.5,3.1,-13.0],at:[-18,1.42,-5.1],view:4.25},
  {eye:[-7.0,3.7,-17.1],at:[-3.8,1.3,-3.5],view:5.0},
  {eye:[13.0,4.8,-19.2],at:[16.0,1.35,-3.8],view:5.9},
  {eye:[8.0,8.3,-22.0],at:[8,1.4,0],view:10.8}
 ];
export const CAMERA_STOPS=[0,.23,.49,.76,1];
export const sampleStreetCamera=(p)=>{
  const k=CAMERA_STOPS.findIndex((stop,i)=>i<CAMERA_STOPS.length-1 && p>=stop && p<=CAMERA_STOPS[i+1]);
  const seg=Math.max(0,Math.min(CAMERA_STOPS.length-2,k<0?CAMERA_STOPS.length-2:k));
  const f=clamp((p-CAMERA_STOPS[seg])/Math.max(.0001,CAMERA_STOPS[seg+1]-CAMERA_STOPS[seg]),0,1);
  // Continuous cubic Hermite interpolation gives position, target and zoom smooth first derivatives.
  const interpolate=(part,axis)=>{
   const val=i=>part==='view'?CAMERA_POSES[i].view:CAMERA_POSES[i][part][axis];
   const a=val(seg),b=val(seg+1),before=val(Math.max(0,seg-1)),after=val(Math.min(CAMERA_POSES.length-1,seg+2));
   const m0=(b-before)*.5,m1=(after-a)*.5,t=f,t2=t*t,t3=t2*t;
   return (2*t3-3*t2+1)*a+(t3-2*t2+t)*m0+(-2*t3+3*t2)*b+(t3-t2)*m1;
  };
  return {eye:[0,1,2].map(i=>interpolate('eye',i)),at:[0,1,2].map(i=>interpolate('at',i)),view:interpolate('view',0)};
 };
