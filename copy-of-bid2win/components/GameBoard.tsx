
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Game, Player, Card, Suit, Rank } from '../types';
import { createDeck, getSuitIcon, getCardValue, getCardScore, SUITS, RANKS } from '../constants';
import CardUI from './CardUI';

interface GameBoardProps {
  players: string[];
  onGameOver: (score: number) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ players, onGameOver }) => {
  const [game, setGame] = useState<Game | null>(null);
  const [selectedBid, setSelectedBid] = useState<number>(100);
  const [winningPlayerId, setWinningPlayerId] = useState<string | null>(null);
  const [thinkingIndex, setThinkingIndex] = useState<number | null>(null);
  const [viewingSetPlayerId, setViewingSetPlayerId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<{ text: string; subtext?: string } | null>(null);

  useEffect(() => {
    const deck = createDeck();
    const gamePlayers: Player[] = players.map((name, i) => ({
      id: i === 0 ? 'player' : `p${i}`,
      name: name,
      avatar: `https://api.dicebear.com/7.x/${i === 0 ? 'avataaars' : 'bottts'}/svg?seed=${name}`,
      hand: deck.slice(i * 5, (i + 1) * 5),
      isBot: i !== 0,
      score: 0,
      wonTricks: [],
      team: 'DEFENDER'
    }));

    setGame({
      id: Math.random().toString(36).substr(2, 9),
      status: 'BIDDING',
      players: gamePlayers,
      currentPlayerIndex: 0,
      highestBidderIndex: null,
      highestBid: 0,
      trumpSuit: null,
      tricks: [],
      currentTrick: { cards: [] },
      dealerIndex: 0,
      totalPointsCollected: 0,
      partnerCardIds: [],
      teamScores: { bidder: 0, defender: 0 }
    });
  }, [players]);

  const showAnnouncement = (text: string, subtext?: string) => {
    setAnnouncement({ text, subtext });
    setTimeout(() => setAnnouncement(null), 3500);
  };

  const getValidCards = (playerHand: Card[], leadSuit?: Suit) => {
    if (!leadSuit) return playerHand;
    const hasLeadSuit = playerHand.some(c => c.suit === leadSuit);
    if (!hasLeadSuit) return playerHand;
    return playerHand.filter(c => c.suit === leadSuit);
  };

  const handleBid = (bid: number) => {
    setGame(prev => {
      if (!prev) return null;
      let nextHigh = prev.highestBid;
      let nextBidder = prev.highestBidderIndex;

      if (bid > prev.highestBid) {
        nextHigh = bid;
        nextBidder = prev.currentPlayerIndex;
      }

      if (prev.currentPlayerIndex === prev.players.length - 1) {
        if (nextBidder === null) nextBidder = 0;
        
        const bidderName = prev.players[nextBidder].name;
        showAnnouncement(`${bidderName} Wins the Bid!`, `Target Goal: ${nextHigh} Points`);

        const allDealtCards = prev.players.flatMap(p => p.hand);
        const deck = createDeck().filter(c => !allDealtCards.some(hc => hc.id === c.id));
        const cardsPerPlayer = Math.floor(deck.length / prev.players.length);
        
        const updatedPlayers = prev.players.map((p, i) => {
            const start = i * cardsPerPlayer;
            const extraCards = deck.slice(start, start + cardsPerPlayer);
            return {
                ...p, 
                hand: [...p.hand, ...extraCards],
                team: (i === nextBidder) ? 'BIDDER' as const : 'DEFENDER' as const
            };
        });

        return {
          ...prev,
          players: updatedPlayers,
          highestBid: nextHigh,
          highestBidderIndex: nextBidder,
          status: 'CHOOSE_TRUMP',
          currentPlayerIndex: nextBidder
        };
      }

      return {
        ...prev,
        highestBid: nextHigh,
        highestBidderIndex: nextBidder,
        currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length
      };
    });
  };

  const handleChooseTrump = (suit: Suit) => {
    setGame(prev => {
        if (!prev) return null;
        const partnersNeeded = Math.floor(prev.players.length / 2) - 1;
        if (partnersNeeded <= 0) return { ...prev, trumpSuit: suit, status: 'PLAYING' };
        return { ...prev, trumpSuit: suit, status: 'CHOOSE_PARTNER' };
    });
  };

  const handlePickPartnerCard = (suit: Suit, rank: Rank) => {
    setGame(prev => {
        if (!prev) return null;
        const partnerCardId = `${rank}-${suit}`;
        if (prev.partnerCardIds.includes(partnerCardId)) return prev;
        const newPartners = [...prev.partnerCardIds, partnerCardId];
        const partnersNeeded = Math.floor(prev.players.length / 2) - 1;

        if (newPartners.length >= partnersNeeded) {
            return { ...prev, partnerCardIds: newPartners, status: 'PLAYING' };
        }
        return { ...prev, partnerCardIds: newPartners };
    });
  };

  const handlePlayCard = (card: Card) => {
    if (card.id === '3-SPADES') {
      const pName = game?.players[game.currentPlayerIndex]?.name || 'Someone';
      showAnnouncement(`${pName} played 3 of Spades!`, "+30 Points Unleashed!");
    }

    setGame(prev => {
      if (!prev) return null;
      const idx = prev.currentPlayerIndex;
      const player = prev.players[idx];
      const validCards = getValidCards(player.hand, prev.currentTrick.leadSuit);
      if (!validCards.some(c => c.id === card.id)) return prev;

      const newHand = player.hand.filter(c => c.id !== card.id);
      const newTrickCards = [...prev.currentTrick.cards, { playerId: player.id, card }];
      const leadSuit = prev.currentTrick.leadSuit || card.suit;

      let updatedTeam = player.team;
      // Reveal partner if they play the partner card
      if (prev.partnerCardIds.includes(card.id)) {
          updatedTeam = 'BIDDER';
          showAnnouncement(`${player.name} is the Secret Partner!`, `Revealed by playing ${card.rank} of ${card.suit}`);
      }

      const updatedPlayers = [...prev.players];
      updatedPlayers[idx] = { ...player, hand: newHand, team: updatedTeam };

      if (newTrickCards.length === prev.players.length) {
        let winnerId = newTrickCards[0].playerId;
        let best = newTrickCards[0].card;
        newTrickCards.forEach(t => {
          const isTrump = t.card.suit === prev.trumpSuit;
          const isBestTrump = best.suit === prev.trumpSuit;
          if (isTrump && (!isBestTrump || getCardValue(t.card.rank) > getCardValue(best.rank))) { winnerId = t.playerId; best = t.card; }
          else if (!isBestTrump && t.card.suit === leadSuit && getCardValue(t.card.rank) > getCardValue(best.rank)) { winnerId = t.playerId; best = t.card; }
        });
        const wIdx = updatedPlayers.findIndex(p => p.id === winnerId);
        const trickPoints = newTrickCards.reduce((acc, t) => acc + getCardScore(t.card), 0);
        
        setTimeout(() => {
          setWinningPlayerId(winnerId);
          setTimeout(() => {
            setWinningPlayerId(null);
            setGame(curr => {
              if (!curr) return null;
              const nextP = [...curr.players];
              nextP[wIdx].score += trickPoints;
              nextP[wIdx].wonTricks = [...(nextP[wIdx].wonTricks || []), newTrickCards.map(t => t.card)];
              
              const winnerTeam = nextP[wIdx].team;
              const newTeamScores = { ...curr.teamScores };
              if (winnerTeam === 'BIDDER') newTeamScores.bidder += trickPoints;
              else newTeamScores.defender += trickPoints;

              // Early Game Over Logic: Bid reached or prevented
              const totalPointsPossible = 230; // 20 face cards @ 10 + 3 of spades @ 30
              const isBidReached = newTeamScores.bidder >= curr.highestBid;
              const isBidImpossible = newTeamScores.defender > (totalPointsPossible - curr.highestBid);

              if (isBidReached || isBidImpossible || nextP[0].hand.length === 0) {
                  const finalScore = isBidReached ? 200 : 0; // Simulated winning score for rating
                  onGameOver(finalScore);
                  return { ...curr, players: nextP, teamScores: newTeamScores, status: 'GAME_OVER' };
              }

              return { ...curr, players: nextP, teamScores: newTeamScores, currentPlayerIndex: wIdx, currentTrick: { cards: [] }, tricks: [...curr.tricks, { leadSuit, cards: newTrickCards }] };
            });
          }, 1000);
        }, 600);
      }
      return { ...prev, players: updatedPlayers, currentPlayerIndex: (idx + 1) % prev.players.length, currentTrick: { ...prev.currentTrick, cards: newTrickCards, leadSuit } };
    });
  };

  useEffect(() => {
    if (!game || game.status === 'GAME_OVER' || winningPlayerId) return;
    const currentPlayer = game.players[game.currentPlayerIndex];
    if (currentPlayer.isBot) {
        const timeout = setTimeout(() => {
            setThinkingIndex(game.currentPlayerIndex);
            setTimeout(() => {
                setThinkingIndex(null);
                if (game.status === 'BIDDING') {
                    const highCards = currentPlayer.hand.filter(c => ['10','J','Q','K','A'].includes(c.rank) || c.id === '3-SPADES').length;
                    if (highCards >= 3 && game.highestBid < 140) handleBid(Math.min(190, game.highestBid + 10));
                    else handleBid(0);
                } else if (game.status === 'CHOOSE_TRUMP') {
                    handleChooseTrump(currentPlayer.hand[0].suit);
                } else if (game.status === 'CHOOSE_PARTNER') {
                    const randomSuit = SUITS[Math.floor(Math.random()*SUITS.length)];
                    handlePickPartnerCard(randomSuit, 'A');
                } else if (game.status === 'PLAYING') {
                    const valid = getValidCards(currentPlayer.hand, game.currentTrick.leadSuit);
                    handlePlayCard(valid[0]);
                }
            }, 1000);
        }, 500);
        return () => clearTimeout(timeout);
    }
  }, [game?.currentPlayerIndex, game?.status, winningPlayerId]);

  if (!game) return null;

  return (
    <div className="relative w-full h-[calc(100vh-64px)] bg-[#0c0d10] overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-indigo-900/10"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-10"></div>
      </div>

      <AnimatePresence>
        {announcement && (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0, y: -50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="absolute top-32 left-1/2 -translate-x-1/2 z-[1000] text-center"
          >
            <div className="bg-indigo-600/90 backdrop-blur-xl px-12 py-6 rounded-[3rem] shadow-[0_0_80px_rgba(79,70,229,0.4)] border-2 border-indigo-400/50">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white mb-1 leading-none">
                {announcement.text}
              </h2>
              {announcement.subtext && (
                <p className="text-indigo-200 font-bold uppercase text-xs tracking-[0.4em] opacity-80">
                  {announcement.subtext}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-4 inset-x-6 z-[200] flex justify-between items-start pointer-events-none">
        <div className="flex gap-4 pointer-events-auto">
          <div className="glass px-6 py-4 rounded-3xl border border-white/10 min-w-[160px] shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-600/10 blur-xl"></div>
             <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1">Target Goal</div>
             <div className="text-4xl font-black text-white italic tabular-nums leading-none tracking-tighter">{game.highestBid || '---'}</div>
          </div>
          <div className="glass px-6 py-4 rounded-3xl border border-white/10 min-w-[160px] shadow-2xl">
             <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1">Trump Suit</div>
             <div className="text-4xl font-black text-white flex items-center gap-2 leading-none">
                {game.trumpSuit && getSuitIcon(game.trumpSuit, "w-10 h-10")}
                <span className="tracking-tighter uppercase">{game.trumpSuit || '???'}</span>
             </div>
          </div>
          {game.partnerCardIds.length > 0 && (
            <div className="glass px-6 py-4 rounded-3xl border border-white/10 shadow-2xl">
               <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">Secret Partners</div>
               <div className="flex gap-4">
                 {game.partnerCardIds.map(id => {
                   const [rank, suit] = id.split('-');
                   return (
                     <motion.div 
                        key={id} 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }} 
                        className="flex flex-col items-center bg-white/5 p-2 rounded-xl border border-white/10 min-w-[50px] shadow-lg group hover:bg-white/10 transition-colors"
                     >
                        <span className="text-lg font-black text-white leading-none mb-1">{rank}</span>
                        {getSuitIcon(suit as Suit, "w-4 h-4")}
                     </motion.div>
                   );
                 })}
               </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2 pointer-events-auto">
          <div className="glass px-6 py-4 rounded-3xl border border-white/10 text-right shadow-2xl">
             <div className="text-[10px] font-black uppercase tracking-[0.2em] text-green-400 mb-1">Your Team Score</div>
             <div className="text-4xl font-black text-white italic tabular-nums tracking-tighter leading-none">{game.players[0].team === 'BIDDER' ? game.teamScores.bidder : game.teamScores.defender}</div>
          </div>
          <div className="glass px-6 py-2 rounded-2xl border border-white/5 text-right opacity-60">
             <div className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Opponent Team</div>
             <div className="text-xl font-black text-white tabular-nums leading-none">{game.players[0].team === 'BIDDER' ? game.teamScores.defender : game.teamScores.bidder}</div>
          </div>
        </div>
      </div>

      <div className="relative w-full h-full flex items-center justify-center flex-1 py-10">
        <div className="absolute w-[95%] h-[75%] max-w-[1100px] max-h-[600px] rounded-[240px] border-[14px] border-[#1a1c24] shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-hidden bg-gradient-to-b from-[#2a2d38] to-[#0c0d10]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-5"></div>
          <div className="absolute inset-0 border border-white/5 rounded-[220px] m-6 pointer-events-none"></div>
        </div>

        {game.players.map((p, idx) => {
          const count = game.players.length;
          const angle = (idx * (360 / count)) + 90;
          const radiusX = Math.min(window.innerWidth * 0.4, 450);
          const radiusY = Math.min(window.innerHeight * 0.3, 220);
          const x = radiusX * Math.cos(angle * (Math.PI / 180));
          const y = radiusY * Math.sin(angle * (Math.PI / 180));
          const isTurn = game.currentPlayerIndex === idx;

          return (
            <motion.div key={p.id} style={{ x, y }} className={`absolute flex flex-col items-center gap-3 z-[210] transition-all`}>
              <div className={`relative p-1.5 rounded-full transition-all group ${isTurn ? 'ring-4 ring-indigo-500 ring-offset-4 ring-offset-[#1a1c24] scale-110 shadow-2xl shadow-indigo-500/30' : 'opacity-80 scale-90'}`}>
                <img src={p.avatar} className="w-20 h-20 rounded-full border-4 border-slate-800 shadow-2xl" alt={p.name} />
                <button onClick={() => setViewingSetPlayerId(p.id)} className="absolute -bottom-2 -right-2 bg-indigo-600 w-10 h-10 rounded-full border-2 border-[#1a1c24] flex items-center justify-center text-white shadow-xl hover:bg-indigo-500 transition-all pointer-events-auto active:scale-90"><i className="fas fa-layer-group text-sm"></i></button>
                {winningPlayerId === p.id && <motion.div initial={{ scale: 0 }} animate={{ scale: 2.5 }} className="absolute inset-0 flex items-center justify-center text-yellow-500 z-50 pointer-events-none"><i className="fas fa-star drop-shadow-[0_0_15px_rgba(234,179,8,1)]"></i></motion.div>}
                {thinkingIndex === idx && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-3 -right-3 bg-indigo-600 p-2 rounded-xl border border-white/20 shadow-2xl"><i className="fas fa-circle-notch fa-spin text-white text-xs"></i></motion.div>}
              </div>
              <div className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all border-2 ${isTurn ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-black/60 text-slate-400 border-white/5'}`}>
                {p.name} {p.team === 'BIDDER' && p.id !== 'player' && game.status === 'PLAYING' && <span className="text-yellow-400 ml-1">•</span>}
              </div>
            </motion.div>
          );
        })}

        <div className="absolute inset-0 flex items-center justify-center z-[220] pointer-events-none">
          {game.currentTrick.cards.map((tc, i) => {
            const pIdx = game.players.findIndex(p => p.id === tc.playerId);
            const count = game.players.length;
            const angle = (pIdx * (360 / count)) + 90;
            const radius = 120;
            const x = radius * Math.cos(angle * (Math.PI / 180));
            const y = radius * Math.sin(angle * (Math.PI / 180));
            return (
              <motion.div key={tc.card.id} initial={{ scale: 0, x: x*2.5, y: y*2.5, opacity: 0 }} animate={{ scale: 0.9, x, y, rotate: angle, opacity: 1 }} transition={{ type: "spring", stiffness: 220, damping: 20 }} className="absolute">
                <CardUI card={tc.card} size="md" disabled />
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="w-full h-80 bg-gradient-to-t from-black via-black/80 to-transparent z-[300] flex flex-col items-center shrink-0 relative">
        <div className="w-full h-full overflow-x-auto overflow-y-hidden flex items-end px-20 pb-12 scrollbar-hide pt-16">
            <div className={`flex items-end gap-3 min-w-max pb-4 px-20 mx-auto ${game.players[0].hand.length > 8 ? 'justify-start' : 'justify-center'}`}>
                {game.players[0].hand.map((card) => {
                  const isUserTurn = game.currentPlayerIndex === 0 && game.status === 'PLAYING';
                  const valid = getValidCards(game.players[0].hand, game.currentTrick.leadSuit);
                  const isValid = valid.some(v => v.id === card.id);
                  const isInvalid = !isValid && isUserTurn;
                  const isPlayable = isUserTurn && isValid && !winningPlayerId;

                  return ( 
                    <CardUI key={card.id} card={card} onClick={() => handlePlayCard(card)} disabled={!isUserTurn || !!winningPlayerId || isInvalid} isPlayable={isPlayable} size="lg" /> 
                  );
                })}
            </div>
        </div>
        <AnimatePresence>
            {game.currentPlayerIndex === 0 && game.status === 'PLAYING' && !winningPlayerId && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="absolute bottom-6 bg-indigo-600 text-white px-10 py-2 rounded-full font-black uppercase text-xs tracking-[0.4em] shadow-[0_0_30px_rgba(79,70,229,0.5)] animate-pulse">Your Turn</motion.div>
            )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {game.status === 'BIDDING' && game.currentPlayerIndex === 0 && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="absolute z-[500] glass p-12 rounded-[4rem] text-center max-w-sm shadow-2xl border border-white/10 backdrop-blur-3xl">
             <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-10 text-white leading-none">Declare Bid</h3>
             <div className="flex items-center gap-6 mb-10 bg-black/40 p-8 rounded-3xl shadow-inner border border-white/5">
                <button onClick={() => setSelectedBid(b => Math.max(100, b-10))} className="w-16 h-16 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/5"><i className="fas fa-minus text-indigo-400"></i></button>
                <div className="flex-1 text-7xl font-black tabular-nums text-white leading-none italic">{selectedBid}</div>
                <button onClick={() => setSelectedBid(b => Math.min(190, b+10))} className="w-16 h-16 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/5"><i className="fas fa-plus text-indigo-400"></i></button>
             </div>
             <div className="flex flex-col gap-4">
                <button onClick={() => handleBid(selectedBid)} className="bg-indigo-600 py-6 rounded-3xl font-black text-2xl italic uppercase tracking-tighter shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all active:scale-95 text-white">Commit Bid</button>
                <button onClick={() => handleBid(0)} className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] hover:text-white transition-colors">Pass Control</button>
             </div>
          </motion.div>
        )}

        {game.status === 'CHOOSE_TRUMP' && game.currentPlayerIndex === 0 && (
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} className="absolute z-[500] glass p-12 rounded-[4rem] text-center shadow-2xl border border-white/10 backdrop-blur-3xl">
             <h3 className="text-5xl font-black uppercase italic tracking-tighter mb-12 text-white leading-none">Declare Trump</h3>
             <div className="grid grid-cols-2 gap-6">
               {SUITS.map(s => (
                 <button key={s} onClick={() => handleChooseTrump(s)} className="p-12 bg-white/5 rounded-[2.5rem] hover:bg-indigo-600 transition-all group border border-white/5 hover:border-indigo-400 shadow-xl">
                    <div className="group-hover:scale-125 transition-transform duration-500">{getSuitIcon(s, "w-20 h-20")}</div>
                    <div className="mt-4 text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 text-white">{s}</div>
                 </button>
               ))}
             </div>
          </motion.div>
        )}

        {game.status === 'CHOOSE_PARTNER' && game.currentPlayerIndex === 0 && (
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} className="absolute z-[500] glass p-10 rounded-[4rem] text-center max-w-xl shadow-2xl border border-white/10 backdrop-blur-3xl">
             <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-4 text-white leading-none">Draft Partners</h3>
             <p className="text-[10px] text-slate-500 mb-10 uppercase font-black tracking-[0.3em]">Declare {Math.floor(game.players.length / 2) - game.partnerCardIds.length} more card(s) as partners</p>
             <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mb-10 h-80 overflow-y-auto pr-4 scrollbar-thin">
                {SUITS.map(s => RANKS.map(r => {
                    const cardId = `${r}-${s}`;
                    const isSelected = game.partnerCardIds.includes(cardId);
                    return (
                        <button key={cardId} disabled={isSelected} onClick={() => handlePickPartnerCard(s, r)} className={`text-xs p-4 rounded-2xl font-black transition-all shadow-lg ${isSelected ? 'bg-indigo-600/20 text-indigo-400 opacity-30 cursor-not-allowed' : 'bg-white/5 hover:bg-indigo-600 text-white border border-white/5 active:scale-90'}`}>{r}<br/>{s[0]}</button>
                    );
                }))}
             </div>
          </motion.div>
        )}

        {viewingSetPlayerId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-8">
            <div className="max-w-6xl w-full flex flex-col gap-10 h-full">
              <div className="flex justify-between items-center border-b border-white/10 pb-8 text-white">
                <div>
                    <h2 className="text-6xl font-black italic uppercase tracking-tighter">Arena Trophies</h2>
                    <p className="text-indigo-400 font-black uppercase text-[10px] tracking-[0.4em] mt-2">Captured Tricks: {game.players.find(p => p.id === viewingSetPlayerId)?.name}</p>
                </div>
                <button onClick={() => setViewingSetPlayerId(null)} className="w-20 h-20 rounded-full bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center border border-white/10 shadow-2xl active:scale-90"><i className="fas fa-times text-3xl text-slate-400"></i></button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-20 pr-8 scrollbar-thin">
                {game.players.find(p => p.id === viewingSetPlayerId)?.wonTricks?.map((trickCards, tIdx) => (
                  <div key={tIdx} className="space-y-8">
                    <div className="flex items-center gap-6">
                        <span className="w-16 h-16 rounded-[1.5rem] bg-indigo-600/20 flex items-center justify-center font-black text-2xl text-indigo-400 border border-indigo-500/30">Set {tIdx + 1}</span>
                    </div>
                    <div className="flex gap-8 flex-wrap justify-center lg:justify-start"> {trickCards.map((card) => ( <CardUI key={card.id} card={card} size="lg" disabled /> ))} </div>
                  </div>
                ))}
                {(!game.players.find(p => p.id === viewingSetPlayerId)?.wonTricks || game.players.find(p => p.id === viewingSetPlayerId)?.wonTricks?.length === 0) && (
                  <div className="flex flex-col items-center justify-center py-48 opacity-20 grayscale"> <i className="fas fa-layer-group text-[120px] mb-10 text-white"></i> <div className="text-4xl font-black uppercase italic tracking-tighter text-white">No spoils of war</div> </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameBoard;
