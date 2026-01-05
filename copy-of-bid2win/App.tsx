
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import Leaderboard from './components/Leaderboard';
import Login from './components/Login';
import { User } from './types';

const storage = {
  set: (key: string, val: any) => {
    localStorage.setItem(key, JSON.stringify(val));
    document.cookie = `${key}=${JSON.stringify(val)}; path=/; max-age=31536000; SameSite=Lax`;
  },
  get: (key: string) => {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
    const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
    if (match) return JSON.parse(decodeURIComponent(match[2]));
    return null;
  },
  clear: (key: string) => {
    localStorage.removeItem(key);
    document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax`;
  }
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState<'LOBBY' | 'GAME' | 'LEADERBOARD'>('LOBBY');
  const [roomPlayers, setRoomPlayers] = useState<{name: string, isBot: boolean}[]>([]);
  const [opponentRating, setOpponentRating] = useState<number>(100);

  useEffect(() => {
    const saved = storage.get('bid2win_user');
    if (saved) setUser(saved);
  }, []);

  const handleLogin = (username: string, avatar: string) => {
    const newUser = { username, avatar, rating: 100 };
    setUser(newUser);
    storage.set('bid2win_user', newUser);
  };

  const startGame = (players: {name: string, isBot: boolean}[]) => {
    setRoomPlayers(players);
    // Simulate opponent rating based on context
    const isAiGame = players.some(p => p.isBot);
    setOpponentRating(isAiGame ? 100 : (user?.rating || 100) + Math.floor(Math.random() * 200));
    setActivePage('GAME');
  };

  const handleGameOver = (score: number) => {
    if (user) {
      const didWin = score > 100;
      let ratingChange = 0;
      const diff = opponentRating - user.rating;

      if (didWin) {
        if (diff > 50) {
          // Rule: (Opponent - Yours - 50) / 2
          ratingChange = Math.max(10, Math.floor((opponentRating - user.rating - 50) / 2));
        } else {
          ratingChange = 10;
        }
      } else {
        if (diff > 50) {
          ratingChange = 0; // Nothing happens
        } else {
          ratingChange = -10;
        }
      }

      const newRating = Math.max(100, user.rating + ratingChange);
      const updatedUser = { ...user, rating: newRating };
      setUser(updatedUser);
      storage.set('bid2win_user', updatedUser);
    }
    setActivePage('LOBBY');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0c] text-slate-100 selection:bg-indigo-500/30 overflow-hidden">
      <nav className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-2xl sticky top-0 z-[1000] flex items-center px-8 justify-between shrink-0">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActivePage('LOBBY')}>
          <motion.div whileHover={{ rotate: 360 }} className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <i className="fas fa-crown text-white"></i>
          </motion.div>
          <span className="text-2xl font-black tracking-tighter uppercase italic">BID<span className="text-indigo-500">2</span>WIN</span>
        </div>

        <div className="hidden md:flex items-center gap-10 font-bold text-slate-400 text-sm uppercase tracking-widest">
          <button onClick={() => setActivePage('LOBBY')} className={`hover:text-white transition-all relative ${activePage === 'LOBBY' ? 'text-white' : ''}`}>
            Lobby {activePage === 'LOBBY' && <motion.div layoutId="underline" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-indigo-500" />}
          </button>
          <button onClick={() => setActivePage('LEADERBOARD')} className={`hover:text-white transition-all relative ${activePage === 'LEADERBOARD' ? 'text-white' : ''}`}>
            Leaderboard {activePage === 'LEADERBOARD' && <motion.div layoutId="underline" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-indigo-500" />}
          </button>
        </div>

        <div className="flex items-center gap-5">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] uppercase font-black text-slate-600 tracking-widest leading-none mb-1">{user.username}</span>
            <span className="font-black text-indigo-400 text-lg leading-none italic">{user.rating}</span>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-indigo-500/50 overflow-hidden shadow-xl cursor-pointer hover:scale-110 transition-transform" onClick={() => { if(confirm("Log out and clear session?")) { setUser(null); storage.clear('bid2win_user'); } }}>
            <img src={user.avatar} alt="Avatar" />
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        <motion.main key={activePage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 w-full relative">
          {activePage === 'LOBBY' && <Lobby onStartGame={startGame} currentUser={user} />}
          {activePage === 'GAME' && <GameBoard players={roomPlayers.map(p => p.name)} onGameOver={handleGameOver} />}
          {activePage === 'LEADERBOARD' && <Leaderboard />}
        </motion.main>
      </AnimatePresence>
    </div>
  );
};

export default App;
