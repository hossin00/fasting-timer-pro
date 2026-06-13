import { useState, useEffect } from 'react';
import { Timer, Play, Square, RotateCcw, Flame } from 'lucide-react';
import { format, differenceInSeconds, addHours } from 'date-fns';
const AC='#f97316';
const SAVE='ft_v1';
interface FastSession { start:number; end:number|null; target:number; }
const load=():FastSession[]=>{try{return JSON.parse(localStorage.getItem(SAVE)||'[]')}catch{return[]}};
const PROTOCOLS=[{label:'12:12',hours:12},{label:'16:8',hours:16},{label:'18:6',hours:18},{label:'20:4',hours:20},{label:'24h',hours:24},{label:'Custom',hours:0}];
export default function App() {
  const [sessions,setSessions]=useState<FastSession[]>(load);
  const [selected,setSelected]=useState(1); const [customHours,setCustom]=useState(16);
  const [tick,setTick]=useState(0);
  useEffect(()=>{const i=setInterval(()=>setTick(t=>t+1),1000);return()=>clearInterval(i);},[]);
  const save=(s:FastSession[])=>{setSessions(s);localStorage.setItem(SAVE,JSON.stringify(s));};
  const current=sessions.find(s=>!s.end)||null;
  const target=current?current.target:selected===PROTOCOLS.length-1?customHours:PROTOCOLS[selected].hours;
  const elapsed=current?differenceInSeconds(new Date(),new Date(current.start)):0;
  const targetSecs=target*3600;
  const pct=current?Math.min(100,(elapsed/targetSecs)*100):0;
  const remaining=Math.max(0,targetSecs-elapsed);
  const fmtTime=(s:number)=>`${Math.floor(s/3600).toString().padStart(2,'0')}:${Math.floor((s%3600)/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  const streak=()=>{let s=0;const today=new Date().toDateString();for(const ss of [...sessions].reverse()){if(!ss.end)continue;if(ss.end-ss.start>=ss.target*3600*0.9)s++;else break;}return s;};
  const start=()=>{const h=selected===PROTOCOLS.length-1?customHours:PROTOCOLS[selected].hours;save([{start:Date.now(),end:null,target:h},...sessions]);};
  const stop=()=>{if(!current)return;save(sessions.map(s=>!s.end?{...s,end:Date.now()}:s));};
  return (
    <div style={{minHeight:'100vh',background:'#080a0f',display:'flex',flexDirection:'column'}}>
      <header style={{padding:'16px 20px',borderBottom:'1px solid #1a1000',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'36px',height:'36px',borderRadius:'10px',background:`linear-gradient(135deg,${AC},#ea580c)`,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 4px 14px ${AC}30`}}><Timer size={16} color="white"/></div>
          <div style={{fontWeight:'700',fontSize:'16px',color:'white'}}>Fasting Timer Pro</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'6px',background:'#1a1000',border:'1px solid #2c1a00',borderRadius:'8px',padding:'5px 10px'}}>
          <Flame size={13} color={AC}/>
          <span style={{fontSize:'13px',fontWeight:'700',color:AC}}>{streak()}</span>
          <span style={{fontSize:'11px',color:'#92400e'}}>streak</span>
        </div>
      </header>
      <div style={{flex:1,overflow:'auto',padding:'20px',display:'flex',flexDirection:'column',alignItems:'center',gap:'20px'}}>
        {/* Big timer circle */}
        <div style={{position:'relative',width:'220px',height:'220px'}}>
          <svg width="220" height="220" viewBox="0 0 220 220" style={{transform:'rotate(-90deg)'}}>
            <circle cx="110" cy="110" r="100" fill="none" stroke="#1a1000" strokeWidth="10"/>
            <circle cx="110" cy="110" r="100" fill="none" stroke={AC} strokeWidth="10"
              strokeDasharray={`${2*Math.PI*100}`} strokeDashoffset={`${2*Math.PI*100*(1-pct/100)}`}
              strokeLinecap="round" style={{transition:'stroke-dashoffset 1s ease'}}/>
          </svg>
          <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
            <div style={{fontSize:'11px',color:'#92400e',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'4px'}}>{current?'FASTING':'READY'}</div>
            <div style={{fontSize:'36px',fontWeight:'700',color:'white',fontVariantNumeric:'tabular-nums',fontFamily:'monospace'}}>{current?fmtTime(elapsed):'00:00:00'}</div>
            {current&&<div style={{fontSize:'12px',color:'#92400e',marginTop:'4px'}}>of {target}h target</div>}
          </div>
        </div>

        {/* Protocol selector */}
        {!current&&<div style={{display:'flex',flexWrap:'wrap',gap:'8px',justifyContent:'center',width:'100%',maxWidth:'380px'}}>
          {PROTOCOLS.map((p,i)=><button key={p.label} onClick={()=>setSelected(i)}
            style={{padding:'10px 16px',borderRadius:'10px',border:`1px solid ${selected===i?AC:'#1a1000'}`,background:selected===i?AC+'15':'transparent',color:selected===i?'#fb923c':'#92400e',fontSize:'14px',fontWeight:'600',cursor:'pointer',fontFamily:'Inter'}}>{p.label}</button>)}
        </div>}
        {!current&&selected===PROTOCOLS.length-1&&<div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <input type="number" value={customHours} onChange={e=>setCustom(+e.target.value)} min={1} max={72}
            style={{width:'80px',background:'#1a1000',border:`1px solid ${AC}`,borderRadius:'8px',padding:'10px',color:'white',fontSize:'18px',fontWeight:'700',outline:'none',textAlign:'center',fontFamily:'Inter'}}/>
          <span style={{color:'#92400e',fontSize:'14px'}}>hours</span>
        </div>}

        {current&&<div style={{width:'100%',maxWidth:'380px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
          {[['Elapsed',fmtTime(elapsed),'#fb923c'],['Remaining',fmtTime(remaining),'#67e8f9'],['Started',format(new Date(current.start),'h:mm a'),'white'],['Ends',format(addHours(new Date(current.start),current.target),'h:mm a'),pct>=100?AC:'white']].map(([l,v,c])=>(
            <div key={l as string} style={{background:'#1a1000',border:'1px solid #2c1a00',borderRadius:'10px',padding:'12px',textAlign:'center'}}>
              <div style={{fontSize:'10px',color:'#92400e',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'4px'}}>{l as string}</div>
              <div style={{fontSize:'18px',fontWeight:'700',color:String(c),fontFamily:'monospace'}}>{v as string}</div>
            </div>
          ))}
        </div>}

        <button onClick={current?stop:start}
          style={{width:'100%',maxWidth:'300px',padding:'18px',borderRadius:'14px',background:current?'#1a1000':`linear-gradient(135deg,${AC},#ea580c)`,border:`1px solid ${current?'#92400e':AC}`,color:current?'#f87171':'white',fontSize:'16px',fontWeight:'700',cursor:'pointer',fontFamily:'Inter',boxShadow:current?'none':`0 8px 24px ${AC}40`,display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
          {current?<><Square size={18}/>Stop Fast</>:<><Play size={18}/>Start Fasting</>}
        </button>

        {sessions.filter(s=>s.end).slice(0,5).length>0&&<div style={{width:'100%',maxWidth:'380px',background:'#0a0800',border:'1px solid #1a1000',borderRadius:'12px',padding:'14px'}}>
          <div style={{fontSize:'12px',color:'#92400e',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:'10px'}}>Recent Fasts</div>
          {sessions.filter(s=>s.end).slice(0,5).map((s,i)=>{
            const dur=s.end!-s.start; const hrs=dur/3600000;
            const done=hrs>=s.target*0.9;
            return <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:'1px solid #1a1000'}}>
              <div>
                <div style={{color:'white',fontSize:'13px',fontWeight:'500'}}>{hrs.toFixed(1)}h of {s.target}h</div>
                <div style={{color:'#92400e',fontSize:'11px'}}>{format(new Date(s.start),'MMM d, yyyy')}</div>
              </div>
              <span style={{fontSize:'13px',color:done?AC:'#92400e',fontWeight:'600'}}>{done?'✓ Complete':'Partial'}</span>
            </div>;
          })}
        </div>}
      </div>
    </div>
  );
}