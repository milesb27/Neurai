import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { processUserMessage } from "./services/openai";
import { insertChatSessionSchema, insertChatMessageSchema, insertAppointmentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all doctors
  app.get("/api/doctors", async (req, res) => {
    try {
      const doctors = await storage.getDoctors();
      res.json(doctors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch doctors" });
    }
  });

  app.post("/chat", async (req, res) => {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    try {
      const systemPrompt = `
      You are a Columbia neurosurgery intake assistant.

      Greet the patient politely with a warm, professional tone.
      Start by asking: “Hello! How can I assist you today?” and offer 4 clear options:

      • Scheduling an appointment  
      • Getting imaging  
      • Learning more about our doctors  
      • Something else

      Also remind the user: If this is an emergency, they should call 911.

      Speak simply. Only ask **one question at a time**. Wait for a reply before continuing.
      `.trim();

      const reply = response.choices[0].message.content;
      res.json({ reply });
    } catch (error) {
      console.error("OpenAI error:", error);
      res.status(500).json({ error: "Failed to get response from OpenAI" });
    }
  });
  // Get doctors by location
  app.get("/api/doctors/location/:location", async (req, res) => {
    try {
      const { location } = req.params;
      const doctors = await storage.getDoctorsByLocation(location);
      res.json(doctors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch doctors by location" });
    }
  });

  // Create chat session
  app.post("/api/chat/session", async (req, res) => {
    try {
      const validatedData = insertChatSessionSchema.parse(req.body);
      const session = await storage.createChatSession(validatedData);
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create chat session" });
      }
    }
  });

  // Get chat messages
  app.get("/api/chat/session/:sessionId/messages", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getChatMessages(sessionId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send message to chat
  app.post("/api/chat/session/:sessionId/message", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ message: "Message content is required" });
      }

      // Save user message
      const userMessage = await storage.createChatMessage({
        sessionId,
        content,
        sender: "user"
      });

      // Get conversation history
      const messages = await storage.getChatMessages(sessionId);
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === "user" ? "user" as const : "assistant" as const,
        content: msg.content
      }));

      // Get current session to determine step
      const session = await storage.getChatSession(sessionId);
      const currentStep = session?.status || "greeting";

      // Process with OpenAI
      const aiResponse = await processUserMessage(content, conversationHistory, currentStep);

      // Save AI response
      const assistantMessage = await storage.createChatMessage({
        sessionId,
        content: aiResponse.message,
        sender: "assistant"
      });

      // Update session with extracted info
      if (aiResponse.extractedInfo && session) {
        const updates: any = {};
        if (aiResponse.extractedInfo.location) {
          updates.location = aiResponse.extractedInfo.location;
        }
        if (aiResponse.extractedInfo.urgency) {
          updates.urgency = aiResponse.extractedInfo.urgency;
        }
        if (aiResponse.extractedInfo.patientName) {
          updates.patientName = aiResponse.extractedInfo.patientName;
        }
        if (aiResponse.nextStep) {
          updates.status = aiResponse.nextStep;
        }

        if (Object.keys(updates).length > 0) {
          await storage.updateChatSession(sessionId, updates);
        }
      }

      res.json({
        userMessage,
        assistantMessage,
        nextStep: aiResponse.nextStep,
        extractedInfo: aiResponse.extractedInfo
      });
    } catch (error) {
      console.error('Chat message error:', error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  // Create appointment
  app.post("/api/appointments", async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(validatedData);
      
      // Update chat session if provided
      if (req.body.sessionId) {
        await storage.updateChatSession(req.body.sessionId, {
          status: "completed",
          appointmentId: appointment.id
        });
      }

      res.json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create appointment" });
      }
    }
  });

  // Get all appointments
  app.get("/api/appointments", async (req, res) => {
    try {
      const appointments = await storage.getAppointments();
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  // Update appointment status
  app.patch("/api/appointments/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const appointment = await storage.updateAppointmentStatus(id, status);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update appointment status" });
    }
  });

  // Get appointments by date
  app.get("/api/appointments/date/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const targetDate = new Date(date);
      
      if (isNaN(targetDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      const appointments = await storage.getAppointmentsByDate(targetDate);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments by date" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
