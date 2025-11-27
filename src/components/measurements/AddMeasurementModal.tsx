'use client';

import { useState } from 'react';
import { X, Scale, Percent, Ruler } from 'lucide-react';
import { BodyMeasurement } from '@/types/database';

interface Props {
  userId: string;
  measurement: BodyMeasurement | null;
  onClose: (newMeasurement?: BodyMeasurement) => void;
}

export default function AddMeasurementModal({ userId, measurement, onClose }: Props) {
  const isEditing = !!measurement;
  
  const [formData, setFormData] = useState({
    measured_at: measurement?.measured_at 
      ? new Date(measurement.measured_at).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    weight_kg: measurement?.weight_kg?.toString() || '',
    body_fat_percentage: measurement?.body_fat_percentage?.toString() || '',
    neck_cm: measurement?.neck_cm?.toString() || '',
    shoulders_cm: measurement?.shoulders_cm?.toString() || '',
    chest_cm: measurement?.chest_cm?.toString() || '',
    waist_cm: measurement?.waist_cm?.toString() || '',
    hips_cm: measurement?.hips_cm?.toString() || '',
    bicep_left_cm: measurement?.bicep_left_cm?.toString() || '',
    bicep_right_cm: measurement?.bicep_right_cm?.toString() || '',
    forearm_left_cm: measurement?.forearm_left_cm?.toString() || '',
    forearm_right_cm: measurement?.forearm_right_cm?.toString() || '',
    thigh_left_cm: measurement?.thigh_left_cm?.toString() || '',
    thigh_right_cm: measurement?.thigh_right_cm?.toString() || '',
    calf_left_cm: measurement?.calf_left_cm?.toString() || '',
    calf_right_cm: measurement?.calf_right_cm?.toString() || '',
    notes: measurement?.notes || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate at least one measurement is provided
      const hasWeight = formData.weight_kg !== '';
      const hasBodyFat = formData.body_fat_percentage !== '';
      const hasAnyMeasurement = Object.entries(formData).some(
        ([key, value]) => key.endsWith('_cm') && value !== ''
      );

      if (!hasWeight && !hasBodyFat && !hasAnyMeasurement) {
        setError('Please enter at least one measurement');
        setIsSubmitting(false);
        return;
      }

      // Prepare payload
      const payload: any = {
        user_id: userId,
        measured_at: new Date(formData.measured_at).toISOString(),
      };

      // Add numeric fields if they have values
      const numericFields = [
        'weight_kg',
        'body_fat_percentage',
        'neck_cm',
        'shoulders_cm',
        'chest_cm',
        'waist_cm',
        'hips_cm',
        'bicep_left_cm',
        'bicep_right_cm',
        'forearm_left_cm',
        'forearm_right_cm',
        'thigh_left_cm',
        'thigh_right_cm',
        'calf_left_cm',
        'calf_right_cm',
      ];

      numericFields.forEach(field => {
        const value = formData[field as keyof typeof formData];
        if (value !== '') {
          payload[field] = parseFloat(value as string);
        }
      });

      // Add notes if provided
      if (formData.notes.trim()) {
        payload.notes = formData.notes.trim();
      }

      // Make API request
      const url = isEditing
        ? `/api/measurements/${measurement.id}`
        : '/api/measurements';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save measurement');
      }

      const savedMeasurement = await response.json();
      onClose(savedMeasurement);
    } catch (err) {
      console.error('Error saving measurement:', err);
      setError(err instanceof Error ? err.message : 'Failed to save measurement');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Measurement' : 'Add New Measurement'}
          </h2>
          <button
            onClick={() => onClose()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Measurement Date *
            </label>
            <input
              type="date"
              name="measured_at"
              value={formData.measured_at}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Core Metrics */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Scale className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Core Metrics</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight_kg"
                  value={formData.weight_kg}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  max="500"
                  placeholder="e.g., 75.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Body Fat %
                </label>
                <input
                  type="number"
                  name="body_fat_percentage"
                  value={formData.body_fat_percentage}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="e.g., 18.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Upper Body Measurements */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Ruler className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Upper Body (cm)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Neck</label>
                <input
                  type="number"
                  name="neck_cm"
                  value={formData.neck_cm}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  placeholder="cm"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shoulders</label>
                <input
                  type="number"
                  name="shoulders_cm"
                  value={formData.shoulders_cm}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  placeholder="cm"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chest</label>
                <input
                  type="number"
                  name="chest_cm"
                  value={formData.chest_cm}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  placeholder="cm"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Core Measurements */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Percent className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Core (cm)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Waist</label>
                <input
                  type="number"
                  name="waist_cm"
                  value={formData.waist_cm}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  placeholder="cm"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hips</label>
                <input
                  type="number"
                  name="hips_cm"
                  value={formData.hips_cm}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  placeholder="cm"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Arms */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Arms (cm)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bicep Left</label>
                <input
                  type="number"
                  name="bicep_left_cm"
                  value={formData.bicep_left_cm}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  placeholder="cm"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bicep Right</label>
                <input
                  type="number"
                  name="bicep_right_cm"
                  value={formData.bicep_right_cm}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  placeholder="cm"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Forearm Left</label>
                <input
                  type="number"
                  name="forearm_left_cm"
                  value={formData.forearm_left_cm}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  placeholder="cm"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Forearm Right</label>
                <input
                  type="number"
                  name="forearm_right_cm"
                  value={formData.forearm_right_cm}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  placeholder="cm"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Legs */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Legs (cm)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thigh Left</label>
                <input
                  type="number"
                  name="thigh_left_cm"
                  value={formData.thigh_left_cm}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  placeholder="cm"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thigh Right</label>
                <input
                  type="number"
                  name="thigh_right_cm"
                  value={formData.thigh_right_cm}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  placeholder="cm"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Calf Left</label>
                <input
                  type="number"
                  name="calf_left_cm"
                  value={formData.calf_left_cm}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  placeholder="cm"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Calf Right</label>
                <input
                  type="number"
                  name="calf_right_cm"
                  value={formData.calf_right_cm}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  placeholder="cm"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Any additional notes about this measurement..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => onClose()}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Measurement' : 'Save Measurement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}