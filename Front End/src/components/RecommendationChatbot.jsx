import React, { useState, useRef, useEffect } from 'react';
import { ChatIcon, CloseIcon } from './Icons';
import './RecommendationChatbot.css';

const RecommendationChatbot = ({
  onSend,
  onNewChat,
  chatHistory,
  chatLoading,
  disabled,
  open,
  onOpenChange,
  showFloatingButton = true,
}) => {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isControlled ? open : internalOpen;
  const setOpen = isControlled ? (onOpenChange || (() => {})) : setInternalOpen;
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, chatLoading]);

  const handleSend = () => {
    const msg = message.trim();
    if (!msg || chatLoading || disabled) return;
    onSend(msg);
    setMessage('');
  };

  return (
    <>
      {/* Floating chat button (optional) */}
      {showFloatingButton && (
        <button
          type="button"
          className="recommendation-chatbot-toggle"
          onClick={() => setOpen(!isOpen)}
          title="Chat about recommendations"
          aria-label="Open recommendation chatbot"
        >
          <ChatIcon size={24} color="white" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="recommendation-chatbot-window">
          <div className="recommendation-chatbot-header">
            <div className="recommendation-chatbot-header-title">
              <span className="recommendation-chatbot-avatar">AI</span>
              <div>
                <strong>Career Advisor</strong>
                <span className="recommendation-chatbot-subtitle">Multi-turn chat — continue like ChatGPT / Gemini</span>
              </div>
            </div>
            <div className="recommendation-chatbot-header-actions">
              {onNewChat && chatHistory.length > 0 && (
                <button
                  type="button"
                  className="recommendation-chatbot-new-chat"
                  onClick={() => !chatLoading && onNewChat()}
                  disabled={chatLoading}
                  title="Clear history and start a new conversation"
                >
                  New chat
                </button>
              )}
              <button
                type="button"
                className="recommendation-chatbot-close"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
              >
                <CloseIcon size={20} color="currentColor" />
              </button>
            </div>
          </div>

          <div className="recommendation-chatbot-messages">
            {chatHistory.length === 0 ? (
              <div className="recommendation-chatbot-welcome">
                <p>Hi! Ask anything about your recommendations — then keep chatting; earlier messages stay in context.</p>
                <p>Try asking:</p>
                <ul>
                  <li>Tell me more about Data Scientist</li>
                  <li>Which career has the best salary?</li>
                  <li>What skills should I learn first?</li>
                  <li>Compare my top 2 recommendations</li>
                </ul>
              </div>
            ) : (
              chatHistory.map((m, i) => (
                <div
                  key={i}
                  className={`recommendation-chatbot-bubble recommendation-chatbot-bubble-${m.role}`}
                >
                  {m.role === 'assistant' && (
                    <span className="recommendation-chatbot-bubble-avatar">AI</span>
                  )}
                  <div className="recommendation-chatbot-bubble-content">
                    {m.content}
                  </div>
                </div>
              ))
            )}
            {chatLoading && (
              <div className="recommendation-chatbot-bubble recommendation-chatbot-bubble-assistant">
                <span className="recommendation-chatbot-bubble-avatar">AI</span>
                <div className="recommendation-chatbot-bubble-content recommendation-chatbot-typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="recommendation-chatbot-input-area">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a follow-up…"
              disabled={chatLoading || disabled}
            />
            <button
              type="button"
              className="recommendation-chatbot-send"
              onClick={handleSend}
              disabled={chatLoading || !message.trim() || disabled}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default RecommendationChatbot;
