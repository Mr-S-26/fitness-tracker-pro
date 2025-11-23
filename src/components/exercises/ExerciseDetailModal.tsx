'use client';

import { X, Edit, Trash2, Play, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  instructions: string;
  tips: string[];
  common_mistakes: string[];
  video_url: string | null;
  image_url: string | null;
  is_compound: boolean;
}

interface ExerciseDetailModalProps {
  exercise: Exercise;
  isCustom: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export default function ExerciseDetailModal({
  exercise,
  isCustom,
  onClose,
  onEdit,
}: ExerciseDetailModalProps) {
  const supabase = createClient();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!isCustom) return;

    if (!confirm(`Are you sure you want to delete "${exercise.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exercise.id);

      if (error) throw error;

      alert('Exercise deleted successfully');
      onClose();
      window.location.reload(); // Refresh the page
    } catch (error) {
      console.error('Error deleting exercise:', error);
      alert('Failed to delete exercise');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {exercise.name}
                </h2>
                {exercise.is_compound && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                    Compound
                  </span>
                )}
                {isCustom && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                    Custom
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="capitalize">{exercise.category}</span>
                <span>•</span>
                <span className="capitalize">{exercise.equipment}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Action Buttons */}
          {isCustom && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Muscles */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Target Muscles
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Primary Muscles */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-purple-900 mb-2">
                  Primary
                </h4>
                {exercise.primary_muscles && exercise.primary_muscles.length > 0 ? (
                  <ul className="space-y-1">
                    {exercise.primary_muscles.map((muscle, index) => (
                      <li
                        key={index}
                        className="text-sm text-purple-700 capitalize flex items-center gap-2"
                      >
                        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                        {muscle}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-purple-600">Not specified</p>
                )}
              </div>

              {/* Secondary Muscles */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Secondary
                </h4>
                {exercise.secondary_muscles && exercise.secondary_muscles.length > 0 ? (
                  <ul className="space-y-1">
                    {exercise.secondary_muscles.map((muscle, index) => (
                      <li
                        key={index}
                        className="text-sm text-blue-700 capitalize flex items-center gap-2"
                      >
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                        {muscle}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-blue-600">Not specified</p>
                )}
              </div>
            </div>
          </div>

          {/* Video/Image */}
          {(exercise.video_url || exercise.image_url) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Demonstration
              </h3>
              {exercise.video_url && (
                <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Play className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">Video Tutorial</p>
                      <p className="text-sm text-gray-600">Watch demonstration</p>
                    </div>
                  </div>
                  <a
                    href={exercise.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Watch
                  </a>
                </div>
              )}
              {exercise.image_url && (
                <img
                  src={exercise.image_url}
                  alt={exercise.name}
                  className="w-full rounded-lg mt-3"
                />
              )}
            </div>
          )}

          {/* Instructions */}
          {exercise.instructions && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-gray-600" />
                Instructions
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {exercise.instructions}
                </p>
              </div>
            </div>
          )}

          {/* Tips */}
          {exercise.tips && exercise.tips.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Tips for Success
              </h3>
              <ul className="space-y-2">
                {exercise.tips.map((tip, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-3"
                  >
                    <div className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-sm text-green-900">{tip}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Common Mistakes */}
          {exercise.common_mistakes && exercise.common_mistakes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Common Mistakes to Avoid
              </h3>
              <ul className="space-y-2">
                {exercise.common_mistakes.map((mistake, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-900">{mistake}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}