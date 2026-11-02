// Declared chat participants; this is not Twitch's live viewer count.
const R = window.React, h = R.createElement, G = window.GUI;
const { Box, Button, Avatar, Typography } = G.Atoms;
const Monad = R.memo(G.Monad), limit = 6;
export function ViewerRail({ kernels, selected, onSelect, transparent }) {
  if (!kernels.length) return null;
  const visible = kernels.slice(0,limit), extra = kernels.length-visible.length;
  return h('foreignObject', { x: 1544, y: 44, width: 344, height: 82+visible.length*74+(extra?40:0), 'data-viewer-rail': true, pointerEvents: transparent?'none':undefined },
    h(Box, { component:'section', 'aria-label':'Joined participants', sx:{p:1.5,bgcolor:'background.paper',color:'text.primary',border:1,borderColor:'divider',borderRadius:2,boxShadow:2} },
      h(Typography,{sx:{fontFamily:'monospace',fontSize:17,color:'text.secondary',mb:1}},`Joined · ${kernels.length}`),
      h(Box,{role:'list',sx:{display:'grid',gap:.75}},visible.map(kernel=>{
        const profile=Object.fromEntries((kernel.graph?.nodes||[]).filter(n=>n.path.startsWith('twitch.profile.')).map(n=>[n.path.slice(15),n.value]));
        return h(Box,{key:kernel.id,role:'listitem',className:'viewer-arrival'},
          h(Button,{component:transparent?'div':'button',type:transparent?undefined:'button','data-me-id':kernel.id,'data-me-bubble':kernel.id,'data-viewer-row':kernel.id,'data-me-label':kernel.owner,
            role:transparent?'presentation':undefined,tabIndex:transparent?-1:0,'aria-label':`.me kernel @${kernel.owner}`,'aria-pressed':transparent?undefined:selected===kernel.id,
            onClick:transparent?undefined:event=>onSelect(kernel,event.currentTarget),
            sx:{width:'100%',minWidth:0,p:1,gap:1.25,justifyContent:'flex-start',textTransform:'none',color:'text.primary',borderRadius:1,bgcolor:selected===kernel.id?'action.selected':'transparent',cursor:transparent?'default':'pointer'}},
            h(Avatar,{src:profile.profileImageUrl||undefined,alt:`${profile.displayName||kernel.owner}'s Twitch profile`,imgProps:{referrerPolicy:'no-referrer'},sx:{width:48,height:48,fontSize:22,flexShrink:0}},kernel.owner.slice(0,1).toUpperCase()),
            h(Typography,{component:'span',sx:{fontFamily:'monospace',fontSize:21,minWidth:0,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',textAlign:'left'}},`@${kernel.owner}`),
            h(Box,{className:'me-visual','data-viewer-orb':kernel.id,'aria-hidden':true,sx:{width:28,height:28,flexShrink:0,pointerEvents:'none'}},h(Box,{sx:{width:64,height:64,transform:'scale(.4375)',transformOrigin:'top left'}},h(Monad,{kind:'me',variant:'bubble',mode:'contained',seed:kernel.owner,label:`@${kernel.owner} · .me`,solid:true,core:'flat',ring:1,tooltip:false})))));
      })),
      extra?h(Typography,{'data-viewer-overflow':extra,sx:{fontFamily:'monospace',fontSize:18,color:'text.secondary',mt:1}},`+${extra} more`):null));
}
