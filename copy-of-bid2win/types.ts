
export type Suit = 'HEARTS' | 'DIAMONDS' | 'CLUBS' | 'SPADES';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
}

export type GameState = 'LOBBY' | 'BIDDING' | 'CHOOSE_TRUMP' | 'CHOOSE_PARTNER' | 'PLAYING' | 'GAME_OVER';

export interface User {
  username: string;
  avatar: string;
  rating: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  hand: Card[];
  isBot: boolean;
  score: number;
  bid?: number;
  wonTricks: Card[][];
  team?: 'BIDDER' | 'DEFENDER';
}

export interface Trick {
  leadSuit?: Suit;
  cards: { playerId: string; card: Card }[];
}

export interface Game {
  id: string;
  status: GameState;
  players: Player[];
  currentPlayerIndex: number;
  highestBidderIndex: number | null;
  highestBid: number;
  trumpSuit: Suit | null;
  tricks: Trick[];
  currentTrick: Trick;
  dealerIndex: number;
  partnerCardIds: string[]; 
  teamScores: { bidder: number; defender: number };
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  rating: number;
  wins: number;
  losses: number;
}
