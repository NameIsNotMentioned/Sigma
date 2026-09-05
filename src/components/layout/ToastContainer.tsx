import React from 'react';
import { CheckCircle2, AlertTriangle, Info, Sparkles, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  desc?: string;
  tone?: 'success' | 'warning' | 'info' | 'accent';
}

export const ToastContainer: React.FC<{
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const isSuccess = t.tone === 'success';
        const isWarning = t.tone === 'warning';
        const isAccent = t.tone === 'accent';

        return (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-start gap-3 transition-all animate-in slide-in-from-bottom-3 duration-300 ${
              isSuccess
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100 shadow-emerald-500/10'
                : isWarning
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-100 shadow-rose-500/10'
                : isAccent
                ? 'bg-cyan-950/90 border-cyan-500/40 text-cyan-100 shadow-cyan-500/10'
                : 'bg-slate-900/90 border-white/10 text-white'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {isWarning && <AlertTriangle className="w-4 h-4 text-rose-400" />}
              {isAccent && <Sparkles className="w-4 h-4 text-cyan-400" />}
              {!isSuccess && !isWarning && !isAccent && <Info className="w-4 h-4 text-blue-400" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold leading-tight">{t.title}</div>
              {t.desc && (
                <div className="text-[11px] opacity-80 mt-0.5 leading-snug">{t.desc}</div>
              )}
            </div>

            <button
              onClick={() => onDismiss(t.id)}
              className="p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

