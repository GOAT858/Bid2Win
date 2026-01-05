
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';

interface LobbyProps {
  onStartGame: (players: {name: string}[]) => void;
  currentUser: User;
}

const Lobby: React.FC<LobbyProps> = ({ onStartGame, currentUser }) => {
  const [view, setView] = useState<'MAIN' | 'CREATE' | 'JOIN' | 'MATCHMAKING'>('MAIN');
  const [playerCount, setPlayerCount] = useState(4);
  const [players, setPlayers] = useState<{name: string}[]>([{ name: currentUser.username }]);
  const [roomCode] = useState(() => Math.random().toString(36).substring(2, 7).toUpperCase());

  const startMatchmaking = () => {
    setView('MATCHMAKING');
    // Simulate finding real players joining the session
    setTimeout(() => {
      const simulatedPlayers = [
        { name: currentUser.username },
        { name: 'CardsKing_99' },
        { name: 'Ace_Hunter' },
        { name: 'ShadowBet' },
        { name: 'QueenOfHearts' },
        { name: 'SpadeDealer' },
        { name: 'DiamondJack' },
        { name: 'ClubMaster' },
        { name: 'TheGambler' },
        { name: 'WinningHand' }
      ].slice(0, playerCount);
      onStartGame(simulatedPlayers);
    }, 3000);
  };

  const handleCreateView = () => {
    setView('CREATE');
    setPlayers([{ name: currentUser.username }]);
    
    // Simulate other real players joining your created room
    let joined = 1;
    const names = ['ProPlayerX', 'LuckyStrike', 'BiddingBoss', 'LegendaryCard', 'MasterDeck'];
    const interval = setInterval(() => {
      if (joined < playerCount) {
        setPlayers(prev => [...prev, { name: names[joined - 1] }]);
        joined++;
      } else {
        clearInterval(interval);
      }
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] overflow-y-auto">
      <AnimatePresence mode="wait">
        {view === 'MAIN' && (
          <motion.div key="main" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col lg:flex-row gap-12 items-center w-full max-w-6xl">
            <div className="flex-1 space-y-10 text-center lg:text-left">
              <div className="space-y-4">
                <span className="bg-indigo-600/20 text-indigo-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">Online Arena</span>
                <h1 className="text-[100px] font-black italic tracking-tighter uppercase leading-[0.85] text-white">
                  Bid <br /> <span className="text-indigo-600">To</span> <br /> Win
                </h1>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                <button onClick={() => setView('JOIN')} className="group relative bg-indigo-600 hover:bg-indigo-500 px-12 py-7 rounded-[2.5rem] font-black text-2xl italic uppercase tracking-tighter shadow-2xl shadow-indigo-600/30 transition-all text-white overflow-hidden">
                  <span className="relative z-10 flex items-center gap-3">Join Arena <i className="fas fa-search text-sm"></i></span>
                </button>
                <button onClick={handleCreateView} className="bg-white/5 border border-white/10 hover:bg-white/10 px-12 py-7 rounded-[2.5rem] font-black text-2xl italic uppercase tracking-tighter transition-all text-white">
                  Create Table
                </button>
              </div>
            </div>

            <div className="w-full lg:w-[400px]">
              <div className="glass p-10 rounded-[3.5rem] border border-white/5 shadow-2xl space-y-8 relative overflow-hidden">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-xl shadow-inner">
                       <i className="fas fa-users"></i>
                   </div>
                   <div>
                       <h3 className="font-black uppercase tracking-[0.2em] text-white text-sm">Arena Stats</h3>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Real-time matchmaking</p>
                   </div>
                </div>
                <div className="space-y-6">
                   <div className="bg-black/20 p-6 rounded-3xl border border-white/5">
                      <div className="text-3xl font-black text-white italic">1,248</div>
                      <div className="text-[8px] font-black uppercase tracking-widest text-slate-600">Online Players</div>
                   </div>
                   <div className="bg-black/20 p-6 rounded-3xl border border-white/5">
                      <div className="text-3xl font-black text-white italic">312</div>
                      <div className="text-[8px] font-black uppercase tracking-widest text-slate-600">Active Tables</div>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {view === 'JOIN' && (
          <motion.div key="join" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg glass p-12 rounded-[4rem] border border-white/10 shadow-2xl text-center space-y-10">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Find a Game</h2>
            
            <div className="space-y-6 p-6 bg-black/40 rounded-[2rem] border border-white/5">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 block">Match Size</label>
                <div className="flex justify-center gap-3">
                  {[2, 4, 6, 8, 10].map(n => (
                    <button 
                      key={n} 
                      onClick={() => setPlayerCount(n)} 
                      className={`w-12 h-12 rounded-xl font-black transition-all ${playerCount === n ? 'bg-indigo-600 text-white shadow-xl scale-110' : 'bg-white/5 text-slate-500 border border-white/10'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
            </div>

            <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Enter Private Code</label>
                <input type="text" placeholder="BK2W9" className="w-full bg-black/40 border-2 border-white/5 rounded-3xl px-8 py-5 text-2xl font-black text-center text-white focus:outline-none focus:border-indigo-600 transition-all uppercase tracking-[0.5em]" maxLength={5} />
            </div>

            <div className="flex flex-col gap-4">
              <button onClick={startMatchmaking} className="w-full bg-indigo-600 hover:bg-indigo-500 py-6 rounded-3xl font-black text-xl uppercase italic shadow-2xl shadow-indigo-600/40 text-white">Join Private</button>
              <button onClick={startMatchmaking} className="w-full bg-white/5 border border-white/10 hover:bg-white/10 py-6 rounded-3xl font-black text-xl uppercase italic text-white">Quick Match</button>
            </div>
            <button onClick={() => setView('MAIN')} className="text-slate-600 font-black uppercase text-[10px] tracking-widest block w-full">Go Back</button>
          </motion.div>
        )}

        {view === 'MATCHMAKING' && (
          <motion.div key="match" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-12">
            <div className="relative">
              <div className="w-48 h-48 border-8 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <img src={currentUser.avatar} className="w-32 h-32 rounded-full border-4 border-[#0a0a0c]" alt="avatar" />
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">Searching for {playerCount} Players...</h2>
              <p className="text-indigo-400 font-black uppercase text-xs tracking-[0.5em] animate-pulse">Matching with real players</p>
            </div>
            <button onClick={() => setView('MAIN')} className="text-slate-600 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors">Cancel</button>
          </motion.div>
        )}

        {view === 'CREATE' && (
          <motion.div key="create" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl glass p-12 rounded-[4rem] border border-white/10 shadow-2xl relative">
            <div className="flex justify-between items-center mb-16">
              <div>
                <h2 className="text-6xl font-black italic uppercase tracking-tighter text-white leading-none">Create Table</h2>
                <p className="text-indigo-400 font-black uppercase text-[10px] tracking-[0.3em] mt-2">Room Code: <span className="text-white">{roomCode}</span></p>
              </div>
              <div className="text-right">
                <span className="text-8xl font-black text-white italic tabular-nums leading-none">{players.length}<span className="text-slate-800">/{playerCount}</span></span>
                <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">Waiting for others</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {Array.from({ length: playerCount }).map((_, i) => (
                <div key={i} className={`h-40 rounded-[2.5rem] border-2 flex flex-col items-center justify-center transition-all ${players[i] ? 'bg-indigo-600/10 border-indigo-500/50 shadow-2xl' : 'bg-black/20 border-white/5 border-dashed opacity-30'}`}>
                  {players[i] ? (
                     <div className="flex flex-col items-center gap-3">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${players[i].name}`} className="w-16 h-16 rounded-2xl bg-slate-800" alt="avatar" />
                        <span className="font-black text-[10px] uppercase tracking-tighter truncate max-w-[100px] text-white italic">{players[i].name}</span>
                     </div>
                  ) : (
                    <div className="text-indigo-600/10 text-4xl animate-pulse">
                      <i className="fas fa-user-plus"></i>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-8 justify-between pt-12 border-t border-white/5">
                <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 block">Table Capacity</label>
                   <div className="flex gap-2">
                     {[2, 4, 6, 8, 10].map(n => (
                        <button key={n} onClick={() => { setPlayerCount(n); setPlayers([{ name: currentUser.username }]); }} className={`w-14 h-14 rounded-2xl font-black transition-all ${playerCount === n ? 'bg-indigo-600 text-white shadow-xl scale-110' : 'bg-white/5 text-slate-600 border border-white/10'}`}>{n}</button>
                     ))}
                   </div>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                    <button onClick={() => setView('MAIN')} className="px-10 py-5 rounded-3xl font-black uppercase text-xs text-slate-500 hover:text-white transition-colors">Discard</button>
                    <button disabled={players.length < playerCount} onClick={() => onStartGame(players)} className="flex-1 sm:flex-none px-12 py-5 bg-indigo-600 hover:bg-indigo-500 rounded-3xl font-black text-xl uppercase italic shadow-2xl shadow-indigo-600/30 transition-all disabled:opacity-20 text-white">Begin Arena</button>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Lobby;
