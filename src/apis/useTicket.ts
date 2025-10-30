{/*  ===================================THIS FILE WAS AUTO GENERATED=================================== */}

import { env } from "../env";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { handleApiError } from "./useError";
import type { Ticket } from "../types/Ticket";

// Configure axios defaults for CORS and development
axios.defaults.withCredentials = false;
axios.defaults.headers.common['Content-Type'] = 'application/json';

const BASE_URL = env.API_BASE_URL;

export type TicketsListParams = {
  pageSize?: number;
  pageNumber?: number;
  searchQuery?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  statusFilter?: string; // mapped to &status=
  status?: string;
};

export const getTickets = ({
  pageSize = 5,
  pageNumber = 0,
  searchQuery,
  statusFilter,
  status,
  sortBy,
  sortDirection
}: TicketsListParams = {}) => {

  const { data = { data: [], totalCount: 0 } } = useQuery({
    queryKey: [
      'fetchTickets',
      { pageSize, pageNumber, searchQuery,
        statusFilter,
        status,
        sortBy, sortDirection }
    ],
    queryFn: () => fetchTickets({ pageSize, pageNumber, searchQuery,
      statusFilter,
      status,
      sortBy, sortDirection }),
  });

  return data || { data: [], totalCount: 0 };
};

export const fetchTickets = async ({
  pageSize,
  pageNumber,
  searchQuery,
  statusFilter,
  status,
  sortBy,
  sortDirection
}: Required<Pick<TicketsListParams, 'pageSize' | 'pageNumber'>> & Omit<TicketsListParams, 'pageSize' | 'pageNumber'>): Promise<{ data: Array<Ticket>; totalCount: number }> => {
  try {
    let url = `${BASE_URL}api/ticket/get?pageSize=${pageSize}&pageNumber=${pageNumber + 1}`;

    // Optional server-side filtering & sorting
    if (searchQuery) { url += `&search=${encodeURIComponent(searchQuery)}`; }
    if (statusFilter) { url += `&status=${encodeURIComponent(statusFilter)}`; }
    if (sortBy) { url += `&sortBy=${encodeURIComponent(sortBy)}`; }
    if (sortDirection) { url += `&sortDirection=${sortDirection}`; }

    const response = await axios.get(url);
    const data = response.data;
    return { data: data.data ?? [], totalCount: data.totalCount ?? 0 };
  } catch (error) {
    return handleApiError(error, 'fetch tickets');
  }
};

export const getTicket = async (id?: string): Promise<Ticket> => {
  try {
    const url = `${BASE_URL}api/ticket/getTicketById/${id}`;
    const response = await axios.get(url);
    return response.data as Ticket;
  } catch (error) {
    handleApiError(error, 'get ticket');
    throw error;
  }
};

export const createTicket = async (Ticket?: Ticket): Promise<Ticket> => {
  try {
    const url = `${BASE_URL}api/ticket/createTicket`;
    const response = await axios.post(url, Ticket);
    return response.data as Ticket;
  } catch (error) {
    handleApiError(error, 'create ticket');
    throw error;
  }
};

export const updateTicket = async (ticket?: Ticket): Promise<Ticket> => {
  try {
    const id = ((ticket as any)?.ticketID ?? '').toString();
    const url = `${BASE_URL}api/ticket/updateTicket/${id}`;
    const response = await axios.put(url, ticket);
    return response.data as Ticket;
  } catch (error) {
    handleApiError(error, 'update ticket');
    throw error;
  }
};

export const deleteTicket = async (id: string): Promise<void> => {
  try {
    const url = `${BASE_URL}api/ticket/deleteTicket/${id}`;
    await axios.delete(url);
  } catch (error) {
    handleApiError(error, 'delete ticket');
  }
};

export const fireTicketAction = async (id?: string, status?: string): Promise<Ticket> => {
  try {
    if (!id || !status) {
      throw new Error(`Missing required parameters: id=${id}, status=${status}`);
    }
    let url = `${BASE_URL}api/ticket/updateTicketStatus/${id}/${encodeURIComponent(status)}`;
    let response;
    try {
      response = await axios.get(url);
    } catch (error1: any) {
      const alternatives = [
        `${BASE_URL}api/ticket/updateticketstatus/${id}/${encodeURIComponent(status)}`,
        `${BASE_URL}api/TICKET/UpdateTicketStatus/${id}/${encodeURIComponent(status)}`,
      ];
      let lastError = error1;
      for (const alt of alternatives) {
        try { response = await axios.get(alt); break; }
        catch (e:any) { lastError = e; }
      }
      if (!response) throw lastError;
    }
    const data = response.data;
    return data as Ticket;
  } catch (error) {
    handleApiError(error, 'fire ticket action');
    throw error;
  }
};

