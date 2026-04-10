'use client';

import {
  ChatBubble,
  ChatBubbleMessage,
} from '@/components/ui/chat/chat-bubble';
import type { UIMessage } from 'ai';
import { motion } from 'framer-motion';
import ChatMessageContent from './chat-message-content';
import ToolRenderer from './tool-renderer';

interface SimplifiedChatViewProps {
  message: UIMessage;
  isLoading: boolean;
  regenerate: () => void;
  addToolResult?: (args: { toolCallId: string; result: string }) => void;
}

const MOTION_CONFIG = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: {
    duration: 0.3,
    ease: 'easeOut',
  },
};

export function SimplifiedChatView({
  message,
  isLoading,
  regenerate,
  addToolResult,
}: SimplifiedChatViewProps) {
  if (message.role !== 'assistant') return null;

  // Extract tool invocations that are in "output-available" state (AI SDK v6)
  const toolInvocations =
    message.parts
      ?.filter(
        (part: any) =>
          typeof part.type === 'string' &&
          part.type.startsWith('tool-') &&
          part.type !== 'tool-invocation' &&
          part.state === 'output-available'
      )
      .map((part: any) => ({
        toolCallId: part.toolCallId,
        toolName: part.type.replace(/^tool-/, ''),
        args: part.input,
        result: part.output,
      })) || [];

  // Only display the first tool (if any)
  const currentTool = toolInvocations.length > 0 ? [toolInvocations[0]] : [];

  const hasTextContent = message.parts?.some(
    (part: any) => part.type === 'text' && part.text?.trim()
  );
  const hasTools = currentTool.length > 0;

  return (
    <motion.div {...MOTION_CONFIG} className="flex h-full w-full flex-col px-4">
      <div className="custom-scrollbar flex h-full w-full flex-col overflow-y-auto">
        {hasTools && (
          <div className="mb-4 w-full">
            <ToolRenderer
              toolInvocations={currentTool}
              messageId={message.id || 'current-msg'}
            />
          </div>
        )}

        {hasTextContent && (
          <div className="w-full">
            <ChatBubble variant="received" className="w-full">
              <ChatBubbleMessage className="w-full">
                <ChatMessageContent
                  message={message}
                  isLast={true}
                  isLoading={isLoading}
                  skipToolRendering={true}
                />
              </ChatBubbleMessage>
            </ChatBubble>
          </div>
        )}

        <div className="pb-4"></div>
      </div>
    </motion.div>
  );
}
