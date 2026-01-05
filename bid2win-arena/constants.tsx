
import React from 'react';
import { Suit, Rank, Card } from './types';

export const SUITS: Suit[] = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];
export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const POINT_RANKS: Rank[] = ['10', 'J', 'Q', 'K', 'A'];
export const POINT_VALUE = 10;

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      deck.push({ suit, rank, id: `${rank}-${suit}` });
    });
  });
  return deck.sort(() => Math.random() - 0.5);
};

export const getSuitIcon = (suit: Suit, className: string = "w-4 h-4") => {
  switch (suit) {
    case 'HEARTS':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" className="text-red-500" />
        </svg>
      );
    case 'DIAMONDS':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L4.5 12 12 22l7.5-10L12 2z" className="text-red-600" />
        </svg>
      );
    case 'CLUBS':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-4 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm8 0c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-3 8v-4h2v4h3v2h-8v-2h3z" className="text-slate-800" />
          <circle cx="12" cy="6" r="3.5" className="text-slate-800" />
          <circle cx="7.5" cy="12" r="3.5" className="text-slate-800" />
          <circle cx="16.5" cy="12" r="3.5" className="text-slate-800" />
          <path d="M10 18h4l1 4h-6z" className="text-slate-800" />
        </svg>
      );
    case 'SPADES':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C9 2 4 9 4 14c0 3 2.5 5 5 5 1 0 2-.5 3-1.5 1 1 2 1.5 3 1.5 2.5 0 5-2 5-5 0-5-5-12-8-12z" className="text-slate-900" />
          <path d="M10 18h4l1 5h-6z" className="text-slate-900" />
        </svg>
      );
  }
};

export const getCardValue = (rank: Rank): number => {
  const values: Record<Rank, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };
  return values[rank];
};

export const getCardScore = (card: Card): number => {
  if (card.id === '3-SPADES') return 30;
  if (POINT_RANKS.includes(card.rank)) return 10;
  return 0;
};
