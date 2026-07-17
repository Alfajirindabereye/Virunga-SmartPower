// Shared domain interfaces for Virunga SmartPower.

export interface Appliance {
  id: string;
  name: string;
  watts: number;
  active: boolean;
  category: "essential" | "heavy";
  icon: string;
  description: string;
}

export interface TokenHistory {
  id: string;
  date: string;
  amountUsd: number;
  kwh: number;
  token: string;
  operator: string;
  phone: string;
  applied: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}

export type NotificationType = "critical" | "warning" | "info" | "success";
export type NotificationCategory =
  | "low_credit"
  | "shedding"
  | "system"
  | "recharge";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: NotificationCategory;
}

export interface ActiveToast {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
}
