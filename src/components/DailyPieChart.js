import React, { useState } from 'react';
import { PieChart, Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { formatTime } from '../utils/timeUtils';
import { getAllCategories } from '../utils/categoryUtils';

export const DailyPieChart = ({ tasks, customCategories = [] }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const CATEGORIES = getAllCategories(customCategories);

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    if (newDate <= new Date()) {
      setSelectedDate(newDate);
    }
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const isFuture = selectedDate > new Date();

  // Get tasks for the selected date with overlap calculation
  const getDayData = () => {
    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(23, 59, 59, 999);

    const categoryTotals = {};

    // Process each task
    tasks.forEach(task => {
      const taskStart = new Date(task.startTime);
      const taskEnd = new Date(task.endTime);

      // Check if task overlaps with selected day
      if (taskEnd >= dayStart && taskStart <= dayEnd) {
        // Calculate overlap duration
        const overlapStart = Math.max(taskStart.getTime(), dayStart.getTime());
        const overlapEnd = Math.min(taskEnd.getTime(), dayEnd.getTime());
        const overlapSeconds = Math.floor((overlapEnd - overlapStart) / 1000);

        if (overlapSeconds > 0) {
          const cat = task.category || 'other';
          categoryTotals[cat] = (categoryTotals[cat] || 0) + overlapSeconds;
        }
      }
    });

    return categoryTotals;
  };

  const categoryTotals = getDayData();
  const totalTracked = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
  const totalSeconds = 24 * 3600; // 24 hours
  const untracked = Math.max(0, totalSeconds - totalTracked);

  // Prepare data for visualization - maps category IDs to full category info
// Prepare data for visualization - maps category IDs to full category info
const chartData = Object.entries(categoryTotals)
  .map(([catId, seconds]) => {
    // Look up category info from combined list (default + custom)
    const categoryInfo = CATEGORIES.find(c => c.id === catId);
    
    if (categoryInfo) {
      return {
        ...categoryInfo,
        seconds,
        percentage: ((seconds || 0) / totalSeconds * 100).toFixed(1)
      };
    } else {
      // Fallback for unknown categories - generate color from ID
      const hashColor = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colors = [
          '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', 
          '#06b6d4', '#f97316', '#ef4444', '#14b8a6', '#a855f7'
        ];
        return colors[Math.abs(hash) % colors.length];
      };
      
      return {
        id: catId,
        name: catId.charAt(0).toUpperCase() + catId.slice(1).replace(/_/g, ' '),
        color: hashColor(catId),
        icon: '📌',
        seconds,
        percentage: ((seconds || 0) / totalSeconds * 100).toFixed(1)
      };
    }
  })
  .filter(cat => cat.seconds > 0)
  .sort((a, b) => b.seconds - a.seconds);

  // Add untracked time
  if (untracked > 0) {
    chartData.push({
      id: 'untracked',
      name: 'Untracked',
      color: '#374151',
      icon: '⏱️',
      seconds: untracked,
      percentage: (untracked / totalSeconds * 100).toFixed(1)
    });
  }

  // Create SVG pie chart
  const createPieChart = () => {
    const size = 300;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 20;

    let currentAngle = -90; // Start from top

    return chartData.map((item) => {
      const angle = (item.seconds / totalSeconds) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
      const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
      const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
      const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);

      const largeArc = angle > 180 ? 1 : 0;

      const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      currentAngle = endAngle;

      return (
        <g key={item.id}>
          <path
            d={path}
            fill={item.color}
            opacity="0.8"
            className="hover:opacity-100 transition-opacity cursor-pointer"
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'brightness(1.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          />
        </g>
      );
    });
  };

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <PieChart className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-semibold text-slate-100">Daily Breakdown</h3>
        </div>
      </div>

      {/* Date Navigator */}
      <div className="flex items-center justify-between mb-6 p-4 bg-slate-700/30 rounded-xl">
        <button
          onClick={goToPreviousDay}
          className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-300" />
        </button>
        
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-purple-400" />
          <span className="text-lg font-semibold text-slate-100">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
        
        <button
          onClick={goToNextDay}
          disabled={isFuture}
          className="p-2 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5 text-slate-300" />
        </button>
      </div>

      {!isToday && (
        <button
          onClick={goToToday}
          className="w-full mb-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-all"
        >
          Jump to Today
        </button>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
          <div className="text-sm text-slate-400 mb-1">Tracked Time</div>
          <div className="text-2xl font-bold text-purple-400">
            {formatTime(totalTracked)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {((totalTracked / totalSeconds) * 100).toFixed(1)}% of day
          </div>
        </div>
        <div className="p-4 bg-slate-700/30 border border-slate-600/30 rounded-xl">
          <div className="text-sm text-slate-400 mb-1">Untracked Time</div>
          <div className="text-2xl font-bold text-slate-300">
            {formatTime(untracked)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {((untracked / totalSeconds) * 100).toFixed(1)}% of day
          </div>
        </div>
      </div>

      {totalTracked === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Clock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p>No activities tracked for this day</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="flex items-center justify-center">
            <svg width="300" height="300" viewBox="0 0 300 300">
              {createPieChart()}
              {/* Center circle for donut effect */}
              <circle cx="150" cy="150" r="80" fill="#1e293b" />
              <text x="150" y="145" textAnchor="middle" className="text-2xl font-bold fill-slate-200">
                24h
              </text>
              <text x="150" y="165" textAnchor="middle" className="text-sm fill-slate-400">
                Total
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div className="space-y-3">
            {chartData.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-200 font-medium flex items-center gap-2">
                    <span>{item.icon}</span>
                    {item.name}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-slate-200 font-semibold">
                    {formatTime(item.seconds)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {item.percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};