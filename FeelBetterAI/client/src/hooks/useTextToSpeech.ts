import { useState, useCallback, useRef, useEffect } from 'react';

export interface TextToSpeechOptions {
  voice?: SpeechSynthesisVoice | null;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export function useTextToSpeech(options: TextToSpeechOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSupported, setIsSupported] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const {
    voice = null,
    rate = 0.9,
    pitch = 1,
    volume = 0.8
  } = options;

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      // Load voices initially
      loadVoices();

      // Some browsers load voices asynchronously
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
      }
    } else {
      setIsSupported(false);
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!isSupported) {
      console.warn('Text-to-speech is not supported in this browser');
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Configure utterance
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Use specified voice or find a suitable default
    if (voice) {
      utterance.voice = voice;
    } else {
      // Try to find a pleasant English voice
      const preferredVoices = voices.filter(v => 
        v.lang.startsWith('en') && 
        (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Karen'))
      );
      if (preferredVoices.length > 0) {
        utterance.voice = preferredVoices[0];
      }
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    speechSynthesis.speak(utterance);
  }, [isSupported, voice, rate, pitch, volume, voices]);

  const stop = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      utteranceRef.current = null;
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (isSupported && isSpeaking) {
      speechSynthesis.pause();
    }
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (isSupported) {
      speechSynthesis.resume();
    }
  }, [isSupported]);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isSupported,
    voices
  };
}
