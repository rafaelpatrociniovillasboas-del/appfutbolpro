import React from 'react';
import { Lock, Sparkles } from 'lucide-react';
import * as motion from 'motion/react-client';

interface ComingSoonModuleProps {
  title: string;
  description: string;
}

export function ComingSoonModule({ title, description }: ComingSoonModuleProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/5 mb-8 relative"
      >
        <Lock className="w-10 h-10 text-zinc-500" />
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-[#050a07]">
            <Sparkles className="w-4 h-4 text-white" />
        </div>
      </motion.div>
      <motion.h2 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-3xl lg:text-4xl font-display font-bold text-white mb-4"
      >
        {title}
      </motion.h2>
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-zinc-400 text-lg max-w-lg mx-auto leading-relaxed"
      >
        {description}
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-12 inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full text-sm font-bold border border-emerald-500/20"
      >
        <span className="relative flex h-2 w-2 mr-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        Módulo em Desenvolvimento
      </motion.div>
    </div>
  );
}
