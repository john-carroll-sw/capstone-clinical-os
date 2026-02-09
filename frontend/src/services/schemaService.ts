/**
 * Schema Service - API calls for schema and import/export operations
 * 
 * Centralized API client for Dev Panel operations.
 * Uses axiosInstance to ensure Authorization headers are attached.
 */

import { axiosInstance } from '../api/axiosInstance';

// Column info from database schema
export interface ColumnInfo {
  columnName: string;
  displayName: string;
  dataType: string;
  isProtected: boolean;
}

/**
 * Fetch columns for a specific entity type
 * 
 * @param entityType - Entity type (objective, key_result, initiative, milestone, initiative_update)
 * @returns Promise<ColumnInfo[]> - Array of column definitions
 */
export async function fetchColumns(entityType: string): Promise<ColumnInfo[]> {
  const response = await axiosInstance.get<ColumnInfo[]>(`/schema/columns/${entityType}`);
  return response.data;
}

/**
 * Add a new column to an entity type
 * 
 * @param entityType - Entity type to add column to
 * @param columnName - Database column name (snake_case)
 * @param displayName - Human-readable display name
 * @param dataType - Column data type (string, number, date, boolean)
 */
export async function addColumn(
  entityType: string,
  columnName: string,
  displayName: string,
  dataType: string
): Promise<void> {
  await axiosInstance.post('/schema/columns', {
    entityType,
    columnName,
    displayName,
    dataType,
  });
}

/**
 * Delete a column from an entity type
 * 
 * @param entityType - Entity type to delete column from
 * @param columnName - Column name to delete
 */
export async function deleteColumn(entityType: string, columnName: string): Promise<void> {
  await axiosInstance.delete(`/schema/columns/${entityType}/${columnName}`);
}

/**
 * Download database as Excel file
 * 
 * @returns Promise<Blob> - Excel file blob
 */
export async function downloadExcel(): Promise<Blob> {
  const response = await axiosInstance.get('/excel/download', {
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Upload Excel file to update database
 * 
 * @param file - Excel file to upload
 * @returns Promise<{ message: string }> - Upload result message
 */
export async function uploadExcel(file: File): Promise<{ message: string }> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axiosInstance.post<{ message: string }>('/excel/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}
