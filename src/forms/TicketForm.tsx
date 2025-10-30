{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeftIcon, XIcon, CheckIcon } from '../components/Icons';
import type { AlertType } from '../env';
import type { Ticket } from '../types/Ticket';
import { createTicket, updateTicket } from '../apis/useTicket';
import { useAuth } from '../hooks/useAuth';

// Zod validation schema (numeric values preprocessed to numbers to support <select> sources)
const ticketSchema = z.object({
  title: z.string().max(200, "Title must be less than 200 characters").min(1, "Title is required"),
  description: z.string().max(1000, "Description must be less than 1000 characters").min(1, "Description is required"),
  status: z.string().min(1, "Status is required").refine(v => (v ?? '') === '' || ["Pending", "In Progress", "Completed", "Cancelled"].includes(v as any), "Invalid Status"),
  createdBy: z.string().min(1, "Created By is required"),
  dueDate: z.string(),
  userID: z.preprocess((v) => (typeof v === 'string' ? (v.trim()==='' ? 0 : Number(v)) : v), z.number().min(1, "User is required")),
});

type TicketFormData = z.infer<typeof ticketSchema>;

interface TicketFormProps {
  onAlert?: (message: string, type: AlertType) => void;
  initialTicket?: Ticket | null;
  isEditMode?: boolean;
}

export default function TicketForm({ onAlert, initialTicket = null, isEditMode = false }: TicketFormProps) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const getDefaultValues = React.useCallback((): TicketFormData => {
    const src = (initialTicket as any) ?? {};
    if (isEditMode && initialTicket) {
      return {
        title: (src?.title ?? ""),
        description: (src?.description ?? ""),
        status: (src?.status ?? ""),
        createdBy: (src?.createdBy ?? ((currentUser?.user?.firstName || "") + " " + (currentUser?.user?.lastName || "")).trim()),
        dueDate: src?.dueDate ? new Date(src?.dueDate as any).toISOString().split('T')[0] : "",
        userID: (src?.userID ?? 0),
      };
    }
    return {
      title: "",
      description: "",
      status: "Pending",
      createdBy: ((currentUser?.user?.firstName || "") + " " + (currentUser?.user?.lastName || "")).trim(),
      dueDate: "",
      userID: currentUser?.user?.userId ?? 0,
    };
  }, [isEditMode, initialTicket]);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: getDefaultValues(),
    resolver: zodResolver(ticketSchema),
  });

  const [hasLoadedItem, setHasLoadedItem] = React.useState(false);
  React.useEffect(() => {
    if (isEditMode && initialTicket && !hasLoadedItem) { reset(getDefaultValues()); setHasLoadedItem(true); }
    else if (!isEditMode) { setHasLoadedItem(false); }
  }, [isEditMode, initialTicket, reset, getDefaultValues, hasLoadedItem]);

  const onSubmitHandler = async (data: TicketFormData) => {
    try {
      const action = isEditMode ? 'Updating' : 'Creating';
      onAlert?.(`${action} ticket...`, 'info');
      const payload: any = {
        ticketID: (isEditMode ? ((initialTicket as any)?.ticketID ?? 0) : 0),
        title: data.title ?? '',
        description: data.description ?? '',
        status: data.status ?? '',
        createdBy: (data.createdBy || ((currentUser?.user?.firstName || "") + " " + (currentUser?.user?.lastName || "")).trim()),
        createdAt : (isEditMode ? ((initialTicket as any)?.createdAt ?? null) : null),
        dueDate: data.dueDate || null,
        completedAt : (isEditMode ? ((initialTicket as any)?.completedAt ?? null) : null),
        userID: data.userID,
      };
      let result: any;
      result = isEditMode ? await updateTicket(payload as Ticket) : await createTicket(payload as Ticket);
      const successAction = isEditMode ? 'updated' : 'created';
      onAlert?.(`Ticket "${result?.title ?? result?.name ?? ''}" ${successAction} successfully!`, 'success');
      navigate('/tickets');
    } catch (error: any) {
      const message = error?.message || 'An unknown error occurred';
      onAlert?.(message, 'error');
      console.error('Error saving record:', error);
    }
  };

  const handleBack = () => navigate(-1);
  const handleCancel = () => { reset(getDefaultValues()); onAlert?.(isEditMode ? 'Form reset to original values!' : 'Form cleared successfully!', 'info'); };

  return (
    <section className="card container">
      <div className="card-header"><h3 className="card-title">{isEditMode ? 'Edit Ticket' : 'Create Ticket'}</h3></div>
      <form className="form" onSubmit={handleSubmit(onSubmitHandler)}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', overflow: 'hidden' }}>
          <Field label="Title" error={errors.title?.message as string}>
            <input className="input" placeholder="Enter title" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }} {...register('title')}  />
          </Field>
          <Field label="Description" error={errors.description?.message as string}>
            <textarea className="input" placeholder="Enter description" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', minHeight: '80px', resize: 'vertical' }} {...register('description')} rows={3} />
          </Field>
          <Field label="Status *" error={errors.status?.message as string}>
            <select className="select" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }} {...register('status')}>
              <option value="">Select Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </Field>
          <Field label="Created By" error={errors.createdBy?.message as string}>
            <input className="input" placeholder="" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }} {...register('createdBy')} readOnly />
          </Field>
          <Field label="Due Date" error={errors.dueDate?.message as string}>
            <input className="input" placeholder="" type="date" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }} {...register('dueDate')} />
          </Field>
          <Field label="User" error={errors.userID?.message as string}>
            <input className="input" placeholder="Select user" type="number" min="0" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }} {...register('userID', { valueAsNumber: true })} />
          </Field>
        </div>
        <div className="form-actions">
          <button className="btn btn-soft" type="button" onClick={handleBack}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ArrowLeftIcon />Back</span>
          </button>
          <button className="btn btn-soft" type="button" onClick={handleCancel}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><XIcon />Cancel</span>
          </button>
          <button className="btn" style={{ background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' }} disabled={isSubmitting}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckIcon />{isSubmitting ? 'Submitting...' : 'Submit'}</span>
          </button>
        </div>
      </form>
    </section>
  );
}

function Field({ label, error, children }: React.PropsWithChildren<{ label: string; error?: string }>) {
  return (
    <div style={{ marginBottom: '8px', minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
        <label className="field-label" style={{ width: '120px', margin: 0, flexShrink: 0, fontSize: '12px' }}>{label}</label>
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>{children}</div>
      </div>
      {error && <div className="field-error" style={{ marginLeft: '128px', fontSize: '12px' }}>{error}</div>}
    </div>
  );
}

