import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeftIcon, XIcon, CheckIcon } from '../components/Icons';
import type { AlertType } from '../env';
import type Task from '../types/Task';
import { createTask, updateTask } from '../apis/useTask';
import { useAuth } from '../hooks/useAuth';

// Zod validation schema for task form data
const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  status: z.string().min(1, "Status is required"),
  createdBy: z.string().min(1, "Created by is required").max(100, "Created by must be less than 100 characters"),
  dueDate: z.string().optional(),
  userID: z.number().min(1, "User ID is required")
});

// TypeScript type definitions
type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  onAlert?: (message: string, type: AlertType) => void;
  initialTask?: Task | null;
  isEditMode?: boolean;
}

// Task form component with responsive layout and validation
export default function TaskForm({ onAlert, initialTask, isEditMode = false }: TaskFormProps) {

  // Navigation hook
  const navigate = useNavigate();

  // Authentication hook
  const { currentUser } = useAuth(); 

  // Responsive state management
  const [isMobile, setIsMobile] = React.useState(false);

  // Mobile detection effect
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  // Prepare default values from initial task or defaults
  const getDefaultValues = React.useCallback((): TaskFormData => {
    if (initialTask && isEditMode) {

      return {
        title: initialTask.title || "",
        description: initialTask.description || "",
        status: initialTask.status || "Pending",
        createdBy: initialTask.createdBy || currentUser?.user.firstName + " " + currentUser?.user.lastName || "",
        dueDate: initialTask.dueDate ? new Date(initialTask.dueDate).toISOString().split('T')[0] : "",
        userID: initialTask.userID ?? currentUser?.user.userId ?? 0
      };
    }
    return {
      title: "",
      description: "",
      status: "Pending",
      createdBy: currentUser?.user.firstName + " " + currentUser?.user.lastName,
      dueDate: "",
      userID: currentUser?.user.userId ?? 0
    };
  }, [initialTask, isEditMode]);

  // Form hook configuration with validation
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TaskFormData>({
    defaultValues: getDefaultValues(),
    resolver: zodResolver(taskSchema),
  });

  // Reset form when initialTask changes (for edit mode)
  const [hasLoadedTask, setHasLoadedTask] = React.useState(false);
  
  React.useEffect(() => {

    // console.log('user: ', currentUser);
    if (initialTask && isEditMode && !hasLoadedTask) {
      const formData = getDefaultValues();
      reset(formData);
      // Removed alert - fetching a record is a normal operation and doesn't need notification
      setHasLoadedTask(true);
    } else if (!initialTask || !isEditMode) {
      setHasLoadedTask(false);
    }
  }, [initialTask, isEditMode, reset, getDefaultValues, hasLoadedTask]);

  // Form submission handler for creating/updating tasks
  const onSubmitHandler = async (data: TaskFormData) => {
    try {
      const action = isEditMode ? 'Updating' : 'Creating';
      onAlert?.(`${action} task "${data.title}"...`, 'info');
      
      // Prepare task data for API call (with proper date formatting)
      const taskData = {
        taskID: isEditMode ? (initialTask?.taskID || '') : null, // Will be ignored by server for new tasks
        title: data.title,
        description: data.description || '',
        status: data.status,
        createdBy: data.createdBy || currentUser?.user?.firstName + " " + currentUser?.user?.lastName,
        createdAt: isEditMode ? (initialTask?.createdAt || new Date()) : null,
        dueDate: data.dueDate || null, // Keep as yyyy-mm-dd string format from the date input
        completedAt: data.status === 'Completed' && (initialTask?.completedAt === null || initialTask?.completedAt === undefined) 
                    ? new Date().toISOString().split('T')[0] 
                    : initialTask?.completedAt || null, // Only set completion date if status is 'Completed' and not already completed
        userID: data.userID || currentUser?.user?.userId,
        user: initialTask?.user || null
      };

      // Make API call to save/update the task
      // console.log(`${action} task data:`, taskData); // SECURITY: Contains task data
      
      let result: Task;
      if (isEditMode) {
        result = await updateTask(taskData as Task);
      } else {
        result = await createTask(taskData as Task);
      }
      
      const successAction = isEditMode ? 'updated' : 'created';
      // console.log(`Task ${successAction} successfully:`, result); // SECURITY: Contains task result data
      onAlert?.(`Task "${result.title}" ${successAction} successfully!`, 'success');
      
      // Navigate back to task list after successful save
      // console.log('TaskForm: Navigating to /tasks after successful save');
      navigate("/tasks");
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      
      // Show error in alert component only
      onAlert?.(errorMessage, 'error');
      console.error("Error with task:", errorMessage);
    }
  };

  // Back navigation handler
  const handleBack = () => {
    navigate(-1); // Go back to previous page in history
  };

  // Cancel handler - clears all form entries or resets to initial values
  const handleCancel = () => {
    reset(getDefaultValues()); // Reset form to default values
    const message = isEditMode ? 'Form reset to original values!' : 'Form cleared successfully!';
    onAlert?.(message, 'info');
  };

  // Component render with responsive form layout
  return (
    <section className="card container">
      <div className="card-header"><h3 className="card-title">{isEditMode ? 'Edit Task' : 'Create Task'}</h3></div>
      <form className="form" onSubmit={handleSubmit(onSubmitHandler)}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
          gap: '16px', 
          overflow: 'hidden' 
        }}>
          <Field label="Title" error={errors.title?.message}>
            <input className="input" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }} {...register('title')} />
          </Field>
          <Field label="Status" error={errors.status?.message}>
            <select className="select" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }} {...register('status')}>
              <option value="">Select Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </Field>
          <Field label="Description" error={errors.description?.message}>
            <textarea 
              className="input" 
              style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', minHeight: '80px', resize: 'vertical' }} 
              {...register('description')} 
              rows={3}
            />
          </Field>
          <Field label="Created By" error={errors.createdBy?.message}>
            <input className="input" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }} {...register('createdBy')} readOnly />
          </Field>
          <Field label="Due Date" error={errors.dueDate?.message}>
            <input className="input" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }} type="date" {...register('dueDate')} />
          </Field>
          <Field label="User ID" error={errors.userID?.message}>
            <input className="input" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }} type="number" min="1" {...register('userID', { valueAsNumber: true })} />
          </Field>
        </div>
        <div className="form-actions">
          <button className="btn btn-soft" type="button" onClick={handleBack}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeftIcon />
              Back
            </span>
          </button>
          <button className="btn btn-soft" type="button" onClick={handleCancel}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <XIcon />
              Cancel
            </span>
          </button>
          <button 
            className="btn" 
            style={{ background: "var(--primary)", color: "#fff", borderColor: "var(--primary)" }}
            disabled={isSubmitting}>

            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckIcon />
              {isSubmitting ? "Submitting..." : "Submit"}
            </span>
          </button>
        </div>
      </form>
    </section>
  );
}

// Reusable form field component with label and error display
function Field({ label, error, children }: React.PropsWithChildren<{ label: string; error?: string }>) {
  return (
    <div style={{ marginBottom: '8px', minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
        <label className="field-label" style={{ width: '80px', margin: '0', flexShrink: 0, fontSize: '12px' }}>{label}</label>
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>{children}</div>
      </div>
      {error && <div className="field-error" style={{ marginLeft: '88px', fontSize: '12px' }}>{error}</div>}
    </div>
  );
}