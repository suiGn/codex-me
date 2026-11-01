import OverlaySwatch from '/ui/vendor/overlay-swatch/OverlaySwatch.js';
import { hslString } from '/ui/vendor/overlay-swatch/overlaySwatchCore.js';
import { useTint } from './scene-tint-state.js';
const R = window.React, h = R.createElement;
const storageKey = 'codex-me:scene-tint';
function TintEditor() {
  const [revision, setRevision] = R.useState(0), [error, setError] = R.useState('');
  const latest=R.useRef(null), csrf=R.useRef(null), timer=R.useRef(null), busy=R.useRef(false), last=R.useRef('');
  const schedule=R.useRef(null);
  R.useEffect(() => {
    let stopped=false; const controller=new AbortController();
    const flush=async()=>{
      timer.current=null;
      if(stopped || busy.current || !csrf.current || !latest.current)return;
      const body=JSON.stringify(latest.current);if(body===last.current)return;
      busy.current=true;
      try{
        const response=await fetch('/api/scene-tint',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf.current},body,signal:controller.signal});
        if(!response.ok)throw Error(); last.current=body;if(!stopped)setError('');
      }catch{if(!stopped)setError('Could not share overlay color with OBS. Reload to reconnect.');}
      finally{busy.current=false;if(!stopped && JSON.stringify(latest.current)!==body)schedule.current?.();}
    };
    schedule.current=()=>{if(!stopped && !timer.current && !busy.current)timer.current=setTimeout(flush,100);};
    fetch('/api/scene-tint',{cache:'no-store',signal:controller.signal}).then(r=>r.json()).then(data=>{if(!stopped && data.canEdit){csrf.current=data.csrf;schedule.current?.();}}).catch(()=>{if(!stopped)setError('Overlay color disconnected. Reload to reconnect.');});
    const update=event=>{if(event.key===storageKey || event.key===null)setRevision(v=>v+1);};window.addEventListener('storage',update);
    return()=>{stopped=true;clearTimeout(timer.current);controller.abort();window.removeEventListener('storage',update);schedule.current=null;};
  },[]);
  const changed=R.useCallback(value=>{latest.current={h:value.h,s:value.s,l:value.l,a:value.a};schedule.current?.();},[]);
  return h(R.Fragment,null,
    h(OverlaySwatch,{key:revision,overlay:false,target:'#scene-tint',storageKey,defaultOpacity:18,size:32,zIndex:4,onChange:changed,
      style:{position:'absolute',top:16,left:16,right:'auto'},title:'Drag ↔ color · ↕ opacity · Double-click to follow theme'}),
    error?h(window.GUI.Atoms.Typography,{role:'alert',sx:{position:'absolute',top:56,left:16,fontSize:12,zIndex:4}},error):null);
}
export function SceneTint({ transparent }) {
  const tint=useTint();
  return h(R.Fragment,null,
    h('div',{id:'scene-tint','data-scene-tint':true,'aria-hidden':true,style:{position:'absolute',inset:0,pointerEvents:'none',...(transparent?{background:tint?hslString(tint,tint.a):'transparent'}:{})}}),
    transparent?null:h(TintEditor));
}
