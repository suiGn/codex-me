import { useFace } from './face-state.js';
import { drawFaceMesh } from '/ui/face-mesh.js';
const h = React.createElement;
export function FacePoints() {
  const face=useFace(), canvas=React.useRef(null), theme=window.GUI.useThemeContext();
  React.useLayoutEffect(()=>{if(canvas.current)drawFaceMesh(canvas.current,{points:face?.points,aspect:face?.aspect,colors:face?.colors});},[face,theme.themeId,theme.mode]);
  if(!face?.points?.length)return null;
  return h('foreignObject',{x:0,y:0,width:1920,height:1080,pointerEvents:'none','aria-hidden':true},h('canvas',{ref:canvas,width:1920,height:1080,'data-face-points':true,style:{width:'100%',height:'100%'}}));
}
