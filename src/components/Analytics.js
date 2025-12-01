import React, { useState } from 'react';
import { PieChart, BarChart3, Calendar, TrendingUp, Clock, Award, Target, Zap } from 'lucide-react';
import { getAllCategories } from '../utils/categoryUtils';
import { DailyPieChart } from './DailyPieChart';
import { DailyTimeline } from './DailyTimeline';

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const Analytics = ({ tasks, customCategories = [] }) => {
  const [period, setPeriod] = useState('week');

  const CATEGORIES = getAllCategories(customCategories);

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

  const getHourlyDistribution = () => {
    const hourlyMap = new Array(24).fill(0);
    filteredTasks.forEach(task => {
      const hour = new Date(task.startTime).getHours();
      hourlyMap[hour] += task.duration;
    });
    return hourlyMap;
  };

  const getWeekdayDistribution = () => {
    const weekdayMap = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    filteredTasks.forEach(task => {
      const day = new Date(task.startTime).getDay();
      weekdayMap[day] += task.duration;
    });

    return Object.entries(weekdayMap).map(([day, time]) => ({
      name: weekdayNames[day],
      time,
      tasks: filteredTasks.filter(t => new Date(t.startTime).getDay() === parseInt(day)).length
    }));
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

  const getProductivityInsights = () => {
    const hourlyDist = getHourlyDistribution();
    const peakHour = hourlyDist.indexOf(Math.max(...hourlyDist));
    const weekdayDist = getWeekdayDistribution();
    const mostProductiveDay = weekdayDist.reduce((max, day) => day.time > max.time ? day : max, weekdayDist[0]);
    
    const avgSessionLength = filteredTasks.length > 0 
      ? filteredTasks.reduce((sum, t) => sum + t.duration, 0) / filteredTasks.length 
      : 0;

    return {
      peakHour: peakHour === 0 ? '12 AM' : peakHour < 12 ? `${peakHour} AM` : peakHour === 12 ? '12 PM' : `${peakHour - 12} PM`,
      mostProductiveDay: mostProductiveDay.name,
      avgSessionLength: formatTime(Math.round(avgSessionLength)),
      longestSession: filteredTasks.length > 0 ? formatTime(Math.max(...filteredTasks.map(t => t.duration))) : '0m'
    };
  };

  const categoryStats = getCategoryStats();
  const dailyStats = getDailyStats();
  const weekdayDist = getWeekdayDistribution();
  const hourlyDist = getHourlyDistribution();
  const topTasks = getTopTasks();
  const insights = getProductivityInsights();
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

  const maxWeekdayTime = Math.max(...weekdayDist.map(d => d.time), 1);
  const maxHourlyTime = Math.max(...hourlyDist, 1);

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

          <DailyPieChart tasks={filteredTasks} customCategories={customCategories} />
          <DailyTimeline tasks={filteredTasks} customCategories={customCategories} />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Clock, label: 'Total Time', value: formatTime(totalTime), color: 'purple' },
          { icon: TrendingUp, label: 'Avg Per Day', value: formatTime(Math.round(avgPerDay)), color: 'blue' },
          { icon: BarChart3, label: 'Total Tasks', value: filteredTasks.length, color: 'pink' },
          { icon: Target, label: 'Categories', value: categoryStats.length, color: 'emerald' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          const colors = {
            purple: 'from-purple-500 to-pink-500',
            blue: 'from-blue-500 to-cyan-500',
            pink: 'from-pink-500 to-rose-500',
            emerald: 'from-emerald-500 to-green-500'
          };
          return (
            <div key={idx} className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50 p-5 hover:border-purple-500/50 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${colors[stat.color]} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-100 mb-1">{stat.value}</div>
              <div className="text-xs text-slate-400 font-medium">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Productivity Insights */}
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-slate-100">Productivity Insights</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-slate-400 mb-1">Peak Hour</div>
            <div className="text-lg font-bold text-purple-400">{insights.peakHour}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Best Day</div>
            <div className="text-lg font-bold text-purple-400">{insights.mostProductiveDay}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Avg Session</div>
            <div className="text-lg font-bold text-purple-400">{insights.avgSessionLength}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Longest</div>
            <div className="text-lg font-bold text-purple-400">{insights.longestSession}</div>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Pie Chart Visualization */}
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <PieChart className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-semibold text-slate-100">Time by Category</h3>
          </div>
          
          {categoryStats.length === 0 ? (
            <div className="text-center py-12 text-slate-400">No category data</div>
          ) : (
            <div className="space-y-4">
              {categoryStats.map(stat => (
                <div key={stat.id}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <span>{stat.icon}</span>
                      {stat.name}
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

        {/* Weekday Distribution */}
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-semibold text-slate-100">Activity by Weekday</h3>
          </div>
          
          <div className="flex items-end justify-between gap-2 h-48">
            {weekdayDist.map((day, idx) => {
              const heightPercent = (day.time / maxWeekdayTime) * 100;
              const isToday = new Date().toLocaleDateString('en-US', { weekday: 'short' }) === day.name;
              
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center justify-end flex-1">
                    {day.time > 0 && (
                      <div className="text-xs text-slate-400 mb-1 font-mono">
                        {formatTime(day.time)}
                      </div>
                    )}
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isToday 
                          ? 'bg-gradient-to-t from-purple-500 to-pink-500' 
                          : 'bg-gradient-to-t from-slate-600 to-slate-500'
                      }`}
                      style={{ height: `${Math.max(heightPercent, day.time > 0 ? 10 : 0)}%` }}
                    />
                  </div>
                  <div className={`text-xs font-medium ${
                    isToday ? 'text-purple-400' : 'text-slate-400'
                  }`}>
                    {day.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hourly Heatmap */}
      <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-semibold text-slate-100">Activity by Hour</h3>
        </div>
        
        <div className="grid grid-cols-12 md:grid-cols-24 gap-1">
          {hourlyDist.map((time, hour) => {
            const intensity = time > 0 ? (time / maxHourlyTime) * 100 : 0;
            const getColor = (intensity) => {
              if (intensity === 0) return 'bg-slate-700/30';
              if (intensity < 25) return 'bg-purple-500/20';
              if (intensity < 50) return 'bg-purple-500/40';
              if (intensity < 75) return 'bg-purple-500/60';
              return 'bg-purple-500/80';
            };
            
            return (
              <div
                key={hour}
                className={`aspect-square rounded ${getColor(intensity)} hover:ring-2 hover:ring-purple-400 transition-all cursor-pointer group relative`}
                title={`${hour}:00 - ${formatTime(time)}`}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-xs text-slate-300 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {hour}:00 - {formatTime(time)}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
          <span>12 AM</span>
          <span>6 AM</span>
          <span>12 PM</span>
          <span>6 PM</span>
          <span>11 PM</span>
        </div>
      </div>

      {/* Daily Trend */}
      <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-semibold text-slate-100">Daily Activity Trend</h3>
        </div>
        
        {dailyStats.length === 0 ? (
          <div className="text-center py-12 text-slate-400">No daily data</div>
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
                      className="h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center px-3 transition-all duration-500"
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
      <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-semibold text-slate-100">Top 10 Tasks</h3>
        </div>
        
        {topTasks.length === 0 ? (
          <div className="text-center py-12 text-slate-400">No task data</div>
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