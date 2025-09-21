import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ChartLine, Settings, LogOut, Send, Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { VoiceInterface } from "@/components/chat/VoiceInterface";
import { MoodIndicator } from "@/components/chat/MoodIndicator";
import { CrisisModal } from "@/components/modals/CrisisModal";
import { MoodDashboard } from "@/components/modals/MoodDashboard";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  moodScore?: number;
}

interface Conversation {
  id: string;
  title?: string;
  mode: "talk" | "survey";
  isActive: boolean;
}

export default function Chat() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const { speak, isSpeaking, stop: stopSpeaking } = useTextToSpeech({
    rate: 0.9,
    pitch: 1,
    volume: 0.8
  });

  // WebSocket connection
  const { isConnected, lastMessage, sendMessage: sendWSMessage } = useWebSocket("/ws");

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [showMoodDashboard, setShowMoodDashboard] = useState(false);
  const [currentMoodScore, setCurrentMoodScore] = useState(7);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [hasSelectedMode, setHasSelectedMode] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionStartTime = useRef<Date>(new Date());

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Initialize conversation
  useEffect(() => {
    if (isAuthenticated && !currentConversation) {
      initializeConversation();
    }
  }, [isAuthenticated]);

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      handleWebSocketMessage(lastMessage);
    }
  }, [lastMessage]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update session duration
  useEffect(() => {
    const interval = setInterval(() => {
      const duration = Math.floor((Date.now() - sessionStartTime.current.getTime()) / 60000);
      setSessionDuration(duration);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const initializeConversation = async () => {
    let welcomeMessage: Message = {
      id: "welcome",
      role: "assistant",
      content: "Hi, I'm your Feel-Better AI companion. For the best experience, please put on your headphones. We'll start when you're ready.",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    speak(welcomeMessage.content);

    try {
      const response = await apiRequest("POST", "/api/conversations", {
        mode: "talk",
        title: `Chat Session ${new Date().toLocaleDateString()}`
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentConversation(data.conversation);
        setSessionId(data.sessionId);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start conversation. You can still talk to me!",
        variant: "destructive",
      });
    }
  };

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case "chat_response":
        const { userMessage, aiMessage, moodScore } = message;
        
        setMessages(prev => [
          ...prev,
          {
            id: userMessage.id,
            role: "user",
            content: userMessage.content,
            timestamp: new Date(userMessage.timestamp),
            moodScore
          },
          {
            id: aiMessage.id,
            role: "assistant",
            content: aiMessage.content,
            timestamp: new Date(aiMessage.timestamp)
          }
        ]);

        setCurrentMoodScore(moodScore);
        
        // Speak AI response
        speak(aiMessage.content);
        break;

      case "crisis_detected":
        setShowCrisisModal(true);
        break;

      case "error":
        toast({
          title: "Error",
          description: message.message || "Something went wrong",
          variant: "destructive",
        });
        break;
    }
  };

  const selectMode = (mode: "talk" | "survey") => {
    setHasSelectedMode(true);
    
    if (currentConversation) {
      // Update conversation mode
      // This could be an API call to update the conversation
      setCurrentConversation({ ...currentConversation, mode });
    }

    const modeMessage = mode === "talk" 
      ? "Great! I'm here to listen. What's on your mind today?"
      : "Perfect! Let's start with some simple questions. How are you feeling today on a scale of 1 to 10?";

    const aiMessage: Message = {
      id: `mode-${mode}`,
      role: "assistant",
      content: modeMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
    speak(modeMessage);
  };

  const sendMessage = () => {
    const content = inputMessage.trim();
    if (!content) return;

    // Try to send via WebSocket if connected
    if (isConnected && currentConversation) {
      sendWSMessage({
        type: "chat_message",
        conversationId: currentConversation.id,
        content,
        sessionId
      });
    } else {
      // Simulate AI response if backend/WebSocket fails
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date()
      };
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: "I'm here to listen. Tell me more about how you're feeling.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage, aiMessage]);
      speak(aiMessage.content);
    }
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleVoiceMode = () => {
    // Try to activate voice mode, handle errors
    try {
      setIsVoiceMode(!isVoiceMode);
      if (!isVoiceMode) {
        toast({
          title: "Voice Mode Activated",
          description: "Click the microphone to start speaking",
        });
      }
    } catch (err) {
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions and retry.",
        variant: "destructive",
      });
      setIsVoiceMode(false);
    }
  };

  const logout = () => {
    window.location.href = "/api/logout";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="text-primary-foreground h-8 w-8" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background" data-testid="chat-interface">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border sticky top-0 z-10" data-testid="chat-header">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Heart className="text-primary-foreground h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground" data-testid="text-app-title">Feel-Better AI</h1>
                <p className="text-sm text-muted-foreground flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-accent' : 'bg-destructive'}`}></span>
                  <span data-testid="text-connection-status">
                    {isConnected ? "Online and ready to listen" : "Connecting..."}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                title="Home"
                data-testid="button-home"
              >
                Home
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMoodDashboard(true)}
                title="Mood Dashboard"
                data-testid="button-mood-dashboard"
              >
                <ChartLine className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                title="Settings"
                data-testid="button-settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                title="Logout"
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mood Indicator Bar */}
      <MoodIndicator 
        currentScore={currentMoodScore}
        sessionDuration={sessionDuration}
        data-testid="mood-indicator"
      />

      {/* Chat Messages */}
      <div className="flex-1 max-w-4xl mx-auto px-4 py-6" data-testid="chat-messages-container">
        <div className="space-y-6 mb-32">
          {messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message}
              data-testid={`message-${message.id}`}
            />
          ))}

          {/* Mode Selection (only show if not selected yet) */}
          {!hasSelectedMode && messages.length === 1 && (
            <div className="flex justify-center space-x-4" data-testid="mode-selection">
              <Button 
                onClick={() => selectMode('talk')}
                className="px-6 py-3"
                data-testid="button-mode-talk"
              >
                <Heart className="mr-2 h-4 w-4" />
                I'd like to talk
              </Button>
              <Button 
                onClick={() => selectMode('survey')}
                variant="secondary"
                className="px-6 py-3"
                data-testid="button-mode-survey"
              >
                <ChartLine className="mr-2 h-4 w-4" />
                Simple questions
              </Button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Voice Interface */}
      {isVoiceMode && (
        <VoiceInterface 
          onTranscript={(transcript) => {
            setInputMessage(transcript);
            setIsVoiceMode(false);
            // Auto-send after voice input
            setTimeout(sendMessage, 500);
          }}
          data-testid="voice-interface"
        />
      )}

      {/* Chat Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border" data-testid="chat-input-container">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={1}
                className="resize-none pr-12"
                placeholder="Type your message..."
                disabled={!isConnected}
                data-testid="input-message"
              />
              <Button
                onClick={sendMessage}
                size="sm"
                variant="ghost"
                className="absolute right-3 bottom-3"
                disabled={!inputMessage.trim() || !isConnected}
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={toggleVoiceMode}
              variant={isVoiceMode ? "default" : "outline"}
              size="lg"
              data-testid="button-toggle-voice"
            >
              {isVoiceMode ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CrisisModal 
        isOpen={showCrisisModal}
        onClose={() => setShowCrisisModal(false)}
        data-testid="crisis-modal"
      />
      
      <MoodDashboard
        isOpen={showMoodDashboard}
        onClose={() => setShowMoodDashboard(false)}
        data-testid="mood-dashboard-modal"
      />
    </div>
  );
}
