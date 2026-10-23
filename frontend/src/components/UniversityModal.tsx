import React from 'react';
import { X, Award, MapPin, Building, Hash, TrendingUp } from 'lucide-react';
import { UniversityItem } from '../types';

interface UniversityModalProps {
  university: UniversityItem | null;
  onClose: () => void;
  avgScore?: number;
}

export const UniversityModal: React.FC<UniversityModalProps> = ({
  university,
  onClose,
  avgScore = 53.89
}) => {
  if (!university) return null;

  const scoreDiff = (university.score - avgScore).toFixed(2);
  const isAboveAvg = university.score >= avgScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold tracking-wider uppercase mb-1">
            <Building className="w-3.5 h-3.5" />
            <span>NIRF University Profile</span>
          </div>
          <h2 className="text-xl font-bold leading-tight pr-6">{university.name}</h2>
          <div className="flex items-center space-x-2 text-xs text-slate-300 mt-2">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            <span>{university.city}, {university.state}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4">
              <div className="flex items-center space-x-1.5 text-xs text-indigo-700 font-semibold mb-1">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>NIRF All-India Rank</span>
              </div>
              <div className="text-3xl font-extrabold text-indigo-950">
                #{university.rank}
              </div>
              <p className="text-[11px] text-indigo-600 font-medium mt-1">
                {university.rank <= 10 ? 'Top 10 Tier Premier' : university.rank <= 50 ? 'Top 50 University' : 'Top 100 Accredited'}
              </p>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4">
              <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-semibold mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Composite Score</span>
              </div>
              <div className="text-3xl font-extrabold text-emerald-950">
                {university.score.toFixed(2)}
              </div>
              <p className="text-[11px] text-emerald-700 font-medium mt-1">
                {isAboveAvg ? `+${scoreDiff} above avg` : `${scoreDiff} below avg`}
              </p>
            </div>
          </div>

          {/* Details Table */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500 flex items-center space-x-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>Institute ID:</span>
              </span>
              <span className="font-mono font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                {university.institute_id || 'N/A'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500">State:</span>
              <span className="font-medium text-slate-800">{university.state}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
              <span className="text-slate-500">City:</span>
              <span className="font-medium text-slate-800">{university.city}</span>
            </div>

            <div className="flex justify-between items-start py-1">
              <span className="text-slate-500">Full Raw Name:</span>
              <span className="font-medium text-slate-700 text-right max-w-[260px]">
                {university.raw_name}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 text-center">
            Data sourced directly from NIRF rankings CSV dataset.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-100/70 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
