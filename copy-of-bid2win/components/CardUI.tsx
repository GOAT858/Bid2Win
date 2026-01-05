
import React from 'react';
import { Card, Suit } from '../types';
import { getSuitIcon } from '../constants';
import { motion } from 'framer-motion';

interface CardUIProps {
  card: Card;
  onClick?: () => void;
  disabled?: boolean;
  isPlayable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isHidden?: boolean;
  layoutId?: string;
}

const CardUI: React.FC<CardUIProps> = ({ card, onClick, disabled, isPlayable, size = 'md', isHidden = false, layoutId }) => {
  const isRed = card.suit === 'HEARTS' || card.suit === 'DIAMONDS';
  const isFaceCard = ['J', 'Q', 'K'].includes(card.rank);
  
  const sizeClasses = {
    sm: 'w-12 h-18 text-[10px]',
    md: 'w-20 h-32 text-sm',
    lg: 'w-32 h-48 text-xl'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-8 h-8'
  };

  // Artwork for face cards
  const getFaceArt = () => {
    if (!isFaceCard) return null;
    const type = card.rank === 'J' ? 'bottts' : card.rank === 'Q' ? 'avataaars' : 'micah';
    return `https://api.dicebear.com/7.x/${type}/svg?seed=${card.rank}-${card.suit}&backgroundColor=transparent`;
  };

  if (isHidden) {
    return (
      <motion.div 
        layoutId={layoutId}
        className={`${sizeClasses[size]} bg-indigo-900 border-2 border-indigo-400 rounded-xl shadow-xl flex items-center justify-center overflow-hidden`}
      >
        <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-700 to-indigo-950 rounded-md flex items-center justify-center relative">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            <i className="fas fa-crown text-indigo-400 opacity-30 text-2xl relative z-10"></i>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      layoutId={layoutId}
      whileHover={!disabled ? { y: -25, scale: 1.05, zIndex: 50 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        y: isPlayable ? -15 : 0,
        boxShadow: isPlayable 
          ? "0 0 25px rgba(99, 102, 241, 0.6), 0 0 10px rgba(99, 102, 241, 0.4)" 
          : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
      }}
      transition={{ 
        y: { type: 'spring', stiffness: 300, damping: 20 },
        boxShadow: { duration: 1.5, repeat: Infinity, repeatType: 'mirror' }
      }}
      exit={{ scale: 0.5, opacity: 0 }}
      onClick={!disabled ? onClick : undefined}
      className={`
        ${sizeClasses[size]} 
        ${disabled ? 'cursor-not-allowed opacity-60 grayscale-[0.5]' : 'cursor-pointer'} 
        bg-white rounded-xl border-2 
        ${isPlayable ? 'border-indigo-500 ring-2 ring-indigo-400/30' : disabled ? 'border-gray-300' : 'border-slate-200'} 
        shadow-2xl flex flex-col justify-between p-2 relative select-none overflow-hidden
      `}
    >
      <div className={`flex flex-col items-start ${isRed ? 'text-red-600' : 'text-slate-900'} z-10`}>
        <span className="font-black leading-none">{card.rank}</span>
        <div className="mt-1">{getSuitIcon(card.suit, iconSizeClasses[size])}</div>
      </div>
      
      {/* Center Art */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {isFaceCard ? (
          <div className="w-full h-full p-4 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
            <img src={getFaceArt()!} alt="face art" className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="opacity-[0.05] scale-[2.5]">
            {getSuitIcon(card.suit, "w-16 h-16")}
          </div>
        )}
      </div>

      <div className={`flex flex-col items-end rotate-180 ${isRed ? 'text-red-600' : 'text-slate-900'} z-10`}>
        <span className="font-black leading-none">{card.rank}</span>
        <div className="mt-1">{getSuitIcon(card.suit, iconSizeClasses[size])}</div>
      </div>

      {/* Decorative inner frame */}
      <div className={`absolute inset-1 border ${isRed ? 'border-red-50' : 'border-slate-50'} rounded-lg pointer-events-none opacity-50`}></div>
      
      {/* Playable Highlight Pulse Overlay */}
      {isPlayable && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-indigo-500/10 pointer-events-none"
        />
      )}
    </motion.div>
  );
};

export default CardUI;
