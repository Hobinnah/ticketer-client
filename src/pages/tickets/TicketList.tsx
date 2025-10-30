{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../themes/theme.css';
import useCustomTooltips from '../../hooks/useCustomTooltips';
import TicketGrid from '../../grids/TicketGrid.tsx';
import BreadCrum  from '../../components/BreadCrum';
import MasterLayout from '../../components/MasterLayout';
import Alert from '../../components/Alert';
import { PlusIcon, DownloadIcon } from '../../components/Icons';
import { deleteTicket, fetchTickets, fireTicketAction } from '../../apis/useTicket';
import { env, type AlertType } from '../../env';
import type { Ticket } from '../../types/Ticket';
import TicketViewModal from './TicketViewModal.tsx';

export default function TicketList() {
  useCustomTooltips();
  const navigate = useNavigate();

  const [showActionDropdown, setShowActionDropdown] = React.useState(true);
  const [alerts, setAlerts] = React.useState<{ message: string; type: AlertType; id: number }[]>([]);
  const [viewModalOpen, setViewModalOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Ticket | null>(null);

  const handleAdd = () => {
    navigate('/tickets/new');
  };

  const handleAlert = useCallback((message: string, type: AlertType) => {
    const id = Date.now();
    setAlerts(prev => {
      const filtered = prev.filter(a => a.type !== type && a.message !== message);
      setShowActionDropdown(true);
      return [...filtered, { message, type, id }];
    });
  }, []);

  const removeAlert = (id: number | string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const handleExportData = async () => {
    handleAlert('Data export started...', 'info');
    try {
      const exportData = await fetchTickets({ pageSize: 1000, pageNumber: 0, sortBy: 'title', sortDirection: 'desc' });
      const csvContent = convertToCSV(exportData.data);
      downloadCSV(csvContent, `tickets-export-${new Date().toISOString().split('T')[0]}.csv`);
      handleAlert(`Successfully exported ${exportData.data.length} records!`, 'success');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Export failed';
      handleAlert(msg, 'error');
      console.error('Export error:', error);
    }
  };

  const convertToCSV = (rows: Ticket[]): string => {
    if (!rows || rows.length === 0) return 'No data to export';
    const esc = (v: any) => String(v ?? '').replace(/"/g, '""');
    const fmt = (k: string, v: any) => {
      try {
        if (!v) return '';
        switch (k) {
          case 'createdAt': return new Date(v as any).toLocaleDateString();
          case 'dueDate': return new Date(v as any).toLocaleDateString();
          default: return v;
        }
      } catch { return v; }
    };
    const headers = ["Title", "Description", "Status", "Created By", "Created Date", "Due Date"];
    const keys = ["title", "description", "status", "createdBy", "createdAt", "dueDate"];
    const body = rows.map(r => keys.map(k => `"${esc(fmt(k, (r as any)?.[k]))}"`).join(','));
    return [headers.join(','), ...body].join('\n');
  };

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

  const handleView = useCallback((row: Ticket) => {
    setSelected(row);
    setViewModalOpen(true);
  }, []);

  const handleCloseViewModal = useCallback(() => {
    setViewModalOpen(false);
    setSelected(null);
  }, []);

  const handleEdit = useCallback((row: Ticket) => {
    const id = (row as any)?.ticketID;
    if (id === undefined || id === null) return;
    navigate(`/tickets/${id}`);
  }, [navigate]);

  const handleDelete = useCallback(async (row: Ticket, setItems: React.Dispatch<React.SetStateAction<Ticket[]>>, setError: React.Dispatch<React.SetStateAction<string | null>>) => {
    const id = (row as any)?.ticketID;
    if (id === undefined || id === null) return;
    if (confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      try {
        await deleteTicket(id);
        setItems(prev => prev.filter(x => (x as any)?.ticketID !== id));
        handleAlert('Record deleted successfully', 'success');
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Failed to delete';
        console.error('Delete error:', error);
        setError(msg);
        handleAlert(msg, 'error');
      }
    }
  }, [handleAlert]);

  // Dynamic per-action handlers (fallback).
  const actionHandlers = React.useMemo(() => ({
    "in-progress": async (row: any) => {
      const id = row?.ticketID;
      if (id === undefined || id === null) return;
      await fireTicketAction(id, "In Progress");
      handleAlert('Action executed', 'success');
    },
    "revert": async (row: any) => {
      const id = row?.ticketID;
      if (id === undefined || id === null) return;
      await fireTicketAction(id, "Revert");
      handleAlert('Action executed', 'success');
    },
    "completed": async (row: any) => {
      const id = row?.ticketID;
      if (id === undefined || id === null) return;
      await fireTicketAction(id, "Completed");
      handleAlert('Action executed', 'success');
    },
  }), [handleAlert]);

  const pageContent = React.useMemo(() => [
    <div key="list-content">
      <BreadCrum
        title="Ticket List"
        trail={[{ label: 'Tables' }, { label: 'Ticket List', href: '/tickets', active: true }]}
        actions={[
          { label: 'Add Ticket', variant: 'soft', onClick: handleAdd, icon: <PlusIcon /> },
          { label: 'Export Data', variant: 'warning', onClick: handleExportData, icon: <DownloadIcon /> },
        ]}
      />

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

      <TicketGrid
        initialPageSize={5}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAlert={handleAlert}
        actionHandlers={actionHandlers}
        showActionDropdown={true}
      />

    </div>
  ], [alerts, handleAdd, handleExportData, handleAlert, handleView, handleEdit, handleDelete, actionHandlers]);

  return (
    <>
      <MasterLayout showFooter={true}>
        {...pageContent}
      </MasterLayout>

      {/* Optional View Modal (ensure component exists) */}
      <TicketViewModal
        ticket={selected}
        isOpen={viewModalOpen}
        onClose={handleCloseViewModal}
      />
    </>
  );
}

