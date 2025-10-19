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
      color: 'blue'
    },
    {
      icon: TrendingUp,
      label: 'This Week',
      value: formatTime(getWeekTime()),
      color: 'purple'
    },
    {
      icon: Award,
      label: 'Streak',
      value: `${getStreak()} days`,
      color: 'emerald'
    },
    {
      icon: Target,
      label: 'Active Goals',
      value: activeGoals.length,
      color: 'amber'
    }
  ];

  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    emerald: 'from-emerald-500 to-green-500',
    amber: 'from-amber-500 to-orange-500'
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div 
            key={index}
            className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50 p-5 hover:border-purple-500/50 transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${colorClasses[stat.color]} rounded-lg flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
            </div>
            <div className="text-2xl font-bold text-slate-100">{stat.value}</div>
          </div>
        );
      })}
    </div>
  );
};