import React, { useState } from 'react';
import { formatTime } from '../utils/timeUtils';
import { Target, Plus, Trash2, Award, TrendingUp } from 'lucide-react';

const CATEGORIES = [
  { id: 'study', name: 'Study', color: '#3b82f6', icon: '📚' },
  { id: 'work', name: 'Work', color: '#8b5cf6', icon: '💼' },
  { id: 'gaming', name: 'Gaming', color: '#ec4899', icon: '🎮' },
  { id: 'exercise', name: 'Exercise', color: '#10b981', icon: '💪' },
  { id: 'reading', name: 'Reading', color: '#f59e0b', icon: '📖' },
  { id: 'coding', name: 'Coding', color: '#06b6d4', icon: '💻' },
  { id: 'creative', name: 'Creative', color: '#f97316', icon: '🎨' },
  { id: 'other', name: 'Other', color: '#64748b', icon: '📌' },
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
    if (categoryId === 'all') return { name: 'All Categories', color: '#64748b', icon: '🎯' };
    return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];
  };

  const activeGoals = goals.filter(g => !g.completedAt);
  const completedGoals = goals.filter(g => g.completedAt);

  return (
    <div className="space-y-6">
      {/* Add Goal Button */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/50 p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-light text-slate-800 flex items-center gap-3">
            <Target className="w-6 h-6 text-blue-600" />
            Your Goals
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            {showForm ? 'Cancel' : 'New Goal'}
          </button>
        </div>

        {showForm && (
          <div className="space-y-5 p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Goal Name</label>
              <input
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder="e.g., Study for 4 hours daily"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Time Period</label>
                <select
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Target Hours</label>
                <input
                  type="number"
                  value={targetHours}
                  onChange={(e) => setTargetHours(Math.max(0.5, parseFloat(e.target.value) || 0))}
                  min="0.5"
                  step="0.5"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Category</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setCategory('all')}
                  className={`p-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    category === 'all'
                      ? 'bg-white border-2 border-blue-500 shadow-lg scale-105'
                      : 'bg-white border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  🎯 All
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      category === cat.id
                        ? 'bg-white border-2 shadow-lg scale-105'
                        : 'bg-white border border-slate-200 hover:border-slate-300'
                    }`}
                    style={{
                      borderColor: category === cat.id ? cat.color : undefined
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
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              Create Goal
            </button>
          </div>
        )}
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/50 p-6 md:p-8">
          <h3 className="text-xl font-light text-slate-800 mb-6 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-blue-600" />
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
                  className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-300'
                      : 'bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="px-3 py-1 rounded-xl text-xs font-medium"
                          style={{
                            backgroundColor: `${categoryInfo.color}15`,
                            color: categoryInfo.color,
                          }}
                        >
                          {categoryInfo.icon} {categoryInfo.name}
                        </span>
                        <span className="px-3 py-1 bg-white text-slate-700 rounded-xl text-xs font-medium border border-slate-200">
                          {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)}
                        </span>
                      </div>
                      <h4 className="font-medium text-slate-800 text-lg">{goal.name}</h4>
                    </div>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-slate-700">
                        {formatTime(currentSeconds)} / {formatTime(goal.targetSeconds)}
                      </span>
                      <span className="font-semibold text-slate-800">{percentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-4 rounded-full transition-all duration-500 ${
                          isCompleted
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {isCompleted ? (
                    <div className="flex items-center gap-2 text-emerald-700 font-medium">
                      <Award className="w-5 h-5" />
                      Goal Completed! 🎉
                    </div>
                  ) : (
                    <div className="text-sm text-slate-600">
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
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/50 p-6 md:p-8">
          <h3 className="text-xl font-light text-slate-800 mb-6 flex items-center gap-3">
            <Award className="w-6 h-6 text-emerald-600" />
            Completed Goals
          </h3>
          <div className="space-y-3">
            {completedGoals.map(goal => {
              const categoryInfo = getCategoryInfo(goal.category);
              
              return (
                <div
                  key={goal.id}
                  className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 flex justify-between items-center"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="px-3 py-1 rounded-xl text-xs font-medium"
                        style={{
                          backgroundColor: `${categoryInfo.color}15`,
                          color: categoryInfo.color,
                        }}
                      >
                        {categoryInfo.icon} {categoryInfo.name}
                      </span>
                    </div>
                    <div className="font-medium text-slate-800">{goal.name}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Completed on {new Date(goal.completedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete goal"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeGoals.length === 0 && completedGoals.length === 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/50 p-16 text-center">
          <Target className="w-20 h-20 text-slate-300 mx-auto mb-6" />
          <h3 className="text-2xl font-light text-slate-800 mb-3">No Goals Yet</h3>
          <p className="text-slate-600 mb-6">Set your first goal to track your progress</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:shadow-lg font-medium transition-all duration-300 hover:scale-105"
          >
            Create Your First Goal
          </button>
        </div>
      )}
    </div>
  );
};