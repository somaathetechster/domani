"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef, useCallback } from "react";
import { useDomaniStore } from "@/lib/store/useDomaniStore";
import { LoaderGate }     from "@/components/loader/LoaderGate";
import { audio }          from "@/lib/audio/AudioManager";

const DomaniWorld  = dynamic(
  () => import("@/components/world/DomaniWorld").then(m=>({default:m.DomaniWorld})), {ssr:false}
);
const WorldOverlay = dynamic(
  () => import("@/components/world/WorldOverlay").then(m=>({default:m.WorldOverlay})), {ssr:false}
);
const PortalMenu   = dynamic(
  () => import("@/components/world/PortalMenu").then(m=>({default:m.PortalMenu})), {ssr:false}
);

export function SiteRoot() {
  const siteState    = useDomaniStore(s=>s.siteState);
  const setSiteState = useDomaniStore(s=>s.setSiteState);

  const [showWorld,     setShowWorld]     = useState(false);
  const [loaderOut,     setLoaderOut]     = useState(false);
  const [scrollT,       setScrollT]       = useState(0);
  const [buildComplete, setBuildComplete] = useState(false);
  const [portalOpen,    setPortalOpen]    = useState(false);

  const scrollTRef     = useRef(0);
  const onScroll       = useCallback((t:number)=>{ scrollTRef.current=t; },[]);
  const onReady        = useCallback(()=>{}, []);
  const onBuildComplete= useCallback(()=>{ setBuildComplete(true); },[]);
  const onPortalClick  = useCallback(()=>{ 
    setPortalOpen(true);
    audio.stopAmbientTrack(800);
  },[]);
  
  // FIX: Only schedule the audio restart if we are NOT navigating. 
  // Then double-check inside the timeout to ensure we are actually on the home page.
  const onPortalClose  = useCallback((navigating?: boolean)=>{ 
    setPortalOpen(false);
    if (!navigating) {
      setTimeout(() => {
        if (typeof window !== "undefined" && window.location.pathname === "/") {
          audio.playAmbientTrack();
        }
      }, 400);
    }
  },[]);

  useEffect(()=>{
    if(siteState==="enter"||siteState==="transition") setShowWorld(true);
  },[siteState]);

  useEffect(()=>{
    if(siteState!=="transition") return;
    const t=setTimeout(()=>{ setSiteState("world"); setLoaderOut(true); },1900);
    return()=>clearTimeout(t);
  },[siteState,setSiteState]);

  useEffect(()=>{
    const id=setInterval(()=>{
      const v=scrollTRef.current;
      if(Math.abs(v-scrollT)>0.002) setScrollT(v);
    },40);
    return()=>clearInterval(id);
  },[scrollT]);

  const isWorld=siteState==="world";

  return (
    <>
      {showWorld&&(
        <div style={{position:"fixed",inset:0,zIndex:0,opacity:isWorld?1:0,transition:"opacity 1.2s ease"}}>
          <DomaniWorld
            onReady={onReady}
            onScroll={onScroll}
            onBuildComplete={onBuildComplete}
            onPortalClick={onPortalClick}
          />
          {isWorld&&(
            <>
              <WorldOverlay scrollT={scrollT} buildComplete={buildComplete}/>
              <PortalMenu open={portalOpen} onClose={onPortalClose}/>
            </>
          )}
        </div>
      )}

      <div style={{
        position:"fixed",inset:0,
        zIndex:loaderOut?-1:10,
        opacity:loaderOut?0:1,
        transition:"opacity 0.8s ease, z-index 0s 0.8s",
        pointerEvents:loaderOut?"none":"all",
      }}>
        <LoaderGate/>
      </div>
    </>
  );
}