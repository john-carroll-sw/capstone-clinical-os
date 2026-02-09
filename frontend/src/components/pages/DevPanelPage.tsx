/**
 * Dev Panel Page - Edit initiative data directly
 * Allows editing all 5 Excel sheets with static columns
 */

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  Alert,
  Snackbar,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import {
  DataGrid,
  GridColDef,
  GridRowModel,
  GridRowId,
  GridToolbarContainer,
  GridCellParams,
  useGridApiRef,
} from "@mui/x-data-grid";
import { Delete, Save, Refresh, Download, Upload, Warning } from "@mui/icons-material";
import { fetchInitiativeData, saveInitiativeData } from "../../services/excelDataService";
import {
  fetchColumns,
  addColumn,
  deleteColumn,
  downloadExcel,
  uploadExcel,
  type ColumnInfo,
} from "../../services/schemaService";
import { env } from "../../config/env";
import type {
  Objective,
  KeyResult,
  Initiative,
  Milestone,
  InitiativeUpdate,
} from "../../types";

// Entity type display names
const ENTITY_TYPE_LABELS: Record<string, string> = {
  objective: "Objectives",
  key_result: "Key Results",
  initiative: "Initiatives",
  milestone: "Milestones",
  initiative_update: "Updates",
};

const ENTITY_TYPES = ["objective", "key_result", "initiative", "milestone", "initiative_update"];

// Convert snake_case to camelCase
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

const GHOST_ROW_ID = "__ghost__";

// Fields to hide from Data Editor (system-managed, not user-editable)
const HIDDEN_FIELDS = ["id", "created_at", "updated_at"];

// Check if column should be shown in Data Editor
function shouldShowColumn(col: ColumnInfo): boolean {
  return !HIDDEN_FIELDS.includes(col.columnName);
}

// Generate GridColDef from ColumnInfo
function columnInfoToGridColDef(col: ColumnInfo): GridColDef {
  const fieldName = snakeToCamel(col.columnName);
  
  // Determine width based on field type and name
  let width = 150;
  if (col.columnName.includes("name") || col.columnName.includes("description")) width = 250;
  if (col.columnName.includes("id") && !col.columnName.includes("description")) width = 120;
  if (col.dataType === "date") width = 130;
  if (col.dataType === "number") width = 100;
  
  const baseColDef: GridColDef = {
    field: fieldName,
    headerName: col.displayName,
    width,
    editable: true,
  };
  
  // Date columns need valueGetter to convert string to Date object
  if (col.dataType === "date") {
    return {
      ...baseColDef,
      type: "date",
      valueGetter: (value: string | null | undefined) => {
        if (!value) return null;
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
      },
      valueSetter: (value: Date | null, row: Record<string, unknown>) => {
        const dateStr = value ? value.toISOString().split("T")[0] : null;
        return { ...row, [fieldName]: dateStr };
      },
    };
  }
  
  // Number columns
  if (col.dataType === "number") {
    return { ...baseColDef, type: "number" };
  }
  
  // Boolean columns
  if (col.dataType === "boolean") {
    return { ...baseColDef, type: "boolean" };
  }
  
  // JSONB columns - display as editable JSON string
  if (col.dataType === "jsonb") {
    return {
      ...baseColDef,
      width: 300,
      valueGetter: (value: unknown) => {
        if (value === null || value === undefined) return "";
        if (typeof value === "string") return value;
        return JSON.stringify(value);
      },
      valueSetter: (value: unknown, row: Record<string, unknown>) => {
        const strValue = typeof value === "string" ? value : "";
        if (!strValue || strValue.trim() === "") {
          return { ...row, [fieldName]: null };
        }
        try {
          const parsed = JSON.parse(strValue);
          return { ...row, [fieldName]: parsed };
        } catch {
          return { ...row, [fieldName]: strValue };
        }
      },
    };
  }
  
  // Default: string
  return baseColDef;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  if (value !== index) return null;
  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
      {children}
    </Box>
  );
}



interface EditableGridProps<T> {
  rows: T[];
  columns: GridColDef[];
  onRowUpdate: (newRow: T) => void;
  onRowAddWithData: (newRow: T) => void;
  onRowDelete: (ids: GridRowId[]) => void;
  idPrefix: string;
}

function EditableGrid<T extends { id: string }>({
  rows,
  columns,
  onRowUpdate,
  onRowAddWithData,
  onRowDelete,
  idPrefix,
}: EditableGridProps<T>) {
  const [selectionModel, setSelectionModel] = useState<readonly GridRowId[]>([]);
  const apiRef = useGridApiRef();

  // Single click to edit
  const handleCellClick = useCallback((params: GridCellParams) => {
    if (params.isEditable) {
      apiRef.current.startCellEditMode({ id: params.id, field: params.field });
    }
  }, [apiRef]);

  // Create ghost row for adding new rows
  const ghostRow = { id: GHOST_ROW_ID } as T;
  const rowsWithGhost = [...rows, ghostRow];

  // Modify first column to show "+ Add new row" for ghost row
  const modifiedColumns: GridColDef[] = columns.map((col, index) => {
    if (index === 0) {
      return {
        ...col,
        renderCell: (params) => {
          if (params.row.id === GHOST_ROW_ID) {
            return (
              <Box sx={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary" }}>
                  + Add new row
                </Typography>
              </Box>
            );
          }
          return params.value;
        },
      } as GridColDef;
    }
    return col;
  });


  const processRowUpdate = useCallback(
    (newRow: GridRowModel, oldRow: GridRowModel): T => {
      // If editing the ghost row, create a new real row
      if (oldRow.id === GHOST_ROW_ID) {
        const hasData = Object.entries(newRow).some(([key, value]) => {
          if (key === "id") return false;
          return value !== undefined && value !== null && value !== "";
        });
        if (hasData) {
          const realNewRow = { ...newRow, id: `${idPrefix}-${Date.now()}` } as T;
          onRowAddWithData(realNewRow);
        }
        return oldRow as T;
      }
      onRowUpdate(newRow as T);
      return newRow as T;
    },
    [onRowUpdate, onRowAddWithData, idPrefix]
  );

  const handleProcessRowUpdateError = useCallback((error: Error) => {
    console.error("Error updating row:", error);
  }, []);

  const CustomToolbar = () => (
    <GridToolbarContainer sx={{ p: 1, gap: 1 }}>
      <Button
        size="small"
        startIcon={<Delete />}
        onClick={() => onRowDelete(selectionModel.filter(id => id !== GHOST_ROW_ID))}
        disabled={selectionModel.filter(id => id !== GHOST_ROW_ID).length === 0}
        color="error"
      >
        Delete Selected
      </Button>
    </GridToolbarContainer>
  );

  return (
    <DataGrid
      apiRef={apiRef}
      rows={rowsWithGhost}
      columns={modifiedColumns}
      checkboxSelection
      disableRowSelectionOnClick
      editMode="cell"
      onCellClick={handleCellClick}
      processRowUpdate={processRowUpdate}
      onProcessRowUpdateError={handleProcessRowUpdateError}
      onRowSelectionModelChange={(newSelection) => setSelectionModel(newSelection)}
      rowSelectionModel={selectionModel}
      isRowSelectable={(params) => params.row.id !== GHOST_ROW_ID}
      slots={{
        toolbar: CustomToolbar,
      }}
      sx={{
        flex: 1,
        minHeight: 0,
        "& .MuiDataGrid-cell--editable": {
          cursor: "pointer",
        },
        "& .MuiDataGrid-cell--editable:hover": {
          backgroundColor: "action.hover",
        },
        // Style the ghost row
        [`& .MuiDataGrid-row[data-id="${GHOST_ROW_ID}"]`]: {
          opacity: 0.6,
          fontStyle: "italic",
          backgroundColor: "action.hover",
        },
      }}
      getRowId={(row) => row.id}
    />
  );
}

export function DevPanelPage() {
  const [mode, setMode] = useState<"data" | "schema" | "import-export">("data");
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Data state
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [keyResults, setKeyResults] = useState<KeyResult[]>([]);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [initiativeUpdates, setInitiativeUpdates] = useState<InitiativeUpdate[]>([]);

  // Track deleted IDs for each entity type
  const [deletedIds, setDeletedIds] = useState<{
    objectives: string[];
    keyResults: string[];
    initiatives: string[];
    milestones: string[];
    initiativeUpdates: string[];
  }>({
    objectives: [],
    keyResults: [],
    initiatives: [],
    milestones: [],
    initiativeUpdates: [],
  });

  // Track modified/added row IDs for delta saves
  const [modifiedIds, setModifiedIds] = useState<{
    objectives: Set<string>;
    keyResults: Set<string>;
    initiatives: Set<string>;
    milestones: Set<string>;
    initiativeUpdates: Set<string>;
  }>({
    objectives: new Set(),
    keyResults: new Set(),
    initiatives: new Set(),
    milestones: new Set(),
    initiativeUpdates: new Set(),
  });

  // Track if data has been modified
  const [hasChanges, setHasChanges] = useState(false);

  // Schema management state
  const [schemaEntityType, setSchemaEntityType] = useState("objective");
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnType, setNewColumnType] = useState("string");
  const [loadingSchema, setLoadingSchema] = useState(false);

  // Dynamic columns for Data Editor (loaded from schema API)
  const [entityColumns, setEntityColumns] = useState<Record<string, GridColDef[]>>({
    objective: [],
    key_result: [],
    initiative: [],
    milestone: [],
    initiative_update: [],
  });

  // Load columns for selected entity type
  const loadColumns = useCallback(async () => {
    setLoadingSchema(true);
    try {
      const cols = await fetchColumns(schemaEntityType);
      setColumns(cols);
    } catch (err) {
      console.error("Failed to load columns:", err);
      setError(err instanceof Error ? err.message : "Failed to load columns");
    } finally {
      setLoadingSchema(false);
    }
  }, [schemaEntityType]);

  // Reload columns when entity type changes
  useEffect(() => {
    if (mode === "schema") {
      loadColumns();
    }
  }, [schemaEntityType, mode, loadColumns]);

  // Add new column
  const handleAddColumn = async () => {
    if (!newColumnName) {
      setError("Column name is required");
      return;
    }
    try {
      const colName = newColumnName.toLowerCase().replace(/\s/g, "_");
      const displayName = newColumnName;
      await addColumn(schemaEntityType, colName, displayName, newColumnType);
      setNewColumnName("");
      setSuccessMessage("Column added successfully");
      loadColumns();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add column");
    }
  };

  // Delete column
  const handleDeleteColumn = async (columnName: string) => {
    try {
      await deleteColumn(schemaEntityType, columnName);
      setSuccessMessage("Column deleted");
      loadColumns();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete column");
    }
  };

  // Import/Export state
  const [uploading, setUploading] = useState(false);
  const [showUploadWarning, setShowUploadWarning] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Download Excel
  const handleDownloadExcel = async () => {
    try {
      const blob = await downloadExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `app_data_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccessMessage("Excel downloaded successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download Excel");
    }
  };

  // Handle file selection for upload
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPendingFile(file);
      setShowUploadWarning(true);
    }
    // Reset input so same file can be selected again
    event.target.value = "";
  };

  // Confirm and upload Excel
  const handleConfirmUpload = async () => {
    if (!pendingFile) return;
    setShowUploadWarning(false);
    setUploading(true);
    try {
      const result = await uploadExcel(pendingFile);
      setSuccessMessage(result.message);
      // Reload data after upload
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload Excel");
    } finally {
      setUploading(false);
      setPendingFile(null);
    }
  };

  // Cancel upload
  const handleCancelUpload = () => {
    setShowUploadWarning(false);
    setPendingFile(null);
  };

  // Load data and columns for all entity types
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch data and columns in parallel
      const [data, objCols, krCols, initCols, mileCols, updateCols] = await Promise.all([
        fetchInitiativeData(),
        fetchColumns("objective"),
        fetchColumns("key_result"),
        fetchColumns("initiative"),
        fetchColumns("milestone"),
        fetchColumns("initiative_update"),
      ]);
      
      setObjectives(data.objectives);
      setKeyResults(data.keyResults);
      setInitiatives(data.initiatives);
      setMilestones(data.milestones);
      setInitiativeUpdates(data.initiativeUpdates);
      
      // Convert ColumnInfo to GridColDef for each entity type
      setEntityColumns({
        objective: objCols.filter(shouldShowColumn).map(columnInfoToGridColDef),
        key_result: krCols.filter(shouldShowColumn).map(columnInfoToGridColDef),
        initiative: initCols.filter(shouldShowColumn).map(columnInfoToGridColDef),
        milestone: mileCols.filter(shouldShowColumn).map(columnInfoToGridColDef),
        initiative_update: updateCols.filter(shouldShowColumn).map(columnInfoToGridColDef),
      });
      
      setHasChanges(false);
      // Reset deleted IDs on load
      setDeletedIds({
        objectives: [],
        keyResults: [],
        initiatives: [],
        milestones: [],
        initiativeUpdates: [],
      });
      // Reset modified IDs on load
      setModifiedIds({
        objectives: new Set(),
        keyResults: new Set(),
        initiatives: new Set(),
        milestones: new Set(),
        initiativeUpdates: new Set(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save data - only send modified/added/deleted rows (delta save)
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // Only include rows that were modified or added
      const changedObjectives = objectives.filter(o => modifiedIds.objectives.has(o.id));
      const changedKeyResults = keyResults.filter(k => modifiedIds.keyResults.has(k.id));
      const changedInitiatives = initiatives.filter(i => modifiedIds.initiatives.has(i.id));
      const changedMilestones = milestones.filter(m => modifiedIds.milestones.has(m.id));
      const changedUpdates = initiativeUpdates.filter(u => modifiedIds.initiativeUpdates.has(u.id));

      await saveInitiativeData({
        objectives: changedObjectives,
        keyResults: changedKeyResults,
        initiatives: changedInitiatives,
        milestones: changedMilestones,
        initiativeUpdates: changedUpdates,
        deletedIds,
      });
      setHasChanges(false);
      setSuccessMessage("Data saved successfully!");
      // Reset deleted IDs after successful save
      setDeletedIds({
        objectives: [],
        keyResults: [],
        initiatives: [],
        milestones: [],
        initiativeUpdates: [],
      });
      // Reset modified IDs after successful save
      setModifiedIds({
        objectives: new Set(),
        keyResults: new Set(),
        initiatives: new Set(),
        milestones: new Set(),
        initiativeUpdates: new Set(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save data");
    } finally {
      setSaving(false);
    }
  };

  // Generic row update handler - tracks modified IDs
  const createRowUpdateHandler = <T extends { id: string }>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    entityType: 'objectives' | 'keyResults' | 'initiatives' | 'milestones' | 'initiativeUpdates'
  ) => {
    return (newRow: T) => {
      setter((prev) => prev.map((row) => (row.id === newRow.id ? newRow : row)));
      // Track this row as modified
      setModifiedIds(prev => ({
        ...prev,
        [entityType]: new Set([...prev[entityType], newRow.id]),
      }));
      setHasChanges(true);
    };
  };

  // Generic row add handler - tracks new IDs
  const createRowAddHandler = <T extends { id: string }>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    entityType: 'objectives' | 'keyResults' | 'initiatives' | 'milestones' | 'initiativeUpdates'
  ) => {
    return (newRow: T) => {
      setter((prev) => [...prev, newRow]);
      // Track this row as added (same as modified for upsert)
      setModifiedIds(prev => ({
        ...prev,
        [entityType]: new Set([...prev[entityType], newRow.id]),
      }));
      setHasChanges(true);
    };
  };

  // Generic row delete handler with ID tracking
  const createRowDeleteHandler = <T extends { id: string }>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    entityType: 'objectives' | 'keyResults' | 'initiatives' | 'milestones' | 'initiativeUpdates'
  ) => {
    return (ids: GridRowId[]) => {
      // Get the string IDs for tracking
      const idsToDelete = ids.map(id => String(id));
      
      // Track deleted IDs for this entity type
      setDeletedIds(prev => ({
        ...prev,
        [entityType]: [...prev[entityType], ...idsToDelete],
      }));
      
      // Remove from local state
      setter((prev) => prev.filter((row) => !ids.includes(row.id)));
      setHasChanges(true);
    };
  };

  return (
    <Box sx={{ width: "100%", flex: 1, display: "flex", flexDirection: "column", overflow: "auto", minHeight: 0 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexShrink: 0 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Dev Panel
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Edit initiative data directly. Changes are saved to the backend Excel file.
          </Typography>
        </Box>
        {mode === "data" ? (
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton onClick={loadData} disabled={loading}>
              <Refresh />
            </IconButton>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={!hasChanges || saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={async () => {
                try {
                  const res = await fetch(`${env.api.baseUrl}/feedback/test-webhook`, { method: 'POST' });
                  const data = await res.json();
                  alert(data.message || 'Webhook test sent');
                } catch (e) {
                  alert('Failed to test webhook');
                }
              }}
            >
              Test Webhook
            </Button>
          </Box>
        ) : (
          <IconButton onClick={loadColumns} title="Refresh schema">
            <Refresh />
          </IconButton>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Changes indicator */}
      {hasChanges && mode === "data" && (
        <Alert severity="warning">
          You have unsaved changes. Click "Save Changes" to persist them.
        </Alert>
      )}

      {/* Mode Toggle */}
      <Tabs
        value={mode}
        onChange={(_, newMode) => setMode(newMode)}
        sx={{ mb: 2, flexShrink: 0 }}
      >
        <Tab value="data" label="Data Editor" />
        <Tab value="schema" label="Schema Manager" />
        <Tab value="import-export" label="Import/Export" />
      </Tabs>

      {/* Data Mode */}
      {mode === "data" && (
        <Card sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
          <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0, p: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{ borderBottom: 1, borderColor: "divider", mb: 2, flexShrink: 0 }}
            >
              <Tab label={`Objectives (${objectives.length})`} />
              <Tab label={`Key Results (${keyResults.length})`} />
              <Tab label={`Initiatives (${initiatives.length})`} />
              <Tab label={`Milestones (${milestones.length})`} />
              <Tab label={`Updates (${initiativeUpdates.length})`} />
            </Tabs>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
              <Typography>Loading data...</Typography>
            </Box>
          ) : (
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
              <TabPanel value={activeTab} index={0}>
                <EditableGrid
                  rows={objectives}
                  columns={entityColumns.objective}
                  onRowUpdate={createRowUpdateHandler(setObjectives, 'objectives')}
                  onRowAddWithData={createRowAddHandler(setObjectives, 'objectives')}
                  onRowDelete={createRowDeleteHandler(setObjectives, 'objectives')}
                  idPrefix="objective"
                />
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                <EditableGrid
                  rows={keyResults}
                  columns={entityColumns.key_result}
                  onRowUpdate={createRowUpdateHandler(setKeyResults, 'keyResults')}
                  onRowAddWithData={createRowAddHandler(setKeyResults, 'keyResults')}
                  onRowDelete={createRowDeleteHandler(setKeyResults, 'keyResults')}
                  idPrefix="key-result"
                />
              </TabPanel>

              <TabPanel value={activeTab} index={2}>
                <EditableGrid
                  rows={initiatives}
                  columns={entityColumns.initiative}
                  onRowUpdate={createRowUpdateHandler(setInitiatives, 'initiatives')}
                  onRowAddWithData={createRowAddHandler(setInitiatives, 'initiatives')}
                  onRowDelete={createRowDeleteHandler(setInitiatives, 'initiatives')}
                  idPrefix="initiative"
                />
              </TabPanel>

              <TabPanel value={activeTab} index={3}>
                <EditableGrid
                  rows={milestones}
                  columns={entityColumns.milestone}
                  onRowUpdate={createRowUpdateHandler(setMilestones, 'milestones')}
                  onRowAddWithData={createRowAddHandler(setMilestones, 'milestones')}
                  onRowDelete={createRowDeleteHandler(setMilestones, 'milestones')}
                  idPrefix="milestone"
                />
              </TabPanel>

              <TabPanel value={activeTab} index={4}>
                <EditableGrid
                  rows={initiativeUpdates}
                  columns={entityColumns.initiative_update}
                  onRowUpdate={createRowUpdateHandler(setInitiativeUpdates, 'initiativeUpdates')}
                  onRowAddWithData={createRowAddHandler(setInitiativeUpdates, 'initiativeUpdates')}
                  onRowDelete={createRowDeleteHandler(setInitiativeUpdates, 'initiativeUpdates')}
                  idPrefix="update"
                />
              </TabPanel>
            </Box>
          )}
          </CardContent>
        </Card>
      )}

      {/* Schema Mode */}
      {mode === "schema" && (
        <Card sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
          <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto", minHeight: 0 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Entity Type Selector */}
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Typography variant="h6">Manage Columns for:</Typography>
                <FormControl sx={{ minWidth: 180 }}>
                  <Select
                    value={schemaEntityType}
                    onChange={(e) => setSchemaEntityType(e.target.value)}
                    size="small"
                  >
                    {ENTITY_TYPES.map((key) => (
                      <MenuItem key={key} value={key}>{ENTITY_TYPE_LABELS[key]}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Add New Column */}
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "flex-end" }}>
                <TextField
                  label="New Column Name"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="e.g. Budget Amount"
                  sx={{ width: 200 }}
                  size="small"
                />
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel size="small">Type</InputLabel>
                  <Select
                    value={newColumnType}
                    label="Type"
                    onChange={(e) => setNewColumnType(e.target.value)}
                    size="small"
                  >
                    <MenuItem value="string">Text</MenuItem>
                    <MenuItem value="number">Number</MenuItem>
                    <MenuItem value="date">Date</MenuItem>
                    <MenuItem value="boolean">Yes/No</MenuItem>
                    <MenuItem value="jsonb">JSONB</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddColumn}
                  size="small"
                >
                  Add Column
                </Button>
              </Box>

              {/* Columns Table */}
              <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 600 }}>
                Current Columns ({columns.length})
              </Typography>
              <Paper sx={{ width: "100%", overflow: "hidden" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "action.hover" }}>
                      <TableCell>Column Name</TableCell>
                      <TableCell>Display Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingSchema ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : columns.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                          No columns found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      columns.map((col) => (
                        <TableRow key={col.columnName}>
                          <TableCell><code>{col.columnName}</code></TableCell>
                          <TableCell>{col.displayName}</TableCell>
                          <TableCell>{col.dataType}</TableCell>
                          <TableCell>
                            {col.isProtected ? (
                              <Typography variant="caption" sx={{ color: "warning.main" }}>
                                Protected
                              </Typography>
                            ) : (
                              <Typography variant="caption" sx={{ color: "success.main" }}>
                                Deletable
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {!col.isProtected && (
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteColumn(col.columnName)}
                                title="Delete column"
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Paper>
              <Typography variant="caption" color="text.secondary">
                Protected columns are required for the app to function and cannot be deleted.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Import/Export Mode */}
      {mode === "import-export" && (
        <Card sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
          <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto", minHeight: 0 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {/* Download Section */}
              <Box>
                <Typography variant="h6" gutterBottom>Download Database</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Download the entire database as an Excel file with all entities in separate sheets.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={handleDownloadExcel}
                >
                  Download Excel
                </Button>
              </Box>

              {/* Upload Section */}
              <Box>
                <Typography variant="h6" gutterBottom>Upload Database</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Upload an Excel file to update the database. The file should have sheets named: 
                  Objectives, Key Results, Initiatives, Milestones, Updates.
                  Rows will be matched by ID and upserted (insert or update).
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<Upload />}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Select Excel File"}
                  <input
                    type="file"
                    hidden
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                  />
                </Button>
              </Box>

              {/* Upload Warning Dialog */}
              {showUploadWarning && (
                <Paper sx={{ p: 3, backgroundColor: "warning.light", border: "1px solid", borderColor: "warning.main" }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                    <Warning color="warning" sx={{ fontSize: 40 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        Warning: Database Update
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        You are about to update the database with data from: <strong>{pendingFile?.name}</strong>
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        This will:
                      </Typography>
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        <li>Update existing rows if they have matching IDs</li>
                        <li>Insert new rows if IDs don't exist</li>
                        <li>NOT delete any existing rows</li>
                      </ul>
                      <Typography variant="body2" sx={{ mt: 2, fontWeight: 600 }}>
                        This action cannot be easily undone. Make sure you have a backup.
                      </Typography>
                      <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                        <Button
                          variant="contained"
                          color="warning"
                          onClick={handleConfirmUpload}
                        >
                          Yes, Upload and Update
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={handleCancelUpload}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
      />
    </Box>
  );
}

export default DevPanelPage;
