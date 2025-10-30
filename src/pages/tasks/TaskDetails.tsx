import React from 'react';
import { useParams } from 'react-router-dom';
import MasterLayout from '../../components/MasterLayout';
import TaskForm from '../../forms/TaskForm';
import BreadCrum  from '../../components/BreadCrum';
import Alert from '../../components/Alert';
import { env } from '../../env';
import type { AlertType } from '../../env';
import type Task from '../../types/Task';
import { getTask } from '../../apis/useTask';

// Task details page component for creating and editing tasks
export default function TaskDetails() {
  
  // Get task ID from URL parameters
  const { id: taskId } = useParams<{ id: string }>();
  
  // Component state management
  const [formAlerts, setFormAlerts] = React.useState<{ message: string; type: AlertType; id: string }[]>([]);
  const [task, setTask] = React.useState<Task | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const alertIdCounterRef = React.useRef(0);

  // Alert handler functions
  const handleAlert = React.useCallback((message: string, type: AlertType) => {
    // Generate unique ID by combining timestamp with incrementing counter
    alertIdCounterRef.current += 1;
    const id = `${Date.now()}-${alertIdCounterRef.current}`;
    setFormAlerts(prev => [...prev, { message, type, id }]);
  }, []);

  const removeAlert = (id: number | string) => {
    setFormAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  // Fetch task data when component mounts or taskId changes
  React.useEffect(() => {
    const fetchTask = async () => {
      // Debug: Log the taskId to help identify the issue
      // console.log('TaskDetails - taskId from URL:', taskId); // SECURITY: Contains task ID
      
      // Check if we have a valid task ID (GUID format, not "new", "create", etc.)
      const isValidTaskId = taskId && 
                           taskId !== 'new' && 
                           taskId !== 'create' && 
                           taskId.length >= 32 // && // Minimum length for GUID without dashes
                          //  /^[a-f0-9\-]{8,}$/i.test(taskId); // Basic GUID pattern check
      
      // console.log('TaskDetails - isValidTaskId:', isValidTaskId);
      
      if (isValidTaskId) {
        setLoading(true);
        setIsEditMode(true);
        try {
          const fetchedTask = await getTask(taskId);
          setTask(fetchedTask);
          // Remove the alert here to prevent duplicate alerts
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load task';
          handleAlert(errorMessage, 'error');
          console.error('Error fetching task:', error);
        } finally {
          setLoading(false);
        }
      } else {
        // No valid taskId means we're creating a new task
        setIsEditMode(false);
        setTask(null);
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  // Page content configuration
  const pageContent = [
    <React.Fragment key="task-details-content">
        <BreadCrum 
              title={isEditMode ? "Edit Task" : "Create Task"}
              trail={[
                { label: 'Tables' }, 
                { label: 'Task List', href: '/tasks' }, 
                { label: isEditMode ? 'Edit Task' : 'Create Task', active: true }
              ]}
              actions={[]} />

        {/* Alert notifications display */}
        {formAlerts.map(alert => (
          <Alert
            key={alert.id}
            id={alert.id}
            message={alert.message}
            type={alert.type}
            onRemove={removeAlert}
            autoClose={true}
            duration={env.ALERT_DURATIONS[alert.type]}
          />
        ))}

        {/* Loading indicator */}
        {loading && (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            Loading task data...
          </div>
        )}

        {/* Task form - show only when not loading */}
        {!loading && (
          <TaskForm 
            key={isEditMode ? `edit-${taskId}` : 'create-new'} 
            onAlert={handleAlert}
            initialTask={task}
            isEditMode={isEditMode}
          />
        )}
    </React.Fragment>
  ];

  // Component render with master layout
  return (
    <MasterLayout showFooter={true}>
      {pageContent}
    </MasterLayout>
  );
}
