'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Scale, TrendingUp, TrendingDown, Plus, Edit2, Trash2, Calendar } from 'lucide-react';
import { BodyMeasurement } from '@/types/database';
import AddMeasurementModal from '@/components/measurements/AddMeasurementModal';
import { useRouter } from 'next/navigation';

interface Props {
  userId: string;
  measurements: BodyMeasurement[];
}

export default function MeasurementsClient({ userId, measurements: initialMeasurements }: Props) {
  const router = useRouter();
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>(initialMeasurements);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<BodyMeasurement | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Calculate statistics
  const stats = {
    totalEntries: measurements.length,
    latestWeight: measurements[0]?.weight_kg || 0,
    latestBodyFat: measurements[0]?.body_fat_percentage || 0,
    weightChange: 0,
    bodyFatChange: 0,
  };

  // Calculate changes if we have at least 2 entries
  if (measurements.length >= 2) {
    const latest = measurements[0];
    const previous = measurements[1];
    
    if (latest.weight_kg && previous.weight_kg) {
      stats.weightChange = latest.weight_kg - previous.weight_kg;
    }
    
    if (latest.body_fat_percentage && previous.body_fat_percentage) {
      stats.bodyFatChange = latest.body_fat_percentage - previous.body_fat_percentage;
    }
  }

  // Prepare chart data (reverse for chronological order)
  const chartData = [...measurements]
    .reverse()
    .map(m => ({
      date: new Date(m.measured_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: m.weight_kg || null,
      bodyFat: m.body_fat_percentage || null,
    }))
    .filter(d => d.weight || d.bodyFat);

  const handleAddMeasurement = () => {
    setEditingMeasurement(null);
    setIsModalOpen(true);
  };

  const handleEditMeasurement = (measurement: BodyMeasurement) => {
    setEditingMeasurement(measurement);
    setIsModalOpen(true);
  };

  const handleDeleteMeasurement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this measurement?')) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/measurements/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete measurement');

      // Remove from local state
      setMeasurements(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting measurement:', error);
      alert('Failed to delete measurement. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleModalClose = (newMeasurement?: BodyMeasurement) => {
    setIsModalOpen(false);
    setEditingMeasurement(null);

    if (newMeasurement) {
      // Refresh the page to get updated data
      router.refresh();
      
      // Update local state
      if (editingMeasurement) {
        // Update existing
        setMeasurements(prev =>
          prev.map(m => m.id === newMeasurement.id ? newMeasurement : m)
        );
      } else {
        // Add new
        setMeasurements(prev => [newMeasurement, ...prev]);
      }
    }
  };

  const formatChange = (value: number, unit: string = '') => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}${unit}`;
  };

  const TrendIcon = ({ value }: { value: number }) => {
    if (value === 0) return null;
    return value > 0 ? (
      <TrendingUp className="w-4 h-4 text-red-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-green-500" />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Body Measurements</h1>
            <p className="text-gray-600">Track your physical progress over time</p>
          </div>
          <button
            onClick={handleAddMeasurement}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add Measurement
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Entries */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm text-gray-600">Total Entries</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalEntries}</p>
          </div>

          {/* Latest Weight */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Scale className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-600">Current Weight</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900">
                {stats.latestWeight > 0 ? stats.latestWeight.toFixed(1) : '—'}
              </p>
              <span className="text-lg text-gray-500">kg</span>
            </div>
            {stats.weightChange !== 0 && (
              <div className="flex items-center gap-1 mt-2">
                <TrendIcon value={stats.weightChange} />
                <span className={`text-sm font-medium ${stats.weightChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatChange(stats.weightChange, ' kg')}
                </span>
                <span className="text-xs text-gray-500">vs last</span>
              </div>
            )}
          </div>

          {/* Latest Body Fat */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-sm text-gray-600">Body Fat %</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900">
                {stats.latestBodyFat > 0 ? stats.latestBodyFat.toFixed(1) : '—'}
              </p>
              <span className="text-lg text-gray-500">%</span>
            </div>
            {stats.bodyFatChange !== 0 && (
              <div className="flex items-center gap-1 mt-2">
                <TrendIcon value={stats.bodyFatChange} />
                <span className={`text-sm font-medium ${stats.bodyFatChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatChange(stats.bodyFatChange, '%')}
                </span>
                <span className="text-xs text-gray-500">vs last</span>
              </div>
            )}
          </div>

          {/* Consistency */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-600">Tracking</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {measurements.length >= 4 ? 'Excellent' : measurements.length >= 2 ? 'Good' : 'Start'}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {measurements.length < 4 ? 'Add more entries for trends' : 'Great tracking!'}
            </p>
          </div>
        </div>

        {/* Charts */}
        {chartData.length >= 2 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Weight Chart */}
            {chartData.some(d => d.weight) && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weight Progress</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Weight (kg)"
                      dot={{ fill: '#3b82f6', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Body Fat Chart */}
            {chartData.some(d => d.bodyFat) && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Body Fat % Progress</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="bodyFat"
                      stroke="#f97316"
                      strokeWidth={2}
                      name="Body Fat %"
                      dot={{ fill: '#f97316', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-blue-800 text-center">
              Add at least 2 measurements to see progress charts! 📊
            </p>
          </div>
        )}

        {/* Measurements History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Measurement History</h3>
          </div>
          
          {measurements.length === 0 ? (
            <div className="p-12 text-center">
              <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No measurements recorded yet</p>
              <button
                onClick={handleAddMeasurement}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Measurement
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight (kg)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Body Fat %</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {measurements.map((measurement) => (
                    <tr key={measurement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(measurement.measured_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {measurement.weight_kg ? `${measurement.weight_kg.toFixed(1)} kg` : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {measurement.body_fat_percentage ? `${measurement.body_fat_percentage.toFixed(1)}%` : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {measurement.notes || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handleEditMeasurement(measurement)}
                          className="text-blue-600 hover:text-blue-800 mr-4"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMeasurement(measurement.id)}
                          disabled={deletingId === measurement.id}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <AddMeasurementModal
          userId={userId}
          measurement={editingMeasurement}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}