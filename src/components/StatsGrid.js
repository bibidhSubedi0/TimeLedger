import React from 'react';
import { formatTime } from '../utils/timeUtils';
import { TrendingUp, Award, Calendar, Target } from 'lucide-react';

export const StatsGrid = ({ tasks, goals }) => {
  if (tasks.length === 0) return null;

  const getTotalTime = () => {
    return tasks.reduce((sum, task) => sum + task.duration, 0);
  };

  const getTodayTime = () => {
    const today = new Date().setHours(0, 0, 0, 0);
    return tasks
      .filter(t => new Date(t.startTime).setHours(0, 0, 0, 0) === today)
      .reduce((sum, task) => sum + task.duration, 0);
  };

  const getWeekTime = () => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return tasks
      .filter(t => t.startTime >= weekAgo)
      .reduce((sum, task) => sum + task.duration, 0);
  };

  const getStreak = () => {
    const sortedDates = [...new Set(
      tasks.map(t => new Date(t.startTime).toDateString())
    )].sort((a, b) => new Date(b) - new Date(a));

    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (sortedDates[0] === today || sortedDates[0] === yesterday) {
      for (let i = 0; i < sortedDates.length; i++) {
        const expectedDate = new Date(Date.now() - i * 86400000).toDateString();
        if (sortedDates[i] === expectedDate) {
          streak++;
        } else {
          break;
        }
      }
    }
    return streak;
  };

  const activeGoals = goals.filter(g => {
    if (g.type === 'daily') {
      const today = new Date().toDateString();
      return new Date(g.createdAt).toDateString() === today || !g.completedAt;
    }
    return !g.completedAt;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <div className="bg-white rounded shadow-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5 text-gray-700" />
          <div className="text-sm text-gray-600">Today</div>
        </div>
        <div className="text-2xl font-medium text-gray-800">{formatTime(getTodayTime())}</div>
      </div>

      <div className="bg-white rounded shadow-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-gray-700" />
          <div className="text-sm text-gray-600">This Week</div>
        </div>
        <div className="text-2xl font-medium text-gray-800">{formatTime(getWeekTime())}</div>
      </div>

      <div className="bg-white rounded shadow-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-5 h-5 text-gray-700" />
          <div className="text-sm text-gray-600">Streak</div>
        </div>
        <div className="text-2xl font-medium text-gray-800">{getStreak()} days</div>
      </div>

      <div className="bg-white rounded shadow-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-gray-700" />
          <div className="text-sm text-gray-600">Active Goals</div>
        </div>
        <div className="text-2xl font-medium text-gray-800">{activeGoals.length}</div>
      </div>
    </div>
  );
};