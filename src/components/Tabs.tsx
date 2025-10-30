
{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}


export default function Tabs({ value, onChange, options }: { value: string; onChange: (v:any)=>void; options: { value: string; label: string }[] }) {
  return (
    <div className="container tabs">
      {options.map(opt => (
        <button key={opt.value} className={`tab ${value===opt.value? 'is-active':''}`} onClick={()=>onChange(opt.value)}>{opt.label}</button>
      ))}
    </div>
  );
}