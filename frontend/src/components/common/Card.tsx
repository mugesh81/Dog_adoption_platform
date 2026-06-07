import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, hoverable = false }) => {
  return (
    <motion.div
      whileHover={hoverable ? { y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' } : {}}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${hoverable ? 'cursor-pointer transition-all' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};
