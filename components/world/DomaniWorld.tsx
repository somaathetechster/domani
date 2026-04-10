"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer }  from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass }      from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass }      from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass }      from "three/examples/jsm/postprocessing/OutputPass.js";
import { RGBShiftShader }  from "three/examples/jsm/shaders/RGBShiftShader.js";

// ─── MONOLITH ─────────────────────────────────────────────────────────────────
const MONO_VERT = /* glsl */`
uniform float uReveal;
varying vec3 vPos; varying vec3 vNorm; varying vec2 vUv;
void main() {
  vPos=position; vNorm=normalize(normalMatrix*normal); vUv=uv;
  vec3 p=position; p.y*=uReveal;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
}`;

const MONO_FRAG = /* glsl */`
uniform float uTime; uniform float uGlow; uniform float uHover;
uniform float uReveal; uniform float uCrumble;
varying vec3 vPos; varying vec3 vNorm; varying vec2 vUv;
float edge(vec2 u,float w){vec2 d=min(u,1.0-u);return 1.0-smoothstep(0.0,w,min(d.x,d.y));}
void main(){
  vec3 base=vec3(0.003,0.006,0.010);
  float band=pow(max(0.0,1.0-abs(vUv.x-0.5)*4.0),2.5)*0.05;
  base+=vec3(0.18,0.60,1.0)*band;
  float e=edge(vUv,0.011);
  float pulse=0.40+0.60*sin(uTime*0.82+vPos.y*1.3);
  float hb=1.0+uHover*2.5;
  float scan=smoothstep(0.90,1.0,fract(uTime*0.20+vPos.y*0.14+uGlow*0.4))*0.50
            +smoothstep(0.62,0.72,fract(uTime*0.20+vPos.y*0.14+uGlow*0.4))*0.12;
  float top=smoothstep(0.0,0.06,1.0-vUv.y)*0.08;
  vec3 cyan=vec3(0.72,0.94,1.0);
  vec3 col=base;
  col+=cyan*e*uGlow*pulse*hb*0.80;
  col+=cyan*scan*uGlow*0.50;
  col+=cyan*top;
  col+=cyan*uHover*0.030;
  if(uCrumble>0.0){float n=fract(sin(dot(vUv,vec2(12.9898,78.233)))*43758.5453);if(n<uCrumble)discard;}
  gl_FragColor=vec4(col,0.97*uReveal);
}`;

// ─── GROUND ───────────────────────────────────────────────────────────────────
const GROUND_VERT = /* glsl */`
varying vec3 vWorld;
void main(){vWorld=(modelMatrix*vec4(position,1.0)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;

const GROUND_FRAG = /* glsl */`
uniform float uTime; uniform float uReveal; uniform vec3 uCam;
varying vec3 vWorld;
float grid(vec2 p,float sz,float th){vec2 g=abs(fract(p/sz)-.5);return 1.0-smoothstep(0.0,th/sz,min(g.x,g.y));}
void main(){
  vec2 wp=vWorld.xz;
  float dist=length(wp-uCam.xz);
  float draw=1.0-smoothstep(uReveal*90.0-14.0,uReveal*90.0,dist);
  float fade=(1.0-smoothstep(10.0,80.0,dist))*draw;
  float g1=grid(wp,2.5,0.030)*0.12;
  float g2=grid(wp,12.0,0.055)*(0.26+0.08*sin(uTime*0.35));
  float g3=grid(wp,50.0,0.070)*0.45;
  float gVal=max(max(g1,g2),g3)*fade;
  vec3 col=vec3(0.003,0.005,0.009)+vec3(0.20,0.75,1.0)*gVal*0.26;
  float rad=1.0-smoothstep(0.0,22.0,dist);
  col+=vec3(0.0,0.022,0.055)*rad*0.5*uReveal;
  gl_FragColor=vec4(col,1.0);
}`;

// ─── STREAM ───────────────────────────────────────────────────────────────────
const STREAM_VERT = /* glsl */`
attribute float aOff; attribute float aSpd;
uniform float uTime; uniform float uReveal;
varying float vA;
void main(){
  float p=fract(aOff+uTime*aSpd*0.42);
  vA=smoothstep(0.0,0.07,p)*smoothstep(1.0,0.93,p)*uReveal;
  vec3 pos=position; pos.y=mix(-0.48,0.48,p);
  gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.0);
  gl_PointSize=2.2;
}`;
const STREAM_FRAG = /* glsl */`
varying float vA;
void main(){
  if(vA<0.01)discard;
  vec2 c=2.0*gl_PointCoord-1.0;float r=dot(c,c);if(r>1.0)discard;
  gl_FragColor=vec4(0.72,0.94,1.0,vA*(1.0-r));
}`;

// ─── CRUMBLE ──────────────────────────────────────────────────────────────────
const CRUMBLE_VERT = /* glsl */`
attribute vec3 aVel; attribute float aPhase;
uniform float uTime; uniform float uState;
varying float vA;
void main(){
  float t=uTime;
  vec3 pos=position+aVel*t*2.2+vec3(0.0,-5.0*t*t,0.0);
  if(uState==2.0){float e=1.0-pow(1.0-clamp(t*0.65,0.0,1.0),3.0);pos=mix(pos,position,e);}
  vA=uState>0.0?0.65:0.0;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.0);gl_PointSize=1.8;
}`;
const CRUMBLE_FRAG = /* glsl */`
varying float vA;
void main(){
  if(vA<0.01)discard;
  vec2 c=2.0*gl_PointCoord-1.0;if(dot(c,c)>1.0)discard;
  gl_FragColor=vec4(0.72,0.94,1.0,vA);
}`;

// ─── PORTAL MONOLITH SHADER — DOMANI text, luminous cyan ──────────────────────
const PORTAL_VERT = /* glsl */`
uniform float uReveal;
uniform float uPulse;
varying vec3 vPos; varying vec2 vUv; varying vec3 vNorm;
void main(){
  vPos=position; vUv=uv; vNorm=normalize(normalMatrix*normal);
  vec3 p=position; p.y*=uReveal;
  // Subtle breathe scale on the whole monolith
  p.xz*=1.0+uPulse*0.008;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
}`;

const PORTAL_FRAG = /* glsl */`
uniform float uTime; uniform float uReveal; uniform float uProximity; uniform float uPulse;
varying vec3 vPos; varying vec2 vUv; varying vec3 vNorm;

// SDF primitives for glyph rendering
float sdBox(vec2 p,vec2 b){vec2 d=abs(p)-b;return length(max(d,0.0))+min(max(d.x,d.y),0.0);}
float sdLine(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float t=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);return length(pa-ba*t);}

// Each letter D-O-M-A-N-I rendered via SDF in UV space (0-1)
// Letters are stacked vertically, uv.y drives which letter
float letterSDF(vec2 uv){
  // Normalise to letter cell
  float cellH=1.0/6.0;
  int letter=int(uv.y/cellH); // 0=D,1=O,2=M,3=A,4=N,5=I
  float ly=fract(uv.y/cellH); // 0-1 within letter
  float lx=uv.x;              // 0-1 across width
  vec2 p=vec2(lx-0.5,ly-0.5)*2.0; // centre at 0,0 scale to -1..1
  float d=1.0;
  if(letter==0){ // D
    d=min(sdLine(p,vec2(-0.3,-0.8),vec2(-0.3,0.8)),0.3);
    d=min(d,length(p-vec2(-0.3,0.0))-0.85);
    d=max(d,-length(p-vec2(-0.3,0.0))+0.45);
  } else if(letter==1){ // O
    float r=length(p); d=abs(r-0.7);
  } else if(letter==2){ // M
    d=min(sdLine(p,vec2(-0.7,-0.8),vec2(-0.7,0.8)),0.05);
    d=min(d,sdLine(p,vec2(0.7,-0.8),vec2(0.7,0.8)));
    d=min(d,sdLine(p,vec2(-0.7,0.8),vec2(0.0,0.1)));
    d=min(d,sdLine(p,vec2(0.7,0.8),vec2(0.0,0.1)));
  } else if(letter==3){ // A
    d=sdLine(p,vec2(0.0,0.8),vec2(-0.6,-0.8));
    d=min(d,sdLine(p,vec2(0.0,0.8),vec2(0.6,-0.8)));
    d=min(d,sdLine(p,vec2(-0.3,0.0),vec2(0.3,0.0)));
  } else if(letter==4){ // N
    d=sdLine(p,vec2(-0.6,-0.8),vec2(-0.6,0.8));
    d=min(d,sdLine(p,vec2(-0.6,0.8),vec2(0.6,-0.8)));
    d=min(d,sdLine(p,vec2(0.6,-0.8),vec2(0.6,0.8)));
  } else { // I
    d=sdLine(p,vec2(0.0,-0.8),vec2(0.0,0.8));
    d=min(d,sdLine(p,vec2(-0.4,0.8),vec2(0.4,0.8)));
    d=min(d,sdLine(p,vec2(-0.4,-0.8),vec2(0.4,-0.8)));
  }
  return d;
}

float edge(vec2 u,float w){vec2 d=min(u,1.0-u);return 1.0-smoothstep(0.0,w,min(d.x,d.y));}

void main(){
  // Ultra-deep obsidian with faint teal interior
  vec3 base=vec3(0.002,0.004,0.008);
  float interiorGlow=uProximity*0.04;
  base+=vec3(0.0,0.08,0.20)*interiorGlow;

  // Edge glow — brighter than normal monoliths
  float e=edge(vUv,0.008);
  float pulse=0.6+0.4*sin(uTime*1.1+vPos.y*0.8);
  float boost=1.0+uProximity*1.8;

  // Scan line — faster on portal
  float scan=smoothstep(0.88,1.0,fract(uTime*0.35+vPos.y*0.10))*0.7;

  // DOMANI text — only on front face (normal pointing toward camera roughly)
  float textMask=0.0;
  if(abs(vNorm.z)>0.3){
    // Text occupies centre 40% width, full height
    float textX=(vUv.x-0.30)/0.40;
    float textY=vUv.y;
    if(textX>0.0&&textX<1.0){
      float sdf=letterSDF(vec2(textX,textY));
      float thickness=0.12+uProximity*0.06;
      textMask=1.0-smoothstep(0.0,thickness,sdf);
      // Animate text — letters light up sequentially
      float cellH=1.0/6.0;
      float letterIdx=vUv.y/cellH;
      float phase=fract(uTime*0.4+letterIdx*0.15);
      textMask*=0.5+0.5*sin(uTime*1.5+letterIdx*0.8);
    }
  }

  vec3 cyan=vec3(0.72,0.94,1.0);
  vec3 hotCyan=vec3(0.85,0.98,1.0);

  vec3 col=base;
  col+=cyan*e*1.2*pulse*boost;
  col+=cyan*scan*0.6;
  // Text — very luminous
  col+=hotCyan*textMask*(1.8+uProximity*1.2);
  // Portal glow — entire surface brightens when near
  col+=cyan*uProximity*0.08;
  // Bloom seed — white hot at text
  col+=vec3(1.0)*textMask*0.6*uProximity;

  gl_FragColor=vec4(col,0.98*uReveal);
}
`;

// ─── SLOTS — 52 monoliths across full world ───────────────────────────────────
type Slot=[number,number,number,number];
const SLOTS:Slot[]=[
  [0,-4,1.4,6.0],[-3.5,-2,0.9,4.0],[3.5,-2,0.9,4.5],
  [-8,-7,1.1,7.2],[8,-6,1.2,5.6],[0,-13,1.8,9.0],
  [-5,-10,0.8,4.2],[5,-11,0.8,4.8],[-6,4,0.9,5.0],[6,5,0.9,4.6],
  [-14,-4,1.2,8.0],[14,-3,1.1,7.5],[-16,-10,1.3,8.8],[16,-9,1.2,8.2],
  [-10,8,1.0,6.0],[10,9,1.0,5.8],[-2,-17,1.6,9.5],[2,-18,1.4,9.0],
  [-22,-4,1.6,11.0],[22,-3,1.4,9.5],[-26,-14,1.2,8.5],[26,-12,1.2,8.0],
  [-18,3,1.0,6.5],[18,4,1.0,6.0],[-20,10,1.1,7.2],[20,11,1.0,6.8],
  [-14,-16,1.5,9.8],[14,-15,1.3,8.2],[0,-24,2.2,13.0],[-10,-22,1.0,6.8],
  [10,-22,1.0,6.2],[-18,-22,1.2,8.5],[18,-21,1.1,8.0],[-4,-28,1.0,7.2],[4,-28,1.0,7.0],
  [-32,-30,1.8,15.0],[32,-28,1.8,14.0],[0,-40,3.0,20.0],[-18,-36,1.4,11.0],[18,-34,1.4,10.5],
  [-8,-34,1.1,8.5],[8,-33,1.0,8.0],
  [-28,12,1.2,9.0],[28,10,1.2,8.5],[-12,13,0.9,6.0],[12,12,0.9,5.5],
  [0,16,1.0,5.0],[-6,18,0.8,4.5],[6,17,0.8,4.2],
  [-36,-20,2.0,13.5],[36,-18,1.8,12.0],
  [-24,6,1.0,6.2],[24,7,1.0,5.8],
];

// ─── SCENE ────────────────────────────────────────────────────────────────────
function buildScene(renderer:THREE.WebGLRenderer) {
  const scene=new THREE.Scene();
  scene.fog=new THREE.FogExp2(0x010204,0.0065);
  scene.background=new THREE.Color(0x000000);

  const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,0.1,500);
  camera.position.set(0,2.2,16);

  scene.add(new THREE.AmbientLight(0x020610,5.0));
  const key=new THREE.DirectionalLight(0x2050a0,2.0); key.position.set(30,60,20); scene.add(key);
  const rim=new THREE.DirectionalLight(0xB8F0FF,0.6); rim.position.set(-30,15,-40); scene.add(rim);

  // Ground
  const groundMat=new THREE.ShaderMaterial({
    vertexShader:GROUND_VERT,fragmentShader:GROUND_FRAG,
    uniforms:{uTime:{value:0},uReveal:{value:0},uCam:{value:new THREE.Vector3()}},
  });
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(400,400),groundMat);
  gnd.rotation.x=-Math.PI/2; gnd.position.y=-2.0; scene.add(gnd);

  // Monoliths
  const monoMats:THREE.ShaderMaterial[]=[];
  const monoMeshes:THREE.Mesh[]=[];
  const monoRevealT:number[]=[];

  SLOTS.forEach(([x,z,sxz,sy],i)=>{
    monoRevealT.push(i*0.085+0.7);
    const mat=new THREE.ShaderMaterial({
      vertexShader:MONO_VERT,fragmentShader:MONO_FRAG,
      uniforms:{uTime:{value:0},uGlow:{value:0.45+Math.random()*0.85},uHover:{value:0},uReveal:{value:0},uCrumble:{value:0}},
      transparent:true,depthWrite:true,
    });
    monoMats.push(mat);
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),mat);
    mesh.scale.set(sxz,sy,sxz);
    mesh.position.set(x,sy/2-2.0,z);
    mesh.rotation.y=(i*0.618)%(Math.PI*0.22)-0.11;
    scene.add(mesh); monoMeshes.push(mesh);
  });

  // Rings on tallest
  const rings:THREE.Mesh[]=[];
  [0,5,11,18,28,35,37].forEach(idx=>{
    if(idx>=SLOTS.length)return;
    const[x,z,sxz,sy]=SLOTS[idx];
    const rmat=new THREE.MeshBasicMaterial({color:0xB8F0FF,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,wireframe:true});
    const r=new THREE.Mesh(new THREE.TorusGeometry(sxz*2.5,0.032,6,48),rmat);
    r.position.set(x,sy*0.65-2.0,z); r.rotation.x=Math.PI/2;
    r.userData.targetOpacity=0.14+Math.random()*0.10;
    r.userData.revealT=3.6+idx*0.06;
    scene.add(r); rings.push(r);
  });

  // Spirals — 16 distributed
  const spiralDefs:[number,number,number,number][]=[
    [0,3.5,-7,3.8],[-14,5,-11,3.2],[16,4.5,-9,2.9],[-7,6,-22,4.4],[10,5.5,-20,3.6],
    [-24,4,-5,2.6],[26,3.5,-4,2.5],[0,7.5,-32,5.2],[-20,6,-24,3.3],[20,5,-26,3.1],
    [-4,4,9,2.9],[5,3.5,8,2.7],[-30,5,-14,2.8],[30,4,-12,2.6],[0,4,-18,3.4],[-12,6,5,2.5],
  ];
  const spirals=new THREE.Group();
  spiralDefs.forEach(([sx,sy,sz,sc],s)=>{
    const pts:THREE.Vector3[]=[];
    const off=(s/spiralDefs.length)*Math.PI*2;
    for(let i=0;i<=80;i++){
      const θ=0.1+(i/80)*Math.PI*1.4,r=0.18*Math.exp(0.28*θ);
      pts.push(new THREE.Vector3(Math.cos(θ+off)*r,Math.sin(θ*0.5)*0.07,Math.sin(θ+off)*r));
    }
    const mat=new THREE.MeshStandardMaterial({
      color:0xB8F0FF,emissive:new THREE.Color(0x28809a),
      emissiveIntensity:0,roughness:0.05,metalness:0.95,transparent:true,opacity:0,
    });
    const tube=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),60,0.010,6,false),mat);
    tube.position.set(sx,sy,sz); tube.scale.setScalar(sc);
    tube.userData.revealT=2.5+s*0.12;
    spirals.add(tube);
  });
  scene.add(spirals);

  // Streams
  const streamMats:THREE.ShaderMaterial[]=[];
  [0,2,5,9,11,16,18,22,28,35,37].forEach(idx=>{
    if(idx>=SLOTS.length)return;
    const[x,z,,sy]=SLOTS[idx];
    const N=100,pos=new Float32Array(N*3),off=new Float32Array(N),spd=new Float32Array(N);
    for(let i=0;i<N;i++){
      pos[i*3]=x+(Math.random()-0.5)*0.22; pos[i*3+1]=-2; pos[i*3+2]=z+(Math.random()-0.5)*0.22;
      off[i]=Math.random(); spd[i]=0.3+Math.random()*0.7;
    }
    const geo=new THREE.BufferGeometry();
    geo.setAttribute("position",new THREE.BufferAttribute(pos,3));
    geo.setAttribute("aOff",new THREE.BufferAttribute(off,1));
    geo.setAttribute("aSpd",new THREE.BufferAttribute(spd,1));
    const mat=new THREE.ShaderMaterial({
      vertexShader:STREAM_VERT,fragmentShader:STREAM_FRAG,
      uniforms:{uTime:{value:0},uReveal:{value:0}},
      transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    });
    streamMats.push(mat);
    const pts=new THREE.Points(geo,mat); pts.scale.y=sy; scene.add(pts);
  });

  // Nodes
  const nodes:THREE.Mesh[]=[];
  ([[-8,4,-6,0.18,2.5],[10,5,-8,0.14,2.7],[0,6.5,-16,0.22,3.0],[-16,3,-3,0.15,2.8],
    [18,4,-5,0.16,2.6],[-24,5,-11,0.12,3.2],[22,6,-13,0.13,3.1],
    [-5,8.5,-23,0.20,3.5],[7,7.5,-29,0.18,3.4],[0,5,-30,0.24,3.8],
   ] as[number,number,number,number,number][]).forEach(([x,y,z,r,rt])=>{
    const m=new THREE.Mesh(new THREE.SphereGeometry(r,8,8),
      new THREE.MeshBasicMaterial({color:0xB8F0FF,transparent:true,opacity:0}));
    m.position.set(x,y,z); m.userData.revealT=rt; scene.add(m); nodes.push(m);
  });

  // Crystal slabs
  ([[-20,4,-8,9,0.11,1.5],[22,5,-6,8,0.11,1.2],[-10,6,-22,13,0.11,0.8],
    [10,7,-27,11,0.11,1.0],[0,8.5,-35,20,0.13,1.0],[-15,5.5,6,10,0.11,1.4],
    [16,4.5,7,9,0.11,1.3],[-26,6,-10,8,0.10,1.6],[26,5.5,-8,8,0.10,1.4],
   ] as[number,number,number,number,number,number][]).forEach(([x,y,z,w,h,d],i)=>{
    const mat=new THREE.ShaderMaterial({
      vertexShader:MONO_VERT,fragmentShader:MONO_FRAG,
      uniforms:{uTime:{value:0},uGlow:{value:0.20+Math.random()*0.35},uHover:{value:0},uReveal:{value:0},uCrumble:{value:0}},
      transparent:true,
    });
    monoMats.push(mat);
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
    mesh.position.set(x,y,z); mesh.rotation.y=(i*0.5)%Math.PI;
    mesh.userData.revealT=4.0+i*0.12; scene.add(mesh);
  });

  // Stars
  const starCount=5000,sp=new Float32Array(starCount*3);
  for(let i=0;i<starCount;i++){
    const r=80+Math.random()*300,θ=Math.random()*Math.PI*2,φ=Math.acos(2*Math.random()-1)*0.45;
    sp[i*3]=Math.sin(φ)*Math.cos(θ)*r;sp[i*3+1]=Math.abs(Math.cos(φ))*r*0.5+2;sp[i*3+2]=Math.sin(φ)*Math.sin(θ)*r;
  }
  const starGeo=new THREE.BufferGeometry();
  starGeo.setAttribute("position",new THREE.BufferAttribute(sp,3));
  const starMat=new THREE.PointsMaterial({color:0x90d0f0,size:0.05,transparent:true,opacity:0,sizeAttenuation:true,depthWrite:false,blending:THREE.AdditiveBlending});
  scene.add(new THREE.Points(starGeo,starMat));

  const horizMat=new THREE.MeshBasicMaterial({color:0x081828,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
  const horizMesh = new THREE.Mesh(new THREE.PlaneGeometry(500, 3), horizMat);
  horizMesh.position.set(0, -1.2, -80);
  scene.add(horizMesh);
  
  // Post
  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.48,0.55,0.13);
  composer.addPass(bloom);
  const rgb=new ShaderPass(RGBShiftShader);
  rgb.uniforms["amount"].value=0.0003;
  composer.addPass(rgb);
  const vigShader={
    uniforms:{tDiffuse:{value:null},d:{value:0.62},o:{value:1.06}},
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`uniform sampler2D tDiffuse;uniform float d,o;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);vec2 uv=(vUv-.5)*2.0;float v=pow(clamp(1.0-dot(uv*o,uv*o),0.0,1.0),d);gl_FragColor=vec4(c.rgb*(0.55+0.45*v),c.a);}`,
  };
  composer.addPass(new ShaderPass(vigShader as any));
  composer.addPass(new OutputPass());

  const raycaster=new THREE.Raycaster();

  // ── PORTAL MONOLITH — placed at end of scroll path, z=-44 ────────────────────
  const portalMat=new THREE.ShaderMaterial({
    vertexShader:   PORTAL_VERT,
    fragmentShader: PORTAL_FRAG,
    uniforms:{
      uTime:      {value:0},
      uReveal:    {value:0},
      uProximity: {value:0}, // 0→1 as camera approaches
      uPulse:     {value:0},
    },
    transparent:true,depthWrite:true,
  });
  // Towering — 3.5 wide, 28 tall — dwarfs all others
  const portalMesh=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),portalMat);
  portalMesh.scale.set(3.5,28,3.5);
  portalMesh.position.set(0,12,-44); // centred in camera path
  portalMesh.userData.isPortal=true;
  scene.add(portalMesh);

  // Portal point light — intense cyan glow at base
  const portalLight=new THREE.PointLight(0xB8F0FF,0,40);
  portalLight.position.set(0,2,-44);
  scene.add(portalLight);

  // Portal aura rings — concentric halos
  const portalRings:THREE.Mesh[]=[];
  [4.5,7,10].forEach((r,i)=>{
    const rm=new THREE.MeshBasicMaterial({color:0xB8F0FF,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,wireframe:true});
    const ring=new THREE.Mesh(new THREE.TorusGeometry(r,0.04,6,64),rm);
    ring.position.set(0,14+i*2,-44);ring.rotation.x=Math.PI/2;
    ring.userData.baseOpacity=0.10-i*0.02;
    scene.add(ring); portalRings.push(ring);
  });

  return {scene,camera,composer,groundMat,monoMats,monoMeshes,monoRevealT,
          streamMats,spirals,rings,nodes,starMat,horizMat,rgb,bloom,raycaster,
          portalMat,portalMesh,portalLight,portalRings};
}

// ─── CRUMBLE SPAWN ────────────────────────────────────────────────────────────
function spawnCrumble(mesh:THREE.Mesh,scene:THREE.Scene,monoMats:THREE.ShaderMaterial[],idx:number){
  const bbox=new THREE.Box3().setFromObject(mesh);
  const size=new THREE.Vector3(); bbox.getSize(size);
  const N=500,pos=new Float32Array(N*3),vel=new Float32Array(N*3),ph=new Float32Array(N);
  for(let i=0;i<N;i++){
    pos[i*3]=(Math.random()-0.5)*size.x+mesh.position.x;
    pos[i*3+1]=Math.random()*size.y+mesh.position.y-size.y/2;
    pos[i*3+2]=(Math.random()-0.5)*size.z+mesh.position.z;
    vel[i*3]=(Math.random()-0.5)*3.2;vel[i*3+1]=Math.random()*3.8+0.8;vel[i*3+2]=(Math.random()-0.5)*3.2;
    ph[i]=Math.random();
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute("position",new THREE.BufferAttribute(pos,3));
  geo.setAttribute("aVel",new THREE.BufferAttribute(vel,3));
  geo.setAttribute("aPhase",new THREE.BufferAttribute(ph,1));
  const mat=new THREE.ShaderMaterial({
    vertexShader:CRUMBLE_VERT,fragmentShader:CRUMBLE_FRAG,
    uniforms:{uTime:{value:0},uState:{value:1}},
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  });
  const pts=new THREE.Points(geo,mat);
  scene.add(pts);
  if(monoMats[idx]) monoMats[idx].uniforms.uCrumble.value=1.0;

  let elapsed=0,phase=1;
  const iv=setInterval(()=>{
    elapsed+=0.016;
    mat.uniforms.uTime.value=elapsed;
    if(phase===1&&elapsed>0.85){
      phase=2;elapsed=0;mat.uniforms.uState.value=2;
      let d=1.0;
      const uiv=setInterval(()=>{
        d=Math.max(0,d-0.055);
        if(monoMats[idx])monoMats[idx].uniforms.uCrumble.value=d;
        if(d<=0)clearInterval(uiv);
      },25);
    }
    if(phase===2&&elapsed>1.3){scene.remove(pts);geo.dispose();mat.dispose();clearInterval(iv);}
  },16);
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
interface Props {
  onReady?:        ()=>void;
  onScroll?:       (t:number)=>void;
  onBuildComplete?:()=>void;
  onPortalClick?:  ()=>void;   // fires when user clicks the portal monolith
}

export function DomaniWorld({onReady,onScroll,onBuildComplete,onPortalClick}:Props) {
  const onReadyRef         = useRef(onReady);
  const onScrollRef        = useRef(onScroll);
  const onBuildCompleteRef = useRef(onBuildComplete);
  const onPortalClickRef   = useRef(onPortalClick);
  useEffect(()=>{onReadyRef.current=onReady;},[onReady]);
  useEffect(()=>{onScrollRef.current=onScroll;},[onScroll]);
  useEffect(()=>{onBuildCompleteRef.current=onBuildComplete;},[onBuildComplete]);
  useEffect(()=>{onPortalClickRef.current=onPortalClick;},[onPortalClick]);

  const mountRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    if(!mountRef.current) return;

    const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.setSize(innerWidth,innerHeight);
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=0.80;
    mountRef.current.appendChild(renderer.domElement);

    const{scene,camera,composer,groundMat,monoMats,monoMeshes,monoRevealT,
          streamMats,spirals,rings,nodes,starMat,horizMat,rgb,bloom,raycaster,
          portalMat,portalMesh,portalLight,portalRings}=buildScene(renderer);

    onReadyRef.current?.();

    // Camera
    const camPos=new THREE.Vector3(0,2.2,16);
    const camYaw={v:0}, camPitch={v:0};
    const mouse={x:0,y:0};
    let scrollDepth=0,targetDepth=0;
    const MAX_DEPTH=42;

    // Build state
    let buildT=0,building=true,buildComplete=false;
    const BUILD_DUR=6.5;

    // Hover/crumble
    const hoverBlend=new Array(monoMeshes.length).fill(0);
    const crumbleFired=new Set<number>();

    let raf=0;
    const t0=performance.now();

    const onMove=(e:MouseEvent)=>{
      mouse.x=(e.clientX/innerWidth-.5)*2;
      mouse.y=(e.clientY/innerHeight-.5)*2;
    };

    // Click — check if portal monolith was clicked
    const onClick=(e:MouseEvent)=>{
      if(building) return;
      const ndcX=(e.clientX/innerWidth-.5)*2;
      const ndcY=-(e.clientY/innerHeight-.5)*2;
      const clickRay=new THREE.Raycaster();
      clickRay.setFromCamera(new THREE.Vector2(ndcX,ndcY),camera);
      const hits=clickRay.intersectObject(portalMesh);
      if(hits.length>0) onPortalClickRef.current?.();
    };
    const onWheel=(e:WheelEvent)=>{
      if(!building) targetDepth=Math.max(0,Math.min(MAX_DEPTH,targetDepth+e.deltaY*0.022));
    };
    let lastTY=0;
    const onTS=(e:TouchEvent)=>{lastTY=e.touches[0].clientY;};
    const onTM=(e:TouchEvent)=>{
      const dy=lastTY-e.touches[0].clientY; lastTY=e.touches[0].clientY;
      if(!building) targetDepth=Math.max(0,Math.min(MAX_DEPTH,targetDepth+dy*0.055));
    };
    const onResize=()=>{
      camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix();
      renderer.setSize(innerWidth,innerHeight); composer.setSize(innerWidth,innerHeight);
    };

    window.addEventListener("mousemove",onMove);
    window.addEventListener("click",onClick);
    window.addEventListener("wheel",onWheel,{passive:true});
    window.addEventListener("touchstart",onTS,{passive:true});
    window.addEventListener("touchmove",onTM,{passive:true});
    window.addEventListener("resize",onResize);

    function animate(){
      raf=requestAnimationFrame(animate);
      const t=(performance.now()-t0)/1000;

      if(building){
        buildT=t;
        if(buildT>=BUILD_DUR){
          building=false; buildT=BUILD_DUR;
          if(!buildComplete){ buildComplete=true; onBuildCompleteRef.current?.(); }
        }

        groundMat.uniforms.uReveal.value=Math.min(buildT/1.3,1.0);
        starMat.opacity=Math.max(0,Math.min(1,(buildT-0.3)/1.5))*0.42;
        (horizMat as any).opacity=Math.max(0,Math.min(1,(buildT-0.8)/1.2))*0.28;

        monoMats.forEach((mat,i)=>{
          const delay=monoRevealT[i];
          const prog=Math.max(0,Math.min(1,(buildT-delay)/0.60));
          const eased=1-Math.pow(1-prog,3);
          mat.uniforms.uReveal.value=eased;
          mat.uniforms.uTime.value=t;
          mat.uniforms.uGlow.value=eased*(0.35+0.55*Math.sin(t*0.82+i*0.9));
        });

        const sr=Math.max(0,Math.min(1,(buildT-2.2)/1.2));
        streamMats.forEach(m=>{m.uniforms.uTime.value=t;m.uniforms.uReveal.value=sr;});

        spirals.children.forEach((child,i)=>{
          const prog=Math.max(0,Math.min(1,(buildT-(child as any).userData.revealT)/0.75));
          const mat=(child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          mat.opacity=prog*0.75; mat.emissiveIntensity=prog*1.8;
          child.rotation.y=t*0.07*(i%2===0?1:-1);
        });

        rings.forEach(ring=>{
          const prog=Math.max(0,Math.min(1,(buildT-ring.userData.revealT)/0.6));
          (ring.material as THREE.MeshBasicMaterial).opacity=prog*ring.userData.targetOpacity;
        });

        nodes.forEach(node=>{
          const prog=Math.max(0,Math.min(1,(buildT-node.userData.revealT)/0.5));
          (node.material as THREE.MeshBasicMaterial).opacity=prog*0.58;
        });

        // Portal reveals last — after all others
        const portalProg=Math.max(0,Math.min(1,(buildT-5.5)/1.0));
        portalMat.uniforms.uReveal.value=portalProg;

      } else {
        scrollDepth+=(targetDepth-scrollDepth)*0.075;

        monoMats.forEach((mat,i)=>{
          mat.uniforms.uTime.value=t;
          mat.uniforms.uGlow.value=0.35+0.55*Math.sin(t*0.82+i*0.9);
        });
        streamMats.forEach(m=>{m.uniforms.uTime.value=t;});
        spirals.children.forEach((child,i)=>{
          child.rotation.y=t*0.07*(i%2===0?1:-1);
          child.rotation.x=Math.sin(t*0.09+i)*0.05;
          child.position.y+=Math.sin(t*0.28+i*1.2)*0.0008;
        });
        rings.forEach((ring,i)=>{ring.rotation.z=t*(0.14+i*0.03)*(i%2===0?1:-1);});

        // Portal — proximity based on scroll depth
        const proximity=Math.max(0,Math.min(1,(scrollDepth-28)/14));
        portalMat.uniforms.uTime.value=t;
        portalMat.uniforms.uProximity.value=proximity;
        portalMat.uniforms.uPulse.value=Math.sin(t*1.8)*0.5+0.5;
        portalLight.intensity=proximity*6.0;
        portalRings.forEach((ring,i)=>{
          ring.rotation.z=t*(0.2+i*0.08)*(i%2===0?1:-1);
          (ring.material as THREE.MeshBasicMaterial).opacity=proximity*ring.userData.baseOpacity*(0.6+0.4*Math.sin(t*1.2+i));
        });

        // Raycaster hover
        raycaster.setFromCamera(new THREE.Vector2(mouse.x,-mouse.y),camera);
        const hits=raycaster.intersectObjects(monoMeshes);
        const hitIdx=hits.length>0?monoMeshes.indexOf(hits[0].object as THREE.Mesh):-1;

        hoverBlend.forEach((v,i)=>{
          const tgt=i===hitIdx?1.0:0.0;
          hoverBlend[i]+=(tgt-v)*0.09;
          if(i<monoMats.length) monoMats[i].uniforms.uHover.value=hoverBlend[i];
          if(hoverBlend[i]>0.75&&!crumbleFired.has(i)&&i<monoMeshes.length){
            crumbleFired.add(i);
            spawnCrumble(monoMeshes[i],scene,monoMats,i);
          }
          if(hoverBlend[i]<0.05) crumbleFired.delete(i);
        });
      }

      // Camera — mouse look + scroll walk
      camYaw.v+=((-mouse.x*0.50)-camYaw.v)*0.055;
      camPitch.v+=((-mouse.y*0.20)-camPitch.v)*0.055;
      camPos.z+=((16-scrollDepth)-camPos.z)*0.07;
      camera.position.copy(camPos);
      const lx=Math.sin(camYaw.v)*Math.cos(camPitch.v);
      const ly=Math.sin(camPitch.v);
      const lz=-Math.cos(camYaw.v)*Math.cos(camPitch.v);
      camera.lookAt(camPos.x+lx*12,camPos.y+ly*12,camPos.z+lz*12);

      groundMat.uniforms.uTime.value=t;
      groundMat.uniforms.uCam.value.copy(camera.position);
      rgb.uniforms["amount"].value=0.0003;
      bloom.strength=0.45+Math.sin(t*0.28)*0.06;

      composer.render();
      onScrollRef.current?.(scrollDepth/MAX_DEPTH);
    }

    animate();

    return ()=>{
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove",onMove);
      window.removeEventListener("click",onClick);
      window.removeEventListener("wheel",onWheel);
      window.removeEventListener("touchstart",onTS);
      window.removeEventListener("touchmove",onTM);
      window.removeEventListener("resize",onResize);
      renderer.dispose();
      if(mountRef.current?.contains(renderer.domElement)){
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  return <div ref={mountRef} style={{position:"fixed",inset:0,zIndex:0}}/>;
}