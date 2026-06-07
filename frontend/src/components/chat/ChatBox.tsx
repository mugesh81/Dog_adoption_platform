import React, { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';

let socket: Socket;

interface Message {
  sender: string;
  text: string;
}

export const ChatBox: React.FC<{ applicationId: string }> = ({ applicationId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    socket = io('http://localhost:5000');

    socket.emit('join', applicationId);

    socket.on('newMessage', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [applicationId]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const messageData = {
      room: applicationId,
      sender: user?.name || 'Unknown',
      text: inputText
    };

    socket.emit('sendMessage', messageData);
    setInputText('');
  };

  return (
    <div className="flex flex-col h-96 bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-light px-4 py-3 border-b border-gray-200">
        <h3 className="font-bold text-dark">Live Chat</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i} 
            className={`flex flex-col ${msg.sender === user?.name ? 'items-end' : 'items-start'}`}
          >
            <span className="text-xs text-gray-400 mb-1">{msg.sender}</span>
            <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${msg.sender === user?.name ? 'bg-primary text-dark rounded-br-none' : 'bg-gray-100 text-dark rounded-bl-none'}`}>
              {msg.text}
            </div>
          </motion.div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="p-3 bg-light border-t border-gray-200 flex space-x-2">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 appearance-none px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
        />
        <Button type="submit" variant="primary" size="sm" className="px-3">
          <Send size={18} />
        </Button>
      </form>
    </div>
  );
};
