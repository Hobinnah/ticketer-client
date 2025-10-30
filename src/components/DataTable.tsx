import React, { useEffect, useMemo, useState } from 'react';
import { SortIcon, PencilIcon, TrashIcon } from './Icons';

export interface DataTableProps {
  rows: any[];
  onEdit?: (r:any)=>void;
  onDelete?: (r:any)=>void;
}

const DataTable: React.FC<DataTableProps> = ({ rows, onEdit, onDelete }) => {
  const columns = [
    { key: "name", label: "Name" },
    { key: "position", label: "Position" },
    { key: "office", label: "Office" },
    { key: "age", label: "Age" },
    { key: "start", label: "Start date" },
    { key: "salary", label: "Salary" },
  ] as const;

  const [data, setData] = useState(rows);
  useEffect(()=>setData(rows), [rows]);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    let res = data.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(query.toLowerCase())));
    if (sort) {
      const { key, dir } = sort;
      res = [...res].sort((a,b)=> String(a[key]).localeCompare(String(b[key]), undefined, { numeric: true }));
      if (dir === "desc") res.reverse();
    }
    return res;
  }, [data, query, sort]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const current = filtered.slice(start, start + pageSize);

  useEffect(() => setPage(1), [query, pageSize]);

  const handleEdit = (r:any) => onEdit ? onEdit(r) : null;
  const handleDelete = (r:any) => {
    if (confirm(`Delete ${r.name}?`)) {
      setData(prev => prev.filter(x => x.id !== r.id));
      onDelete && onDelete(r);
    }
  };

  return (
    <section className="card container">
      <div className="card-header">
        <div className="datatable-controls">
          <label className="show">Show
            <select className="select" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              {[10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            entries
          </label>
          <div className="spacer" />
          <div className="col-ctrl">
            <button className="btn">Columns ▾</button>
            <div className="col-pop">
              {columns.map(c => (
                <label key={c.key} className="col-item">
                  <input type="checkbox" checked={visible[c.key] ?? true} onChange={() => setVisible(v=>({ ...v, [c.key]: !(v[c.key] ?? true) }))} /> {c.label}
                </label>
              ))}
            </div>
          </div>
          <input className="input" placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              {columns.map(c => (visible[c.key] ?? true) && (
                <th key={c.key} onClick={() => setSort(s => s?.key === c.key ? { key: c.key, dir: s.dir === "asc" ? "desc" : "asc" } : { key: c.key, dir: "asc" })}>
                  {c.label} {sort?.key === c.key ? (sort.dir === "asc" ? "▲" : "▼") : <SortIcon />}
                </th>
              ))}
              <th className="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {current.map(r => (
              <tr key={r.id}>
                {columns.map(c => (visible[c.key] ?? true) && <td key={c.key}>{r[c.key as keyof typeof r] as any}</td>)}
                <td className="td-actions">
                  <button className="icon-link" title="Edit" onClick={()=>handleEdit(r)}><PencilIcon/></button>
                  <button className="icon-link danger" title="Delete" onClick={()=>handleDelete(r)}><TrashIcon/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card-footer">
        <div className="muted">Showing {start + 1} to {Math.min(start + pageSize, total)} of {total} entries</div>
        <div className="pagination">
          <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
          {Array.from({ length: pages }).slice(0, 6).map((_, i) => (
            <button key={i} className={`page-btn ${page === i + 1 ? "is-active" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
          ))}
          <button className="page-btn" disabled={page === pages} onClick={() => setPage(p => Math.min(pages, p + 1))}>Next</button>
        </div>
      </div>
    </section>
  );
};

export default DataTable;