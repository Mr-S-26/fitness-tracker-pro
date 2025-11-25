'use client';

import { useState, useEffect } from 'react';
import { Home, Building2, Warehouse, Trees, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { OnboardingFormData, TrainingLocation, EquipmentTypeReference } from '@/types/database';

interface EquipmentStepProps {
  formData: OnboardingFormData;
  setFormData: (data: OnboardingFormData) => void;
}

const LOCATION_OPTIONS: Array<{
  value: TrainingLocation;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { value: 'home', label: 'Home Gym', icon: Home },
  { value: 'commercial_gym', label: 'Commercial Gym', icon: Building2 },
  { value: 'garage_gym', label: 'Garage/Basement', icon: Warehouse },
  { value: 'outdoor', label: 'Outdoor/Park', icon: Trees },
];

export default function EquipmentStep({ formData, setFormData }: EquipmentStepProps) {
  const supabase = createClient();
  const [equipmentOptions, setEquipmentOptions] = useState<EquipmentTypeReference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEquipment = async () => {
      const { data } = await supabase
        .from('equipment_types_reference')
        .select('*')
        .order('category', { ascending: true });
      
      if (data) {
        setEquipmentOptions(data);
      }
      setLoading(false);
    };
    
    loadEquipment();
  }, [supabase]);

  const toggleEquipment = (equipmentId: string) => {
    const current = formData.available_equipment || [];
    
    // If selecting 'none', clear all others
    if (equipmentId === 'none') {
      setFormData({ ...formData, available_equipment: ['none'] });
      return;
    }
    
    // If selecting anything else, remove 'none'
    let updated = current.filter(id => id !== 'none');
    
    if (updated.includes(equipmentId)) {
      updated = updated.filter((id) => id !== equipmentId);
    } else {
      updated = [...updated, equipmentId];
    }
    
    setFormData({ ...formData, available_equipment: updated });
  };

  const selectAllGymEquipment = () => {
    const allIds = equipmentOptions
      .filter(eq => eq.id !== 'none')
      .map(eq => eq.id);
    setFormData({ ...formData, available_equipment: allIds });
  };

  const clearAll = () => {
    setFormData({ ...formData, available_equipment: [] });
  };

  // Group equipment by category
  const equipmentByCategory = equipmentOptions.reduce((acc, eq) => {
    if (!acc[eq.category]) {
      acc[eq.category] = [];
    }
    acc[eq.category].push(eq);
    return acc;
  }, {} as Record<string, EquipmentTypeReference[]>);

  const categoryLabels: Record<string, string> = {
    free_weights: '🏋️ Free Weights',
    bodyweight: '🤸 Bodyweight',
    equipment: '🛠️ Equipment',
    machines: '⚙️ Machines',
    accessories: '🎯 Accessories',
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          What Equipment Do You Have?
        </h2>
        <p className="text-gray-600">
          This is crucial! I'll only suggest exercises you can actually do with your equipment.
        </p>
      </div>

      {/* Training Location */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Where do you train?
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {LOCATION_OPTIONS.map((location) => {
            const Icon = location.icon;
            const isSelected = formData.training_location === location.value;

            return (
              <button
                key={location.value}
                onClick={() => setFormData({ ...formData, training_location: location.value })}
                className={`p-4 border-2 rounded-xl transition-all ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-purple-600' : 'text-gray-400'}`} />
                <div className="text-sm font-medium text-gray-900">{location.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Equipment Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Available Equipment
          </label>
          <div className="flex gap-2">
            {formData.training_location === 'commercial_gym' && (
              <button
                onClick={selectAllGymEquipment}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium"
              >
                Select All (Full Gym)
              </button>
            )}
            {formData.available_equipment && formData.available_equipment.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-gray-600 hover:text-gray-700 font-medium"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(equipmentByCategory).map(([category, items]) => (
              <div key={category}>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  {categoryLabels[category] || category}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {items.map((equipment) => {
                    const isSelected = formData.available_equipment?.includes(equipment.id);
                    const isNone = equipment.id === 'none';

                    return (
                      <button
                        key={equipment.id}
                        onClick={() => toggleEquipment(equipment.id)}
                        className={`p-4 border-2 rounded-xl transition-all text-left relative ${
                          isSelected
                            ? isNone
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-2">{equipment.icon}</div>
                        <div className="text-sm font-medium text-gray-900 leading-tight">
                          {equipment.label}
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <div className="w-5 h-5 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {formData.available_equipment && formData.available_equipment.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-2">
            🎯 Selected Equipment ({formData.available_equipment.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {formData.available_equipment.map((equipId) => {
              const equipment = equipmentOptions.find(eq => eq.id === equipId);
              if (!equipment) return null;
              
              return (
                <span
                  key={equipId}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-purple-200 rounded-full text-sm"
                >
                  <span>{equipment.icon}</span>
                  <span className="text-gray-700">{equipment.label}</span>
                  <button
                    onClick={() => toggleEquipment(equipId)}
                    className="ml-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}