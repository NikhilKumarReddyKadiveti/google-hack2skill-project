import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateEmphatheticResponse, analyzeSentiment, detectCrisis } from "./services/openai";
import { analyzeTextForCrisis, getCrisisResponseMessage } from "./services/crisisDetection";
import { calculateMoodTrend, generateMoodInsights, getDailyMoodSummary } from "./services/moodAnalysis";
import { insertMessageSchema, insertConversationSchema, insertMoodEntrySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Conversation routes
  app.post('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversationData = insertConversationSchema.parse({
        ...req.body,
        userId
      });
      
      const conversation = await storage.createConversation(conversationData);
      
      // Create initial session
      const session = await storage.createUserSession({
        userId,
        messageCount: 0
      });
      
      res.json({ conversation, sessionId: session.id });
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  app.get('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get('/api/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const messages = await storage.getConversationMessages(id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Mood tracking routes
  app.get('/api/mood/entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      const entries = await storage.getUserMoodEntries(userId, start, end);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching mood entries:", error);
      res.status(500).json({ message: "Failed to fetch mood entries" });
    }
  });

  app.get('/api/mood/average', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { days = 7 } = req.query;
      
      const average = await storage.getUserAverageMood(userId, Number(days));
      res.json({ average });
    } catch (error) {
      console.error("Error calculating average mood:", error);
      res.status(500).json({ message: "Failed to calculate average mood" });
    }
  });

  app.get('/api/mood/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get last 30 days of mood data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const moodEntries = await storage.getUserMoodEntries(userId, thirtyDaysAgo);
      const sessions = await storage.getUserSessions(userId);
      
      // Calculate trends and insights
      const trend = calculateMoodTrend(moodEntries.map(entry => ({ score: entry.score, date: entry.date as Date })));
      const insights = generateMoodInsights(
        moodEntries.map(entry => ({ score: entry.score, date: entry.date as Date })),
        sessions.map(session => ({ 
          averageMood: session.averageMood || 5, 
          messageCount: session.messageCount || 0, 
          startTime: session.startTime as Date 
        }))
      );
      
      // Get daily summaries for the last 7 days
      const dailySummaries = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const summary = getDailyMoodSummary(
          date, 
          moodEntries.map(entry => ({ score: entry.score, date: entry.date as Date })),
          sessions.map(session => ({ 
            messageCount: session.messageCount || 0, 
            startTime: session.startTime as Date,
            averageMood: session.averageMood || undefined 
          }))
        );
        dailySummaries.push(summary);
      }
      
      const averageMood = await storage.getUserAverageMood(userId, 1); // Today's average
      const todaySessions = sessions.filter(s => {
        const today = new Date();
        const sessionDate = new Date(s.startTime);
        return sessionDate.toDateString() === today.toDateString();
      });
      
      res.json({
        trend,
        insights,
        dailySummaries,
        averageMood,
        todayStats: {
          sessions: todaySessions.length,
          totalTime: todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0),
          messageCount: todaySessions.reduce((sum, s) => sum + (s.messageCount || 0), 0)
        }
      });
    } catch (error) {
      console.error("Error generating mood dashboard:", error);
      res.status(500).json({ message: "Failed to generate mood dashboard" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req) => {
    console.log('WebSocket connection established');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'chat_message') {
          const { conversationId, content, sessionId } = message;
          
          // Get conversation to find userId
          const conversation = await storage.getConversation(conversationId);
          if (!conversation) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Conversation not found'
            }));
            return;
          }
          
          const userId = conversation.userId;
          
          // Store user message
          const userMessage = await storage.createMessage(
            insertMessageSchema.parse({
              conversationId,
              role: 'user',
              content
            })
          );

          // Analyze sentiment and crisis indicators
          const sentimentAnalysis = await analyzeSentiment(content);
          const crisisAnalysis = analyzeTextForCrisis(content);
          const aiCrisisDetection = await detectCrisis(content);

          // Update message with mood score
          await storage.updateMessage(userMessage.id, {
            moodScore: sentimentAnalysis.rating,
            crisisFlag: crisisAnalysis.requiresIntervention || aiCrisisDetection.isCrisis
          });

          // Create mood entry
          await storage.createMoodEntry(
            insertMoodEntrySchema.parse({
              userId: userId,
              conversationId,
              score: sentimentAnalysis.rating,
              confidence: sentimentAnalysis.confidence
            })
          );

          // Handle crisis if detected
          if (crisisAnalysis.requiresIntervention || aiCrisisDetection.isCrisis) {
            const severity = aiCrisisDetection.severity === "high" ? "high" : 
                           aiCrisisDetection.severity === "medium" ? "medium" : 
                           crisisAnalysis.severity as "low" | "medium" | "high";

            // Log crisis event
            await storage.createCrisisEvent({
              userId: userId,
              messageId: userMessage.id,
              severity,
              triggerWords: [...crisisAnalysis.triggerWords, ...aiCrisisDetection.triggerWords].join(', '),
              actionTaken: 'crisis_modal_triggered'
            });

            // Send crisis response
            ws.send(JSON.stringify({
              type: 'crisis_detected',
              severity,
              message: getCrisisResponseMessage(severity)
            }));
            return;
          }

          // Get conversation history for context
          const recentMessages = await storage.getConversationMessages(conversationId);
          const conversationHistory = recentMessages.slice(-10).map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content
          }));

          // Get conversation mode (already have conversation from above)
          const mode = conversation?.mode || 'talk';

          // Generate AI response
          const aiResponse = await generateEmphatheticResponse(
            content, 
            conversationHistory,
            mode as "talk" | "survey"
          );

          // Store AI message
          const aiMessage = await storage.createMessage(
            insertMessageSchema.parse({
              conversationId,
              role: 'assistant',
              content: aiResponse
            })
          );

          // Update session message count
          if (sessionId) {
            const sessions = await storage.getUserSessions(userId);
            const currentSession = sessions.find(s => s.id === sessionId);
            if (currentSession) {
              await storage.updateUserSession(sessionId, {
                messageCount: (currentSession.messageCount || 0) + 2, // User + AI message
                averageMood: sentimentAnalysis.rating
              });
            }
          }

          // Send response back to client
          ws.send(JSON.stringify({
            type: 'chat_response',
            userMessage,
            aiMessage,
            moodScore: sentimentAnalysis.rating,
            moodConfidence: sentimentAnalysis.confidence
          }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process message'
        }));
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });

    // Check connection status
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'connection_established',
        message: 'Connected to Feel-Better AI'
      }));
    }
  });

  return httpServer;
}
