import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o-mini" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || ""
});

export interface SentimentAnalysis {
  rating: number; // 1-10 mood score
  confidence: number; // 0-1 confidence level
  explanation?: string;
}

export interface CrisisDetection {
  isCrisis: boolean;
  severity: "low" | "medium" | "high";
  triggerWords: string[];
  confidence: number;
}

export async function generateEmphatheticResponse(
  userMessage: string,
  conversationHistory: Array<{ role: "user" | "assistant", content: string }> = [],
  mode: "talk" | "survey" = "talk"
): Promise<string> {
  try {
    const systemPrompt = mode === "talk" 
      ? `You are "Feel-Better AI", a calm, warm, empathetic AI companion. Your job is to make users feel supported and safe. Follow these guidelines:
        - Validate feelings: "I hear you. That sounds tough."
        - Be gentle and non-judgmental
        - Ask open-ended questions to encourage sharing
        - Offer comfort and support
        - Keep responses conversational and human-like
        - If user seems silent or stuck, gently prompt: "It's okay to take your time. Would you like me to ask a simple question?"
        - Show genuine care and empathy in every response`
      : `You are "Feel-Better AI" conducting a gentle survey. Ask simple, caring questions one at a time:
        - "How are you feeling today on a scale of 1 to 10?"
        - "Did you get some rest last night?"
        - "Would you like me to share something calming with you?"
        - Respond with empathy: "Thank you for sharing. That matters."
        - Keep questions simple and non-overwhelming`;

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map(msg => ({ 
        role: msg.role as "user" | "assistant", 
        content: msg.content 
      })),
      { role: "user", content: userMessage }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 200,
    });

    return response.choices[0].message.content || "I'm here to listen. How are you feeling?";
  } catch (error) {
    console.error("Error generating response:", error);
    return "I'm having trouble responding right now, but I'm still here to listen. How are you feeling?";
  }
}

export async function analyzeSentiment(text: string): Promise<SentimentAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a sentiment analysis expert specializing in mental health and emotional wellness. 
          Analyze the sentiment and emotional state of the text and provide:
          - A mood rating from 1 (very negative/distressed) to 10 (very positive/happy)
          - A confidence score between 0 and 1
          - A brief explanation of the emotional indicators
          
          Consider factors like: emotional words, tone, stress indicators, hope vs despair, energy levels.
          Respond with JSON in this format: { "rating": number, "confidence": number, "explanation": "string" }`
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      rating: Math.max(1, Math.min(10, Math.round(result.rating || 5))),
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      explanation: result.explanation || ""
    };
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return {
      rating: 5, // Neutral default
      confidence: 0.1,
      explanation: "Unable to analyze sentiment"
    };
  }
}

export async function detectCrisis(text: string): Promise<CrisisDetection> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a crisis detection specialist for mental health support. Analyze text for signs of:
          - Suicidal ideation ("want to die", "kill myself", "end it all")
          - Self-harm intent ("hurt myself", "cut myself")
          - Severe hopelessness and despair
          - Plans for harmful actions
          
          Classify severity:
          - HIGH: Direct statements of intent to harm self or others, specific plans
          - MEDIUM: Strong ideation, significant despair, indirect harm references
          - LOW: Concerning language but not immediate danger
          
          Respond with JSON: { "isCrisis": boolean, "severity": "low|medium|high", "triggerWords": ["word1"], "confidence": number }`
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      isCrisis: result.isCrisis || false,
      severity: result.severity || "low",
      triggerWords: result.triggerWords || [],
      confidence: Math.max(0, Math.min(1, result.confidence || 0))
    };
  } catch (error) {
    console.error("Error detecting crisis:", error);
    return {
      isCrisis: false,
      severity: "low",
      triggerWords: [],
      confidence: 0
    };
  }
}
