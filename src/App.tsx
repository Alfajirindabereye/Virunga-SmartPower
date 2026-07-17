import React, { useState, useEffect, useRef } from "react";
import {
  Zap,
  Power,
  DollarSign,
  AlertTriangle,
  Flame,
  Smartphone,
  Activity,
  Leaf,
  RefreshCw,
  Sliders,
  Clock,
  ShieldAlert,
  Send,
  Sparkles,
  CheckCircle,
  HelpCircle,
  Plus,
  Compass,
  ArrowRight,
  Bell,
  BellRing,
  Trash2,
  Volume2,
  VolumeX,
  Check,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

// Interfaces
interface Appliance {
  id: string;
  name: string;
  watts: number;
  active: boolean;
  category: "essential" | "heavy";
  icon: string;
  description: string;
}

interface TokenHistory {
  id: string;
  date: string;
  amountUsd: number;
  kwh: number;
  token: string;
  operator: string;
  phone: string;
  applied: boolean;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}

interface AppNotification {
  id: string;
  type: "critical" | "warning" | "info" | "success";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: "low_credit" | "shedding" | "system" | "recharge";
}

interface ActiveToast {
  id: string;
  type: "critical" | "warning" | "info" | "success";
  title: string;
  message: string;
}

export default function App() {
  // 1. Core Meter States
  const [balanceKwh, setBalanceKwh] = useState<number>(18.45);
  const [alertThreshold, setAlertThreshold] = useState<number>(5.0);
  const [loadSheddingActive, setLoadSheddingActive] = useState<boolean>(true);
  const [selectedTariff, setSelectedTariff] = useState({
    name: "Social / Domestique",
    usdPerKwh: 0.18,
    cdfPerKwh: 504, // 1 USD = 2800 CDF
  });

  // Client Profile / CRUD subscription states (Demande utilisateur)
  const [profileName, setProfileName] = useState<string>("Alfajiri Ndabereye");
  const [profileEmail, setProfileEmail] = useState<string>(
    "ndabereyealfajiri@gmail.com",
  );
  const [profilePhone, setProfilePhone] = useState<string>("+243 998 765 432");
  const [profileMeterCode, setProfileMeterCode] =
    useState<string>("1428 5937 102");
  const [profileIdCardUrl, setProfileIdCardUrl] = useState<string>(""); // Base64 of ID card upload
  const [profileIdCardName, setProfileIdCardName] = useState<string>("");
  const [isRegistered, setIsRegistered] = useState<boolean>(true); // By default true, can be deleted or updated
  const [gmailAlertsEnabled, setGmailAlertsEnabled] = useState<boolean>(true);

  // Temporary form states for CRUD Operations (Demande utilisateur)
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>("Alfajiri Ndabereye");
  const [tempEmail, setTempEmail] = useState<string>(
    "ndabereyealfajiri@gmail.com",
  );
  const [tempPhone, setTempPhone] = useState<string>("+243 998 765 432");
  const [tempMeterCode, setTempMeterCode] = useState<string>("1428 5937 102");
  const [tempIdCardUrl, setTempIdCardUrl] = useState<string>("");
  const [tempIdCardName, setTempIdCardName] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // CRUD Handler Operations
  const handleStartEditProfile = () => {
    setTempName(profileName || "Alfajiri Ndabereye");
    setTempEmail(profileEmail || "ndabereyealfajiri@gmail.com");
    setTempPhone(profilePhone || "+243 998 765 432");
    setTempMeterCode(profileMeterCode || "1428 5937 102");
    setTempIdCardUrl(profileIdCardUrl || "");
    setTempIdCardName(profileIdCardName || "");
    setIsEditingProfile(true);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileName(tempName);
    setProfileEmail(tempEmail);
    setProfilePhone(tempPhone);
    setProfileMeterCode(tempMeterCode);
    setProfileIdCardUrl(tempIdCardUrl);
    setProfileIdCardName(tempIdCardName);
    setIsEditingProfile(false);

    addNotification(
      "success",
      "✓ Profil Client Mis à Jour",
      "Les identifiants et la carte d'identité de l'abonné ont été mis à jour avec succès.",
      "system",
    );
  };

  const handleDeleteProfile = () => {
    if (
      confirm(
        "Voulez-vous vraiment délier/supprimer cet abonné ? Cela effacera ses identifiants.",
      )
    ) {
      setProfileName("");
      setProfileEmail("");
      setProfilePhone("");
      setProfileMeterCode("");
      setProfileIdCardUrl("");
      setProfileIdCardName("");
      setIsRegistered(false);
      setIsEditingProfile(false);

      // Reset form variables
      setTempName("");
      setTempEmail("");
      setTempPhone("");
      setTempMeterCode("");
      setTempIdCardUrl("");
      setTempIdCardName("");
      addNotification(
        "warning",
        "🗑️ Profil Client Supprimé",
        "Le profil de l'abonné a été supprimé. Le compteur est repassé en mode anonyme.",
        "system",
      );
    }
  };

  const handleRegisterProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileName(tempName);
    setProfileEmail(tempEmail);
    setProfilePhone(tempPhone);
    setProfileMeterCode(tempMeterCode);
    setProfileIdCardUrl(tempIdCardUrl);
    setProfileIdCardName(tempIdCardName);
    setIsRegistered(true);

    addNotification(
      "success",
      "✓ Nouvel Abonné Enregistré",
      `Bienvenue ${tempName} ! Votre compteur ${tempMeterCode} est désormais lié à vos identifiants.`,
      "system",
    );
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert(
        "Veuillez sélectionner uniquement une image pour votre carte d'identité.",
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setTempIdCardUrl(event.target.result as string);
        setTempIdCardName(file.name);
      } else {
        alert(
          "Impossible de lire l'image de la carte d'identité (fichier vide ou corrompu). Veuillez réessayer.",
        );
      }
    };
    reader.onerror = () => {
      alert(
        "Échec de la lecture de l'image de la carte d'identité. Veuillez réessayer avec un autre fichier.",
      );
    };
    reader.readAsDataURL(file);
  };

  const handleIdCardFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleIdCardDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Sync profile details to the recharge form to prevent manual memorization
  useEffect(() => {
    if (isRegistered) {
      if (profilePhone) {
        setMomoPhone(profilePhone.replace(/\s+/g, ""));
      }
    }
  }, [isRegistered, profilePhone, profileMeterCode]);

  // Auto-populated / dynamic meter code (no memorization needed)
  const meterNumber = isRegistered ? profileMeterCode : "1428 5937 102";
  const exchangeRate = 2800; // 1 USD = 2800 CDF

  // 2. Simulated Appliances
  const [appliances, setAppliances] = useState<Appliance[]>([
    {
      id: "led_lights",
      name: "Éclairage LED",
      watts: 60,
      active: true,
      category: "essential",
      icon: "Lightbulb",
      description: "Lampes basse consommation pour salon et chambres",
    },
    {
      id: "fridge",
      name: "Réfrigérateur A+",
      watts: 150,
      active: true,
      category: "essential",
      icon: "Refrigerator",
      description: "Appareil frigorifique pour conserver les vivres",
    },
    {
      id: "tv",
      name: "TV & Décodeur Kivu",
      watts: 120,
      active: true,
      category: "essential",
      icon: "Tv",
      description: "Divertissement familial et informations locales",
    },
    {
      id: "water_heater",
      name: "Chauffe-eau",
      watts: 2000,
      active: false,
      category: "heavy",
      icon: "Thermometer",
      description: "Production d'eau chaude pour la douche",
    },
    {
      id: "stove",
      name: "Plaque de Cuisson",
      watts: 1500,
      active: false,
      category: "heavy",
      icon: "Flame",
      description: "Cuisinière électrique de cuisine",
    },
    {
      id: "iron",
      name: "Fer à Repasser",
      watts: 1000,
      active: false,
      category: "heavy",
      icon: "Wrench",
      description: "Défroissage des habits",
    },
  ]);

  // 3. Time Acceleration Simulator
  const [isAccelerated, setIsAccelerated] = useState<boolean>(false);
  const [accelSpeed, setAccelSpeed] = useState<number>(60); // 1 sec = 60 mins (1 hour)
  const [sheddingTriggered, setSheddingTriggered] = useState<boolean>(false);

  // 4. Mobile Money & Tokens States
  const [paymentStep, setPaymentStep] = useState<number>(1); // 1: Form, 2: Simulating USSD confirmation, 3: Success with token
  const [selectedOperator, setSelectedOperator] = useState<string>("M-Pesa");
  const [rechargeAmountUsd, setRechargeAmountUsd] = useState<number>(10);
  const [customAmountUsd, setCustomAmountUsd] = useState<string>("");
  const [momoPhone, setMomoPhone] = useState<string>("099876543");
  const [generatedToken, setGeneratedToken] = useState<string>("");
  const [isProcessingPayment, setIsProcessingPayment] =
    useState<boolean>(false);

  const [tokenHistory, setTokenHistory] = useState<TokenHistory[]>([
    {
      id: "token_1",
      date: "2026-07-01 10:14",
      amountUsd: 15.0,
      kwh: 83.3,
      token: "4820-1940-5821-3950-1284",
      operator: "M-Pesa",
      phone: "099876543",
      applied: true,
    },
    {
      id: "token_2",
      date: "2026-06-15 14:22",
      amountUsd: 10.0,
      kwh: 55.5,
      token: "9218-4039-1120-4820-5831",
      operator: "Airtel Money",
      phone: "097123456",
      applied: true,
    },
  ]);

  // Manual token activation input
  const [manualTokenInput, setManualTokenInput] = useState<string>("");
  const [manualTokenError, setManualTokenError] = useState<string>("");
  const [manualTokenSuccess, setManualTokenSuccess] = useState<boolean>(false);

  // Format token as XXXX-XXXX-XXXX-XXXX-XXXX automatically
  const formatTokenString = (rawVal: string) => {
    const digitsOnly = rawVal.replace(/\D/g, "").slice(0, 20);
    const segments = [];
    for (let i = 0; i < digitsOnly.length; i += 4) {
      segments.push(digitsOnly.slice(i, i + 4));
    }
    return segments.join("-");
  };

  const handleManualTokenInputChange = (val: string) => {
    setManualTokenInput(formatTokenString(val));
  };

  const handleKeypadPress = (key: string) => {
    let digitsOnly = manualTokenInput.replace(/\D/g, "");
    if (key === "←") {
      digitsOnly = digitsOnly.slice(0, -1);
    } else if (key === "Effacer") {
      digitsOnly = "";
    } else {
      if (digitsOnly.length < 20) {
        digitsOnly += key;
      }
    }
    setManualTokenInput(formatTokenString(digitsOnly));
  };

  const handlePasteLastGeneratedToken = () => {
    if (generatedToken) {
      setManualTokenInput(generatedToken);
      addNotification(
        "success",
        "✓ Jeton Collé",
        "Le jeton généré de 20 chiffres a été automatiquement collé dans votre compteur intelligent.",
        "system",
      );
    } else {
      const lastToken = tokenHistory[0]?.token;
      if (lastToken) {
        setManualTokenInput(lastToken);
        addNotification(
          "info",
          "✓ Jeton Collé",
          "Le jeton de votre dernière recharge a été inséré.",
          "system",
        );
      } else {
        alert(
          "Aucun jeton disponible à coller. Veuillez d'abord initier une recharge via Mobile Money ou copier un code.",
        );
      }
    }
  };

  // 5. Environmental & Historical Metrics
  const [co2SavedKg, setCo2SavedKg] = useState<number>(1420.5); // Total historical saving
  const [treesSaved, setTreesSaved] = useState<number>(42.8); // Equivalent trees protected from 'makala' (charcoal)

  // Historical consumption points (Recharts)
  const [historyData, setHistoryData] = useState([
    { name: "Lun", kwh: 6.2, cost: 1.11, co2: 5.2 },
    { name: "Mar", kwh: 7.5, cost: 1.35, co2: 6.3 },
    { name: "Mer", kwh: 5.8, cost: 1.04, co2: 4.9 },
    { name: "Jeu", kwh: 9.4, cost: 1.69, co2: 7.9 },
    { name: "Ven", kwh: 12.1, cost: 2.17, co2: 10.2 },
    { name: "Sam", kwh: 8.6, cost: 1.54, co2: 7.3 },
    { name: "Dim", kwh: 4.2, cost: 0.75, co2: 3.5 },
  ]);

  // 6. AI Advisor States
  const [chatInput, setChatInput] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Bonjour ! Je suis **Éco-Conseiller Virunga**, votre assistant intelligent de gestion électrique.\n\nJe suis connecté en temps réel à votre compteur prépayé de Goma. Je peux vous conseiller pour prolonger votre crédit Cashpower, planifier vos appareils à forte consommation (comme votre chauffe-eau de 2000W), et vous montrer comment votre consommation hydroélectrique sauve les forêts du Parc National des Virunga contre le charbon 'makala'.\n\nQue souhaitez-vous savoir aujourd'hui ?",
      timestamp: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // 6.5. Notification Center States & Helpers
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: "notif_init_1",
      type: "success",
      title: "Crédit Initial Activé",
      message:
        "Bienvenue sur Virunga SmartPower. Votre compteur a été approvisionné avec 18.45 kWh de départ.",
      timestamp: "10:14",
      read: true,
      category: "system",
    },
    {
      id: "notif_init_2",
      type: "info",
      title: "Eco-Conseiller connecté",
      message:
        "Le Conseiller intelligent Gemini est à votre disposition pour optimiser votre consommation.",
      timestamp: "11:30",
      read: true,
      category: "system",
    },
  ]);
  const [toasts, setToasts] = useState<ActiveToast[]>([]);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [browserNotifEnabled, setBrowserNotifEnabled] =
    useState<boolean>(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] =
    useState<boolean>(false);
  const [notifFilter, setNotifFilter] = useState<"all" | "unread" | "critical">(
    "all",
  );

  const playAlertSound = (
    type: "critical" | "warning" | "success" | "info",
  ) => {
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      if (type === "critical") {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(440, ctx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === "warning") {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          ctx.currentTime + 0.25,
        );
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === "success") {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          ctx.currentTime + 0.35,
        );
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(659.25, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          ctx.currentTime + 0.15,
        );
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch (e) {
      console.warn("AudioContext standard error or blocked:", e);
    }
  };

  const addNotification = (
    type: "critical" | "warning" | "info" | "success",
    title: string,
    message: string,
    category: "low_credit" | "shedding" | "system" | "recharge",
  ) => {
    const id = `notif_${Date.now()}`;
    const now = new Date();
    const timestamp = now.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newNotif: AppNotification = {
      id,
      type,
      title,
      message,
      timestamp,
      read: false,
      category,
    };

    setNotifications((prev) => [newNotif, ...prev]);

    // Add as a floating toast
    const newToast: ActiveToast = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);

    if (isSoundEnabled) {
      playAlertSound(type);
    }

    // Auto remove toast after 6 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);

    // Try HTML5 browser notification
    if (
      browserNotifEnabled &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      try {
        new Notification(title, { body: message });
      } catch (e) {
        console.warn("HTML5 Notification failed:", e);
      }
    }
  };

  const requestBrowserNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert(
        "Votre navigateur ne prend pas en charge les notifications push standard.",
      );
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setBrowserNotifEnabled(true);
        addNotification(
          "success",
          "✓ Notifications Système Activées",
          "Vous recevrez des alertes instantanées de votre compteur Cashpower directement sur votre appareil.",
          "system",
        );
      } else {
        setBrowserNotifEnabled(false);
        alert(
          "Permission refusée. Les notifications de bureau ne pourront pas s'afficher.",
        );
      }
    } catch (e) {
      console.error("Failed requesting browser notification permission:", e);
    }
  };

  const triggerGmailAlert = async (subject: string, htmlMessage: string) => {
    if (!gmailAlertsEnabled || !profileEmail || !isRegistered) {
      console.log(
        "[Gmail Alert Status] Disabled or missing recipient email/profile registration.",
      );
      return;
    }
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: profileEmail,
          subject: subject,
          htmlText: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #334155;">
              <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px solid #f1f5f9; padding-bottom: 16px;">
                <h1 style="color: #10b981; margin: 0; font-size: 24px; font-weight: bold; tracking-tight;">Virunga SmartPower</h1>
                <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Alerte Énergie intelligente • RDC</p>
              </div>
              
              <div style="padding: 8px 0; line-height: 1.6; font-size: 15px; color: #334155;">
                ${htmlMessage}
              </div>

              <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 24px 0 16px 0;">
                <h4 style="margin: 0 0 4px 0; color: #0f172a; font-size: 13px;">💡 Conseil Éco-Virunga :</h4>
                <p style="margin: 0; font-size: 12px; color: #475569;">Consommer de l'énergie hydroélectrique durable protège la biodiversité du Parc National des Virunga contre la déforestation du bois 'makala'.</p>
              </div>

              <div style="font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 24px;">
                <p style="margin: 0;">Cet e-mail automatique est destiné à l'abonné enregistré <strong>${profileName}</strong>.</p>
                <p style="margin: 4px 0 0 0;">Numéro de compteur associé : <strong>${meterNumber}</strong></p>
                <div style="margin-top: 16px; padding: 10px; background-color: #f1f5f9; border-radius: 8px; display: inline-block;">
                  <strong style="color: #0f172a;">Service Clientèle Virunga Energies :</strong>
                  <span style="color: #2563eb; font-weight: bold; margin-left: 4px;">+243 990 123 456</span>
                </div>
              </div>
            </div>
          `,
        }),
      });
      const data = await response.json().catch(() => ({}) as any);
      if (!response.ok || !data.success) {
        throw new Error(
          data.details || data.error || `Le serveur a répondu avec le statut ${response.status}`,
        );
      }
      console.log(
        "[Gmail Alert Status] Sent successfully. Simulated:",
        data.simulated,
      );
      addNotification(
        "info",
        data.simulated
          ? "📧 Alerte Gmail (Simulée)"
          : "📧 Alerte Gmail (Réelle)",
        `Notification de solde critique envoyée à ${profileEmail}. ${data.simulated ? "(Consultez les logs de votre console VS Code pour voir l'e-mail)" : "(Envoyé via SMTP)"}`,
        "system",
      );
    } catch (err) {
      console.error("[Gmail Alert Status] Error during fetch sending:", err);
      addNotification(
        "warning",
        "📧 Échec de l'envoi de l'alerte e-mail",
        `Impossible d'envoyer l'e-mail d'alerte à ${profileEmail}. Vérifiez votre connexion internet ou la configuration SMTP. Détail : ${err instanceof Error ? err.message : String(err)}`,
        "system",
      );
    }
  };

  const lastBalanceRef = useRef<number>(balanceKwh);

  useEffect(() => {
    const prev = lastBalanceRef.current;

    if (balanceKwh === 0 && prev > 0) {
      addNotification(
        "critical",
        "⚠️ COUPURE TOTALE - Solde Épuisé",
        "Votre solde Cashpower est tombé à 0.00 kWh. L'électricité de votre foyer a été coupée automatiquement. Veuillez recharger via Mobile Money.",
        "low_credit",
      );
      // Trigger Gmail alert
      triggerGmailAlert(
        `🚨 COUPURE D'ÉLECTRICITÉ - Solde Épuisé (Compteur: ${meterNumber})`,
        `<h3 style="color: #dc2626; margin: 0 0 12px 0;">Coupure automatique d'électricité de votre foyer</h3>
         <p>Cher(e) abonnée <strong>${profileName}</strong>,</p>
         <p>Nous vous informons que le solde disponible sur votre compteur intelligent de Goma est tombé à <strong>0.00 kWh</strong>.</p>
         <p>Par conséquent, la fourniture d'électricité de votre foyer a été suspendue automatiquement. Pour rétablir l'alimentation en moins de 30 secondes, veuillez effectuer un paiement via Mobile Money (M-Pesa, Airtel ou Orange) sur la plateforme.</p>`,
      );
    } else if (
      balanceKwh <= alertThreshold &&
      prev > alertThreshold &&
      balanceKwh > 0
    ) {
      addNotification(
        "warning",
        "⚠️ Alerte : Crédit Bas !",
        `Votre solde est descendu sous le seuil d'alerte de ${alertThreshold.toFixed(1)} kWh. Solde actuel : ${balanceKwh.toFixed(2)} kWh. Pensez à recharger !`,
        "low_credit",
      );
      // Trigger Gmail alert
      triggerGmailAlert(
        `⚠️ ALERTE SOLDE BAS - Votre compteur intelligent ${meterNumber}`,
        `<h3 style="color: #d97706; margin: 0 0 12px 0;">Attention : Votre solde d'électricité est critique !</h3>
         <p>Cher(e) abonnée <strong>${profileName}</strong>,</p>
         <p>Nous attirons votre attention sur le fait que le crédit de votre compteur prépayé est descendu sous votre seuil d'alerte configuré de <strong>${alertThreshold.toFixed(1)} kWh</strong>.</p>
         <p>Solde actuel : <strong style="font-size: 18px; color: #d97706; font-family: monospace;">${balanceKwh.toFixed(2)} kWh</strong> (environ $${(balanceKwh * selectedTariff.usdPerKwh).toFixed(2)}).</p>
         <p>Veuillez recharger dès que possible pour éviter d'être plongé(e) dans le noir de manière inopinée.</p>`,
      );
    } else if (balanceKwh > alertThreshold && prev <= alertThreshold) {
      addNotification(
        "success",
        "🔋 Solde Restauré !",
        `Crédit rechargé avec succès. Votre solde actuel est de ${balanceKwh.toFixed(2)} kWh. Vos appareils sont pleinement opérationnels.`,
        "recharge",
      );
      // Trigger Gmail alert
      triggerGmailAlert(
        `🔋 RECHARGE CONFIRMÉE - Compteur ${meterNumber}`,
        `<h3 style="color: #10b981; margin: 0 0 12px 0;">Recharge enregistrée avec succès !</h3>
         <p>Cher(e) abonnée <strong>${profileName}</strong>,</p>
         <p>Nous vous confirmons la bonne réception de votre paiement. Votre compteur intelligent a été approvisionné de <strong>+${(balanceKwh - prev).toFixed(1)} kWh</strong>.</p>
         <p>Votre solde d'énergie disponible est à présent de : <strong style="font-size: 18px; color: #10b981; font-family: monospace;">${balanceKwh.toFixed(2)} kWh</strong>.</p>
         <p>Merci pour votre fidélité et pour votre action éco-responsable de sauvegarde des gorilles du Kivu !</p>`,
      );
    }

    lastBalanceRef.current = balanceKwh;
  }, [balanceKwh, alertThreshold]);

  // Load initial state from our JSON database
  useEffect(() => {
    async function loadSavedState() {
      try {
        const res = await fetch("/api/state");
        if (!res.ok) {
          console.warn(
            `Failed to load initial state: server responded with status ${res.status}. Falling back to defaults.`,
          );
        } else {
          const data = await res.json();
          if (data && Object.keys(data).length > 0) {
            if (typeof data.balanceKwh === "number")
              setBalanceKwh(data.balanceKwh);
            if (typeof data.alertThreshold === "number")
              setAlertThreshold(data.alertThreshold);
            if (data.tokenHistory) setTokenHistory(data.tokenHistory);
            if (data.chatMessages) setChatMessages(data.chatMessages);
            if (data.notifications) setNotifications(data.notifications);
            if (typeof data.co2SavedKg === "number")
              setCo2SavedKg(data.co2SavedKg);
            if (typeof data.treesSaved === "number")
              setTreesSaved(data.treesSaved);
            if (data.historyData) setHistoryData(data.historyData);
            if (typeof data.isSoundEnabled === "boolean")
              setIsSoundEnabled(data.isSoundEnabled);

            // Load custom client registration fields (CRUD)
            if (typeof data.profileName === "string")
              setProfileName(data.profileName);
            if (typeof data.profileEmail === "string")
              setProfileEmail(data.profileEmail);
            if (typeof data.profilePhone === "string")
              setProfilePhone(data.profilePhone);
            if (typeof data.profileMeterCode === "string")
              setProfileMeterCode(data.profileMeterCode);
            if (typeof data.profileIdCardUrl === "string")
              setProfileIdCardUrl(data.profileIdCardUrl);
            if (typeof data.profileIdCardName === "string")
              setProfileIdCardName(data.profileIdCardName);
            if (typeof data.isRegistered === "boolean")
              setIsRegistered(data.isRegistered);
            if (typeof data.gmailAlertsEnabled === "boolean")
              setGmailAlertsEnabled(data.gmailAlertsEnabled);
          }
        }
      } catch (err) {
        console.warn("Failed to load initial state from database.json:", err);
      }
    }
    loadSavedState();
  }, []);

  // Save state to our JSON database whenever critical variables change.
  // Guard so a persistent save failure notifies the user only once (adding a
  // notification mutates state and would otherwise re-trigger this effect).
  const saveErrorNotifiedRef = useRef(false);
  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch("/api/state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            balanceKwh,
            alertThreshold,
            tokenHistory,
            chatMessages,
            notifications,
            co2SavedKg,
            treesSaved,
            historyData,
            isSoundEnabled,
            // Custom registration states
            profileName,
            profileEmail,
            profilePhone,
            profileMeterCode,
            profileIdCardUrl,
            profileIdCardName,
            isRegistered,
            gmailAlertsEnabled,
          }),
        });
        if (!res.ok) {
          throw new Error(`Le serveur a répondu avec le statut ${res.status}`);
        }
        saveErrorNotifiedRef.current = false;
      } catch (err) {
        console.error("Failed to save state to database.json:", err);
        if (!saveErrorNotifiedRef.current) {
          saveErrorNotifiedRef.current = true;
          addNotification(
            "warning",
            "💾 Échec de la sauvegarde",
            "Vos dernières modifications n'ont pas pu être enregistrées dans la base de données. Elles pourraient être perdues au rechargement de la page.",
            "system",
          );
        }
      }
    }, 1000); // Debounce saves by 1s to prevent spamming during high-frequency changes

    return () => clearTimeout(timeout);
  }, [
    balanceKwh,
    alertThreshold,
    tokenHistory,
    chatMessages,
    notifications,
    co2SavedKg,
    treesSaved,
    historyData,
    isSoundEnabled,
    profileName,
    profileEmail,
    profilePhone,
    profileMeterCode,
    profileIdCardUrl,
    profileIdCardName,
    isRegistered,
    gmailAlertsEnabled,
  ]);

  // 7. Live calculation of current Load
  const currentLoadWatts = appliances
    .filter((app) => app.active)
    .reduce((sum, app) => sum + app.watts, 0);

  const currentAmps = parseFloat((currentLoadWatts / 220).toFixed(2)); // Standard 220V grid in Goma

  // 8. Load Shedding Logic (Gestion automatisée de charge)
  useEffect(() => {
    if (loadSheddingActive && balanceKwh <= alertThreshold) {
      // Find heavy appliances that are active and deactivate them
      let triggered = false;
      const updatedAppliances = appliances.map((app) => {
        if (app.category === "heavy" && app.active) {
          triggered = true;
          return { ...app, active: false };
        }
        return app;
      });

      if (triggered) {
        setAppliances(updatedAppliances);
        setSheddingTriggered(true);

        addNotification(
          "warning",
          "⚡ Délestage Intelligent Activé",
          "Les appareils lourds (chauffe-eau, plaque, fer) ont été éteints automatiquement pour économiser de l'énergie.",
          "shedding",
        );

        // Add notification event inside AI advisor logs or alert
        const alertMsg: ChatMessage = {
          id: `shedding_${Date.now()}`,
          role: "assistant",
          text: `🚨 **Délestage Intelligent Activé automatiquement !**\n\nVotre solde actuel (${balanceKwh.toFixed(2)} kWh) est descendu en dessous de votre seuil d'alerte de **${alertThreshold} kWh**.\n\nPour éviter une coupure totale d'électricité, les appareils lourds actifs (*Chauffe-eau, Plaque de cuisson, Fer à Repasser*) ont été coupés automatiquement. Vos charges essentielles (Éclairage LED, Réfrigérateur) restent alimentées pour maximiser la durée de vos unités restantes !`,
          timestamp: new Date().toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setChatMessages((prev) => [...prev, alertMsg]);
      }
    } else if (balanceKwh > alertThreshold) {
      setSheddingTriggered(false);
    }
  }, [balanceKwh, alertThreshold, loadSheddingActive]);

  // 9. Time Simulation loop (Draining credits)
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isAccelerated && balanceKwh > 0) {
      // If speed = 60, 1 sec of real time = 60 mins of sim time (1 hour)
      // Drain in kWh = (Load in Watts / 1000) * hours_simulated
      const intervalMs = 1000;
      const simulatedHours = accelSpeed / 60; // how many hours simulated per second

      intervalId = setInterval(() => {
        setBalanceKwh((prev) => {
          if (prev <= 0) {
            setIsAccelerated(false);
            return 0;
          }

          const consumptionKwh =
            (currentLoadWatts / 1000) * (1 / 60) * simulatedHours;
          const nextBalance = Math.max(0, prev - consumptionKwh);

          // Accumulate carbon metrics
          setCo2SavedKg((c) => c + consumptionKwh * 0.85); // 1kWh hydro = 0.85kg CO2 avoided vs generator
          setTreesSaved((t) => t + consumptionKwh * 0.03); // Protected forest ratio

          return nextBalance;
        });
      }, intervalMs);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAccelerated, currentLoadWatts, accelSpeed, balanceKwh]);

  // Calculate estimated duration before depletion
  const getRemainingTimeText = () => {
    if (currentLoadWatts === 0) return "Indéfini (Aucune consommation)";
    if (balanceKwh <= 0) return "Électricité coupée (Rechargez immédiatement)";

    // hours = balanceKwh / currentLoad_kW
    const loadKw = currentLoadWatts / 1000;
    const remainingHours = balanceKwh / loadKw;

    const days = Math.floor(remainingHours / 24);
    const hours = Math.floor(remainingHours % 24);
    const mins = Math.floor((remainingHours * 60) % 60);

    if (days > 0) {
      return `${days}j ${hours}h ${mins}m restants`;
    } else if (hours > 0) {
      return `${hours}h ${mins}m restants`;
    } else {
      return `${mins} minutes restantes`;
    }
  };

  // Toggle Appliance
  const handleToggleAppliance = (id: string) => {
    setAppliances((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          // If automatic load shedding is active and balance is low, block heavy appliance activation
          if (
            loadSheddingActive &&
            balanceKwh <= alertThreshold &&
            app.category === "heavy" &&
            !app.active
          ) {
            alert(
              `Impossible d'allumer ${app.name} : Le délestage automatique est actif en raison du solde bas (< ${alertThreshold} kWh). Rechargez ou désactivez le délestage.`,
            );
            return app;
          }
          return { ...app, active: !app.active };
        }
        return app;
      }),
    );
  };

  // Mobile Money simulated workflow
  const handleInitiatePayment = () => {
    if (!momoPhone || momoPhone.trim().length < 6) {
      alert("Veuillez saisir un numéro de téléphone mobile money valide.");
      return;
    }
    const finalAmount = rechargeAmountUsd || parseFloat(customAmountUsd);
    if (!finalAmount || isNaN(finalAmount) || finalAmount <= 0) {
      alert("Veuillez choisir ou saisir un montant valide supérieur à 0 $.");
      return;
    }

    setIsProcessingPayment(true);
    setPaymentStep(2); // Show confirmation popup simulation

    // Simulate network confirmation delay
    setTimeout(() => {
      setIsProcessingPayment(false);
      // Generate a random 20-digit token segmented by dashes
      const segments = [];
      for (let i = 0; i < 5; i++) {
        segments.push(Math.floor(1000 + Math.random() * 9000).toString());
      }
      const token = segments.join("-");
      setGeneratedToken(token);
      setPaymentStep(3); // Success page with Token
    }, 3000);
  };

  // Apply Generated or Manual Token
  const handleApplyTokenValue = (tokenStr: string, isFromHistory = false) => {
    // Look up kwh based on amount, or calculate standard ($0.18 per kWh)
    let addedKwh = 0;

    if (isFromHistory) {
      const hist = tokenHistory.find((t) => t.token === tokenStr);
      if (hist && !hist.applied) {
        addedKwh = hist.kwh;
        setTokenHistory((prev) =>
          prev.map((t) => (t.token === tokenStr ? { ...t, applied: true } : t)),
        );
      } else {
        alert("Ce jeton a déjà été appliqué sur votre compteur.");
        return;
      }
    } else {
      // Applying newly generated token
      const finalAmount = rechargeAmountUsd || parseFloat(customAmountUsd);
      addedKwh = parseFloat(
        (finalAmount / selectedTariff.usdPerKwh).toFixed(1),
      );

      // Add transaction to history
      const newTx: TokenHistory = {
        id: `token_${Date.now()}`,
        date: new Date().toLocaleString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
        amountUsd: finalAmount,
        kwh: addedKwh,
        token: tokenStr,
        operator: selectedOperator,
        phone: momoPhone,
        applied: true,
      };
      setTokenHistory((prev) => [newTx, ...prev]);
    }

    setBalanceKwh((b) => b + addedKwh);
    setPaymentStep(1); // Reset payment UI
    setManualTokenSuccess(true);
    setManualTokenInput("");
    setManualTokenError("");

    addNotification(
      "success",
      "🔋 Jeton de Recharge Activé",
      `Votre compteur a été rechargé avec succès de +${addedKwh.toFixed(1)} kWh. Nouveau solde : ${(balanceKwh + addedKwh).toFixed(2)} kWh.`,
      "recharge",
    );

    // Add success message in Advisor chat
    const rechargeChatMsg: ChatMessage = {
      id: `recharge_${Date.now()}`,
      role: "assistant",
      text: `🎉 **Recharge de ${addedKwh.toFixed(1)} kWh activée !**\n\nVotre compteur intelligent a bien enregistré le jeton de recharge. Votre solde est désormais de **${(balanceKwh + addedKwh).toFixed(2)} kWh**.\n\n*Merci de soutenir l'énergie 100% hydroélectrique de Virunga Energies ! Grâce à cette recharge, vous évitez le recours au charbon 'makala' et aidez à préserver l'habitat des gorilles du Kivu.* 🦍🌳`,
      timestamp: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setChatMessages((prev) => [...prev, rechargeChatMsg]);

    setTimeout(() => setManualTokenSuccess(false), 5000);
  };

  const handleManualTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanToken = manualTokenInput.replace(/\s+/g, "").replace(/-/g, "");

    if (cleanToken.length !== 20 || isNaN(Number(cleanToken))) {
      setManualTokenError(
        "Format invalide. Un jeton Cashpower valide contient exactement 20 chiffres.",
      );
      return;
    }

    // Check if already used
    const isUsed = tokenHistory.find(
      (t) => t.token.replace(/-/g, "") === cleanToken && t.applied,
    );
    if (isUsed) {
      setManualTokenError(
        "Ce jeton de recharge a déjà été utilisé sur ce compteur.",
      );
      return;
    }

    // Otherwise, simulate activation
    // Give random kWh based on length (e.g. between 10 and 150 kWh)
    const randomKwh = Math.floor(20 + Math.random() * 80);
    const cleanFormatted = manualTokenInput; // keep raw user input

    setBalanceKwh((b) => b + randomKwh);

    // Add to history
    const manualTx: TokenHistory = {
      id: `manual_${Date.now()}`,
      date: new Date().toLocaleString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
      amountUsd: parseFloat((randomKwh * selectedTariff.usdPerKwh).toFixed(2)),
      kwh: randomKwh,
      token: cleanFormatted,
      operator: "Compteur Manuel",
      phone: "Saisi au clavier",
      applied: true,
    };

    setTokenHistory((prev) => [manualTx, ...prev]);
    setManualTokenInput("");
    setManualTokenSuccess(true);
    setManualTokenError("");

    addNotification(
      "success",
      "🔌 Jeton Clavier Activé",
      `Saisie manuelle acceptée. Recharge de +${randomKwh} kWh créditée. Nouveau solde : ${(balanceKwh + randomKwh).toFixed(2)} kWh.`,
      "recharge",
    );

    const rechargeChatMsg: ChatMessage = {
      id: `manual_recharge_${Date.now()}`,
      role: "assistant",
      text: `🔌 **Jeton manuel de ${randomKwh} kWh activé !**\n\nVotre nouveau solde est de **${(balanceKwh + randomKwh).toFixed(2)} kWh**. Le délestage automatique est de nouveau en veille.`,
      timestamp: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setChatMessages((prev) => [...prev, rechargeChatMsg]);

    setTimeout(() => setManualTokenSuccess(false), 5000);
  };

  // 10. API request to AI Advisor
  const handleSendMessageToAi = async (textPrompt?: string) => {
    const finalPrompt = textPrompt || chatInput;
    if (!finalPrompt.trim()) return;

    // Add user message immediately
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      text: finalPrompt,
      timestamp: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!textPrompt) setChatInput("");
    setIsAiLoading(true);

    try {
      const activeApplianceNames = appliances
        .filter((a) => a.active)
        .map((a) => a.name);

      const response = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalPrompt,
          meterState: {
            balanceKwh,
            alertThreshold,
            currentLoadWatts,
            activeAppliances: activeApplianceNames,
            tariffName: selectedTariff.name,
            tariffUsd: selectedTariff.usdPerKwh,
          },
          // Convert history to list of message items
          history: chatMessages.slice(-8).map((msg) => ({
            role: msg.role,
            text: msg.text,
          })),
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.details || data.error);
      }

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: "assistant",
        text: data.text,
        timestamp: new Date().toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (error: any) {
      console.error("Failed to connect to Gemini API on server:", error);
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: "assistant",
        text: "Désolé, je rencontre une difficulté temporaire de connexion à mon cerveau artificiel Gemini. Veuillez réessayer.\n\n💡 *Conseil Éco-Minute :* Saviez-vous que repasser vos vêtements d'un coup consomme beaucoup moins de kWh que de chauffer le fer plusieurs fois par semaine ? C'est le 'repassage groupé' !",
        timestamp: new Date().toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Quick suggestions
  const suggestions = [
    "Comment prolonger mon crédit restant ?",
    "Explique l'impact éco des gorilles 🦍",
    "Astuces pour mon chauffe-eau",
    "Quel est le tarif de Virunga Energies ?",
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-900 pb-12 font-sans">
      {/* HEADER WITH METRIC STATUS BAR */}
      <header
        id="header-container"
        className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-emerald-400">
              <Zap className="h-7 w-7 animate-pulse text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-display tracking-tight text-white">
                  Virunga SmartPower
                </h1>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20">
                  OFFICIEL SIM
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                Réseau Hydro-électrique du Kivu — 100% Propre & Renouvelable
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs relative">
            <div className="bg-slate-800 border border-slate-700/80 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <Compass className="h-4 w-4 text-emerald-400" />
              <span>
                Centrale :{" "}
                <strong className="text-white">Matebe (13.8 MW)</strong>
              </span>
            </div>
            <div className="bg-slate-800 border border-slate-700/80 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-emerald-400" />
              <span>
                Abonné :{" "}
                <strong className="text-white">
                  ndabereyealfajiri@gmail.com
                </strong>
              </span>
            </div>

            {/* BELL ICON BUTTON */}
            <div className="relative">
              <button
                onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                className="bg-slate-800 hover:bg-slate-750 border border-slate-700/80 p-2.5 rounded-lg flex items-center justify-center text-slate-300 hover:text-white transition relative cursor-pointer"
                aria-label="Notifications"
                id="notif-center-bell-btn"
              >
                {notifications.some((n) => !n.read) ? (
                  <BellRing className="h-4 w-4 text-amber-400 animate-pulse" />
                ) : (
                  <Bell className="h-4 w-4" />
                )}
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[8px] h-4 w-4 rounded-full flex items-center justify-center border border-slate-900">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>

              {/* DROPDOWN MENU */}
              {isNotifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl shadow-black/80 py-3 z-50 text-slate-200">
                  <div className="px-4 pb-2 border-b border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-sm">Centre d'Alertes</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsSoundEnabled(!isSoundEnabled);
                        }}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
                        title={
                          isSoundEnabled
                            ? "Désactiver le son"
                            : "Activer le son"
                        }
                      >
                        {isSoundEnabled ? (
                          <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <VolumeX className="h-3.5 w-3.5 text-slate-500" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setNotifications((prev) =>
                            prev.map((n) => ({ ...n, read: true })),
                          );
                        }}
                        className="text-[10px] text-emerald-400 hover:underline bg-transparent border-none cursor-pointer"
                      >
                        Tout lire
                      </button>
                    </div>
                  </div>

                  {/* Browser notification setup banner */}
                  {!browserNotifEnabled && (
                    <div className="px-4 py-2 bg-indigo-500/10 border-b border-slate-800 flex items-center justify-between gap-2">
                      <span className="text-[9px] text-indigo-300">
                        Activer les alertes système ?
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          requestBrowserNotificationPermission();
                        }}
                        className="bg-indigo-500 hover:bg-indigo-450 text-white font-bold text-[9px] px-2 py-1 rounded transition cursor-pointer"
                      >
                        Autoriser
                      </button>
                    </div>
                  )}

                  {/* Gmail alert toggle banner */}
                  <div className="px-4 py-1.5 bg-emerald-500/5 border-b border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-[9px] text-emerald-400 font-mono">
                      Alertes Automatiques Gmail :
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setGmailAlertsEnabled(!gmailAlertsEnabled);
                      }}
                      className={`text-[9px] px-2.5 py-1 rounded transition-all font-bold cursor-pointer ${
                        gmailAlertsEnabled
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-400 border border-slate-750"
                      }`}
                    >
                      {gmailAlertsEnabled ? "ACTIVES ✓" : "DÉSACTIVÉES"}
                    </button>
                  </div>

                  {/* Filters */}
                  <div className="px-4 py-1.5 bg-slate-950/40 border-b border-slate-800/60 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setNotifFilter("all");
                      }}
                      className={`text-[9px] px-2 py-0.5 rounded cursor-pointer ${notifFilter === "all" ? "bg-slate-800 text-white font-bold" : "text-slate-400 hover:text-slate-200"}`}
                    >
                      Toutes ({notifications.length})
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setNotifFilter("unread");
                      }}
                      className={`text-[9px] px-2 py-0.5 rounded cursor-pointer ${notifFilter === "unread" ? "bg-slate-800 text-white font-bold" : "text-slate-400 hover:text-slate-200"}`}
                    >
                      Non lues ({notifications.filter((n) => !n.read).length})
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setNotifFilter("critical");
                      }}
                      className={`text-[9px] px-2 py-0.5 rounded cursor-pointer ${notifFilter === "critical" ? "bg-slate-800 text-white font-bold" : "text-slate-400 hover:text-slate-200"}`}
                    >
                      Critiques (
                      {
                        notifications.filter((n) => n.type === "critical")
                          .length
                      }
                      )
                    </button>
                  </div>

                  {/* Notifications list */}
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/40 custom-scrollbar">
                    {notifications.filter((n) => {
                      if (notifFilter === "unread") return !n.read;
                      if (notifFilter === "critical")
                        return n.type === "critical";
                      return true;
                    }).length === 0 ? (
                      <div className="px-4 py-6 text-center text-slate-500 text-xs">
                        Aucune notification à afficher.
                      </div>
                    ) : (
                      notifications
                        .filter((n) => {
                          if (notifFilter === "unread") return !n.read;
                          if (notifFilter === "critical")
                            return n.type === "critical";
                          return true;
                        })
                        .map((n) => (
                          <div
                            key={n.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setNotifications((prev) =>
                                prev.map((item) =>
                                  item.id === n.id
                                    ? { ...item, read: true }
                                    : item,
                                ),
                              );
                            }}
                            className={`p-3 text-left transition hover:bg-slate-850 cursor-pointer flex gap-2.5 items-start ${!n.read ? "bg-slate-950/20 border-l-2 border-emerald-500" : ""}`}
                          >
                            <span className="mt-0.5 shrink-0">
                              {n.type === "critical" ? (
                                <ShieldAlert className="h-4 w-4 text-rose-500 animate-pulse" />
                              ) : n.type === "warning" ? (
                                <AlertTriangle className="h-4 w-4 text-amber-400" />
                              ) : n.type === "success" ? (
                                <CheckCircle className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <Activity className="h-4 w-4 text-indigo-400" />
                              )}
                            </span>
                            <div className="flex-1">
                              <div className="flex justify-between items-start gap-1">
                                <span
                                  className={`text-xs font-bold leading-tight ${!n.read ? "text-white" : "text-slate-300"}`}
                                >
                                  {n.title}
                                </span>
                                <span className="text-[9px] text-slate-500 font-mono shrink-0">
                                  {n.timestamp}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                                {n.message}
                              </p>
                            </div>
                          </div>
                        ))
                    )}
                  </div>

                  <div className="px-4 pt-2.5 border-t border-slate-800 flex justify-between text-[10px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setNotifications((prev) =>
                          prev.map((n) => ({ ...n, read: true })),
                        );
                      }}
                      className="text-slate-400 hover:text-white transition bg-transparent border-none cursor-pointer"
                    >
                      Tout marquer lu
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setNotifications([]);
                      }}
                      className="text-rose-400 hover:text-rose-300 transition flex items-center gap-1 bg-transparent border-none cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" /> Tout effacer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* EMERGENCY NOTIFICATION HERO IF CUT OFF */}
      {balanceKwh <= 0 && (
        <div className="max-w-7xl mx-auto px-4 mt-6">
          <div className="bg-rose-500/10 border-2 border-rose-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left justify-between animate-bounce">
            <div className="flex items-center gap-3 flex-col sm:flex-row">
              <div className="p-3 bg-rose-500/20 rounded-full text-rose-400">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-bold text-rose-300 text-lg">
                  Coupure de courant active !
                </h3>
                <p className="text-sm text-slate-300">
                  Votre solde prépayé Cashpower est épuisé (0.00 kWh). Veuillez
                  recharger votre compte via Mobile Money.
                </p>
              </div>
            </div>
            <a
              href="#recharge-section"
              className="bg-rose-500 hover:bg-rose-600 transition text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shrink-0"
            >
              Recharger Immédiatement <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}

      {/* CORE DASHBOARD GRID */}
      <main className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: prepaid smart meter panel & dynamic load simulator (6/12 cols) */}
        <section className="lg:col-span-4 flex flex-col gap-8">
          {/* METER CARD PANEL */}
          <div
            id="meter-panel-card"
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl shadow-slate-950/40"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-400" />
                <h2 className="text-lg font-bold font-display text-white">
                  Compteur Prépayé
                </h2>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                  balanceKwh === 0
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    : balanceKwh <= alertThreshold
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                }`}
              >
                {balanceKwh === 0
                  ? "COUPÉ"
                  : balanceKwh <= alertThreshold
                    ? "CRÉDIT BAS"
                    : "ACTIF"}
              </span>
            </div>

            {/* METER TELEMETRY FRAME */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 mb-5 relative">
              <div className="absolute top-2 left-3 flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </div>

              <div className="text-center">
                <p className="text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-1">
                  N° Compteur Cashpower
                </p>
                <p className="font-mono text-base font-semibold tracking-wider text-slate-300">
                  {meterNumber}
                </p>
              </div>

              {/* DYNAMIC SCREEN DISPLAY */}
              <div className="mt-4 pt-4 border-t border-slate-800/60 flex flex-col items-center">
                <div className="text-center">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider">
                    Solde Énergie
                  </span>
                  <div
                    className={`font-mono text-4xl font-extrabold tracking-tight mt-1 digital-glow ${
                      balanceKwh === 0
                        ? "text-rose-500"
                        : balanceKwh <= alertThreshold
                          ? "text-amber-500"
                          : "text-emerald-400"
                    }`}
                  >
                    {balanceKwh.toFixed(2)} <span className="text-lg">kWh</span>
                  </div>
                </div>

                <div className="flex justify-between w-full mt-4 text-xs font-mono border-t border-slate-800/40 pt-3">
                  <div>
                    <span className="text-slate-500 block">Solde USD</span>
                    <strong className="text-slate-200">
                      ${(balanceKwh * selectedTariff.usdPerKwh).toFixed(2)}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block">Solde CDF</span>
                    <strong className="text-slate-200">
                      {(balanceKwh * selectedTariff.cdfPerKwh).toLocaleString(
                        "fr-FR",
                      )}{" "}
                      FC
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE CONSUMPTION READOUT */}
            <div className="grid grid-cols-2 gap-4 text-xs mb-5">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 block mb-1">
                  Charge instantanée
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-bold font-mono text-emerald-400">
                    {currentLoadWatts}
                  </span>
                  <span className="text-slate-400 text-[10px]">Watts</span>
                </div>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 block mb-1">
                  Intensité (Ampères)
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-bold font-mono text-amber-400">
                    {currentAmps}
                  </span>
                  <span className="text-slate-400 text-[10px]">Amps</span>
                </div>
              </div>
            </div>

            {/* DURATION PREDICTION */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase tracking-wider">
                  Durée estimée
                </span>
                <p className="text-xs font-semibold text-white">
                  {getRemainingTimeText()}
                </p>
              </div>
            </div>

            {/* AUTOMATED MANAGEMENT CONTROLLERS */}
            <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-emerald-400" />
                    Délestage Automatique
                  </label>
                  <p className="text-[10px] text-slate-400">
                    Coupe les charges lourdes si crédit bas
                  </p>
                </div>
                <button
                  onClick={() => setLoadSheddingActive(!loadSheddingActive)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${
                    loadSheddingActive ? "bg-emerald-500" : "bg-slate-800"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full transition-transform ${
                      loadSheddingActive ? "translate-x-6" : "translate-x-0"
                    }`}
                  ></div>
                </button>
              </div>

              {/* SEUIL D'ALERTE */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                    Seuil d'alerte critique
                  </span>
                  <span className="font-mono text-amber-400 font-bold">
                    {alertThreshold.toFixed(1)} kWh
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.5"
                  value={alertThreshold}
                  onChange={(e) =>
                    setAlertThreshold(parseFloat(e.target.value))
                  }
                  className="w-full accent-emerald-500 bg-slate-800 h-1 rounded-lg cursor-pointer"
                />
              </div>

              {/* TARIFF SELECTION */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">
                    Tarif Virunga :
                  </span>
                  <span className="text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {selectedTariff.usdPerKwh.toFixed(2)} $ / kWh
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() =>
                      setSelectedTariff({
                        name: "Social / Domestique",
                        usdPerKwh: 0.18,
                        cdfPerKwh: 504,
                      })
                    }
                    className={`text-[10px] p-1.5 rounded border transition-all text-center font-medium ${
                      selectedTariff.usdPerKwh === 0.18
                        ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                        : "border-slate-800 hover:border-slate-700 text-slate-400"
                    }`}
                  >
                    Social ($0.18)
                  </button>
                  <button
                    onClick={() =>
                      setSelectedTariff({
                        name: "Régulier / Commercial",
                        usdPerKwh: 0.23,
                        cdfPerKwh: 644,
                      })
                    }
                    className={`text-[10px] p-1.5 rounded border transition-all text-center font-medium ${
                      selectedTariff.usdPerKwh === 0.23
                        ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                        : "border-slate-800 hover:border-slate-700 text-slate-400"
                    }`}
                  >
                    Privé / Com ($0.23)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* USER PROFILE & CRUD SUBSCRIPTION MANAGEMENT (Demande utilisateur) */}
          <div
            id="user-profile-crud"
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold font-display text-white">
                  Espace Client (CRUD)
                </h3>
              </div>
              <span className="text-[10px] uppercase font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                {isRegistered ? "Abonné Enregistré" : "Mode Visiteur"}
              </span>
            </div>

            {/* CUSTOMER SERVICE WIDGET (Soutien clientèle) */}
            <div className="bg-slate-950/80 border border-emerald-500/20 p-3.5 rounded-2xl mb-5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                  <Smartphone className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 block">
                    Assistance Client 24/7
                  </span>
                  <strong className="text-xs text-white font-mono">
                    +243 990 123 456
                  </strong>
                </div>
              </div>
              <a
                href="tel:+243990123456"
                className="text-[10px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg transition"
              >
                Appeler
              </a>
            </div>

            {!isRegistered ? (
              /* CREATE Form */
              <form
                onSubmit={handleRegisterProfile}
                className="flex flex-col gap-3 text-xs"
              >
                <p className="text-slate-400 text-xs mb-1">
                  Enregistrez-vous pour lier votre code de paiement Cashpower et
                  vos identifiants afin d'automatiser vos recharges futures.
                </p>
                <div>
                  <label className="text-slate-400 block mb-1">
                    Nom Complet
                  </label>
                  <input
                    type="text"
                    required
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="Ex: Alfajiri Ndabereye"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">
                    Adresse E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={tempEmail}
                    onChange={(e) => setTempEmail(e.target.value)}
                    placeholder="Ex: client@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">
                    Numéro de Téléphone
                  </label>
                  <input
                    type="tel"
                    required
                    value={tempPhone}
                    onChange={(e) => setTempPhone(e.target.value)}
                    placeholder="Ex: +243 998 765 432"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">
                    Code Compteur Énergie (Cashpower)
                  </label>
                  <input
                    type="text"
                    required
                    value={tempMeterCode}
                    onChange={(e) => setTempMeterCode(e.target.value)}
                    placeholder="Ex: 1428 5937 102"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-emerald-500"
                  />
                </div>

                {/* ID CARD UPLOAD FIELD (Drag & Drop or click selection) */}
                <div>
                  <label className="text-slate-400 block mb-1 flex justify-between">
                    <span>Copie Carte d'Identité</span>
                    <span className="text-[10px] text-slate-500">
                      (Optionnelle)
                    </span>
                  </label>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={handleIdCardDrop}
                    className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 bg-slate-950 rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[90px]"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleIdCardFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    {tempIdCardUrl ? (
                      <div className="flex flex-col items-center gap-1.5">
                        <img
                          src={tempIdCardUrl}
                          alt="ID Card Copy"
                          className="h-10 w-auto rounded border border-slate-700 object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-[9px] text-emerald-400 font-mono truncate max-w-[180px]">
                          {tempIdCardName || "image_upload.png"}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg">📁</span>
                        <span className="text-[10px] text-slate-400">
                          Glissez-déposez ou cliquez pour téléverser votre carte
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl transition mt-2 cursor-pointer"
                >
                  Créer / Enregistrer mon profil
                </button>
              </form>
            ) : isEditingProfile ? (
              /* UPDATE Form */
              <form
                onSubmit={handleUpdateProfile}
                className="flex flex-col gap-3 text-xs"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-1">
                  <h4 className="text-white font-bold">
                    Mettre à jour le profil
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="text-slate-500 hover:text-white"
                  >
                    Annuler
                  </button>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">
                    Nom Complet
                  </label>
                  <input
                    type="text"
                    required
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">
                    Adresse E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={tempEmail}
                    onChange={(e) => setTempEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">
                    Numéro de Téléphone
                  </label>
                  <input
                    type="tel"
                    required
                    value={tempPhone}
                    onChange={(e) => setTempPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">
                    Code Compteur Énergie (Cashpower)
                  </label>
                  <input
                    type="text"
                    required
                    value={tempMeterCode}
                    onChange={(e) => setTempMeterCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">
                    Copie Carte d'Identité
                  </label>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={handleIdCardDrop}
                    className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 bg-slate-950 rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[90px]"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleIdCardFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    {tempIdCardUrl ? (
                      <div className="flex flex-col items-center gap-1.5">
                        <img
                          src={tempIdCardUrl}
                          alt="ID Card Copy"
                          className="h-10 w-auto rounded border border-slate-700 object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-[9px] text-emerald-400 font-mono truncate max-w-[180px]">
                          {tempIdCardName || "carte_identite.png"}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg">📁</span>
                        <span className="text-[10px] text-slate-400">
                          Glissez-déposez ou cliquez pour téléverser une
                          nouvelle carte
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="w-1/2 border border-slate-800 hover:border-slate-750 text-slate-300 py-2 rounded-xl transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-xl transition"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            ) : (
              /* READ / DISPLAY & DELETE Profile */
              <div className="flex flex-col gap-3.5 text-xs">
                <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-base shrink-0">
                      {profileName
                        ? profileName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()
                        : "A"}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-white font-bold truncate text-sm">
                        {profileName}
                      </h4>
                      <p className="text-slate-500 font-mono text-[10px] truncate">
                        {profileEmail}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-slate-800/60 grid grid-cols-2 gap-x-2 gap-y-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-mono">
                        Téléphone
                      </span>
                      <strong className="text-slate-200 font-mono truncate block">
                        {profilePhone}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-mono font-bold font-semibold">
                        Compteur Lié
                      </span>
                      <strong className="text-emerald-400 font-mono truncate block">
                        {profileMeterCode}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* ID Card Display area */}
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-mono mb-1.5">
                    Copie de Carte d'Identité
                  </span>
                  <div className="bg-slate-950 border border-slate-850 p-2 rounded-xl flex items-center gap-3">
                    <div className="h-14 w-20 shrink-0 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center relative group">
                      {profileIdCardUrl ? (
                        <>
                          <img
                            src={profileIdCardUrl}
                            alt="Copie ID Card"
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-0.5 text-slate-600">
                          <span className="text-lg">📄</span>
                          <span className="text-[8px]">Aucune</span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 text-slate-400">
                      <p className="font-semibold text-[10px] text-slate-300 truncate">
                        {profileIdCardName || "Non spécifiée"}
                      </p>
                      <p className="text-[9px] text-slate-500">
                        {profileIdCardUrl
                          ? "Document d'identité validé"
                          : "Veuillez modifier le profil pour charger"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-2xl flex items-center gap-2">
                  <span className="text-base text-emerald-400">✓</span>
                  <p className="text-[10px] text-slate-400">
                    <strong>Remplissage automatique</strong> actif : lors de
                    l'achat d'électricité, vos identifiants sont renseignés
                    automatiquement !
                  </p>
                </div>

                <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                  Abonné de passage ? Cliquez sur{" "}
                  <strong>Déconnexion / Nouveau Client</strong> pour effacer ce
                  profil de test et s'enregistrer avec vos propres identifiants.
                </p>

                {/* CRUD Controls: UPDATE and DELETE */}
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    onClick={handleStartEditProfile}
                    className="border border-slate-800 hover:border-slate-700 hover:bg-slate-850 py-2.5 rounded-xl text-slate-300 font-bold text-[11px] transition cursor-pointer text-center"
                  >
                    ✏️ Modifier le profil
                  </button>
                  <button
                    onClick={handleDeleteProfile}
                    className="border border-rose-500/20 hover:border-rose-500/40 hover:bg-rose-500/5 py-2.5 rounded-xl text-rose-400 font-bold text-[11px] transition cursor-pointer text-center"
                  >
                    🔑 Nouveau Client (Déconnexion)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ACCELERATED TIME FLOW SYSTEM (TESTING/SIMULATION DEVICE) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white font-display">
                  Simulateur Temporel
                </h3>
              </div>
              <span className="text-[10px] uppercase font-mono text-slate-500">
                Outil de démo
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Activez le déroulement rapide du temps pour voir le compteur
              consommer l'électricité en direct et observer comment
              l'automatisme de délestage coupe les charges lourdes.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setIsAccelerated(!isAccelerated)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  isAccelerated
                    ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-750 border border-slate-700"
                }`}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isAccelerated ? "animate-spin" : ""}`}
                />
                {isAccelerated
                  ? "Mettre en Pause le Défilement"
                  : "Simuler Consommation dans le Temps"}
              </button>

              {isAccelerated && (
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-400">Vitesse :</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setAccelSpeed(30)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono ${accelSpeed === 30 ? "bg-emerald-500 text-slate-950" : "bg-slate-800"}`}
                    >
                      30x
                    </button>
                    <button
                      onClick={() => setAccelSpeed(60)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono ${accelSpeed === 60 ? "bg-emerald-500 text-slate-950" : "bg-slate-800"}`}
                    >
                      60x
                    </button>
                    <button
                      onClick={() => setAccelSpeed(120)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono ${accelSpeed === 120 ? "bg-emerald-500 text-slate-950" : "bg-slate-800"}`}
                    >
                      120x
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* MIDDLE COLUMN: recharge mobile money & load simulator control + reports (5/12 cols) */}
        <section
          id="middle-column"
          className="lg:col-span-5 flex flex-col gap-8"
        >
          {/* LIVE HOUSEHOLD APPLIANCES CONTROL PANEL */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold font-display text-white">
                  Console des Appareils du Foyer
                </h3>
              </div>
              <span className="text-[10px] uppercase font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Live Simulation
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Allumez ou éteignez les appareils de votre maison à Goma pour
              observer l'effet instantané sur votre vitesse de consommation et
              l'ampérage requis.
            </p>

            {/* APPLIANCES GRID LIST */}
            <div className="flex flex-col gap-3">
              {appliances.map((app) => {
                const isHeavy = app.category === "heavy";
                const isShedded =
                  isHeavy && sheddingTriggered && loadSheddingActive;

                return (
                  <div
                    key={app.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      isShedded
                        ? "bg-rose-500/5 border-rose-500/20 opacity-60"
                        : app.active
                          ? "bg-slate-950/90 border-emerald-500/30"
                          : "bg-slate-950/40 border-slate-800/80 hover:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl border ${
                          isShedded
                            ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                            : app.active
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : "bg-slate-800 border-slate-700/60 text-slate-500"
                        }`}
                      >
                        {app.id === "led_lights" ? (
                          <Zap className="h-4 w-4" />
                        ) : app.id === "fridge" ? (
                          <Compass className="h-4 w-4" />
                        ) : app.id === "tv" ? (
                          <Activity className="h-4 w-4" />
                        ) : app.id === "stove" ? (
                          <Flame className="h-4 w-4" />
                        ) : app.id === "water_heater" ? (
                          <Power className="h-4 w-4" />
                        ) : (
                          <Sliders className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold text-white">
                            {app.name}
                          </h4>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                              isHeavy
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            }`}
                          >
                            {isHeavy ? "LOURD" : "ESSENTIEL"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {app.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-white block">
                          {app.watts} W
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">
                          ~
                          {(
                            (app.watts * selectedTariff.usdPerKwh) /
                            1000
                          ).toFixed(4)}
                          $/h
                        </span>
                      </div>

                      {isShedded ? (
                        <div className="text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-lg font-bold">
                          DÉLESTÉ
                        </div>
                      ) : (
                        <button
                          onClick={() => handleToggleAppliance(app.id)}
                          disabled={balanceKwh === 0}
                          className={`p-2 rounded-xl transition ${
                            app.active
                              ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                              : "bg-slate-800 hover:bg-slate-700 text-slate-400 disabled:opacity-50"
                          }`}
                        >
                          <Power className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {sheddingTriggered && loadSheddingActive && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5 mt-4 flex items-start gap-2.5">
                <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-rose-300">
                    Délestage automatique de sauvegarde
                  </h4>
                  <p className="text-[10px] text-slate-300 mt-0.5">
                    Certains appareils à forte demande ont été mis hors tension
                    pour prolonger la durée d'éclairage. Pour annuler, recharger
                    vos crédits Cashpower ou désactiver l'automatisme.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* MOBILE MONEY RECHARGE & PURCHASE PORTAL */}
          <div
            id="recharge-section"
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl scroll-mt-24"
          >
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="h-5 w-5 text-emerald-400" />
              <h3 className="text-base font-bold font-display text-white">
                Recharge Mobile Money
              </h3>
            </div>

            {paymentStep === 1 && (
              <div className="flex flex-col gap-4">
                {/* Operator Selector */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5 font-medium">
                    1. Sélectionnez votre opérateur
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        setSelectedOperator("M-Pesa");
                        setMomoPhone("099876543");
                      }}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                        selectedOperator === "M-Pesa"
                          ? "bg-red-500/10 border-red-500/50 text-red-400"
                          : "bg-slate-950/40 border-slate-800/80 hover:border-slate-800 text-slate-400"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                      <strong className="text-xs block text-slate-100">
                        M-Pesa
                      </strong>
                      <span className="text-[8px] text-slate-500">Vodacom</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOperator("Airtel Money");
                        setMomoPhone("097123456");
                      }}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                        selectedOperator === "Airtel Money"
                          ? "bg-red-600/15 border-red-600/50 text-red-500"
                          : "bg-slate-950/40 border-slate-800/80 hover:border-slate-800 text-slate-400"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-red-600 inline-block"></span>
                      <strong className="text-xs block text-slate-100">
                        Airtel Money
                      </strong>
                      <span className="text-[8px] text-slate-500">Airtel</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOperator("Orange Money");
                        setMomoPhone("089112233");
                      }}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                        selectedOperator === "Orange Money"
                          ? "bg-orange-500/15 border-orange-500/50 text-orange-400"
                          : "bg-slate-950/40 border-slate-800/80 hover:border-slate-800 text-slate-400"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span>
                      <strong className="text-xs block text-slate-100">
                        Orange Money
                      </strong>
                      <span className="text-[8px] text-slate-500">Orange</span>
                    </button>
                  </div>
                </div>

                {/* Predefined Amounts */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5 font-medium">
                    2. Montant de la recharge ($ USD)
                  </label>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    {[5, 10, 20, 50].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => {
                          setRechargeAmountUsd(amt);
                          setCustomAmountUsd("");
                        }}
                        className={`py-2 rounded-xl border transition-all font-mono font-bold ${
                          rechargeAmountUsd === amt && !customAmountUsd
                            ? "bg-emerald-500 text-slate-950 border-emerald-500"
                            : "bg-slate-950/40 border-slate-800/80 hover:border-slate-800 text-slate-200"
                        }`}
                      >
                        {amt} $
                      </button>
                    ))}
                  </div>

                  {/* Custom amount */}
                  <div className="mt-2.5 flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
                    <DollarSign className="h-4 w-4 text-slate-500" />
                    <input
                      type="number"
                      placeholder="Autre montant personnalisé"
                      value={customAmountUsd}
                      onChange={(e) => {
                        setCustomAmountUsd(e.target.value);
                        setRechargeAmountUsd(0);
                      }}
                      className="bg-transparent text-xs w-full text-white outline-none ml-1 placeholder:text-slate-600"
                    />
                  </div>
                </div>

                {/* Estimate output of purchase */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 text-xs">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-slate-400">Jeton estimé :</span>
                    <strong className="text-emerald-400 font-mono">
                      {(
                        (rechargeAmountUsd ||
                          parseFloat(customAmountUsd) ||
                          0) / selectedTariff.usdPerKwh
                      ).toFixed(1)}{" "}
                      kWh
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">
                      En Francs Congolais (simulé) :
                    </span>
                    <span className="text-slate-300 font-mono">
                      {(
                        (rechargeAmountUsd ||
                          parseFloat(customAmountUsd) ||
                          0) * exchangeRate
                      ).toLocaleString()}{" "}
                      CDF
                    </span>
                  </div>
                </div>

                {/* Phone Input */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-slate-400 block font-medium">
                      3. Numéro de téléphone Mobile Money
                    </label>
                    {isRegistered && (
                      <span className="text-[9px] text-emerald-400 font-medium">
                        ✓ Rempli automatiquement
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={momoPhone}
                    onChange={(e) => setMomoPhone(e.target.value)}
                    placeholder="Saisir votre numéro de téléphone"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="text-[11px] bg-slate-950/60 p-2.5 rounded-xl border border-slate-850 flex justify-between items-center text-slate-400">
                  <span>Compteur bénéficiaire :</span>
                  <div className="text-right">
                    <strong className="text-white font-mono block">
                      {meterNumber}
                    </strong>
                    {isRegistered ? (
                      <span className="text-[9px] text-emerald-400 block font-mono">
                        ID lié à {profileName}
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-500 block">
                        Compteur visiteur standard
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleInitiatePayment}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 transition text-slate-950 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 mt-1 cursor-pointer"
                >
                  <Smartphone className="h-4 w-4" />
                  Initier la Recharge de {rechargeAmountUsd ||
                    customAmountUsd}{" "}
                  $
                </button>
              </div>
            )}

            {/* STEP 2: SIMULATED WAITING/USSD POPUP */}
            {paymentStep === 2 && (
              <div className="py-6 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mb-4"></div>
                <h4 className="text-sm font-bold text-white mb-2">
                  Simulateur Mobile Money
                </h4>

                <div className="bg-slate-950 border border-indigo-500/30 p-4 rounded-xl max-w-xs mt-2 relative">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-indigo-500 text-white rounded text-[8px] font-bold">
                    BOÎTE DE DIALOGUE SIMULÉE
                  </div>
                  <p className="text-xs text-indigo-300 font-mono mt-1">
                    Pour la simulation, imaginez l'écran de votre smartphone :
                  </p>
                  <p className="text-xs text-white font-mono mt-2 bg-slate-900/80 p-2.5 rounded border border-slate-800">
                    "Virunga Energies vous demande de valider{" "}
                    {rechargeAmountUsd || customAmountUsd} $ via{" "}
                    {selectedOperator}. Entrez votre code PIN de validation..."
                  </p>
                </div>

                <p className="text-[10px] text-slate-500 mt-4 animate-pulse">
                  Validation du réseau en cours... Veuillez patienter.
                </p>
              </div>
            )}

            {/* STEP 3: SUCCESS WITH JETON */}
            {paymentStep === 3 && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-2xl flex flex-col items-center justify-center text-center">
                <div className="p-2.5 bg-emerald-500/20 rounded-full text-emerald-400 mb-3">
                  <CheckCircle className="h-8 w-8" />
                </div>

                <h4 className="text-sm font-bold text-emerald-400 mb-1">
                  Paiement Reçu avec Succès
                </h4>
                <p className="text-xs text-slate-300 mb-4">
                  Votre jeton Cashpower de recharge a été généré automatiquement
                  par l'opérateur.
                </p>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 w-full mb-4">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1">
                    Votre Jeton (20 chiffres)
                  </span>
                  <div className="text-sm md:text-base font-mono font-bold text-emerald-400 tracking-wider">
                    {generatedToken}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 w-full text-xs">
                  <button
                    onClick={() => {
                      navigator.clipboard
                        .writeText(generatedToken)
                        .then(() => {
                          alert("Jeton copié dans le presse-papier !");
                        })
                        .catch(() => {
                          alert(
                            "Impossible de copier le jeton automatiquement. Veuillez le copier manuellement.",
                          );
                        });
                    }}
                    className="border border-slate-800 hover:border-slate-700 hover:bg-slate-850 py-2 rounded-lg text-slate-300 transition"
                  >
                    Copier Jeton
                  </button>
                  <button
                    onClick={() => handleApplyTokenValue(generatedToken)}
                    className="bg-emerald-500 hover:bg-emerald-400 py-2 rounded-lg text-slate-950 font-bold transition flex items-center justify-center gap-1"
                  >
                    <Zap className="h-3 w-3" /> Activer Direct
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT COLUMN: AI Eco-Advisor chatbot panel (3/12 cols) */}
        <section className="lg:col-span-3 flex flex-col gap-8">
          {/* ENVIRONMENT & CONSERVATION IMPACT INFO */}
          <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/20 rounded-3xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1 bg-emerald-500 text-slate-950 rounded-bl-xl font-bold text-[8px] uppercase tracking-wider">
              100% Vert
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Leaf className="h-5 w-5 text-emerald-400" />
              <h3 className="text-sm font-bold font-display text-white">
                Charte Éco-Virunga
              </h3>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              En consommant de l'électricité hydro-électrique plutôt que du
              charbon de bois (<strong>'makala'</strong>), vous protégez
              l'écosystème du Parc des Virunga.
            </p>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono mb-4 border-t border-slate-800/80 pt-4">
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">
                  CO2 évité
                </span>
                <strong className="text-emerald-400 font-bold block mt-1">
                  {co2SavedKg.toFixed(1)} kg
                </strong>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">
                  Arbres sauvés
                </span>
                <strong className="text-emerald-400 font-bold block mt-1">
                  ~{treesSaved.toFixed(1)} arbres
                </strong>
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl flex gap-3 items-center">
              <span className="text-2xl">🦍</span>
              <div>
                <h4 className="text-[11px] font-bold text-emerald-300">
                  Gardien des Gorilles de Montagne
                </h4>
                <p className="text-[9px] text-slate-400">
                  Le Kivu vert vous remercie de votre contribution active.
                </p>
              </div>
            </div>
          </div>

          {/* MANUAL CODE / KEYPAD CHARGE AREA - COMPTEUR CASHPOWER VIRUNGA */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                <Zap className="h-3.5 w-3.5 text-emerald-400" /> Compteur
                Cashpower
              </h4>
              <span className="text-[9px] bg-slate-950 px-2 py-0.5 rounded-md font-mono text-slate-400 border border-slate-800">
                Saisie Clavier
              </span>
            </div>

            {/* Simulated LCD Screen */}
            <div className="bg-[#051111] border-2 border-slate-800 rounded-xl p-3.5 shadow-inner relative overflow-hidden">
              <div className="absolute top-1 right-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[8px] font-mono text-emerald-500/60 uppercase">
                  En Ligne
                </span>
              </div>
              <label className="text-[9px] font-mono text-emerald-500/50 uppercase tracking-wider block mb-1">
                ÉCRAN LCD • RECHARGE CASHPOWER
              </label>

              <div className="font-mono text-sm sm:text-base text-emerald-400 font-extrabold tracking-widest text-center py-1 select-none min-h-[32px] flex items-center justify-center bg-slate-950/40 rounded-lg border border-emerald-500/5">
                {manualTokenInput || "0000-0000-0000-0000-0000"}
              </div>

              {manualTokenError && (
                <p className="text-[10px] text-rose-400 text-center font-mono mt-1.5 animate-pulse">
                  ⚠ ERROR: {manualTokenError}
                </p>
              )}
              {manualTokenSuccess && (
                <p className="text-[10px] text-emerald-400 text-center font-mono font-bold mt-1.5">
                  ✓ ACCEPTE: +CREDIT OK
                </p>
              )}
            </div>

            {/* Quick Actions Bar */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePasteLastGeneratedToken}
                className="flex-1 bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 hover:border-slate-700 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                📥 Coller le jeton acheté
              </button>
              {manualTokenInput && (
                <button
                  type="button"
                  onClick={() => setManualTokenInput("")}
                  className="bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-950/30 px-3 py-2 rounded-xl text-[10px] transition cursor-pointer"
                >
                  Effacer
                </button>
              )}
            </div>

            {/* Responsive Virtual Keypad for Smartphones */}
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-850">
              <div className="grid grid-cols-3 gap-2">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleKeypadPress(num)}
                    className="h-11 sm:h-12 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono font-bold text-white hover:bg-slate-800 hover:border-slate-700 active:bg-emerald-500 active:text-slate-950 transition-all duration-75 flex items-center justify-center cursor-pointer select-none"
                  >
                    {num}
                  </button>
                ))}

                {/* Backspace Button */}
                <button
                  type="button"
                  onClick={() => handleKeypadPress("Effacer")}
                  className="h-11 sm:h-12 rounded-xl bg-slate-900/50 hover:bg-rose-950/20 hover:border-rose-900/30 text-[10px] font-bold text-slate-400 hover:text-rose-400 transition flex items-center justify-center cursor-pointer select-none"
                  title="Tout effacer"
                >
                  CLR
                </button>

                <button
                  type="button"
                  onClick={() => handleKeypadPress("0")}
                  className="h-11 sm:h-12 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono font-bold text-white hover:bg-slate-800 hover:border-slate-700 active:bg-emerald-500 active:text-slate-950 transition-all duration-75 flex items-center justify-center cursor-pointer select-none"
                >
                  0
                </button>

                {/* Single Delete Button */}
                <button
                  type="button"
                  onClick={() => handleKeypadPress("←")}
                  className="h-11 sm:h-12 rounded-xl bg-slate-900/50 hover:bg-slate-800 text-xs font-bold text-slate-300 transition flex items-center justify-center cursor-pointer select-none"
                  title="Supprimer le dernier chiffre"
                >
                  ←
                </button>
              </div>

              {/* Submit / Activate Button styled like physical meter action key */}
              <button
                type="button"
                onClick={(e) => handleManualTokenSubmit(e as any)}
                disabled={manualTokenInput.replace(/\D/g, "").length < 20}
                className="w-full mt-3 bg-gradient-to-r from-emerald-500 to-teal-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 hover:brightness-110 text-slate-950 h-11 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20"
              >
                <CheckCircle className="h-4 w-4" /> Entrer (Valider Jeton)
              </button>
            </div>
          </div>

          {/* HISTORICAL TOKENS */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex-1 flex flex-col min-h-[180px]">
            <h4 className="text-xs font-bold text-slate-200 mb-3 uppercase tracking-wider">
              Historique des Jetons
            </h4>

            <div className="flex flex-col gap-2 overflow-y-auto max-h-[220px] pr-1">
              {tokenHistory.map((hist) => (
                <div
                  key={hist.id}
                  className="bg-slate-950/80 border border-slate-850 rounded-xl p-2.5 text-xs"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {hist.date}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        hist.applied
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {hist.applied ? "APPLIQUÉ" : "RESTE"}
                    </span>
                  </div>
                  <div className="flex justify-between font-mono font-bold mb-1">
                    <span className="text-white">
                      {hist.kwh.toFixed(1)} kWh
                    </span>
                    <span className="text-slate-400">
                      ${hist.amountUsd.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono truncate">
                    {hist.token}
                  </p>

                  {!hist.applied && (
                    <button
                      onClick={() => handleApplyTokenValue(hist.token, true)}
                      className="w-full mt-1.5 bg-emerald-500 text-slate-950 py-1 rounded text-[10px] font-bold"
                    >
                      Activer Maintenant
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER STATS CHARTS & FULL AI ADVISOR DIALOG */}
      <section className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CHARTS PANEL (7/12 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-400" />
              <h3 className="text-base font-bold font-display text-white">
                Analyse de Consommation & Historique
              </h3>
            </div>
            <span className="text-xs text-slate-400">7 Derniers Jours</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={historyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorKwh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    color: "#f8fafc",
                    borderRadius: "12px",
                  }}
                  labelClassName="font-bold text-white text-xs"
                />
                <Area
                  type="monotone"
                  dataKey="kwh"
                  name="Consommation (kWh)"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorKwh)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-slate-800 pt-4 text-xs">
            <div className="text-center">
              <span className="text-slate-500 block">Total Hebdo</span>
              <strong className="text-white text-sm font-mono">53.6 kWh</strong>
            </div>
            <div className="text-center border-x border-slate-850">
              <span className="text-slate-500 block">Coût Hebdo</span>
              <strong className="text-white text-sm font-mono">
                $9.65 USD
              </strong>
            </div>
            <div className="text-center">
              <span className="text-slate-500 block">Moyenne Quotidienne</span>
              <strong className="text-emerald-400 text-sm font-mono">
                7.6 kWh / jour
              </strong>
            </div>
          </div>
        </div>

        {/* ECO AI CONSEILLER INTERACTIVE CONSOLE (5/12 cols) */}
        <div
          id="ai-advisor-panel"
          className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col h-[460px]"
        >
          {/* Advisor Header */}
          <div className="flex items-center justify-between border-b border-slate-850 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl text-slate-950 font-bold flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-display flex items-center gap-1.5">
                  Éco-Conseiller AI Virunga
                </h3>
                <p className="text-[10px] text-emerald-400">
                  Soutenu par Gemini 3.5 Flash
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setChatMessages([
                  {
                    id: "welcome",
                    role: "assistant",
                    text: "Bonjour ! Comment puis-je vous aider aujourd'hui avec votre compteur Cashpower ?",
                    timestamp: new Date().toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  },
                ]);
              }}
              className="text-[10px] hover:text-white text-slate-500 flex items-center gap-1 border border-slate-800 px-2.5 py-1 rounded-lg transition"
            >
              Effacer historique
            </button>
          </div>

          {/* CHAT CHANNELS SCRIPTER */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 mb-4 text-xs scrollbar-thin">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${
                  msg.role === "user"
                    ? "self-end items-end"
                    : "self-start items-start"
                }`}
              >
                <div
                  className={`p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-emerald-500 text-slate-950 font-medium rounded-tr-none"
                      : "bg-slate-950/90 text-slate-200 rounded-tl-none border border-slate-850"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-500 mt-1 font-mono px-1">
                  {msg.role === "user" ? "Abonné" : "Conseiller"} •{" "}
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isAiLoading && (
              <div className="self-start flex items-center gap-2 text-slate-400 bg-slate-950/50 px-3 py-2.5 rounded-2xl border border-slate-850/60 max-w-[85%]">
                <div className="flex gap-1">
                  <span
                    className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></span>
                  <span
                    className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></span>
                  <span
                    className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></span>
                </div>
                <span className="text-[10px]">
                  L'AI Virunga analyse vos kWh...
                </span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chat Suggestions Pills */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {suggestions.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSendMessageToAi(sug)}
                disabled={isAiLoading}
                className="text-[9px] bg-slate-950 hover:bg-slate-850 text-slate-300 font-medium border border-slate-850 px-2.5 py-1 rounded-full transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Chat Form */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2 focus-within:border-emerald-500/50">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessageToAi();
              }}
              disabled={isAiLoading}
              placeholder="Posez une question sur votre consommation..."
              className="bg-transparent text-xs w-full text-white outline-none placeholder:text-slate-600 pr-2 disabled:opacity-50"
            />
            <button
              onClick={() => handleSendMessageToAi()}
              disabled={isAiLoading || !chatInput.trim()}
              className="p-1.5 bg-emerald-500 text-slate-950 rounded-xl hover:bg-emerald-400 transition cursor-pointer disabled:opacity-40 disabled:hover:bg-emerald-500 shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER CHARTER LOGO */}
      <footer className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-900 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 Virunga Energies — Projet Énergie Propre du Kivu.</p>
        <p className="flex items-center gap-1.5 justify-center">
          <Leaf className="h-3.5 w-3.5 text-emerald-500" />
          Énergie hydroélectrique préservant le Parc National des Virunga et ses
          Gorilles.
        </p>
      </footer>

      {/* FLOATING TOASTS OVERLAY */}
      <div
        id="floating-toasts-container"
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-2xl border shadow-2xl transition-all duration-300 transform translate-y-0 flex gap-3 items-start animate-fade-in ${
              toast.type === "critical"
                ? "bg-rose-950/95 border-rose-500/40 text-slate-100 shadow-rose-950/50"
                : toast.type === "warning"
                  ? "bg-amber-950/95 border-amber-500/40 text-slate-100 shadow-amber-950/50"
                  : toast.type === "success"
                    ? "bg-emerald-950/95 border-emerald-500/40 text-slate-100 shadow-emerald-950/50"
                    : "bg-slate-900/95 border-slate-700/80 text-slate-100 shadow-slate-950/50"
            }`}
          >
            <span className="shrink-0 mt-0.5">
              {toast.type === "critical" ? (
                <ShieldAlert className="h-5 w-5 text-rose-400 animate-pulse" />
              ) : toast.type === "warning" ? (
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              ) : toast.type === "success" ? (
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              ) : (
                <Activity className="h-5 w-5 text-indigo-400" />
              )}
            </span>
            <div className="flex-1">
              <h5 className="text-xs font-extrabold text-white uppercase tracking-wider">
                {toast.title}
              </h5>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() =>
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }
              className="text-slate-400 hover:text-white p-0.5 rounded transition cursor-pointer"
              aria-label="Fermer"
            >
              <Plus className="h-3.5 w-3.5 rotate-45" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
