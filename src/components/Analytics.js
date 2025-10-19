import React, { useState } from 'react';
import { formatTime } from '../utils/timeUtils';
import { PieChart, BarChart3, Calendar, TrendingUp } from 'lucide-react';

const CATEGORIES = [
  { id: 'study', name: 'Study', color: '#3b82f6', icon: '📚' },
  { id: 'work', name: 'Work', color: '#8b5cf6', icon: '💼' },
  { id: 'gaming', name: 'Gaming', color: '#ec4899', icon: '🎮'},
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
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/50 p-12 text-center">
        <BarChart3 className="w-20 h-20 text-slate-300 mx-auto mb-6" />
        <h3 className="text-2xl font-light text-slate-800 mb-3">No Data Yet</h3>
        <p className="text-slate-600">Start tracking tasks to see your analytics!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/50 p-6">
        <div className="flex gap-3 flex-wrap">
          {[
            { id: 'day', label: 'Today' },
            { id: 'week', label: 'Last 7 Days' },
            { id: 'month', label: 'Last 30 Days' },
            { id: 'all', label: 'All Time' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-5 py-3 rounded-2xl font-medium transition-all duration-300 ${
                period === p.id
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
          { icon: Calendar, label: 'Total Time', value: formatTime(totalTime), gradient: 'from-blue-500 to-cyan-500' },
          { icon: TrendingUp, label: 'Avg Per Day', value: formatTime(Math.round(avgPerDay)), gradient: 'from-emerald-500 to-green-500' },
          { icon: BarChart3, label: 'Total Tasks', value: filteredTasks.length, gradient: 'from-purple-500 to-pink-500' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
            </div>
            <div className="text-3xl font-semibold text-slate-800">{stat.value}</div>
          </div>
        );
      })}
    </div>

    {/* Category Breakdown */}
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/50 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <PieChart className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-light text-slate-800">Time by Category</h3>
      </div>
      
      {categoryStats.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No category data available</div>
      ) : (
        <div className="space-y-4">
          {categoryStats.map(stat => (
            <div key={stat.id}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">
                  {stat.icon} {stat.name}
                </span>
                <div className="text-right">
                  <span className="text-sm font-semibold text-slate-800">{formatTime(stat.totalTime)}</span>
                  <span className="text-xs text-slate-500 ml-2">({stat.percentage}%)</span>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
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
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/50 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-light text-slate-800">Daily Activity</h3>
      </div>
      
      {dailyStats.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No daily data available</div>
      ) : (
        <div className="space-y-3">
          {dailyStats.map(([date, time]) => {
            const maxTime = Math.max(...dailyStats.map(([, t]) => t));
            const percentage = maxTime > 0 ? (time / maxTime * 100) : 0;
            
            return (
              <div key={date} className="flex items-center gap-4">
                <div className="text-xs text-slate-600 w-24 flex-shrink-0">{date}</div>
                <div className="flex-1 bg-slate-200 rounded-full h-10 overflow-hidden">
                  <div
                    className="h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center px-4 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  >
                    {percentage > 20 && (
                      <span className="text-xs font-semibold text-white">{formatTime(time)}</span>
                    )}
                  </div>
                </div>
                {percentage <= 20 && (
                  <span className="text-xs font-semibold text-slate-700 w-20 text-right">{formatTime(time)}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>

    {/* Top Tasks */}
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/50 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-light text-slate-800">Top 10 Tasks</h3>
      </div>
      
      {topTasks.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No task data available</div>
      ) : (
        <div className="space-y-3">
          {topTasks.map((task, index) => {
            const categoryInfo = CATEGORIES.find(c => c.id === task.category) || CATEGORIES[CATEGORIES.length - 1];
            
            return (
              <div key={task.name} className="flex items-center gap-4 p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl hover:shadow-lg transition-all duration-300">
                <div className="text-xl font-semibold text-slate-400 w-8">{index + 1}</div>
                <div className="flex-1">
                  <div className="font-medium text-slate-800 mb-1">{task.name}</div>
                  <div className="text-xs text-slate-500">
                    <span
                      className="inline-block px-2 py-1 rounded-lg text-xs font-medium mr-2"
                      style={{
                        backgroundColor: `${categoryInfo.color}15`,
                        color: categoryInfo.color,
                      }}
                    >
                      {categoryInfo.icon} {categoryInfo.name}
                    </span>
                    {task.count} sessions
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-semibold text-blue-600">{formatTime(task.totalTime)}</div>
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