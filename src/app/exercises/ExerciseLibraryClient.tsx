'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Plus,
  Grid,
  List,
  X,
  Dumbbell,
  Star,
  ChevronLeft,
  TrendingUp,
} from 'lucide-react';
import ExerciseCard from '@/components/exercises/ExerciseCard';
import ExerciseDetailModal from '@/components/exercises/ExerciseDetailModal';
import CreateExerciseModal from '@/components/exercises/CreateExerciseModal';

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
  user_id: string | null;
  is_public: boolean;
  is_compound: boolean;
  created_at: string;
}

interface ExerciseLibraryClientProps {
  exercises: Exercise[];
  userId: string;
  customExercisesCount: number;
}

export default function ExerciseLibraryClient({
  exercises,
  userId,
  customExercisesCount,
}: ExerciseLibraryClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [showCustomOnly, setShowCustomOnly] = useState(false);
  const [showCompoundOnly, setShowCompoundOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Get unique categories and equipment
  const categories = useMemo(() => {
    const cats = new Set(exercises.map((ex) => ex.category));
    return ['all', ...Array.from(cats).sort()];
  }, [exercises]);

  const equipmentTypes = useMemo(() => {
    const equip = new Set(exercises.map((ex) => ex.equipment));
    return ['all', ...Array.from(equip).sort()];
  }, [exercises]);

  // Filter exercises
  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesSearch = exercise.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || exercise.category === selectedCategory;
      const matchesEquipment =
        selectedEquipment === 'all' || exercise.equipment === selectedEquipment;
      const matchesCustom = !showCustomOnly || exercise.user_id === userId;
      const matchesCompound = !showCompoundOnly || exercise.is_compound;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesEquipment &&
        matchesCustom &&
        matchesCompound
      );
    });
  }, [
    exercises,
    searchQuery,
    selectedCategory,
    selectedEquipment,
    showCustomOnly,
    showCompoundOnly,
    userId,
  ]);

  // Category emoji map
  const categoryEmoji: Record<string, string> = {
    chest: '💪',
    back: '🦾',
    shoulders: '🏋️',
    biceps: '💪',
    triceps: '💪',
    legs: '🦵',
    glutes: '🍑',
    core: '🔥',
    cardio: '🏃',
    full_body: '🤸',
    olympic: '🏅',
    powerlifting: '⚡',
    other: '🎯',
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedEquipment('all');
    setShowCustomOnly(false);
    setShowCompoundOnly(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Exercise Library
                </h1>
                <p className="text-sm text-gray-600">
                  {filteredExercises.length} exercises available
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Create Exercise</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exercises by name..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                showFilters
                  ? 'bg-purple-50 border-purple-500 text-purple-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
            </button>

            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${
                  viewMode === 'grid'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${
                  viewMode === 'list'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'all'
                          ? 'All Categories'
                          : cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Equipment Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Equipment
                  </label>
                  <select
                    value={selectedEquipment}
                    onChange={(e) => setSelectedEquipment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {equipmentTypes.map((equip) => (
                      <option key={equip} value={equip}>
                        {equip === 'all'
                          ? 'All Equipment'
                          : equip.charAt(0).toUpperCase() + equip.slice(1).replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={showCompoundOnly}
                        onChange={(e) => setShowCompoundOnly(e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">
                        Compound Only
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={showCustomOnly}
                        onChange={(e) => setShowCustomOnly(e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">
                        My Custom Exercises ({customExercisesCount})
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {(selectedCategory !== 'all' ||
                selectedEquipment !== 'all' ||
                showCustomOnly ||
                showCompoundOnly ||
                searchQuery) && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {selectedCategory !== 'all' && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      {selectedCategory}
                    </span>
                  )}
                  {selectedEquipment !== 'all' && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {selectedEquipment}
                    </span>
                  )}
                  {showCompoundOnly && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Compound
                    </span>
                  )}
                  {showCustomOnly && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                      Custom
                    </span>
                  )}
                  <button
                    onClick={clearFilters}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                Total: <span className="font-semibold text-gray-900">{exercises.length}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                Custom: <span className="font-semibold text-gray-900">{customExercisesCount}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                Filtered: <span className="font-semibold text-gray-900">{filteredExercises.length}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Exercise Grid/List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredExercises.length === 0 ? (
          <div className="text-center py-20">
            <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No exercises found
            </h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search or filters
            </p>
            <button
              onClick={clearFilters}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {filteredExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                viewMode={viewMode}
                categoryEmoji={categoryEmoji}
                isCustom={exercise.user_id === userId}
                onClick={() => setSelectedExercise(exercise)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          isCustom={selectedExercise.user_id === userId}
          onClose={() => setSelectedExercise(null)}
          onEdit={() => {
            setSelectedExercise(null);
            setShowCreateModal(true);
          }}
        />
      )}

      {/* Create Exercise Modal */}
      {showCreateModal && (
        <CreateExerciseModal
          userId={userId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}