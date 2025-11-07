"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { apiFetch } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const ChatbotWidget: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '¡Hola! Soy el asistente virtual de POSOQO, impulsado por inteligencia artificial.\n\nPuedo ayudarte con:\n• Información sobre nuestras cervezas artesanales\n• Realizar pedidos y consultas\n• Recomendaciones y maridajes\n• Información sobre nuestros servicios\n\n¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Ocultar en la página de login, registro y dashboard
  if (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname.startsWith('/dashboard')) {
    return null;
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Preparar historial de conversación para Gemini
      const conversationHistory = messages.slice(1).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      const response = await apiFetch<{ success: boolean; response: string }>('/ai/chatbot', {
        method: 'POST',
        body: JSON.stringify({
          message: input,
          conversationHistory,
        }),
      });

      if (response.success && response.response) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error('No se recibió respuesta');
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: '🔧 El asistente de IA está en configuración. Por favor, contacta al administrador para activar el servicio de Google Gemini.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    '¿Qué cervezas tienen disponibles?',
    '¿Cuál es el precio de envío?',
    'Recomiéndame una cerveza',
    '¿Cómo hago un pedido?',
  ];

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <>
      {/* Botón flotante */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            style={{ position: 'fixed', bottom: '84px', right: '20px', zIndex: 10000 }}
            className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center text-white transition-all duration-200 group"
            title="Asistente POSOQO con IA"
          >
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Ventana del chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{ position: 'fixed', bottom: '112px', right: '24px', zIndex: 10000, maxHeight: 'calc(100vh - 140px)' }}
            className="w-[400px] h-[550px] max-h-[calc(100vh-140px)] bg-black/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header con gradiente profesional */}
            <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 p-5 flex items-center justify-between border-b border-black/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center ring-2 ring-black/10">
                  <Bot className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-black font-bold text-base flex items-center gap-2">
                    Asistente POSOQO
                    <Sparkles className="w-4 h-4 text-black/70" />
                  </h3>
                  <p className="text-black/70 text-xs flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                    En línea • IA Powered
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-black/70 hover:text-black hover:bg-black/10 rounded-full p-1.5 transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-black via-black to-black">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-9 h-9 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-yellow-400/20">
                      <Bot className="w-5 h-5 text-black" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black shadow-lg'
                        : 'bg-white/5 text-white border border-white/10 backdrop-blur-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    <p
                      className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-black/60' : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString('es-PE', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 border border-white/20">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Indicador de escritura */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="w-9 h-9 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-yellow-400/20">
                    <Bot className="w-5 h-5 text-black" />
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 backdrop-blur-sm">
                    <div className="flex gap-1.5 items-center">
                      <motion.span 
                        className="w-2.5 h-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.span 
                        className="w-2.5 h-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.span 
                        className="w-2.5 h-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Preguntas rápidas */}
            {messages.length === 1 && (
              <div className="px-5 py-4 bg-gradient-to-b from-white/5 to-transparent border-t border-white/10">
                <p className="text-xs text-gray-400 mb-3 flex items-center gap-2 font-medium">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  Preguntas frecuentes:
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 hover:border-yellow-400/30 text-white px-3.5 py-2 rounded-full transition-all duration-200 font-medium"
                    >
                      {question}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-5 bg-gradient-to-b from-transparent to-black/50 border-t border-white/10">
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje..."
                  disabled={isLoading}
                  className="flex-1 px-5 py-3 border border-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 disabled:bg-white/5 disabled:cursor-not-allowed text-white bg-white/5 placeholder-gray-500 text-sm font-medium transition-all duration-200"
                />
                <motion.button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 text-black rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};


