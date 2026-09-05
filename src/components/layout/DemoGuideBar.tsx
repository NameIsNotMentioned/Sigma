import React from 'react';
import { useTrip } from '../../context/TripContext';
import { PlayCircle, RotateCcw, ChevronRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Button, Badge } from 'open-glass-ui';

const DEMO_STEPS = [
  { step: 1, label: '① Dashboard', desc: 'Trip overview — ₹64.8k total cost, 6 travelers, live KPIs' },
  { step: 2, label: '② Open Expenses', desc: 'Villa Sol Hotel highlighted — 4 travelers @ ₹6,000 each' },
  { step: 3, label: '③ Drop Rohan (4→3)', desc: 'Remove Rohan from Hotel — share auto-recalculates to ₹8,000!' },
  { step: 4, label: '④ Settle (5→3 tx)', desc: 'Greedy optimization: 5 raw transfers → 3 optimal' },
  { step: 5, label: '⑤ Rohan\'s Profile', desc: 'Open Rohan\'s personal financial drawer' },
  { step: 6, label: '⑥ Cancel Activity', desc: 'Cancel Scuba Diving — reverses impact on all balances' },
];

export const DemoGuideBar: React.FC = () => {
  const { triggerDemoStep, currentDemoStep, resetDemo } = useTrip();

  return (
    <div className="w-full bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-blue-950/40 border-b border-cyan-500/20 backdrop-blur-md px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Banner info */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wide text-white">
                HACKATHON DEMO CONTROLLER
              </span>
              <Badge tone="accent">
                Master Plan Flow
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              One-click demonstration of dynamic recalculation & settlement optimization
            </p>
          </div>
        </div>

        {/* Center: Steps Carousel / Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full no-scrollbar">
          {DEMO_STEPS.map((item) => {
            const isActive = currentDemoStep === item.step;
            return (
              <button
                key={item.step}
                onClick={() => triggerDemoStep(item.step)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap border ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 shadow-lg shadow-cyan-500/10 scale-[1.02]'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
                title={item.desc}
              >
                {isActive ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <PlayCircle className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Reset Demo button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={resetDemo}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/40 hover:text-white text-xs font-medium transition-all"
            title="Reset trip to initial state"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};

