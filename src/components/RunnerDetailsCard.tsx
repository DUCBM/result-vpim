import React from 'react';
import { Runner } from '../types';
import { Timer, Trophy, Calendar, Award, User, Medal } from 'lucide-react';
import { getRunnerSplitData } from '../utils/runnerSplits';
import { getDemoPhoto } from '../data/mockRunners';
import { useLanguage } from '../i18n/LanguageContext';

interface RunnerDetailsCardProps {
  runner: Runner;
}

export const RunnerDetailsCard: React.FC<RunnerDetailsCardProps> = ({ runner }) => {
  const { t } = useLanguage();
  const splits = getRunnerSplitData(runner);
  const displayPhoto = runner.photoUrl || getDemoPhoto(runner.bib) || getDemoPhoto(runner.name);
  const avgPace = runner.avgPace || runner.pace || splits?.avgPace;

  return (
    <div className="w-full space-y-4" id="runner-details-card">
      {/* 1. ATHLETE PROFILE HEADER */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3 min-w-0">
          {displayPhoto ? (
            <img
              src={displayPhoto}
              alt={runner.name}
              className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 font-semibold text-base flex items-center justify-center shrink-0 border border-slate-200/80">
              {runner.gender === 'F' ? '♀' : '♂'}
            </div>
          )}

          <div className="min-w-0 space-y-0.5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
              {runner.name}
            </h3>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-800 font-neue-plak">
                BIB {runner.bib}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="font-medium text-[#009A44]">
                {runner.distance}
              </span>
              {runner.ag && runner.ag !== '-' && runner.ag !== 'null' && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span>{runner.ag}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-medium shrink-0">
          <Award className="w-3 h-3 text-emerald-600" />
          {t('finisherBadge')}
        </span>
      </div>

      {/* 2. PRIMARY TIMING BLOCK (CHIP TIME & GUN TIME) */}
      <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/70">
        <div className="grid grid-cols-2 divide-x divide-slate-200/80">
          {/* CHIP TIME (HERO) */}
          <div className="pr-3 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Timer className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] font-semibold tracking-wide text-slate-600 uppercase">
                {t('chipTime')}
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-neue-plak text-slate-900 tracking-tight tabular-nums">
              {runner.chipTime}
            </div>
            <p className="text-[11px] text-slate-500">
              {avgPace && avgPace !== '--:--' ? (
                <>{t('avgPace')}: <strong className="text-slate-700 font-neue-plak font-semibold">{avgPace}</strong>/km</>
              ) : (
                t('officialTimeNotice')
              )}
            </p>
          </div>

          {/* GUN TIME */}
          <div className="pl-3 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="text-[11px] font-semibold tracking-wide text-slate-600 uppercase">
                {t('gunTime')}
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-semibold font-neue-plak text-slate-700 tracking-tight tabular-nums">
              {runner.gunTime}
            </div>
            <p className="text-[11px] text-slate-500">
              {t('startTimeNotice')}
            </p>
          </div>
        </div>
      </div>

      {/* 3. RANKINGS (COHESIVE, ELEGANT 3-TILES) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {/* OVERALL */}
        <div className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200/80 text-center space-y-1">
          <div className="text-[11px] font-medium text-slate-500 flex items-center justify-center gap-1">
            <Trophy className="w-3 h-3 text-amber-600 shrink-0" />
            <span className="truncate">{t('overallRank')}</span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-neue-plak text-slate-900 tabular-nums">
            #{runner.overallRank}
          </div>
          <div className="text-[10px] text-slate-400">{t('overallLabel')}</div>
        </div>

        {/* GENDER */}
        <div className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200/80 text-center space-y-1">
          <div className="text-[11px] font-medium text-slate-500 flex items-center justify-center gap-1">
            <User className="w-3 h-3 text-slate-500 shrink-0" />
            <span className="truncate">{runner.gender === 'F' ? t('genderRankFemale') : t('genderRankMale')}</span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-neue-plak text-slate-900 tabular-nums">
            #{runner.genderRank}
          </div>
          <div className="text-[10px] text-slate-400">{runner.gender === 'F' ? t('genderLabelFemale') : t('genderLabelMale')}</div>
        </div>

        {/* AGE GROUP */}
        <div className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200/80 text-center space-y-1">
          <div className="text-[11px] font-medium text-slate-500 flex items-center justify-center gap-1">
            <Medal className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate">{t('ageGroupRank')}</span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-neue-plak text-slate-900 tabular-nums">
            #{runner.ageGroupRank}
          </div>
          <div className="text-[10px] text-slate-400 truncate">{runner.ag || t('ageGroupDesc')}</div>
        </div>
      </div>

      {/* 4. FOOTER NOTE */}
      <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-slate-400" />
          {runner.date || t('season2026')}
        </span>
        <span>
          {t('distanceLabel')} {runner.distance}
        </span>
      </div>
    </div>
  );
};
