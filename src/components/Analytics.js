import React, { useState } from 'react';
import { formatTime } from '../utils/timeUtils';
import { PieChart, BarChart3, Calendar, TrendingUp } from 'lucide-react';

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

export const Analytics = ({ tasks }) => {
  const [period, setPeriod] = useState('week');

  const getFilteredTasks = () => {
    const now = Date.now();
    switch (period) {
      case 'day':
        const today = new Date().setHours(0, 0, 0, 0);
        return tasks.filter(t => new Date(t.startTime).setHours(0, 0, 0, 0) === today);
      case 'week':
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
        return tasks.filter(t => t.startTime >= weekAgo);
      case 'month':
        const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
        return tasks.filter(t => t.startTime >= monthAgo);
      default:
        return tasks;
    }
  };

  const filteredTasks = getFilteredTasks();

  const getCategoryStats = () => {
    const stats = {};
    CATEGORIES.forEach(cat => {
      const categoryTasks = filteredTasks.filter(t => t.category === cat.id);
      const totalTime = categoryTasks.reduce((sum, t) => sum + t.duration, 0);
      if (totalTime > 0) {
        stats[cat.id] = {
          ...cat,
          totalTime,
          taskCount: categoryTasks.length,
          percentage: 0
        };
      }
    });

    const totalTime = Object.values(stats).reduce((sum, s) => sum + s.totalTime, 0);
    Object.keys(stats).forEach(key => {
      stats[key].percentage = totalTime > 0 ? (stats[key].totalTime / totalTime * 100).toFixed(1) : 0;
    });

    return Object.values(stats).sort((a, b) => b.totalTime - a.totalTime);
  };

  const getDailyStats = () => {
    const dailyMap = {};
    filteredTasks.forEach(task => {
      const date = new Date(task.startTime).toLocaleDateString();
      if (!dailyMap[date]) {
        dailyMap[date] = 0;
      }
      dailyMap[date] += task.duration;
    });

    return Object.entries(dailyMap)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .slice(-14);
  };

  const getTopTasks = () => {
    const taskMap = {};
    filteredTasks.forEach(task => {
      if (!taskMap[task.name]) {
        taskMap[task.name] = {
          name: task.name,
          totalTime: 0,
          count: 0,
          category: task.category
        };
      }
      taskMap[task.name].totalTime += task.duration;
      taskMap[task.name].count += 1;
    });

    return Object.values(taskMap)
      .sort((a, b) => b.totalTime - a.totalTime)
      .slice(0, 10);
  };

  const categoryStats = getCategoryStats();
  const dailyStats = getDailyStats();
  const topTasks = getTopTasks();
  const totalTime = filteredTasks.reduce((sum, t) => sum + t.duration, 0);
  const avgPerDay = dailyStats.length > 0 
    ? dailyStats.reduce((sum, [, time]) => sum + time, 0) / dailyStats.length 
    : 0;

  if (filteredTasks.length === 0) {
    return (
      <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12 text-center">
        <BarChart3 className="w-20 h-20 text-slate-600 mx-auto mb-6" />
        <h3 className="text-2xl font-semibold text-slate-300 mb-3">No Data Yet</h3>
        <p className="text-slate-400">Start tracking tasks to see your analytics!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'day', label: 'Today' },
            { id: 'week', label: 'Last 7 Days' },
            { id: 'month', label: 'Last 30 Days' },
            { id: 'all', label: 'All Time' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                period === p.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Calendar, label: 'Total Time', value: formatTime(totalTime) },
          { icon: TrendingUp, label: 'Avg Per Day', value: formatTime(Math.round(avgPerDay)) },
          { icon: BarChart3, label: 'Total Tasks', value: filteredTasks.length }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
              </div>
              <div className="text-3xl font-bold text-slate-100">{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Category Breakdown */}
      <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <PieChart className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-semibold text-slate-100">Time by Category</h3>
        </div>
        
        {categoryStats.length === 0 ? (
          <div className="text-center py-12 text-slate-400">No category data available</div>
        ) : (
          <div className="space-y-4">
            {categoryStats.map(stat => (
              <div key={stat.id}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-300">
                    {stat.icon} {stat.name}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-slate-200">{formatTime(stat.totalTime)}</span>
                    <span className="text-xs text-slate-500 ml-2">({stat.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${stat.percentage}%`,
                      backgroundColor: stat.color
                    }}
                  />
                </div>
                <div className="text-xs text-slate-500 mt-1">{stat.taskCount} tasks</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Trend */}
      <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-semibold text-slate-100">Daily Activity</h3>
        </div>
        
        {dailyStats.length === 0 ? (
          <div className="text-center py-12 text-slate-400">No daily data available</div>
        ) : (
          <div className="space-y-3">
            {dailyStats.map(([date, time]) => {
              const maxTime = Math.max(...dailyStats.map(([, t]) => t));
              const percentage = maxTime > 0 ? (time / maxTime * 100) : 0;
              
              return (
                <div key={date} className="flex items-center gap-4">
                  <div className="text-xs text-slate-400 w-24 flex-shrink-0">{date}</div>
                  <div className="flex-1 bg-slate-700/50 rounded-full h-8 overflow-hidden">
                    <div
                      className="h-8 bg-purple-600 rounded-full flex items-center px-3 transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    >
                      {percentage > 20 && (
                        <span className="text-xs font-semibold text-white">{formatTime(time)}</span>
                      )}
                    </div>
                  </div>
                  {percentage <= 20 && (
                    <span className="text-xs font-semibold text-slate-300 w-20 text-right">{formatTime(time)}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top Tasks */}
      <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-semibold text-slate-100">Top 10 Tasks</h3>
        </div>
        
        {topTasks.length === 0 ? (
          <div className="text-center py-12 text-slate-400">No task data available</div>
        ) : (
          <div className="space-y-3">
            {topTasks.map((task, index) => {
              const categoryInfo = CATEGORIES.find(c => c.id === task.category) || CATEGORIES[CATEGORIES.length - 1];
              
              return (
                <div key={task.name} className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/40 transition-all">
                  <div className="text-xl font-bold text-slate-500 w-8">{index + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-200 mb-1 truncate">{task.name}</div>
                    <div className="text-xs text-slate-400">
                      <span
                        className="inline-block px-2 py-0.5 rounded-lg text-xs font-medium mr-2"
                        style={{
                          backgroundColor: `${categoryInfo.color}20`,
                          color: categoryInfo.color,
                        }}
                      >
                        {categoryInfo.icon} {categoryInfo.name}
                      </span>
                      {task.count} sessions
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-semibold text-purple-400">{formatTime(task.totalTime)}</div>
                    <div className="text-xs text-slate-500">{formatTime(Math.round(task.totalTime / task.count))} avg</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};