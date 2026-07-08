import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import nodemailer from "nodemailer";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON with generous size limit for ID card photo uploads
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // POST Route to send alert email via Gmail SMTP (or simulate if not configured)
  app.post("/api/send-email", async (req, res) => {
    const { to, subject, htmlText } = req.body;

    if (!to || !subject || !htmlText) {
      return res.status(400).json({
        error: "Missing required email fields: to, subject, htmlText",
      });
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASS; // App Password (16 characters from Google Account Security)

    console.log(`[Email Service] Demande d'envoi d'e-mail reçue pour: ${to}`);

    if (!gmailUser || !gmailPass) {
      console.log(`[Email Service - MODE SIMULATION]`);
      console.log(`Destinataire: ${to}`);
      console.log(`Sujet: ${subject}`);
      console.log(`Corps: ${htmlText.substring(0, 150)}...`);
      return res.json({
        success: true,
        simulated: true,
        message:
          "E-mail simulé avec succès ! Configurez GMAIL_USER et GMAIL_APP_PASS dans vos variables d'environnement (par exemple .env) pour un envoi Gmail réel.",
      });
    }

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      const mailOptions = {
        from: `"Virunga SmartPower" <${gmailUser}>`,
        to,
        subject,
        html: htmlText,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Service - ENVOYÉ] ID de l'e-mail: ${info.messageId}`);
      return res.json({
        success: true,
        simulated: false,
        messageId: info.messageId,
        message: "E-mail Gmail envoyé avec succès via SMTP !",
      });
    } catch (error: any) {
      console.error("[Email Service - ERREUR SMTP Gmail]:", error);
      return res.status(500).json({
        error: "Échec de l'envoi de l'e-mail via le serveur SMTP Gmail",
        details: error.message,
      });
    }
  });

  // Simple JSON-file Database Persistence for VS Code local run
  const DB_FILE = path.join(process.cwd(), "database.json");

  // GET State from Database
  app.get("/api/state", async (req, res) => {
    try {
      const data = await fs.readFile(DB_FILE, "utf-8");
      res.json(JSON.parse(data));
    } catch (error: any) {
      if (error.code === "ENOENT") {
        // Database file doesn't exist yet, return empty object
        return res.json({});
      }
      res.status(500).json({ error: "Failed to read database state" });
    }
  });

  // POST State to Database
  app.post("/api/state", async (req, res) => {
    try {
      await fs.writeFile(DB_FILE, JSON.stringify(req.body, null, 2), "utf-8");
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save state to database" });
    }
  });

  // Lazy initialize and handle Gemini API request
  app.post("/api/advisor", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Fallback response if API key is not configured yet
        return res.json({
          text: "Bonjour ! Je suis votre Conseiller Éco-Virunga. Notez que la clé API Gemini n'est pas encore configurée dans les paramètres de l'application (Settings > Secrets). Pour l'instant, je fonctionne en mode démo.\n\n💡 *Conseil de base :* Pensez à éteindre vos appareils à forte consommation comme le chauffe-eau ou les plaques électriques pendant les heures de pointe (18h - 21h) pour économiser vos unités Cashpower de Virunga Energies !",
        });
      }

      const { prompt, meterState, history = [] } = req.body;

      // Initialize GoogleGenAI inside the route (lazy loading)
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // System instruction for Gemini in French about Virunga Energies prepaid context
      const systemInstruction = `Tu es "Éco-Conseiller Virunga", un conseiller virtuel intelligent spécialisé en efficacité énergétique pour les abonnés prépayés de Virunga Energies à Goma et au Nord-Kivu (RDC).
Ton rôle est d'analyser les données du compteur de l'utilisateur et de lui donner des conseils chaleureux, pragmatiques et culturellement adaptés pour économiser l'électricité et prolonger ses jetons (unités Cashpower).

Contexte crucial de Virunga Energies :
1. Énergie 100% Propre : L'électricité provient des centrales hydroélectriques durables de Virunga (ex: Matebe de 13.8 MW, Luviro, etc.) construites par l'Alliance Virunga pour protéger le Parc National des Virunga (les gorilles et l'écosystème).
2. Impact Écologique Majeur : Utiliser l'électricité hydroélectrique prévient l'utilisation du charbon de bois (le 'makala'), responsable d'une déforestation massive et tragique du parc. Félicite gentiment l'abonné pour sa contribution à la survie des gorilles !
3. Vie locale à Goma : Le dollar américain (USD) est largement utilisé pour l'achat de jetons, aux côtés du Franc Congolais (CDF). Les coupures de crédit soudaines peuvent plonger les familles dans le noir.
4. Gestion Active : Propose l'activation du délestage automatique des charges lourdes (chauffe-eau, plaques électriques) lorsque le niveau de crédit descend sous un certain seuil.

Données actuelles du compteur de l'abonné :
- Solde actuel : ${meterState?.balanceKwh?.toFixed(2) || 0} kWh (soit environ $${(meterState?.balanceKwh * (meterState?.tariffUsd || 0.18)).toFixed(2)})
- Seuil d'alerte configuré : ${meterState?.alertThreshold || 5} kWh
- Consommation instantanée actuelle : ${meterState?.currentLoadWatts || 0} W
- Appareils actifs : ${meterState?.activeAppliances?.join(", ") || "aucun"}
- Tarif sélectionné : ${meterState?.tariffName || "Social"} ($${meterState?.tariffUsd || 0.18}/kWh)

Réponds en Français, de manière concise, engageante et structurée avec du Markdown. Utilise occasionnellement des références à Goma ou au Kivu. Sois encourageant !`;

      // Map chat history to the structure expected by the SDK
      const contents = [
        ...history.map((msg: any) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.text }],
        })),
        {
          role: "user",
          parts: [
            {
              text:
                prompt ||
                "Analyse mon compteur et donne-moi des conseils d'optimisation.",
            },
          ],
        },
      ];

      // Call Gemini 3.5 Flash (as recommended for basic/intermediate text tasks)
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Advisor Error:", error);
      res.status(500).json({
        error: "Erreur lors de la génération des conseils AI.",
        details: error.message,
      });
    }
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `[Virunga Energies Server] Running on http://localhost:${PORT}`,
    );
  });
}

startServer();
