import React, { useState } from 'react';
import { formatTime } from '../utils/timeUtils';
import { Target, Plus, Trash2, Award, TrendingUp } from 'lucide-react';

const CATEGORIES = [
  { id: 'study', name: 'Study', color: '#1565c0', icon: '📚' },
  { id: 'work', name: 'Work', color: '#4a148c', icon: '💼' },
  { id: 'gaming', name: 'Gaming', color: '#c2185b', icon: '🎮' },
  { id: 'exercise', name: 'Exercise', color: '#2e7d32', icon: '💪' },
  { id: 'reading', name: 'Reading', color: '#f57c00', icon: '📖' },
  { id: 'coding', name: 'Coding', color: '#0277bd', icon: '💻' },
  { id: 'creative', name: 'Creative', color: '#d84315', icon: '🎨' },
  { id: 'other', name: 'Other', color: '#616161', icon: '📌' },
];

export const Goals = ({ goals, tasks, onAddGoal, onDeleteGoal, onUpdateGoal }) => {
  const [showForm, setShowForm] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalType, setGoalType] = useState('daily');
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
    if (categoryId === 'all') return { name: 'All Categories', color: '#616161', icon: '🎯' };
    return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];
  };

  const activeGoals = goals.filter(g => !g.completedAt);
  const completedGoals = goals.filter(g => g.completedAt);

  return (
    <div className="space-y-4">
      {/* Add Goal Button */}
      <div className="bg-white rounded shadow-lg p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-gray-700" />
            Your Goals
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            {showForm ? 'Cancel' : 'New Goal'}
          </button>
        </div>

        {showForm && (
          <div className="space-y-4 p-4 bg-gray-50 rounded border border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Goal Name</label>
              <input
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder="e.g., Study for 4 hours daily"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:border-gray-800 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                <select
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:border-gray-800 focus:outline-none"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Hours</label>
                <input
                  type="number"
                  value={targetHours}
                  onChange={(e) => setTargetHours(Math.max(0.5, parseFloat(e.target.value) || 0))}
                  min="0.5"
                  step="0.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:border-gray-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setCategory('all')}
                  className={`p-2 rounded text-sm font-medium transition-all ${
                    category === 'all'
                      ? 'bg-white border-2 border-gray-800'
                      : 'bg-white border border-gray-300 hover:border-gray-400'
                  }`}
                >
                  🎯 All
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`p-2 rounded text-sm font-medium transition-all ${
                      category === cat.id
                        ? 'bg-white border-2 border-gray-800'
                        : 'bg-white border border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddGoal}
              disabled={!goalName.trim() || targetHours <= 0}
              className="w-full px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Create Goal
            </button>
          </div>
        )}
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="bg-white rounded shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-700" />
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
                  className={`p-4 rounded border-2 ${
                    isCompleted
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="px-2 py-1 rounded text-xs font-medium border"
                          style={{
                            backgroundColor: 'white',
                            color: categoryInfo.color,
                            borderColor: categoryInfo.color,
                          }}
                        >
                          {categoryInfo.icon} {categoryInfo.name}
                        </span>
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium border border-gray-300">
                          {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-800">{goal.name}</h4>
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
                      <span className="font-medium text-gray-800">{percentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded transition-all duration-500 ${
                          isCompleted
                            ? 'bg-green-600'
                            : 'bg-gray-800'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {isCompleted ? (
                    <div className="flex items-center gap-2 text-green-700 font-medium">
                      <Award className="w-5 h-5" />
                      Goal Completed!
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
        <div className="bg-white rounded shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-gray-700" />
            Completed Goals
          </h3>
          <div className="space-y-2">
            {completedGoals.map(goal => {
              const categoryInfo = getCategoryInfo(goal.category);
              
              return (
                <div
                  key={goal.id}
                  className="p-3 bg-gray-50 rounded border border-gray-200 flex justify-between items-center"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="px-2 py-1 rounded text-xs font-medium border"
                        style={{
                          backgroundColor: 'white',
                          color: categoryInfo.color,
                          borderColor: categoryInfo.color,
                        }}
                      >
                        {categoryInfo.icon} {categoryInfo.name}
                      </span>
                    </div>
                    <div className="font-medium text-gray-800">{goal.name}</div>
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
        <div className="bg-white rounded shadow-lg p-12 text-center border border-gray-200">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-800 mb-2">No Goals Yet</h3>
          <p className="text-gray-600 mb-4">Set your first goal to track your progress</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-gray-800 text-white rounded hover:bg-gray-700 font-medium"
          >
            Create Your First Goal
          </button>
        </div>
      )}
    </div>
  );
};