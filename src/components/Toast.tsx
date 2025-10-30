
{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}


export type ToastKind = 'info'|'success'|'error';
export type Toast = { id:number; text:string; kind?: ToastKind };

export default function ToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id:number)=>void }) {
  return (
    <div className="toast-wrap">
      {toasts.map(t=> (
        <div key={t.id} className={`toast banner ${t.kind||'info'}`}>
          <div className="t-text">{t.text}</div>
          <button className="t-close" aria-label="Close" onClick={()=>onClose(t.id)}>×</button>
        </div>
      ))}
    </div>
  );
}