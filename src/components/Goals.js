import React, { useState } from 'react';
import { formatTime } from '../utils/timeUtils';
import { Target, Plus, Trash2, Award, TrendingUp } from 'lucide-react';

const CATEGORIES = [
  { id: 'study', name: 'Study', color: '#6366f1', icon: '📚' },
  { id: 'work', name: 'Work', color: '#8b5cf6', icon: '💼' },
  { id: 'gaming', name: 'Gaming', color: '#ec4899', icon: '🎮' },
  { id: 'exercise', name: 'Exercise', color: '#10b981', icon: '💪' },
  { id: 'reading', name: 'Reading', color: '#f59e0b', icon: '📖' },
  { id: 'coding', name: 'Coding', color: '#3b82f6', icon: '💻' },
  { id: 'creative', name: 'Creative', color: '#f97316', icon: '🎨' },
  { id: 'other', name: 'Other', color: '#6b7280', icon: '📌' },
];

export const Goals = ({ goals, tasks, onAddGoal, onDeleteGoal, onUpdateGoal }) => {
  const [showForm, setShowForm] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalType, setGoalType] = useState('daily'); // 'daily', 'weekly', 'monthly'
  const [targetHours, setTargetHours] = useState(4);
  const [category, setCategory] = useState('all');

  const handleAddGoal = () => {
    if (!goalName.trim() || targetHours <= 0) return;

    const newGoal = {
      name: goalName,
      type: goalType,
      targetSeconds: targetHours * 3600,
      category: category,
      createdAt: Date.now(),
      completedAt: null
    };

    onAddGoal(newGoal);
    setGoalName('');
    setTargetHours(4);
    setCategory('all');
    setShowForm(false);
  };

  const getGoalProgress = (goal) => {
    const now = Date.now();
    let startTime;

    switch (goal.type) {
      case 'daily':
        startTime = new Date().setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        const dayOfWeek = new Date().getDay();
        startTime = now - (dayOfWeek * 24 * 60 * 60 * 1000);
        startTime = new Date(startTime).setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        startTime = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
        break;
      default:
        startTime = goal.createdAt;
    }

    const relevantTasks = tasks.filter(t => {
      const matchesTime = t.startTime >= startTime;
      const matchesCategory = goal.category === 'all' || t.category === goal.category;
      return matchesTime && matchesCategory;
    });

    const currentSeconds = relevantTasks.reduce((sum, t) => sum + t.duration, 0);
    const percentage = Math.min((currentSeconds / goal.targetSeconds) * 100, 100);
    const isCompleted = currentSeconds >= goal.targetSeconds;

    return { currentSeconds, percentage, isCompleted };
  };

  const getCategoryInfo = (categoryId) => {
    if (categoryId === 'all') return { name: 'All Categories', color: '#6b7280', icon: '🎯' };
    return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];
  };

  const activeGoals = goals.filter(g => !g.completedAt);
  const completedGoals = goals.filter(g => g.completedAt);

  return (
    <div className="space-y-4">
      {/* Add Goal Button */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            Your Goals
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
          >
            <Plus className="w-4 h-4" />
            {showForm ? 'Cancel' : 'New Goal'}
          </button>
        </div>

        {showForm && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Goal Name</label>
              <input
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder="e.g., Study for 4 hours daily"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Time Period</label>
                <select
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Target Hours</label>
                <input
                  type="number"
                  value={targetHours}
                  onChange={(e) => setTargetHours(Math.max(0.5, parseFloat(e.target.value) || 0))}
                  min="0.5"
                  step="0.5"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setCategory('all')}
                  className={`p-2 rounded-lg text-sm font-medium transition-all ${
                    category === 'all'
                      ? 'bg-gray-600 text-white'
                      : 'bg-white hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  🎯 All
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`p-2 rounded-lg text-sm font-medium transition-all ${
                      category === cat.id
                        ? 'ring-2 ring-offset-2'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                    style={{
                      backgroundColor: category === cat.id ? cat.color + '20' : undefined,
                      color: category === cat.id ? cat.color : undefined,
                      ringColor: category === cat.id ? cat.color : undefined,
                    }}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddGoal}
              disabled={!goalName.trim() || targetHours <= 0}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Create Goal
            </button>
          </div>
        )}
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Active Goals
          </h3>
          <div className="space-y-4">
            {activeGoals.map(goal => {
              const { currentSeconds, percentage, isCompleted } = getGoalProgress(goal);
              const categoryInfo = getCategoryInfo(goal.category);
              const remainingSeconds = Math.max(0, goal.targetSeconds - currentSeconds);

              return (
                <div
                  key={goal.id}
                  className={`p-4 rounded-lg border-2 ${
                    isCompleted
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: categoryInfo.color + '20',
                            color: categoryInfo.color,
                          }}
                        >
                          {categoryInfo.icon} {categoryInfo.name}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-800">{goal.name}</h4>
                    </div>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">
                        {formatTime(currentSeconds)} / {formatTime(goal.targetSeconds)}
                      </span>
                      <span className="font-bold text-gray-800">{percentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-4 rounded-full transition-all duration-500 ${
                          isCompleted
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                            : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {isCompleted ? (
                    <div className="flex items-center gap-2 text-green-700 font-semibold">
                      <Award className="w-5 h-5" />
                      Goal Completed! 🎉
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">
                      {formatTime(remainingSeconds)} remaining to reach your goal
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Completed Goals
          </h3>
          <div className="space-y-2">
            {completedGoals.map(goal => {
              const categoryInfo = getCategoryInfo(goal.category);
              
              return (
                <div
                  key={goal.id}
                  className="p-3 bg-gray-50 rounded-lg flex justify-between items-center"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: categoryInfo.color + '20',
                          color: categoryInfo.color,
                        }}
                      >
                        {categoryInfo.icon} {categoryInfo.name}
                      </span>
                    </div>
                    <div className="font-semibold text-gray-800">{goal.name}</div>
                    <div className="text-xs text-gray-500">
                      Completed on {new Date(goal.completedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeGoals.length === 0 && completedGoals.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Goals Yet</h3>
          <p className="text-gray-600 mb-4">Set your first goal to track your progress!</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
          >
            Create Your First Goal
          </button>
        </div>
      )}
    </div>
  );
};