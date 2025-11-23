'use client';

import { useState } from 'react';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface CreateExerciseModalProps {
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'legs',
  'glutes',
  'core',
  'cardio',
  'full_body',
  'olympic',
  'powerlifting',
  'other',
];

const EQUIPMENT_TYPES = [
  'barbell',
  'dumbbell',
  'machine',
  'cable',
  'bodyweight',
  'band',
  'kettlebell',
  'plate',
  'smith_machine',
  'ez_bar',
  'trap_bar',
  'other',
  'none',
];

export default function CreateExerciseModal({
  userId,
  onClose,
  onSuccess,
}: CreateExerciseModalProps) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('other');
  const [equipment, setEquipment] = useState('other');
  const [isCompound, setIsCompound] = useState(false);
  const [primaryMuscles, setPrimaryMuscles] = useState<string[]>([]);
  const [secondaryMuscles, setSecondaryMuscles] = useState<string[]>([]);
  const [instructions, setInstructions] = useState('');
  const [tips, setTips] = useState<string[]>(['']);
  const [commonMistakes, setCommonMistakes] = useState<string[]>(['']);
  const [videoUrl, setVideoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Muscle input states
  const [primaryMuscleInput, setPrimaryMuscleInput] = useState('');
  const [secondaryMuscleInput, setSecondaryMuscleInput] = useState('');

  const addPrimaryMuscle = () => {
    if (primaryMuscleInput.trim()) {
      setPrimaryMuscles([...primaryMuscles, primaryMuscleInput.trim()]);
      setPrimaryMuscleInput('');
    }
  };

  const removePrimaryMuscle = (index: number) => {
    setPrimaryMuscles(primaryMuscles.filter((_, i) => i !== index));
  };

  const addSecondaryMuscle = () => {
    if (secondaryMuscleInput.trim()) {
      setSecondaryMuscles([...secondaryMuscles, secondaryMuscleInput.trim()]);
      setSecondaryMuscleInput('');
    }
  };

  const removeSecondaryMuscle = (index: number) => {
    setSecondaryMuscles(secondaryMuscles.filter((_, i) => i !== index));
  };

  const addTip = () => {
    setTips([...tips, '']);
  };

  const updateTip = (index: number, value: string) => {
    const updated = [...tips];
    updated[index] = value;
    setTips(updated);
  };

  const removeTip = (index: number) => {
    setTips(tips.filter((_, i) => i !== index));
  };

  const addMistake = () => {
    setCommonMistakes([...commonMistakes, '']);
  };

  const updateMistake = (index: number, value: string) => {
    const updated = [...commonMistakes];
    updated[index] = value;
    setCommonMistakes(updated);
  };

  const removeMistake = (index: number) => {
    setCommonMistakes(commonMistakes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Exercise name is required');
      return;
    }

    setSaving(true);

    try {
      const { error: insertError } = await supabase.from('exercises').insert({
        name: name.trim(),
        category,
        equipment,
        is_compound: isCompound,
        primary_muscles: primaryMuscles,
        secondary_muscles: secondaryMuscles,
        instructions: instructions.trim() || null,
        tips: tips.filter((t) => t.trim()),
        common_mistakes: commonMistakes.filter((m) => m.trim()),
        video_url: videoUrl.trim() || null,
        image_url: imageUrl.trim() || null,
        user_id: userId,
        is_public: false,
      });

      if (insertError) throw insertError;

      onSuccess();
    } catch (err) {
      console.error('Error creating exercise:', err);
      setError(err instanceof Error ? err.message : 'Failed to create exercise');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Create Custom Exercise
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Basic Information</h3>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exercise Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Bulgarian Split Squat"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>

            {/* Category & Equipment */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equipment *
                </label>
                <select
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                >
                  {EQUIPMENT_TYPES.map((equip) => (
                    <option key={equip} value={equip}>
                      {equip.charAt(0).toUpperCase() + equip.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Compound Checkbox */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isCompound}
                onChange={(e) => setIsCompound(e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">
                This is a compound exercise (works multiple muscle groups)
              </span>
            </label>
          </div>

          {/* Muscles */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Target Muscles</h3>

            {/* Primary Muscles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Muscles
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={primaryMuscleInput}
                  onChange={(e) => setPrimaryMuscleInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrimaryMuscle())}
                  placeholder="e.g., quadriceps"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={addPrimaryMuscle}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {primaryMuscles.map((muscle, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2"
                  >
                    {muscle}
                    <button
                      type="button"
                      onClick={() => removePrimaryMuscle(index)}
                      className="hover:text-purple-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Secondary Muscles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Muscles
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={secondaryMuscleInput}
                  onChange={(e) => setSecondaryMuscleInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSecondaryMuscle())}
                  placeholder="e.g., glutes"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={addSecondaryMuscle}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {secondaryMuscles.map((muscle, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
                  >
                    {muscle}
                    <button
                      type="button"
                      onClick={() => removeSecondaryMuscle(index)}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructions
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Describe how to perform this exercise..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Tips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Tips
              </label>
              <button
                type="button"
                onClick={addTip}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                + Add Tip
              </button>
            </div>
            <div className="space-y-2">
              {tips.map((tip, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={tip}
                    onChange={(e) => updateTip(index, e.target.value)}
                    placeholder="Enter a tip..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  {tips.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTip(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Common Mistakes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Common Mistakes
              </label>
              <button
                type="button"
                onClick={addMistake}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                + Add Mistake
              </button>
            </div>
            <div className="space-y-2">
              {commonMistakes.map((mistake, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={mistake}
                    onChange={(e) => updateMistake(index, e.target.value)}
                    placeholder="Enter a common mistake..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  {commonMistakes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMistake(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Media URLs */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Media (Optional)</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video URL
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !name.trim()}
            className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Exercise'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}