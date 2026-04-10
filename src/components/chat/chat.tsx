'use client';
import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

// Component imports
import ChatBottombar from '@/components/chat/chat-bottombar';
import ChatLanding from '@/components/chat/chat-landing';
import ChatMessageContent from '@/components/chat/chat-message-content';
import { SimplifiedChatView } from '@/components/chat/simple-chat-view';
import {
  ChatBubble,
  ChatBubbleMessage,
} from '@/components/ui/chat/chat-bubble';
import WelcomeModal from '@/components/welcome-modal';
import { Info } from 'lucide-react';
import { GithubButton } from '../ui/github-button';
import HelperBoost from './HelperBoost';

// ClientOnly component for client-side rendering
//@ts-ignore
const ClientOnly = ({ children }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
};

// Define Avatar component props interface
interface AvatarProps {
  hasActiveTool: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isTalking: boolean;
}

// Dynamic import of Avatar component
const Avatar = dynamic<AvatarProps>(
  () =>
    Promise.resolve(({ hasActiveTool, videoRef, isTalking }: AvatarProps) => {
      return (
        <div
          className={`flex items-center justify-center rounded-full transition-all duration-300 ${hasActiveTool ? 'h-20 w-20' : 'h-28 w-28'}`}
        >
          <div
            className="relative cursor-pointer"
            onClick={() => (window.location.href = '/')}
          >
            {isTalking ? (
              <video
                ref={videoRef}
                className="h-full w-full scale-[2.5] object-cover rounded-full"
                style={{ clipPath: 'circle(40%)' }}
                muted
                playsInline
                loop
              >
                <source src="/memoji_talking.mp4" type="video/mp4" />
              </video>
            ) : (
              <img
                src="/landing-memojis.png"
                alt="Avatar"
                className="h-full w-full scale-[1.8] object-contain"
              />
            )}
          </div>
        </div>
      );
    }),
  { ssr: false }
);

const MOTION_CONFIG = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: {
    duration: 0.3,
    ease: 'easeOut',
  },
};

const Chat = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query');
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [input, setInput] = useState('');

  const {
    messages,
    sendMessage,
    status,
    stop,
    setMessages,
    regenerate,
    addToolResult,
  } = useChat({
    onFinish: () => {
      setIsTalking(false);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    },
    onError: (error) => {
      setIsTalking(false);
      if (videoRef.current) {
        videoRef.current.pause();
      }
      console.error('Chat error:', error.message);
      toast.error(`Error: ${error.message}`);
    },
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  // Start talking when streaming begins
  useEffect(() => {
    if (status === 'streaming' && !isTalking) {
      setIsTalking(true);
      if (videoRef.current) {
        videoRef.current.play().catch(console.error);
      }
    }
    if (status === 'ready' && isTalking) {
      setIsTalking(false);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
  }, [status, isTalking]);

  // Compute hasActiveTool from the latest assistant message
  const { hasActiveTool, latestExchangeStartIndex } = useMemo(() => {
    const latestAIIdx = messages.findLastIndex((m) => m.role === 'assistant');
    const latestUserIdx = messages.findLastIndex((m) => m.role === 'user');

    let activeTool = false;
    if (latestAIIdx !== -1 && latestAIIdx > latestUserIdx) {
      activeTool =
        messages[latestAIIdx].parts?.some(
          (part: any) =>
            typeof part.type === 'string' &&
            part.type.startsWith('tool-') &&
            part.type !== 'tool-invocation' &&
            part.state === 'output-available'
        ) || false;
    }

    const exchangeStart = latestUserIdx !== -1 ? latestUserIdx : latestAIIdx;

    return {
      hasActiveTool: activeTool,
      latestExchangeStartIndex: exchangeStart,
    };
  }, [messages]);

  // Auto-scroll ref
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const isToolInProgress = messages.some(
    (m) =>
      m.role === 'assistant' &&
      m.parts?.some(
        (part: any) =>
          typeof part.type === 'string' &&
          part.type.startsWith('tool-') &&
          part.type !== 'tool-invocation' &&
          part.state !== 'output-available' &&
          part.state !== 'output-error'
      )
  );

  const submitQuery = useCallback((query: string) => {
    if (!query.trim()) return;
    if (isLoading || isToolInProgress) {
      stop();
      setMessages([]);
    }
    setInput('');
    setTimeout(() => {
      sendMessage({ text: query });
    }, 50);
  }, [isLoading, isToolInProgress, stop, setMessages, sendMessage]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.loop = true;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      videoRef.current.pause();
    }

    if (initialQuery && !autoSubmitted) {
      setAutoSubmitted(true);
      submitQuery(initialQuery);
    }
  }, [initialQuery, autoSubmitted, submitQuery]);

  const onSubmit = useCallback(() => {
    if (!input.trim() || isToolInProgress) return;
    submitQuery(input);
  }, [input, isToolInProgress, submitQuery]);

  const handleStop = () => {
    stop();
    setIsTalking(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const isEmptyState = messages.length === 0 && !isLoading;

  const headerHeight = hasActiveTool ? 100 : 140;

  return (
    <div className="relative h-screen overflow-hidden">
      <div className="absolute top-6 right-8 z-51 flex flex-col-reverse items-center justify-center gap-1 md:flex-row">
        <WelcomeModal
          trigger={
            <div className="hover:bg-accent cursor-pointer rounded-2xl px-3 py-1.5">
              <Info className="text-accent-foreground h-8" />
            </div>
          }
        />
        <div className="">
          <GithubButton
            animationDuration={1.5}
            label="Star"
            size={'sm'}
            repoUrl="https://github.com/nursm86/ai_portfolio_published"
          />
        </div>
      </div>

      {/* Fixed Avatar Header with Gradient */}
      <div
        className="fixed top-0 right-0 left-0 z-50"
        style={{ background: 'var(--header-gradient)' }}
      >
        <div
          className={`transition-all duration-300 ease-in-out ${hasActiveTool ? 'pt-6 pb-0' : 'py-4'}`}
        >
          <div className="flex justify-center">
            <ClientOnly>
              <Avatar
                hasActiveTool={hasActiveTool}
                videoRef={videoRef}
                isTalking={isTalking}
              />
            </ClientOnly>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto flex h-full max-w-3xl flex-col">
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-2"
          style={{ paddingTop: `${headerHeight}px` }}
        >
          {isEmptyState ? (
            <motion.div
              key="landing"
              className="flex min-h-full items-center justify-center"
              {...MOTION_CONFIG}
            >
              <ChatLanding submitQuery={submitQuery} />
            </motion.div>
          ) : (
            <div className="flex flex-col gap-4 pb-4">
              {messages.map((message: UIMessage, index: number) => {
                const isLatestExchange = index >= latestExchangeStartIndex;

                if (message.role === 'user') {
                  return (
                    <motion.div
                      key={message.id || `msg-${index}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className={`flex justify-end px-4 ${!isLatestExchange ? 'opacity-60' : ''}`}
                    >
                      <ChatBubble variant="sent">
                        <ChatBubbleMessage variant="sent">
                          <ChatMessageContent
                            message={message}
                            isLast={false}
                            isLoading={false}
                          />
                        </ChatBubbleMessage>
                      </ChatBubble>
                    </motion.div>
                  );
                }

                if (message.role === 'assistant') {
                  return (
                    <div
                      key={message.id || `msg-${index}`}
                      className={!isLatestExchange ? 'opacity-60' : ''}
                    >
                      <SimplifiedChatView
                        message={message}
                        isLoading={isLoading && index === messages.length - 1}
                        regenerate={() => regenerate()}
                        addToolResult={addToolResult}
                      />
                    </div>
                  );
                }

                return null;
              })}

              {/* Loading indicator */}
              {isLoading && !messages.some(
                (m, i) => m.role === 'assistant' && i === messages.length - 1
              ) && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="px-4"
                >
                  <ChatBubble variant="received">
                    <ChatBubbleMessage isLoading />
                  </ChatBubble>
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Fixed Bottom Bar */}
        <div className="sticky bottom-0 bg-white dark:bg-neutral-950 px-2 pt-3 md:px-0 md:pb-4">
          <div className="relative flex flex-col items-center gap-3">
            <HelperBoost submitQuery={submitQuery} setInput={setInput} />
            <ChatBottombar
              input={input}
              onInputChange={setInput}
              onSubmit={onSubmit}
              isLoading={isLoading}
              stop={handleStop}
              isToolInProgress={isToolInProgress}
            />
          </div>
        </div>
        <a
          href="https://www.linkedin.com/in/nursm86/"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed right-3 bottom-0 z-10 mb-4 hidden cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm hover:underline md:block"
        >
          @nursm86
        </a>
      </div>
    </div>
  );
};

export default Chat;
