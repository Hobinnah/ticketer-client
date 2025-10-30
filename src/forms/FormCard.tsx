import React, { useState } from 'react';

export default function FormCard({ onSubmit }: { onSubmit: () => void }) {
  const [f, setF] = useState({ name: "", position: "", office: "", age: 18, start: "", salary: "" });
  const [e, setE] = useState<Record<string,string>>({});
  const set = (k: keyof typeof f, v: any) => setF(p=>({ ...p, [k]: v }));
  const validate = () => {
    const x: Record<string,string> = {};
    if(!f.name) x.name = "Name is required";
    if(!f.position) x.position = "Position is required";
    if(!f.office) x.office = "Office is required";
    if(!String(f.age)) x.age = "Age is required";
    if(!f.start) x.start = "Start date is required";
    if(!f.salary) x.salary = "Salary is required";
    setE(x); return !Object.keys(x).length;
  };
  const submit = (ev: React.FormEvent) => { ev.preventDefault(); if(!validate()) return; onSubmit(); };

  return (
    <section className="card container">
      <div className="card-header"><h3 className="card-title">Create Person</h3></div>
      <form className="form" onSubmit={submit}>
        <div className="grid2">
          <Field label="Name" error={e.name}><input className="input" value={f.name} onChange={(ev)=>set('name', ev.target.value)} /></Field>
          <Field label="Position" error={e.position}><input className="input" value={f.position} onChange={(ev)=>set('position', ev.target.value)} /></Field>
          <Field label="Office" error={e.office}><input className="input" value={f.office} onChange={(ev)=>set('office', ev.target.value)} /></Field>
          <Field label="Age" error={e.age}><input className="input" type="number" value={f.age} onChange={(ev)=>set('age', Number(ev.target.value))} /></Field>
          <Field label="Start date" error={e.start}><input className="input" type="date" value={f.start} onChange={(ev)=>set('start', ev.target.value)} /></Field>
          <Field label="Salary" error={e.salary}><input className="input" value={f.salary} onChange={(ev)=>set('salary', ev.target.value)} placeholder="$0.00" /></Field>
        </div>
        <div className="form-actions">
          <button className="btn btn-soft" type="button">Cancel</button>
          <button className="btn" style={{ background: "var(--primary)", color: "#fff", borderColor: "var(--primary)" }}>Save</button>
        </div>
      </form>
    </section>
  );
}

function Field({ label, error, children }: React.PropsWithChildren<{ label: string; error?: string }>) {
  return (<div className="field"><label className="field-label">{label}</label>{children}{error && <div className="field-error">{error}</div>}</div>);
}