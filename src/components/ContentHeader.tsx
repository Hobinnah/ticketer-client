
export default function ContentHeader({ title, trail, actions }: {
  title: string; trail: { label: string; active?: boolean }[];
  actions: { label: string; variant?: 'soft'|'warning'; onClick: ()=>void }[]
}) {
  return (
    <div className="header container">
      <div>
        <h1 className="pagetitle">{title}</h1>
        <div className="breadcrumbs">
          {trail.map((t,i)=> (
            <span key={i} className={`crumb ${t.active? 'active':''}`}>{t.label}{i < trail.length-1 && <span className="sep"> » </span>}</span>
          ))}
        </div>
      </div>
      <div className="actions">
        {actions.map((a,i)=> (
          <button key={i} className={`btn ${a.variant==='soft'? 'btn-soft':''} ${a.variant==='warning'? 'btn-warning':''}`} onClick={a.onClick}>{a.label}</button>
        ))}
      </div>
    </div>
  );
}