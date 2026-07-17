// Shared, framework-agnostic helpers for Virunga SmartPower.
// Centralises formatting, token handling, tariff math, chat-message
// construction and alert sounds that were previously duplicated inline.

import type { ChatMessage, NotificationType } from "./types";

const LOCALE = "fr-FR";

// --- Date / time formatting -------------------------------------------------

/** Short "HH:MM" timestamp used for chat messages and notifications. */
export const formatTime = (date: Date = new Date()): string =>
  date.toLocaleTimeString(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
  });

/** Full "DD/MM/YYYY HH:MM" stamp used for token transaction history. */
export const formatDateTime = (date: Date = new Date()): string =>
  date.toLocaleString(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

// --- Token / digit helpers --------------------------------------------------

/** Keep only the digit characters of a string. */
export const onlyDigits = (value: string): string => value.replace(/\D/g, "");

/** Group a run of digits into fixed-size segments joined by a separator. */
export const groupDigits = (
  digits: string,
  size = 4,
  separator = "-",
): string => {
  const segments: string[] = [];
  for (let i = 0; i < digits.length; i += size) {
    segments.push(digits.slice(i, i + size));
  }
  return segments.join(separator);
};

/** Format raw user input as a XXXX-XXXX-XXXX-XXXX-XXXX (max 20 digit) token. */
export const formatTokenString = (rawVal: string): string =>
  groupDigits(onlyDigits(rawVal).slice(0, 20));

/** Remove whitespace and dashes so a token can be compared/validated. */
export const stripTokenSeparators = (token: string): string =>
  token.replace(/\s+/g, "").replace(/-/g, "");

/** Generate a random 20-digit Cashpower token (5 groups of 4 digits). */
export const generateRandomToken = (): string => {
  const segments: string[] = [];
  for (let i = 0; i < 5; i++) {
    segments.push(Math.floor(1000 + Math.random() * 9000).toString());
  }
  return segments.join("-");
};

// --- Tariff math ------------------------------------------------------------

/** Convert an energy amount (kWh) to its USD value for a given tariff. */
export const kwhToUsd = (kwh: number, usdPerKwh: number): number =>
  kwh * usdPerKwh;

/** Convert a USD amount to the kWh it buys for a given tariff. */
export const usdToKwh = (usd: number, usdPerKwh: number): number =>
  usd / usdPerKwh;

// --- Chat messages ----------------------------------------------------------

/** Build a chat message with a unique id and a fresh short timestamp. */
export const createChatMessage = (
  role: ChatMessage["role"],
  text: string,
  idPrefix: string,
): ChatMessage => ({
  id: `${idPrefix}_${Date.now()}`,
  role,
  text,
  timestamp: formatTime(),
});

// --- Alert sounds -----------------------------------------------------------

interface ToneStep {
  frequency: number;
  offset: number;
}

interface ToneProfile {
  type: OscillatorType;
  gain: number;
  duration: number;
  steps: ToneStep[];
}

const TONE_PROFILES: Record<NotificationType, ToneProfile> = {
  critical: {
    type: "sawtooth",
    gain: 0.08,
    duration: 0.3,
    steps: [
      { frequency: 880, offset: 0 },
      { frequency: 440, offset: 0.15 },
    ],
  },
  warning: {
    type: "sine",
    gain: 0.1,
    duration: 0.25,
    steps: [{ frequency: 587.33, offset: 0 }],
  },
  success: {
    type: "sine",
    gain: 0.08,
    duration: 0.35,
    steps: [
      { frequency: 523.25, offset: 0 },
      { frequency: 659.25, offset: 0.1 },
      { frequency: 783.99, offset: 0.2 },
    ],
  },
  info: {
    type: "sine",
    gain: 0.06,
    duration: 0.15,
    steps: [{ frequency: 659.25, offset: 0 }],
  },
};

/** Play a short Web Audio cue matching the given notification type. */
export const playAlertSound = (type: NotificationType): void => {
  try {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx: AudioContext = new AudioContextClass();

    const profile = TONE_PROFILES[type];
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = profile.type;
    for (const step of profile.steps) {
      osc.frequency.setValueAtTime(step.frequency, ctx.currentTime + step.offset);
    }

    gainNode.gain.setValueAtTime(profile.gain, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      ctx.currentTime + profile.duration,
    );

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + profile.duration);
  } catch (e) {
    console.warn("AudioContext standard error or blocked:", e);
  }
};
