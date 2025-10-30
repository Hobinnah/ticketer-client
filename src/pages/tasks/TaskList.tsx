import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../themes/theme.css';
import useCustomTooltips from '../../hooks/useCustomTooltips';
import TaskGrid from '../../grids/TaskGrid';
import BreadCrum  from '../../components/BreadCrum';
import MasterLayout from '../../components/MasterLayout';
import Alert from '../../components/Alert';
import TaskViewModal from './TaskViewModal';
import { PlusIcon, DownloadIcon } from '../../components/Icons';
import { deleteTask, fetchTasks, fireTaskAction } from '../../apis/useTask';
import { env, type AlertType } from '../../env';
import type Task from '../../types/Task';
/// import CommentArea from '../../components/CommentArea';

// Task list page component displaying data table with actions
export default function TaskList() {

  // Hooks and navigation setup
  useCustomTooltips();
  const navigate = useNavigate();

  // Component state management
  const [showActionDropdown, setShowActionDropdown] = React.useState(true);
  const [alerts, setAlerts] = React.useState<{ message: string; type: AlertType; id: number }[]>([]);
  const [viewModalOpen, setViewModalOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);

  // Navigation handlers
  const handleAddTask = () => {
    navigate('/tasks/new');
  };

  // Alert system functions
  const handleAlert = useCallback((message: string, type: AlertType) => {
    const id = Date.now();
    setAlerts(prev => {
      // Remove any existing alerts of the same type OR same message
      const filtered = prev.filter(alert => alert.type !== type && alert.message !== message);
      setShowActionDropdown(true);
      return [...filtered, { message, type, id }];
    });
  }, []);

  const removeAlert = (id: number | string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  // Action handlers
  const handleExportData = async () => {
    handleAlert('Data export started...', 'info');
    
    try {
      // Fetch all tasks for export (use a large page size to get all records)
      const exportData = await fetchTasks({ 
        pageSize: 10000, // Large number to get all records
        pageNumber: 0,
        searchQuery: undefined,
        statusFilter: undefined,
        sortBy: 'createdAt',
        sortDirection: 'desc'
      });

      // Convert tasks to CSV format
      const csvContent = convertTasksToCSV(exportData.data);
      
      // Create and trigger download
      downloadCSV(csvContent, `tasks-export-${new Date().toISOString().split('T')[0]}.csv`);
      
      handleAlert(`Successfully exported ${exportData.data.length} tasks!`, 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      handleAlert(errorMessage, 'error');
      console.error('Export error:', error);
    }
  };

  // Helper function to convert tasks to CSV format
  const convertTasksToCSV = (tasks: Task[]): string => {
    if (tasks.length === 0) {
      return 'No data to export';
    }

    // Define CSV headers
    const headers = [
      'Task ID',
      'Title', 
      'Description',
      'Status',
      'Created By',
      'User ID',
      'Created Date',
      'Due Date',
      'Completed Date'
    ];

    // Convert tasks to CSV rows
    const rows = tasks.map(task => [
      task.taskID || '',
      `"${(task.title || '').replace(/"/g, '""')}"`, // Escape quotes in title
      `"${(task.description || '').replace(/"/g, '""')}"`, // Escape quotes in description
      task.status || '',
      task.createdBy || '',
      task.userID?.toString() || '',
      task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '',
      task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '',
      task.completedAt ? new Date(task.completedAt).toLocaleDateString() : ''
    ]);

    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    return csvContent;
  };

  // Helper function to trigger CSV download
  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Task action handlers - implemented here and passed to TaskGrid for cleaner architecture
  const handleTaskView = useCallback((task: Task) => {
    // Open modal with task details
    setSelectedTask(task);
    setViewModalOpen(true);
  }, []);

  // Modal handlers
  const handleCloseViewModal = useCallback(() => {
    setViewModalOpen(false);
    setSelectedTask(null);
  }, []);

  const handleTaskEdit = useCallback((task: Task) => {
    // Navigate to task edit page
    // console.log("Editing task:", task.taskID); // SECURITY: Contains task ID
    navigate(`/tasks/${task?.taskID}`);
  }, [navigate]);

  const handleTaskDelete = useCallback(async (
    task: Task, 
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>, 
    setError: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    // Show confirmation dialog before deleting
    if (confirm(`Are you sure you want to delete "${task?.title}"? This action cannot be undone.`)) {
      try {
        await deleteTask(task?.taskID);
        setTasks(prev => prev.filter(x => x?.taskID !== task?.taskID));
        handleAlert(`Task "${task?.title}" deleted successfully`, 'success');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
        console.error('Failed to delete task:', error);
        setError(errorMessage);
        handleAlert(errorMessage, 'error');
      }
    }
  }, [handleAlert]);

  // Status change handlers for task workflow management
  const handleMarkCompleted = useCallback(async (task: Task) => {
    try {
      await fireTaskAction(task.taskID, 'Completed');
      handleAlert(`Task "${task?.title}" marked as completed`, 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task status';
      console.error('Failed to mark task as completed:', error);
      handleAlert(errorMessage, 'error');
    }
  }, [handleAlert]);

  const handleMarkInProgress = useCallback(async (task: Task) => {
    try {
      await fireTaskAction(task.taskID, 'In Progress');
      handleAlert(`Task "${task?.title}" marked as in progress`, 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task status';
      console.error('Failed to mark task as in progress:', error);
      handleAlert(errorMessage, 'error');
    }
  }, [handleAlert]);

  const handleRevertToPending = useCallback(async (task: Task) => {
    try {
      await fireTaskAction(task.taskID, 'Pending');
      handleAlert(`Task "${task?.title}" reverted to pending`, 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task status';
      console.error('Failed to revert task to pending:', error);
      handleAlert(errorMessage, 'error');
    }
  }, [handleAlert]);

  // TaskGrid now loads data from API - no hardcoded rows needed

  // Page content configuration - using React.useMemo for proper memoization
  const pageContent = React.useMemo(() => [
    <div key="task-list-content">
        <BreadCrum 
            title="Task List"
            trail={[{ label: 'Tables' }, { label: 'Task List', href: '/tasks', active: true }]}
            actions={[
                { label: 'Add Task', variant: 'soft', onClick: handleAddTask, icon: <PlusIcon /> },
                { label: 'Export Data', variant: 'warning', onClick: handleExportData, icon: <DownloadIcon /> },
            ]}
        />

        {/* Alert notifications display */}
        {alerts.map(alert => (
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

        {/* Data table with filtering and actions */}
        <TaskGrid 
          showActionDropdown={showActionDropdown}
          onAlert={handleAlert}
          onView={handleTaskView}
          onEdit={handleTaskEdit}
          onDelete={handleTaskDelete}
          onMarkCompleted={handleMarkCompleted}
          onMarkInProgress={handleMarkInProgress}
          onRevertToPending={handleRevertToPending}
        />

        {/* <CommentArea text="This is a comment area..." /> */}
    </div>
  ], [alerts, showActionDropdown, handleAlert, handleTaskView, handleTaskEdit, handleTaskDelete, handleMarkCompleted, handleMarkInProgress, handleRevertToPending, handleAddTask, handleExportData, removeAlert]);

  // Component render with master layout
  return (
    <>
        <MasterLayout showFooter={true}>
            {...pageContent}
        </MasterLayout>
        
        {/* Task View Modal */}
        <TaskViewModal 
          task={selectedTask}
          isOpen={viewModalOpen}
          onClose={handleCloseViewModal}
        />
    </>
  );
}
