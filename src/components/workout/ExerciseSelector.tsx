'use client';

import { useState, useMemo } from 'react';
import { Search, X, Dumbbell, Filter } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string;
  primary_muscles: string[];
  is_compound: boolean;
}

interface ExerciseSelectorProps {
  exercises: Exercise[];
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

export default function ExerciseSelector({ exercises, onSelect, onClose }: ExerciseSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');

  // Get unique categories and equipment
  const categories = useMemo(() => {
    const cats = new Set(exercises.map(ex => ex.category));
    return ['all', ...Array.from(cats)];
  }, [exercises]);

  const equipmentTypes = useMemo(() => {
    const equip = new Set(exercises.map(ex => ex.equipment));
    return ['all', ...Array.from(equip)];
  }, [exercises]);

  // Filter exercises
  const filteredExercises = useMemo(() => {
    return exercises.filter(exercise => {
      const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
      const matchesEquipment = selectedEquipment === 'all' || exercise.equipment === selectedEquipment;
      
      return matchesSearch && matchesCategory && matchesEquipment;
    });
  }, [exercises, searchQuery, selectedCategory, selectedEquipment]);

  // Category emoji map
  const categoryEmoji: Record<string, string> = {
    chest: '💪',
    back: '🦾',
    shoulders: '🏋️',
    biceps: '💪',
    triceps: '💪',
    legs: '🦵',
    core: '🔥',
    cardio: '🏃',
    full_body: '🤸',
    other: '🎯',
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Select Exercise</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercises..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              autoFocus
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            <div className="flex items-center gap-2 text-sm">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={selectedEquipment}
                onChange={(e) => setSelectedEquipment(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              >
                {equipmentTypes.map(equip => (
                  <option key={equip} value={equip}>
                    {equip === 'all' ? 'All Equipment' : equip.charAt(0).toUpperCase() + equip.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredExercises.length === 0 ? (
            <div className="text-center py-12">
              <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No exercises found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredExercises.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => onSelect(exercise)}
                  className="w-full text-left p-4 bg-white border border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">
                          {categoryEmoji[exercise.category] || '🎯'}
                        </span>
                        <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {exercise.name}
                        </h3>
                        {exercise.is_compound && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                            Compound
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
                            <span className="capitalize">{exercise.primary_muscles[0]}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Showing {filteredExercises.length} of {exercises.length} exercises
          </p>
        </div>
      </div>
    </div>
  );
}