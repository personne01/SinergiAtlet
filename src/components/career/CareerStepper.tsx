import { ShieldCheck, ArrowRight, Lock, Zap, Star, CheckCircle, Circle } from 'lucide-react';
import type { CareerLevel } from '../../types';
import { CAREER_PATH } from '../../data/mock';
import { cn } from '../../utils/cn';

const statusConfig = {
  completed: {
    circle: 'bg-[#D1FF00] border-[#D1FF00] text-black',
    line: 'bg-[#D1FF00]',
    badge: 'bg-[#D1FF00]/20 text-[#D1FF00]',
    icon: ShieldCheck,
  },
  current: {
    circle: 'bg-black border-[#D1FF00] text-[#D1FF00]',
    line: 'bg-gradient-to-b from-[#D1FF00] to-white/10',
    badge: 'bg-[#D1FF00]/10 text-[#D1FF00]',
    icon: Zap,
  },
  locked: {
    circle: 'bg-[#0a0a0a] border-white/10 text-white/20',
    line: 'bg-white/5',
    badge: 'bg-white/5 text-white/20',
    icon: Lock,
  },
};

function LevelCircle({ step }: { step: CareerLevel }) {
  const config = statusConfig[step.status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-2 relative',
        config.circle
      )}
    >
      <Icon className={cn(
        'w-4 h-4 sm:w-5 sm:h-5',
        step.status === 'completed' ? 'text-black' : ''
      )} />
      <span className="absolute -top-1.5 -right-1.5 text-[7px] font-mono bg-[#050505] border border-white/10 rounded-full w-4 h-4 flex items-center justify-center text-white/40">
        L{step.level}
      </span>
    </div>
  );
}

function MilestoneItem({ label, completed, locked }: { label: string; completed: boolean; locked: boolean }) {
  if (locked) return null;

  return (
    <div className="flex items-center gap-1.5">
      {completed ? (
        <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#D1FF00] shrink-0" />
      ) : (
        <Circle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white/20 shrink-0" />
      )}
      <span className={cn(
        'text-[7px] sm:text-[8px] leading-tight',
        completed ? 'text-white/50' : 'text-white/20'
      )}>
        {label}
      </span>
    </div>
  );
}

function MilestoneList({ milestones, status }: { milestones: CareerLevel['milestones']; status: CareerLevel['status'] }) {
  const completed = milestones.filter((m) => m.completed).length;
  const total = milestones.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="mt-2 sm:mt-3 space-y-1.5">
      <div className="flex items-center gap-2 text-[7px] sm:text-[8px] font-mono text-white/30">
        <span>{completed}/{total} milestones</span>
        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden max-w-[60px]">
          <div
            className={cn('h-full rounded-full', pct === 100 ? 'bg-[#D1FF00]' : 'bg-white/20')}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={pct === 100 ? 'text-[#D1FF00]' : ''}>{pct}%</span>
      </div>
      {milestones.map((m) => (
        <MilestoneItem
          key={m.id}
          label={m.label}
          completed={m.completed}
          locked={status === 'locked'}
        />
      ))}
    </div>
  );
}

export default function CareerStepper() {
  return (
    <div className="space-y-0 relative">
      {CAREER_PATH.map((step, i) => {
        const config = statusConfig[step.status];
        const isLast = i === CAREER_PATH.length - 1;

        return (
          <div key={step.id} className="flex gap-4 sm:gap-5 relative">
            <div className="flex flex-col items-center">
              <LevelCircle step={step} />
              {!isLast && (
                <div className={cn('w-0.5 flex-1 min-h-[2rem] sm:min-h-[3rem]', config.line)} />
              )}
            </div>

            <div className={cn('pb-6 sm:pb-8 flex-1 min-w-0', isLast && 'pb-0')}>
              <div className="flex items-center gap-2 sm:gap-3 mb-0.5 flex-wrap">
                <h4
                  className={cn(
                    'text-xs sm:text-sm lg:text-base font-bold',
                    step.status === 'locked' ? 'text-white/20' : 'text-white'
                  )}
                >
                  {step.title}
                </h4>
                {step.badge && (
                  <span className={cn(
                    'text-[7px] sm:text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter',
                    config.badge
                  )}>
                    {step.badge}
                  </span>
                )}
              </div>

              <p
                className={cn(
                  'text-[9px] sm:text-[10px] lg:text-sm leading-relaxed',
                  step.status === 'locked' ? 'text-white/10' : 'text-white/40'
                )}
              >
                {step.description}
              </p>

              <div className="flex items-center gap-3 mt-1.5 sm:mt-2">
                <div className="flex items-center gap-1 text-[7px] sm:text-[8px] font-mono text-white/20">
                  <Star className="w-2.5 h-2.5" />
                  {step.expRequired.toLocaleString()} EXP
                </div>
              </div>

              <MilestoneList milestones={step.milestones} status={step.status} />

              {step.status === 'current' && (
                <button className="mt-2 sm:mt-3 text-[9px] sm:text-[10px] font-bold text-[#D1FF00] flex items-center gap-1 border border-[#D1FF00]/30 px-2.5 sm:px-3 py-1 rounded-lg hover:bg-[#D1FF00]/5 transition-colors">
                  Selesaikan Challenge <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
