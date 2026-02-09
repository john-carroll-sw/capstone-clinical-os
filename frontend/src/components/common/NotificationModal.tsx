/**
 * NotificationModal - Modal for Request Update and Communicate Decision actions
 */

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Chip,
} from "@mui/material";
import { Send, Close } from "@mui/icons-material";
import { requestUpdate, communicateDecision } from "../../services";
import type { SignalType, SignalSeverity, DecisionType, NotificationPriority } from "../../types";

type ModalMode = "request_update" | "communicate_decision";

interface NotificationModalProps {
  open: boolean;
  onClose: () => void;
  mode: ModalMode;
  // Pre-filled context from the signal/entity
  entityName: string;
  entityId: string;
  entityType: "initiative" | "key_result";
  // Signal context
  signalType: SignalType;
  signalSeverity: SignalSeverity;
  signalDescription: string;
  // Additional context
  objectiveName?: string;
  owner?: string;
  status?: string;
  ageDays?: number;
}

const DECISION_TYPES: { value: DecisionType; label: string }[] = [
  { value: "scale", label: "Scale" },
  { value: "pivot", label: "Pivot" },
  { value: "invest", label: "Invest" },
  { value: "divest", label: "Divest" },
  { value: "unblock", label: "Unblock" },
  { value: "defer", label: "Defer" },
];

const PRIORITY_OPTIONS: { value: NotificationPriority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "default" },
  { value: "normal", label: "Normal", color: "info" },
  { value: "high", label: "High", color: "warning" },
  { value: "urgent", label: "Urgent", color: "error" },
];

export function NotificationModal({
  open,
  onClose,
  mode,
  entityName,
  entityId,
  entityType,
  signalType,
  signalSeverity,
  signalDescription,
  objectiveName,
  owner,
  status,
  ageDays,
}: NotificationModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [customMessage, setCustomMessage] = useState("");
  const [priority, setPriority] = useState<NotificationPriority>(
    signalSeverity === "S1" ? "high" : "normal"
  );
  const [decisionType, setDecisionType] = useState<DecisionType>("unblock");
  const [rationale, setRationale] = useState("");

  const isRequestUpdate = mode === "request_update";
  const title = isRequestUpdate ? "Request an Update" : "Communicate a Decision";

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      if (isRequestUpdate) {
        await requestUpdate({
          entityType,
          entityName,
          entityId,
          signalType,
          signalSeverity,
          signalDescription,
          objectiveName,
          owner,
          status,
          ageDays,
          customMessage: customMessage || undefined,
          priority,
        });
      } else {
        await communicateDecision({
          entityType,
          entityName,
          entityId,
          signalType,
          signalSeverity,
          signalDescription,
          objectiveName,
          decisionType,
          rationale: rationale || undefined,
          customMessage: customMessage || undefined,
          priority,
        });
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        // Reset state after close
        setSuccess(false);
        setCustomMessage("");
        setRationale("");
      }, 1500);
    } catch (err) {
      console.error("Failed to send notification:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send notification. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      setSuccess(false);
      setCustomMessage("");
      setRationale("");
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" component="span">
            {title}
          </Typography>
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{ minWidth: "auto", p: 0.5 }}
          >
            <Close />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Context Info */}
        <Box
          sx={{
            bgcolor: "action.hover",
            borderRadius: 1,
            p: 2,
            mb: 3,
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {isRequestUpdate ? "Requesting update for:" : "Communicating decision about:"}
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {entityName}
          </Typography>
          {objectiveName && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
              Objective: {objectiveName}
            </Typography>
          )}
          <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label={signalType.charAt(0).toUpperCase() + signalType.slice(1)}
              size="small"
              color={signalType === "blocker" ? "error" : "warning"}
            />
            <Chip
              label={signalSeverity}
              size="small"
              variant="outlined"
              color={signalSeverity === "S1" ? "error" : "warning"}
            />
            {owner && (
              <Chip
                label={`Owner: ${owner}`}
                size="small"
                variant="outlined"
              />
            )}
            {ageDays !== undefined && (
              <Chip
                label={`${ageDays} days old`}
                size="small"
                variant="outlined"
                color={ageDays > 5 ? "error" : "default"}
              />
            )}
          </Box>
          {signalDescription && (
            <Typography variant="body2" sx={{ mt: 1.5, fontStyle: "italic" }}>
              "{signalDescription}"
            </Typography>
          )}
        </Box>

        {/* Success Message */}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Notification sent successfully!
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Decision Type (only for communicate_decision) */}
        {!isRequestUpdate && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Decision Type</InputLabel>
            <Select
              value={decisionType}
              label="Decision Type"
              onChange={(e) => setDecisionType(e.target.value as DecisionType)}
              disabled={loading || success}
            >
              {DECISION_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Rationale (only for communicate_decision) */}
        {!isRequestUpdate && (
          <TextField
            fullWidth
            label="Rationale"
            placeholder="Explain the reasoning behind this decision..."
            multiline
            rows={3}
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            disabled={loading || success}
            sx={{ mb: 2 }}
          />
        )}

        {/* Priority */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={priority}
            label="Priority"
            onChange={(e) => setPriority(e.target.value as NotificationPriority)}
            disabled={loading || success}
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip
                    label={opt.label}
                    size="small"
                    color={opt.color as "default" | "info" | "warning" | "error"}
                  />
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Custom Message */}
        <TextField
          fullWidth
          label="Additional Message (Optional)"
          placeholder={
            isRequestUpdate
              ? "Add any specific questions or context..."
              : "Add any additional notes..."
          }
          multiline
          rows={3}
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          disabled={loading || success}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || success}
          startIcon={loading ? <CircularProgress size={20} /> : <Send />}
        >
          {loading ? "Sending..." : "Send Notification"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NotificationModal;
