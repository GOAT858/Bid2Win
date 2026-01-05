
import React from 'react';
import { LeaderboardEntry } from '../types';
import { motion } from 'framer-motion';

// Mock data cleared - showing only a sample empty state or top performers if necessary.
// For now, let's keep it empty to satisfy "clear all data".
const MOCK_LEADERBOARD: LeaderboardEntry[] = [];

const Leaderboard: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h1 className="text-6xl font-black italic tracking-tighter uppercase text-white leading-none mb-2">Rankings</h1>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Global Hall of Fame • Season 1</p>
        </div>
        <div className="flex gap-4">
          <div className="glass px-8 py-4 rounded-2xl border border-white/10 text-center shadow-xl">
             <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Total Masters</div>
             <div className="text-2xl font-black text-white tabular-nums">0</div>
          </div>
          <div className="bg-indigo-600 px-8 py-4 rounded-2xl border border-indigo-400/30 text-center shadow-2xl shadow-indigo-600/20">
             <div className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Your Rank</div>
             <div className="text-2xl font-black text-white tabular-nums">---</div>
          </div>
        </div>
      </div>

      <div className="glass rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl min-h-[400px] flex flex-col">
        {MOCK_LEADERBOARD.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/5 text-slate-500 uppercase text-[10px] font-black tracking-[0.2em]">
                <tr>
                  <th className="px-10 py-6">Rank</th>
                  <th className="px-10 py-6">Player</th>
                  <th className="px-10 py-6">Rating</th>
                  <th className="px-10 py-6 hidden sm:table-cell text-center">Matches</th>
                  <th className="px-10 py-6 hidden md:table-cell text-right">Win Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {MOCK_LEADERBOARD.map((entry) => (
                  <motion.tr 
                    key={entry.rank}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                  >
                    <td className="px-10 py-6">
                      <span className={`font-black text-2xl italic tracking-tighter tabular-nums text-slate-700`}>
                        {entry.rank}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-slate-800 border-2 border-white/5 overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.username}`} alt="avatar" />
                        </div>
                        <span className="font-black text-lg text-slate-200">{entry.username}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="font-black text-2xl text-indigo-400 tabular-nums tracking-tighter">{entry.rating}</span>
                    </td>
                    <td className="px-10 py-6 hidden sm:table-cell text-center text-white italic font-black">
                      {entry.wins + entry.losses}
                    </td>
                    <td className="px-10 py-6 hidden md:table-cell text-right font-black text-green-500">
                      {Math.round((entry.wins / (entry.wins + entry.losses)) * 100)}%
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6">
            <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center text-slate-800 text-6xl">
              <i className="fas fa-trophy"></i>
            </div>
            <div>
              <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-300">Arena Empty</h3>
              <p className="text-slate-600 font-bold uppercase text-[10px] tracking-widest mt-2">The first legends of the season are yet to emerge.</p>
            </div>
            <button className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all">
              Challenge Someone
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
