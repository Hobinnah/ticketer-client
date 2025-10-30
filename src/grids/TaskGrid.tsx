import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { SortIcon, PencilIcon, TrashIcon, EyeIcon } from '../components/Icons';
import { fetchTasks } from '../apis/useTask';
import type Task from '../types/Task';
import { env, type AlertType } from '../env';

// TypeScript interfaces for component props
export interface ActionItem {
  label: string;
  onClick: (record: any) => void;
  condition?: (record: any) => boolean;
  variant?: 'default' | 'danger' | 'warning';
}

// TaskGrid props - action handlers are passed from parent component (TaskList)
// This makes TaskGrid cleaner and more reusable by focusing only on display and pagination
export interface TaskGridProps {
  initialPageSize?: number;
  onView?: (r:Task)=>void;
  onEdit?: (r:Task)=>void;
  onDelete?: (r:Task, setTasks: React.Dispatch<React.SetStateAction<Task[]>>, setError: React.Dispatch<React.SetStateAction<string | null>>) => Promise<void>;
  onMarkCompleted?: (r:Task) => Promise<void>;
  onMarkInProgress?: (r:Task) => Promise<void>;
  onRevertToPending?: (r:Task) => Promise<void>;
  showActionDropdown?: boolean;
  actionItems?: ActionItem[];
  onAlert?: (message: string, type: AlertType) => void;
}

const TaskGrid: React.FC<TaskGridProps> = ({ initialPageSize = 5, onView, onEdit, onDelete, onMarkCompleted, onMarkInProgress, onRevertToPending, showActionDropdown = false, actionItems = [], onAlert }) => {

  /* 
   * SEARCH STRATEGY IMPLEMENTATION
   * 
   * This component supports two search strategies controlled by env.SEARCH_STRATEGY:
   * 
   * 1. SERVER-SIDE ('server'): 
   *    - Sends search/filter parameters to API
   *    - Server handles filtering, sorting, and pagination
   *    - More efficient for large datasets
   *    - Requires server-side implementation
   * 
   * 2. CLIENT-SIDE ('client'):
   *    - Loads all data from server (paginated in chunks)
   *    - Filters, sorts, and paginates data in browser
   *    - Works with any server that provides data
   *    - Better for smaller datasets or simple server APIs
   */

  // Table column definitions - Grid columns definition
  const columns = [
    { key: "title", label: "Title" },
    { key: "description", label: "Description" },
    { key: "status", label: "Status" },
    { key: "createdBy", label: "Created By" },
    { key: "createdAt", label: "Created Date" },
    { key: "dueDate", label: "Due Date" },
  ] as const;

  // Component state management
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter and sorting state
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [page, setPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{[key: string]: {top?: string, bottom?: string}}>({});
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [visible] = useState<Record<string, boolean>>({});

  // Load tasks from API with optional filtering and sorting
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare parameters based on search strategy
      const params = env.SEARCH_STRATEGY === 'server' ? {
        // Server-side filtering: pass all filter parameters to API
        pageSize,
        pageNumber: page - 1,
        searchQuery: query || undefined,
        statusFilter: statusFilter || undefined,
        sortBy: sort?.key || undefined,
        sortDirection: sort?.dir || undefined
      } : {
        // Client-side filtering: load all records (or large batch) for client-side processing
        pageSize: 1000, // Large number to get all records
        pageNumber: 0,   // Always get from the beginning
        // Don't send filtering parameters - will be handled client-side
      };
      
      const result = await fetchTasks(params);
      
      // Validate the result structure
      if (!result || !Array.isArray(result.data)) {
        console.error('Invalid API response structure:', result);
        throw new Error('Invalid data structure received from API');
      }      
      
      setTasks(result.data || []);
      setTotalCount(result.totalCount || 0);
      
      // console.log('TaskGrid loaded:', { // SECURITY: Contains task data and API response
      //   tasksCount: result.data.length,
      //   totalCount: result.totalCount,
      //   currentPage: page,
      //   pageSize: pageSize,
      //   apiResponse: result
      // });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tasks';
      console.error('TaskGrid loadTasks error:', err);
      setError(errorMessage);
      onAlert?.(errorMessage, 'error');
      // Set empty data on error to prevent further undefined access
      setTasks([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, env.SEARCH_STRATEGY === 'server' 
    ? [pageSize, page, query, statusFilter, sort, onAlert] // Server-side: reload on filter changes
    : [pageSize, onAlert] // Client-side: only reload when pageSize changes (we have all data)
  );

  // Load tasks on component mount and when page/pageSize changes
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Status filter dropdown options - Get unique status values for the dropdown
  const uniqueStatus = useMemo(() => {
    const statuses = [...new Set(tasks.map((task: Task) => task?.status || 'Unknown'))];
    return statuses.sort();
  }, [tasks]);

  // Apply filtering based on search strategy
  const filtered = useMemo(() => {
    if (env.SEARCH_STRATEGY === 'server') {
      // Server-side filtering: display results as-is (already filtered by server)
      return tasks;
    }
    
    // Client-side filtering: apply filters to all loaded data
    if (!query && !statusFilter && !sort) {
      // No filtering needed, return tasks as-is
      return tasks;
    }

    let res = tasks.filter((task: Task) => {
      // Check if task is defined
      if (!task) return false;
      
      // Text search filter with optional chaining
      const searchableText = `${task?.title || ''} ${task?.description || ''} ${task?.status || ''} ${task?.createdBy || ''}`.toLowerCase();
      const matchesSearch = !query || searchableText.includes(query.toLowerCase());
      // Status filter
      const matchesStatus = !statusFilter || task?.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (sort) {
      const { key, dir } = sort;
      res = [...res].sort((a, b) => {
        const aVal = a[key as keyof Task];
        const bVal = b[key as keyof Task];
        return String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      });
      if (dir === "desc") res.reverse();
    }
    return res;
  }, [tasks, query, sort, statusFilter]);

  // Pagination calculations based on search strategy
  const filteredCount = env.SEARCH_STRATEGY === 'server' ? totalCount : filtered.length;
  const pages = Math.max(1, Math.ceil(filteredCount / pageSize));
  const start = (page - 1) * pageSize;
  
  // Display data based on search strategy
  const current = env.SEARCH_STRATEGY === 'server' 
    ? filtered // Server-side: display server-paginated results
    : filtered.slice(start, start + pageSize); // Client-side: apply pagination to filtered results

  // Reset to page 1 when filters change (behavior depends on search strategy)
  useEffect(() => {
    if (query || statusFilter || sort) {
      setPage(1);
      // Server-side filtering: loadTasks will be called automatically due to dependency changes
      // Client-side filtering: handled by useMemo, no API call needed
    }
  }, [query, statusFilter, sort]);

  // Reset to page 1 when pageSize changes and reload data
  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  // Event handlers and effects - Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
      setDropdownPosition({});
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  
  {/* Row action handlers - now using passed props */}
  const handleView = (r:any) => {
    if (onView) {
      onView(r);
    } else {
      // Default behavior: show details in alert
      alert(`Viewing details for "${r?.title}"\n\nDescription: ${r?.description}\nStatus: ${r?.status}\nCreated By: ${r?.createdBy}\nCreated Date: ${r?.createdAt}\nDue Date: ${r?.dueDate}`);
    }
  };
  
  const handleEdit = (r:any) => {
    if (onEdit) {
      onEdit(r);
    } else {
      // Default behavior: show alert
      alert(`Edit functionality not implemented`);
    }
  };
  
  const handleDelete = async (task: Task) => {
    if (onDelete) {
      await onDelete(task, setTasks, setError);
    } else {
      // Default behavior: show alert
      alert(`Delete functionality not implemented`);
    }
  };

  // Status-based action items for dropdown menu
  const defaultActionItems: ActionItem[] = useMemo(() => {
    const baseActions: ActionItem[] = [
      {
        label: 'View',
        onClick: handleView,
      }
    ];

    // Status-specific actions based on current task status
    const statusActions: ActionItem[] = [
      // For Pending tasks: In Progress, View
      {
        label: 'In Progress',
        onClick: async (record) => {
          if (onMarkInProgress) {
            await onMarkInProgress(record);
            // Refresh the grid data after status update
            loadTasks();
          }
        },
        condition: (record) => record?.status === 'Pending',
      },
      // For In Progress tasks: Mark Completed, View  
      {
        label: 'Completed',
        onClick: async (record) => {
          if (onMarkCompleted) {
            await onMarkCompleted(record);
            // Refresh the grid data after status update
            loadTasks();
          }
        },
        condition: (record) => record?.status === 'In Progress',
      },
      // For Completed tasks: Revert to Pending, View
      {
        label: 'Revert',
        onClick: async (record) => {
          if (onRevertToPending) {
            await onRevertToPending(record);
            // Refresh the grid data after status update
            loadTasks();
          }
        },
        condition: (record) => record?.status === 'Completed',
        variant: 'warning' as const,
      }
    ];

    return [...baseActions, ...statusActions];
  }, [handleView, onMarkCompleted, onMarkInProgress, onRevertToPending, loadTasks]);


  // Use provided action items or default ones
  const effectiveActionItems = actionItems.length > 0 ? actionItems : defaultActionItems;

  // Dropdown management with smart positioning
  const toggleDropdown = (recordId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (activeDropdown === recordId) {
      // Close dropdown
      setActiveDropdown(null);
      setDropdownPosition({});
      return;
    }

    // Calculate dropdown position based on available space
    const buttonElement = e.currentTarget as HTMLElement;
    const buttonRect = buttonElement.getBoundingClientRect();
    const tableContainer = buttonElement.closest('.table-wrap') || buttonElement.closest('section');
    const containerRect = tableContainer?.getBoundingClientRect() || { bottom: window.innerHeight };
    
    // Get qualifying actions to estimate dropdown height
    const record = tasks.find(t => t.taskID?.toString() === recordId);
    const actions = record ? getQualifyingActions(record) : [];
    const estimatedDropdownHeight = actions.length * 40 + 8; // ~40px per item + padding
    
    // Check if there's enough space below the button
    const spaceBelow = containerRect.bottom - buttonRect.bottom;
    const shouldOpenUpward = spaceBelow < estimatedDropdownHeight && buttonRect.top > estimatedDropdownHeight;
    
    // Set position for this specific dropdown
    setDropdownPosition({
      [recordId]: shouldOpenUpward 
        ? { bottom: '100%' } 
        : { top: '100%' }
    });
    
    setActiveDropdown(recordId);
  };

  const getQualifyingActions = (record: any) => {
    return effectiveActionItems.filter(action => !action.condition || action.condition(record));
  };



  {/* Component render */}
  return (
    <section className="card container">

      {/* Table header with controls */}
      <div className="card-header">
        <div className="datatable-controls">
          {/* Page size selector */}
          <label className="show">Show
            <select className="select" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              {[5, 10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            entries
          </label>
          
          {/* Development indicator for search strategy */}
          {env.NODE_ENV === 'development' && (
            <span style={{ 
              fontSize: '12px', 
              padding: '2px 6px', 
              backgroundColor: env.SEARCH_STRATEGY === 'server' ? '#e0f2fe' : '#fff3e0',
              color: env.SEARCH_STRATEGY === 'server' ? '#0277bd' : '#ef6c00',
              borderRadius: '4px',
              fontWeight: '500'
            }}>
              {env.SEARCH_STRATEGY.toUpperCase()} SEARCH
            </span>
          )}
          
          <div className="spacer" />

          {/* Column filter by status */}
          <select 
            className="select" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ marginLeft: '8px' }}
          >
            <option value="">All Statuses</option>
            {uniqueStatus.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          {/* Global search input */}
          <input className="input" placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)' }}>
          Loading tasks...
        </div>
      )}
      
      {/* Error state */}
      {error && !loading && (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--danger-color, #dc2626)' }}>
          Error: {error}
        </div>
      )}

      {/* Data table wrapper - only show if not loading and no error */}
      {!loading && !error && (
        <div className="table-wrap">
          <table className="table">
          {/* Table header with sortable columns */}
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
          {/* Table body with data rows */}
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                  {totalCount === 0 ? "No tasks available" : "Loading tasks..."}
                </td>
              </tr>
            ) : (
              current.map(r => r && (
                <tr key={r?.taskID || Math.random()}>
                  {columns.map(c => (visible[c.key] ?? true) && (
                    <td key={c.key}>
                      {c.key === 'createdAt' || c.key === 'dueDate' 
                        ? (r?.[c.key as keyof Task] ? new Date(r?.[c.key as keyof Task] as string).toLocaleDateString() : '-')
                        : String(r?.[c.key as keyof Task] || '-')}
                    </td>
                  ))}
                  <td className="td-actions">
                  {/* Row action buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
                    {/* Primary action buttons */}
                    <button className="icon-link" title="View Details" onClick={()=>handleView(r)} style={{ color: 'var(--primary, #6366f1)' }}><EyeIcon/></button>
                    <button className="icon-link" title="Edit" onClick={()=>handleEdit(r)} style={{ color: 'currentColor' }}><PencilIcon/></button>
                    <button className="icon-link danger" title="Delete" onClick={()=>handleDelete(r)} style={{ color: 'var(--danger-color, #dc2626)' }}><TrashIcon/></button>
                    {/* Dropdown menu for additional actions */}
                    {showActionDropdown && getQualifyingActions(r).length > 0 && (
                      <>
                        {/* Dropdown trigger button */}
                        <button 
                          className="icon-link" 
                          title="More actions" 
                          onClick={(e) => toggleDropdown(r?.taskID?.toString(), e)}
                          style={{ fontSize: '14px', padding: '4px 8px', color: 'currentColor' }}
                        >
                          ⋮
                        </button>
                        {/* Dropdown menu content */}
                        {activeDropdown === r?.taskID?.toString() && (
                          <div style={{
                            position: 'absolute',
                            ...dropdownPosition[r?.taskID?.toString() || ''],
                            right: 0,
                            backgroundColor: 'var(--card-bg, white)',
                            border: '1px solid var(--border-color, #e5e7eb)',
                            borderRadius: '6px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                            zIndex: 1000,
                            minWidth: '160px',
                            padding: '4px 0',
                            display: 'flex',
                            flexDirection: 'column'
                          }}>
                            {getQualifyingActions(r).map((action, index) => (
                              <button
                                key={index}
                                className={`dropdown-item ${action.variant === 'danger' ? 'danger' : action.variant === 'warning' ? 'warning' : ''}`}
                                onClick={() => {
                                  action.onClick(r);
                                  setActiveDropdown(null);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  border: 'none',
                                  background: 'transparent',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  display: 'block',
                                  whiteSpace: 'nowrap',
                                  color: action.variant === 'danger' ? 'var(--danger-color, #dc2626)' : action.variant === 'warning' ? 'var(--warning-color, #d97706)' : '#1f2937',
                                  fontWeight: '500'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = action.variant === 'danger' ? 'var(--danger-bg-hover, rgba(220, 38, 38, 0.1))' : action.variant === 'warning' ? 'var(--warning-bg-hover, rgba(217, 119, 6, 0.1))' : '#f3f4f6';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
        </div>
      )}

      {/* Table footer with pagination - only show if not loading and we have data */}
      {!loading && filteredCount > 0 && (
      <div className="card-footer">
        {/* Showing entries count */}
        <div className="muted">
          {filteredCount === 0 
            ? "No entries found" 
            : env.SEARCH_STRATEGY === 'server'
              ? `Showing ${start + 1} to ${Math.min(start + tasks.length, totalCount)} of ${totalCount} entries`
              : `Showing ${start + 1} to ${Math.min(start + current.length, filteredCount)} of ${filteredCount} entries${filteredCount !== totalCount ? ` (filtered from ${totalCount} total)` : ''}`
          }
        </div>
        {/* Pagination controls */}
        <div className="pagination">
          <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
          {Array.from({ length: pages }).slice(0, 6).map((_, i) => (
            <button key={i} className={`page-btn ${page === i + 1 ? "is-active" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
          ))}
          <button className="page-btn" disabled={page === pages} onClick={() => setPage(p => Math.min(pages, p + 1))}>Next</button>
        </div>
      </div>
      )}

    </section>
  );
};

export default TaskGrid;