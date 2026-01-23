'use client';

import React, { useEffect, useState } from 'react';

const LOADING_MESSAGES = [
  'Loading your creative space...',
  'Preparing your stories...',
  'Sharpening the quill...',
  'Invoking the muses...',
  'Organizing your characters...',
  'Setting up AI...',
  'Awakening inspiration...',
  'Preparing the stage...',
  'Loading imaginary worlds...',
  'Ready to write great stories...',
];

export const LoadingScreen = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // Cycle messages
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);

    // Hide loader after a simulated initialization delay
    // In a real app, this would be triggered by a "ready" state from stores
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 2500); // 2.5 seconds to show the animation

    return () => {
      clearInterval(messageInterval);
      clearTimeout(timeout);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] transition-opacity duration-500 ${
        !isVisible ? 'opacity-0 invisible' : 'opacity-100 visible'
      }`}
    >
      <div className="text-center max-w-[500px] px-6">
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[64px] animate-[float_3s_ease-in-out_infinite]">
            ✍️
          </div>
          <div className="w-20 h-20 border-[3px] border-[rgba(74,144,226,0.1)] border-t-[#4a90e2] rounded-full animate-spin"></div>
        </div>
        <h1 className="text-[32px] font-bold mb-4 bg-gradient-to-br from-[#4a90e2] to-[#7cb3ff] bg-clip-text text-transparent">
          PlumaAI
        </h1>
        <p className="text-[16px] text-[#a0a0a0] min-h-[24px] animate-[fadeInOut_3s_ease-in-out_infinite]">
          {LOADING_MESSAGES[messageIndex]}
        </p>
        <div className="w-full max-w-[300px] h-[3px] bg-[rgba(74,144,226,0.1)] rounded-[3px] mx-auto mt-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#4a90e2] to-[#7cb3ff] rounded-[3px] animate-[loading_2s_ease-in-out_infinite] w-full"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-10px); }
        }
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; transform: translateY(10px); }
          10%, 90% { opacity: 1; transform: translateY(0); }
        }
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};
