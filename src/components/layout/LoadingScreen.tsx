'use client';

import React, { useEffect, useState } from 'react';

export const LoadingScreen = ({ onFinished }: { onFinished?: () => void }) => {
  const [visible, setVisible] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
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

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);

    const timeout = setTimeout(() => {
      // Start fade out
      const loader = document.getElementById('app-loader');
      if (loader) {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
      }
      setTimeout(() => {
        setVisible(false);
        if (onFinished) onFinished();
      }, 500);
    }, 2500); // Show for 2.5s

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [messages.length, onFinished]);

  if (!visible) return null;

  return (
    <>
      <div id="app-loader" className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] text-white transition-all duration-500">
        <div className="text-center max-w-[500px] px-6">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[64px] animate-float">
              ✍️
            </div>
            <div className="w-20 h-20 border-[3px] border-[rgba(74,144,226,0.1)] border-t-[#4a90e2] rounded-full animate-spin"></div>
          </div>

          <h1 className="text-[32px] font-bold mb-4 bg-gradient-to-br from-[#4a90e2] to-[#7cb3ff] bg-clip-text text-transparent">
            PlumaAI
          </h1>

          <p className="text-[16px] text-[#a0a0a0] min-h-[24px] animate-fade-in-out">
            {messages[messageIndex]}
          </p>

          <div className="w-full max-w-[300px] h-[3px] bg-[rgba(74,144,226,0.1)] rounded-[3px] mx-auto mt-6 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#4a90e2] to-[#7cb3ff] rounded-[3px] animate-loading-bar"></div>
          </div>
        </div>
      </div>
      <style>{`
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
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-fade-in-out {
          animation: fadeInOut 3s ease-in-out infinite;
        }
        .animate-loading-bar {
          animation: loading 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};
