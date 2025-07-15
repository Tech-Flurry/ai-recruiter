import { useState, useRef, useCallback } from 'react';

export const useTypingAnimation = () => {
  const [isTyping, setIsTyping] = useState(false);
  const [currentText, setCurrentText] = useState<string>("");
  const typingIntervalRef = useRef<number | null>(null);

  const startTypingAnimation = useCallback(async (text: string) => {
    setIsTyping(true);
    setCurrentText("");

    return new Promise<void>((resolve) => {
      let currentIndex = 0;
      const typeSpeed = 50;
      
      typingIntervalRef.current = window.setInterval(() => {
        if (currentIndex < text.length) {
          const displayText = text.substring(0, currentIndex + 1);
          setCurrentText(displayText);
          currentIndex++;
        } else {
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }
          setIsTyping(false);
          resolve();
        }
      }, typeSpeed);
    });
  }, []);

  const cleanup = useCallback(() => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
  }, []);

  return {
    isTyping,
    currentText,
    startTypingAnimation,
    cleanup
  };
};