import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface VoiceInterfaceProps {
  onTranscript: (transcript: string) => void;
}

export function VoiceInterface({ onTranscript }: VoiceInterfaceProps) {
  const [isListening, setIsListening] = useState(false);
  const {
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition({
    continuous: false,
    interimResults: true
  });

  useEffect(() => {
    if (transcript) {
      onTranscript(transcript);
      resetTranscript();
      setIsListening(false);
    }
  }, [transcript, onTranscript, resetTranscript]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      startListening();
      setIsListening(true);
    }
  };

  if (!isSupported) {
    return (
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-20" data-testid="voice-interface">
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">Voice recognition not supported in this browser</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-20" data-testid="voice-interface">
      <Card className="shadow-2xl border border-border">
        <CardContent className="p-6 text-center">
          <Button
            onClick={toggleListening}
            size="lg"
            className={`w-16 h-16 rounded-full ${
              isListening ? 'animate-pulse bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'
            }`}
            data-testid="button-voice-toggle"
          >
            {isListening ? (
              <MicOff className="h-6 w-6 text-primary-foreground" />
            ) : (
              <Mic className="h-6 w-6 text-primary-foreground" />
            )}
          </Button>
          
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-foreground" data-testid="voice-status">
              {isListening ? "Listening..." : "Click to speak"}
            </p>
            
            {(transcript || interimTranscript) && (
              <div className="text-sm text-muted-foreground max-w-xs">
                <p data-testid="voice-transcript">
                  {transcript}
                  <span className="text-muted-foreground/70">{interimTranscript}</span>
                </p>
              </div>
            )}
            
            {error && (
              <p className="text-xs text-destructive" data-testid="voice-error">
                {error}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
