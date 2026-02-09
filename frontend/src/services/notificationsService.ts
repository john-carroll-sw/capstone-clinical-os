/**
 * Notifications API Service
 * Handles all notification-related API calls
 */

import { axiosInstance } from "../api/axiosInstance";
import { API_ENDPOINTS } from "../api/endpoints";
import type {
  SendNotificationRequest,
  NotificationResponse,
  ApiSuccessResponse,
  SignalType,
  SignalSeverity,
  DecisionType,
  NotificationPriority,
} from "../types/notifications.types";

// Dummy sender info for development
const DUMMY_SENDER = {
  name: "Demo User",
  email: "demo.user@example.com",
};

// Dummy recipient for development
const DUMMY_RECIPIENT_EMAIL = "demo.user@example.com";

/**
 * Send a notification via the specified channel
 */
export async function sendNotification(
  request: Omit<SendNotificationRequest, "sender_name" | "sender_email" | "recipient_email">
): Promise<ApiSuccessResponse<NotificationResponse>> {
  const payload: SendNotificationRequest = {
    sender_name: DUMMY_SENDER.name,
    sender_email: DUMMY_SENDER.email,
    recipient_email: DUMMY_RECIPIENT_EMAIL,
    ...request,
  };

  const response = await axiosInstance.post<ApiSuccessResponse<NotificationResponse>>(
    API_ENDPOINTS.notifications.send,
    payload
  );

  return response.data;
}

/**
 * Signal context passed from the UI
 */
interface SignalContext {
  entityType: "initiative" | "key_result";
  entityName: string;
  entityId: string;
  signalType: SignalType;
  signalSeverity: SignalSeverity;
  signalDescription: string;
  objectiveName?: string;
  owner?: string;
  status?: string;
  ageDays?: number;
  customMessage?: string;
  priority: NotificationPriority;
}

/**
 * Request an update on a signal/initiative
 */
export async function requestUpdate(params: SignalContext): Promise<ApiSuccessResponse<NotificationResponse>> {
  return sendNotification({
    action_type: "request_update",
    entity_type: params.entityType,
    entity_name: params.entityName,
    entity_id: params.entityId,
    signal_type: params.signalType,
    signal_severity: params.signalSeverity,
    signal_description: params.signalDescription,
    objective_name: params.objectiveName,
    owner: params.owner,
    status: params.status,
    age_days: params.ageDays,
    custom_message: params.customMessage,
    priority: params.priority,
    channel: "webex",
  });
}

/**
 * Communicate a decision
 */
export async function communicateDecision(params: SignalContext & {
  decisionType: DecisionType;
  rationale?: string;
}): Promise<ApiSuccessResponse<NotificationResponse>> {
  return sendNotification({
    action_type: "communicate_decision",
    entity_type: params.entityType,
    entity_name: params.entityName,
    entity_id: params.entityId,
    signal_type: params.signalType,
    signal_severity: params.signalSeverity,
    signal_description: params.signalDescription,
    objective_name: params.objectiveName,
    decision_type: params.decisionType,
    decision_rationale: params.rationale,
    custom_message: params.customMessage,
    priority: params.priority,
    channel: "webex",
  });
}
