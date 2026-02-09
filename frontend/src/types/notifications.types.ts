/**
 * Notification API Types
 * Matches the backend Pydantic models for request/response validation
 */

// Action types for notifications
export type NotificationActionType = "request_update" | "communicate_decision" | "general";

// Entity types that can be referenced in notifications
export type NotificationEntityType = "initiative" | "key_result" | "objective" | "decision" | "signal";

// Signal types (for request_update)
export type SignalType = "blocker" | "risk" | "staleness" | "decision";
export type SignalSeverity = "S1" | "S2";

// Decision types (for communicate_decision)
export type DecisionType = "scale" | "pivot" | "invest" | "divest" | "unblock" | "defer";

// Notification priority levels
export type NotificationPriority = "low" | "normal" | "high" | "urgent";

// Delivery channels
export type NotificationChannel = "webex" | "email" | "in_app" | "teams";

// Notification status
export type NotificationStatus = "pending" | "sent" | "delivered" | "failed";

/**
 * Request payload for sending a notification
 */
export interface SendNotificationRequest {
  // Sender info
  sender_name: string;
  sender_email: string;

  // Recipient info
  recipient_email: string;

  // Notification type
  action_type: NotificationActionType;

  // Context - what this notification is about
  entity_type?: NotificationEntityType;
  entity_name?: string;
  entity_id?: string;

  // Signal context
  signal_type?: SignalType;
  signal_severity?: SignalSeverity;
  signal_description?: string;
  objective_name?: string;
  owner?: string;
  status?: string;
  age_days?: number;

  // For communicate_decision
  decision_type?: DecisionType;
  decision_rationale?: string;

  // Message content
  subject?: string;
  custom_message?: string;

  // Delivery options
  priority: NotificationPriority;
  channel: NotificationChannel;
}

/**
 * Notification data returned after creation
 */
export interface NotificationData {
  notification_id: string;
  recipient_email: string;
  sender_email: string;
  action_type: string;
  subject: string;
  priority: string;
  channel: string;
  status: NotificationStatus;
  created_at: string;
}

/**
 * Response wrapper for notification operations
 */
export interface NotificationResponse {
  notification: NotificationData;
}

/**
 * Standardized API success response
 */
export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  timestamp: string;
  request_id?: string;
  data: T;
}

/**
 * Standardized API error response
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  timestamp: string;
  request_id?: string;
  error_code: string;
  details?: Record<string, unknown>;
}

export type NotificationApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
