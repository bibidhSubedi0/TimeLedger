import React, { useState } from 'react';
import { formatTime } from '../utils/timeUtils';
import { PieChart, BarChart3, Calendar, TrendingUp } from 'lucide-react';

const CATEGORIES = [
  { id: 'study', name: 'Study', color: '#6366f1', icon: '📚' },
  { id: 'work', name: 'Work', color: '#8b5cf6', icon: '💼' },
  { id: 'gaming', name: 'Gaming', color: '#ec4899', icon: '🎮'},
  { id: 'exercise', name: 'Exercise', color: '#10b981', icon: '💪' },
  { id: 'reading', name: 'Reading', color: '#f59e0b', icon: '📖' },
  { id: 'coding', name: 'Coding', color: '#3b82f6', icon: '💻' },
  { id: 'creative', name: 'Creative', color: '#f97316', icon: '🎨' },
  { id: 'other', name: 'Other', color: '#6b7280', icon: '📌' },
];

export const Analytics = ({ tasks }) => {
  const [period, setPeriod] = useState('week'); // 'day', 'week', 'month', 'all'

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
      .slice(-14); // Last 14 days
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
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">No Data Yet</h3>
        <p className="text-gray-600">Start tracking tasks to see your analytics!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Period Selector */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex gap-2">
          {[
            { id: 'day', label: 'Today' },
            { id: 'week', label: 'Last 7 Days' },
            { id: 'month', label: 'Last 30 Days' },
            { id: 'all', label: 'All Time' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                period === p.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <div className="text-sm text-gray-600">Total Time</div>
          </div>
          <div className="text-3xl font-bold text-gray-800">{formatTime(totalTime)}</div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <div className="text-sm text-gray-600">Avg Per Day</div>
          </div>
          <div className="text-3xl font-bold text-gray-800">{formatTime(Math.round(avgPerDay))}</div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>
          <div className="text-3xl font-bold text-gray-800">{filteredTasks.length}</div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-gray-800">Time by Category</h3>
        </div>
        
        {categoryStats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No category data available</div>
        ) : (
          <div className="space-y-3">
            {categoryStats.map(stat => (
              <div key={stat.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {stat.icon} {stat.name}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-800">{formatTime(stat.totalTime)}</span>
                    <span className="text-xs text-gray-500 ml-2">({stat.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${stat.percentage}%`,
                      backgroundColor: stat.color
                    }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">{stat.taskCount} tasks</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Trend */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-gray-800">Daily Activity</h3>
        </div>
        
        {dailyStats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No daily data available</div>
        ) : (
          <div className="space-y-2">
            {dailyStats.map(([date, time]) => {
              const maxTime = Math.max(...dailyStats.map(([, t]) => t));
              const percentage = maxTime > 0 ? (time / maxTime * 100) : 0;
              
              return (
                <div key={date} className="flex items-center gap-3">
                  <div className="text-xs text-gray-600 w-24">{date}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                    <div
                      className="h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center px-3 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    >
                      {percentage > 20 && (
                        <span className="text-xs font-bold text-white">{formatTime(time)}</span>
                      )}
                    </div>
                  </div>
                  {percentage <= 20 && (
                    <span className="text-xs font-bold text-gray-700 w-20">{formatTime(time)}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top Tasks */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-gray-800">Top 10 Tasks</h3>
        </div>
        
        {topTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No task data available</div>
        ) : (
          <div className="space-y-2">
            {topTasks.map((task, index) => {
              const categoryInfo = CATEGORIES.find(c => c.id === task.category) || CATEGORIES[CATEGORIES.length - 1];
              
              return (
                <div key={task.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div className="text-lg font-bold text-gray-400 w-8">{index + 1}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{task.name}</div>
                    <div className="text-xs text-gray-500">
                      <span
                        className="inline-block px-2 py-0.5 rounded text-xs font-medium mr-2"
                        style={{
                          backgroundColor: categoryInfo.color + '20',
                          color: categoryInfo.color,
                        }}
                      >
                        {categoryInfo.icon} {categoryInfo.name}
                      </span>
                      {task.count} sessions
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-indigo-600">{formatTime(task.totalTime)}</div>
                    <div className="text-xs text-gray-500">{formatTime(Math.round(task.totalTime / task.count))} avg</div>
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