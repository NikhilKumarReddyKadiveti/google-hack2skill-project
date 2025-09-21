export interface CrisisKeywords {
  high: string[];
  medium: string[];
  low: string[];
}

export const CRISIS_KEYWORDS: CrisisKeywords = {
  high: [
    "kill myself",
    "end my life",
    "commit suicide",
    "want to die",
    "better off dead",
    "can't go on",
    "end it all",
    "take my own life",
    "not worth living"
  ],
  medium: [
    "hurt myself",
    "self harm",
    "cut myself",
    "give up",
    "no point",
    "hopeless",
    "can't take it",
    "want it to stop",
    "make it stop"
  ],
  low: [
    "depressed",
    "sad",
    "overwhelmed",
    "anxious",
    "stressed",
    "tired of life",
    "empty",
    "alone",
    "worthless"
  ]
};

export interface CrisisAnalysis {
  severity: "none" | "low" | "medium" | "high";
  triggerWords: string[];
  confidence: number;
  requiresIntervention: boolean;
}

export function analyzeTextForCrisis(text: string): CrisisAnalysis {
  const normalizedText = text.toLowerCase().trim();
  const foundWords: string[] = [];
  let highestSeverity: "none" | "low" | "medium" | "high" = "none";

  // Check for high-severity keywords
  for (const keyword of CRISIS_KEYWORDS.high) {
    if (normalizedText.includes(keyword)) {
      foundWords.push(keyword);
      highestSeverity = "high";
    }
  }

  // Check for medium-severity keywords if no high-severity found
  if (highestSeverity !== "high") {
    for (const keyword of CRISIS_KEYWORDS.medium) {
      if (normalizedText.includes(keyword)) {
        foundWords.push(keyword);
        if (highestSeverity !== "medium") {
          highestSeverity = "medium";
        }
      }
    }
  }

  // Check for low-severity keywords if no higher severity found
  if (highestSeverity === "none") {
    for (const keyword of CRISIS_KEYWORDS.low) {
      if (normalizedText.includes(keyword)) {
        foundWords.push(keyword);
        highestSeverity = "low";
      }
    }
  }

  // Calculate confidence based on number and severity of matches
  let confidence = 0;
  if (foundWords.length > 0) {
    const baseConfidence = Math.min(foundWords.length * 0.2, 0.8);
    const severityMultiplier = {
      none: 0,
      low: 0.3,
      medium: 0.6,
      high: 1.0
    };
    confidence = baseConfidence * severityMultiplier[highestSeverity];
  }

  return {
    severity: highestSeverity,
    triggerWords: foundWords,
    confidence,
    requiresIntervention: highestSeverity === "high" || (highestSeverity === "medium" && confidence > 0.5)
  };
}

export function getCrisisResponseMessage(severity: "low" | "medium" | "high"): string {
  switch (severity) {
    case "high":
      return "I'm very concerned about your safety. It sounds like you're going through an extremely difficult time. Please know that you matter and there are people who want to help. Would you like me to connect you with crisis support resources right now?";
    case "medium":
      return "I'm concerned about what you're sharing. It sounds like you're in a lot of pain right now. You don't have to go through this alone. Would it help to talk about what's happening, or would you prefer information about support resources?";
    case "low":
      return "I hear that you're struggling right now. Those feelings can be really overwhelming. I'm here to listen and support you. Would you like to talk more about what you're experiencing?";
    default:
      return "I'm here to listen and support you. How are you feeling right now?";
  }
}
