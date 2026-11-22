import { useEffect, useState } from 'react';
import { CheckCircle2, Compass, Fish, Moon, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StartupSplashProps {
  ready: boolean;
  onComplete: () => void;
}

export function StartupSplash({ ready, onComplete }: StartupSplashProps) {
  const [exiting, setExiting] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(2), 350);
    const t2 = setTimeout(() => setStep(3), 750);
    const t3 = setTimeout(() => {
      setExiting(true);
      setTimeout(onComplete, 420);
    }, 1550);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  const dismissNow = () => {
    setExiting(true);
    setTimeout(onComplete, 320);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#020c1b] px-6 text-slate-100 transition-all duration-400 ${
        exiting ? 'pointer-events-none scale-105 opacity-0 blur-sm' : 'scale-100 opacity-100'
      }`}
    >
      {/* Animated Sonar / Water Ripples & Floating Fish Logo */}
      <div className="relative mb-6 flex h-36 w-36 items-center justify-center">
        <span className="animate-ripple absolute inset-0 rounded-full border border-cyan-400/50" />
        <span className="animate-ripple-delay absolute inset-0 rounded-full border border-emerald-400/40" />
        <div className="animate-float relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-600 text-slate-950 shadow-[0_0_40px_rgba(34,211,238,0.45)]">
          <Fish className="h-10 w-10" />
        </div>
      </div>

      <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        Nibbles <span className="text-cyan-400">NZ</span>
      </h1>
      <p className="mt-1 font-mono text-xs tracking-wider text-slate-400 uppercase">
        125 New Zealand Fishing Spots · Live Solunar &amp; Marine Intel
      </p>

      {/* Boot Diagnostic Steps */}
      <div className="mt-6 w-full max-w-xs space-y-2 rounded-xl border border-cyan-500/20 bg-[#07172b]/90 p-3.5 font-mono text-xs">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-slate-300">
            <Compass className="h-3.5 w-3.5 text-cyan-400" /> 125 NZ Coastal Spots
          </span>
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
        </div>
        <div
          className={`flex items-center justify-between transition-opacity duration-300 ${
            step >= 2 ? 'opacity-100' : 'opacity-30'
          }`}
        >
          <span className="flex items-center gap-2 text-slate-300">
            <Moon className="h-3.5 w-3.5 text-amber-400" /> Solunar &amp; Maramataka
          </span>
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
        </div>
        <div
          className={`flex items-center justify-between transition-opacity duration-300 ${
            step >= 3 || ready ? 'opacity-100' : 'opacity-30'
          }`}
        >
          <span className="flex items-center gap-2 text-slate-300">
            <Waves className="h-3.5 w-3.5 text-sky-400" /> Open-Meteo Live Marine
          </span>
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={dismissNow}
        className="mt-5 font-mono text-xs text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300"
      >
        Skip Intro →
      </Button>
    </div>
  );
}
