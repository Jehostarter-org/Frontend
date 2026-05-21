"use client";

import React, { useState } from "react";
import { BarChart2, CheckCircle2 } from "lucide-react";

interface PollOption {
  label: string;
  votes: number;
}

export function CommunityPoll({ question, options: initialOptions }: { question: string, options: PollOption[] }) {
  const [voted, setVoted] = useState(false);
  const totalVotes = initialOptions.reduce((acc, opt) => acc + opt.votes, 0);

  return (
    <div className="p-8 bg-slate-900 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
      {/* Decorative Background Element */}
      <div className="absolute -right-4 -top-4 h-24 w-24 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-white/5 rounded-xl text-teal-400">
            <BarChart2 size={18} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-500/80">Community Poll</span>
        </div>

        <h4 className="text-lg font-black text-white leading-tight mb-6 italic tracking-tight">
          "{question}"
        </h4>

        <div className="space-y-3">
          {initialOptions.map((option) => {
            const percentage = Math.round((option.votes / totalVotes) * 100);
            
            return (
              <button
                key={option.label}
                disabled={voted}
                onClick={() => setVoted(true)}
                className="w-full relative group/btn text-left"
              >
                <div className={`relative z-10 flex justify-between items-center p-4 rounded-2xl border transition-all ${
                  voted ? "border-transparent" : "border-white/10 hover:border-teal-500/50 hover:bg-white/5"
                }`}>
                  <span className="text-xs font-bold text-slate-200">{option.label}</span>
                  {voted && <span className="text-[10px] font-black text-teal-400">{percentage}%</span>}
                </div>

                {/* Animated Progress Bar (Visible after voting) */}
                {voted && (
                  <div 
                    className="absolute inset-0 bg-teal-500/10 rounded-2xl transition-all duration-1000 ease-out" 
                    style={{ width: `${percentage}%` }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {voted && (
          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-teal-400 animate-pulse">
            <CheckCircle2 size={14} /> Vote Recorded
          </div>
        )}
      </div>
    </div>
  );
}