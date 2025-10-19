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

  const stats = [
    {
      icon: Calendar,
      label: 'Today',
      value: formatTime(getTodayTime()),
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'from-blue-50 to-cyan-50'
    },
    {
      icon: TrendingUp,
      label: 'This Week',
      value: formatTime(getWeekTime()),
      gradient: 'from-indigo-500 to-purple-500',
      bg: 'from-indigo-50 to-purple-50'
    },
    {
      icon: Award,
      label: 'Streak',
      value: `${getStreak()} days`,
      gradient: 'from-emerald-500 to-green-500',
      bg: 'from-emerald-50 to-green-50'
    },
    {
      icon: Target,
      label: 'Active Goals',
      value: activeGoals.length,
      gradient: 'from-pink-500 to-rose-500',
      bg: 'from-pink-50 to-rose-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div 
            key={index}
            className={`bg-gradient-to-br ${stat.bg} backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 p-5 hover:scale-105 transition-transform duration-300`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
            </div>
            <div className="text-2xl font-semibold text-slate-800">{stat.value}</div>
          </div>
        );
      })}
    </div>
  );
};