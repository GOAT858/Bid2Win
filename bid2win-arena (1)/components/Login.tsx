
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface LoginProps {
  onLogin: (username: string, avatar: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [seed, setSeed] = useState(() => Math.random().toString(36).substring(7));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim(), `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#070708] flex items-center justify-center p-6 overflow-hidden relative">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600 rounded-full blur-[250px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-900 rounded-full blur-[250px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-12">
          <motion.div 
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-[0_20px_50px_rgba(79,70,229,0.5)] cursor-pointer"
          >
            <i className="fas fa-crown text-white text-5xl"></i>
          </motion.div>
          <h1 className="text-6xl font-black italic tracking-tighter text-white uppercase mb-3">Bid<span className="text-indigo-500">2</span>Win</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.5em] opacity-80">Global Strategic Bidding Arena</p>
        </div>

        <div className="glass p-10 rounded-[4rem] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="flex flex-col items-center gap-6">
              <div 
                className="relative group cursor-pointer" 
                onClick={() => setSeed(Math.random().toString(36).substring(7))}
              >
                <div className="w-32 h-32 rounded-[3rem] bg-slate-800 border-4 border-indigo-500/30 overflow-hidden shadow-2xl group-hover:scale-105 transition-all duration-500">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} alt="avatar" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center border-4 border-[#070708] text-white text-sm shadow-xl group-hover:rotate-180 transition-transform duration-500">
                  <i className="fas fa-sync-alt"></i>
                </div>
              </div>
              <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">Tap to reroll character</p>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-4">Commander Name</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="The Gambler..."
                className="w-full bg-black/50 border-2 border-white/5 rounded-3xl px-8 py-5 font-black text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-800 text-xl italic"
                maxLength={12}
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 py-6 rounded-[2rem] font-black text-2xl italic uppercase tracking-tighter shadow-[0_15px_40px_rgba(79,70,229,0.3)] active:scale-95 transition-all text-white"
            >
              Sign In to Arena
            </button>
          </form>
          
          <div className="mt-12 pt-8 border-t border-white/5 text-center">
            <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.2em] leading-relaxed">
              Secured with High-Stakes Encryption <br/>
              <span className="text-indigo-900/40">v2.5.0-native-audio-native-partner</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
