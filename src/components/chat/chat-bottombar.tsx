// src/components/chat/chat-bottombar.tsx
'use client';

import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import React, { useEffect } from 'react';

interface ChatBottombarProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  stop: () => void;
  isToolInProgress: boolean;
}

export default function ChatBottombar({
  input,
  onInputChange,
  onSubmit,
  isLoading,
  stop,
  isToolInProgress,
}: ChatBottombarProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === 'Enter' &&
      !e.nativeEvent.isComposing &&
      !isToolInProgress &&
      input.trim()
    ) {
      e.preventDefault();
      onSubmit();
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full pb-2 md:pb-8"
    >
      <div className="relative w-full md:px-4">
        <div className="mx-auto flex items-center rounded-full border border-[#E5E5E9] bg-[#ECECF0] py-2 pr-2 pl-6 dark:border-neutral-700 dark:bg-neutral-800">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={
              isToolInProgress ? 'Tool is in progress...' : 'Ask me anything'
            }
            className="text-md w-full border-none bg-transparent text-black placeholder:text-gray-500 focus:outline-none dark:text-white dark:placeholder:text-neutral-400"
            disabled={isToolInProgress || isLoading}
          />

          <button
            type="button"
            disabled={isLoading || !input.trim() || isToolInProgress}
            className="flex items-center justify-center rounded-full bg-[#0171E3] p-2 text-white disabled:opacity-50"
            onClick={() => {
              if (isLoading) {
                stop();
              } else {
                onSubmit();
              }
            }}
          >
            <ArrowUp className="h-6 w-6" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
