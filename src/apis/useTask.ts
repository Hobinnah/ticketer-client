import { env } from "../env";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type Task from "../types/Task";

// Configure axios defaults for CORS and development
axios.defaults.withCredentials = false;
axios.defaults.headers.common['Content-Type'] = 'application/json';

const BASE_URL = env.API_BASE_URL;

export const getTasks = ({ 
    pageSize = 5, 
    pageNumber = 0,
    searchQuery,
    statusFilter,
    sortBy,
    sortDirection
}: { 
    pageSize?: number; 
    pageNumber?: number;
    searchQuery?: string;
    statusFilter?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
} = {}) => {
        
    const { data = { data: [], totalCount: 0 } } = useQuery({
    queryKey: ['fetchTasks', { pageSize, pageNumber, searchQuery, statusFilter, sortBy, sortDirection }],
    queryFn: () => fetchTasks({ pageSize, pageNumber, searchQuery, statusFilter, sortBy, sortDirection }),
    });

    return data || { data: [], totalCount: 0 };
};

export const fetchTasks = async ({ 
    pageSize, 
    pageNumber, 
    searchQuery, 
    statusFilter, 
    sortBy, 
    sortDirection 
}: { 
    pageSize: number; 
    pageNumber: number;
    searchQuery?: string;
    statusFilter?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
}): Promise<{ data: Array<Task>; totalCount: number }> => {
    
    try {
        let url = `${BASE_URL}api/task/getAllTasks?pageSize=${pageSize}&pageNumber=${pageNumber + 1}`;
        
        // Add optional query parameters for server-side filtering and sorting
        if (searchQuery) {
            url += `&search=${encodeURIComponent(searchQuery)}`;
        }
        if (statusFilter) {
            url += `&status=${encodeURIComponent(statusFilter)}`;
        }
        if (sortBy) {
            url += `&sortBy=${encodeURIComponent(sortBy)}`;
        }
        if (sortDirection) {
            url += `&sortDirection=${sortDirection}`;
        }
        
        // console.log('API URL: ', url); // SECURITY: Could expose API endpoints
        const response = await axios.get(url);
        const data = response.data;

        // console.log('paged: ', data); // SECURITY: Contains task data
        // console.log('totalCount: ', data.totalCount);

        return { data: data.data, totalCount: data.totalCount };
    } catch (error) {
        return handleApiError(error, 'fetch tasks');
    }
};


export const getTask = async (id? : string): Promise<Task> => {

    try {
        const url = `${BASE_URL}api/task/getTaskById/${id}`;
        const response = await axios.get(url);
        const data = response.data;

        // console.log(url);
        // console.log(data);

        return data as Task;
    } catch (error) {
        handleApiError(error, 'get task'); // This will throw, no return needed
        throw error; // This line will never be reached but satisfies TypeScript
    }
};

export const createTask = async (Task? : Task): Promise<Task> => {

    try {
        const url = `${BASE_URL}api/task/createTask`;
        // console.log('Create task URL:', url);
        // console.log('Create task data:', Task); // SECURITY: Contains task data
        const response = await axios.post(url, Task);
        return response.data as Task;
    } catch (error) {
        handleApiError(error, 'create task'); // This will throw, no return needed
        throw error; // This line will never be reached but satisfies TypeScript
    }
};

export const updateTask = async (task? : Task): Promise<Task> => {

    try {
        const url = `${BASE_URL}api/task/updateTask/${task?.taskID}`;    
        // console.log('Update task URL:', url);
        // console.log('Update task data:', task); // SECURITY: Contains task data
        const response = await axios.put(url, task);
        return response.data as Task;
    } catch (error) {
        handleApiError(error, 'update task'); // This will throw, no return needed
        throw error; // This line will never be reached but satisfies TypeScript
    }
};

export const deleteTask = async (id: string): Promise<void> => {

    try {
        const url = `${BASE_URL}api/task/deleteTask/${id}`;
        await axios.delete(url);
        // No return data expected for delete operations
    } catch (error) {
        handleApiError(error, 'delete task');
    }
};

// Helper function to handle API errors and extract server messages
const handleApiError = (error: unknown, operation: string): never => {
    if (axios.isAxiosError(error)) {
        // Handle CORS errors specifically
        if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
            throw new Error(`Connection failed: Please check if the API server is running and CORS is configured. Unable to ${operation}.`);
        }
        
        // Handle other axios errors and properly extract message
        let serverMessage = 'Unknown server error';
        
        if (error.response?.data) {
            const data = error.response.data;
            
            // Try different ways to extract error message
            if (typeof data === 'string') {
                serverMessage = data;
            } else if (data.message) {
                serverMessage = data.message;
            } else if (data.error) {
                serverMessage = data.error;
            } else if (data.title) {
                serverMessage = data.title;
            } else if (data.detail) {
                serverMessage = data.detail;
            } else {
                // If it's an object, try to stringify it nicely
                try {
                    serverMessage = JSON.stringify(data);
                } catch {
                    serverMessage = `Server returned ${error.response.status} ${error.response.statusText}`;
                }
            }
        } else if (error.message) {
            serverMessage = error.message;
        }
        
        throw new Error(`Failed to ${operation}: ${serverMessage}`);
    }
    
    // Handle non-axios errors
    if (error instanceof Error) {
        throw new Error(`Failed to ${operation}: ${error.message}`);
    }
    
    throw new Error(`Failed to ${operation}: Unknown error occurred`);
};

export const fireTaskAction = async (id? : string, status? : string): Promise<Task> => {

    try {
        // Validate required parameters
        if (!id || !status) {
            throw new Error(`Missing required parameters: id=${id}, status=${status}`);
        }

        // Try the original URL format first
        let url = `${BASE_URL}api/task/UpdateTaskStatus/${id}/${encodeURIComponent(status)}`;
        // console.log('FireTaskAction URL (attempt 1):', url); // SECURITY: Could expose API endpoints
        // console.log('FireTaskAction params:', { id, status });
        
        let response;
        try {
            // Try GET first (as original)
            response = await axios.get(url);
            // console.log('Success with GET method');
        } catch (error1: any) {
            // console.log('First URL format failed:', error1.response?.status);
            
            // Try alternative URL format (maybe the server expects different casing or structure)
            const alternativeUrls = [
                `${BASE_URL}api/task/updateTaskStatus/${id}/${encodeURIComponent(status)}`,
                `${BASE_URL}api/Task/UpdateTaskStatus/${id}/${encodeURIComponent(status)}`,
                `${BASE_URL}api/tasks/UpdateTaskStatus/${id}/${encodeURIComponent(status)}`,
                `${BASE_URL}api/task/status/${id}?status=${encodeURIComponent(status)}`
            ];
            
            let lastError = error1;
            for (const altUrl of alternativeUrls) {
                try {
                    // console.log(`Trying alternative URL: ${altUrl}`); // SECURITY: Could expose API endpoints
                    response = await axios.get(altUrl);
                    // console.log(`Success with alternative URL: ${altUrl}`); // SECURITY: Could expose API endpoints
                    break;
                } catch (altError: any) {
                    // console.log(`Failed with ${altUrl}:`, altError.response?.status);
                    lastError = altError;
                }
            }
            
            if (!response) {
                throw lastError;
            }
        }
        
        const data = response.data;

        // console.log('FireTaskAction response:', data); // SECURITY: Contains task response data

        return data as Task;
    } catch (error) {
        handleApiError(error, 'fire task action'); // This will throw, no return needed
        throw error; // This line will never be reached but satisfies TypeScript
    }
};
