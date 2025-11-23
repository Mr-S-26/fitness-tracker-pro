'use client';

import { Star, Info } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string;
  primary_muscles: string[];
  is_compound: boolean;
}

interface ExerciseCardProps {
  exercise: Exercise;
  viewMode: 'grid' | 'list';
  categoryEmoji: Record<string, string>;
  isCustom: boolean;
  onClick: () => void;
}

export default function ExerciseCard({
  exercise,
  viewMode,
  categoryEmoji,
  isCustom,
  onClick,
}: ExerciseCardProps) {
  if (viewMode === 'list') {
    return (
      <button
        onClick={onClick}
        className="w-full bg-white border border-gray-200 rounded-lg p-4 hover:border-purple-500 hover:shadow-md transition-all text-left group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="text-4xl">
              {categoryEmoji[exercise.category] || '🎯'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                  {exercise.name}
                </h3>
                {exercise.is_compound && (
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                    Compound
                  </span>
                )}
                {isCustom && (
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Custom
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="capitalize">{exercise.category}</span>
                <span>•</span>
                <span className="capitalize">{exercise.equipment}</span>
                {exercise.primary_muscles && exercise.primary_muscles.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="capitalize">
                      {exercise.primary_muscles.join(', ')}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Info className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
        </div>
      </button>
    );
  }

  // Grid view
  return (
    <button
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-6 hover:border-purple-500 hover:shadow-lg transition-all text-left group h-full"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="text-5xl">
            {categoryEmoji[exercise.category] || '🎯'}
          </div>
          {isCustom && (
            <div className="p-1.5 bg-orange-100 text-orange-700 rounded-lg">
              <Star className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-600 transition-colors mb-2 line-clamp-2">
          {exercise.name}
        </h3>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full capitalize">
            {exercise.category}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full capitalize">
            {exercise.equipment}
          </span>
          {exercise.is_compound && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
              Compound
            </span>
          )}
        </div>

        {/* Muscles */}
        {exercise.primary_muscles && exercise.primary_muscles.length > 0 && (
          <div className="mt-auto">
            <p className="text-xs text-gray-500 mb-1">Primary Muscles:</p>
            <p className="text-sm text-gray-700 capitalize line-clamp-2">
              {exercise.primary_muscles.join(', ')}
            </p>
          </div>
        )}

        {/* View Details */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm">
          <span className="text-purple-600 font-medium group-hover:text-purple-700">
            View Details
          </span>
          <Info className="w-4 h-4 text-purple-600 group-hover:text-purple-700" />
        </div>
      </div>
    </button>
  );
}