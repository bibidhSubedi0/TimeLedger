import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { formatTime } from '../utils/timeUtils';
import { getAllCategories } from '../utils/categoryUtils';

export const DailyTimeline = ({ tasks, customCategories = [] }) => {
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
  const getDayTasks = () => {
    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(23, 59, 59, 999);

    const dayTasks = [];

    tasks.forEach(task => {
      const taskStart = new Date(task.startTime);
      const taskEnd = new Date(task.endTime);

      // Check if task overlaps with selected day
      if (taskEnd >= dayStart && taskStart <= dayEnd) {
        // Calculate overlap
        const overlapStart = Math.max(taskStart.getTime(), dayStart.getTime());
        const overlapEnd = Math.min(taskEnd.getTime(), dayEnd.getTime());

        if (overlapEnd > overlapStart) {
          const categoryInfo = CATEGORIES.find(c => c.id === task.category) || CATEGORIES[CATEGORIES.length - 1];
          
          dayTasks.push({
            ...task,
            displayStart: overlapStart,
            displayEnd: overlapEnd,
            categoryInfo
          });
        }
      }
    });

    return dayTasks.sort((a, b) => a.displayStart - b.displayStart);
  };

  const dayTasks = getDayTasks();

  // Calculate position and width for timeline bars
  const getTaskPosition = (task) => {
    const dayStart = new Date(selectedDate).setHours(0, 0, 0, 0);
    const dayDuration = 24 * 60 * 60 * 1000; // 24 hours in ms

    const startOffset = task.displayStart - dayStart;
    const duration = task.displayEnd - task.displayStart;

    const leftPercent = (startOffset / dayDuration) * 100;
    const widthPercent = (duration / dayDuration) * 100;

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`
    };
  };

  // Format time for display
  const formatTimeOfDay = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Generate hour markers
  const hourMarkers = Array.from({ length: 25 }, (_, i) => i);

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-semibold text-slate-100">Daily Timeline</h3>
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

      {dayTasks.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Clock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p>No activities tracked for this day</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Hour markers */}
          <div className="relative h-8 border-b border-slate-700">
            {hourMarkers.map(hour => (
              <div
                key={hour}
                className="absolute top-0 bottom-0"
                style={{ left: `${(hour / 24) * 100}%` }}
              >
                <div className="absolute -left-6 top-0 text-xs text-slate-500 w-12 text-center">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </div>
                <div className="h-2 w-px bg-slate-700"></div>
              </div>
            ))}
          </div>

          {/* Timeline bars - Smart row placement */}
          <div className="relative mt-8" style={{ minHeight: '80px' }}>
            {/* Time grid background */}
            <div className="absolute inset-0 flex">
              {hourMarkers.slice(0, 24).map(hour => (
                <div
                  key={hour}
                  className="flex-1 border-r border-slate-800/30"
                />
              ))}
            </div>

            {/* Task bars with automatic row placement */}
            {(() => {
              // Algorithm to place tasks in rows without overlap
              const rows = [];
              
              dayTasks.forEach(task => {
                const position = getTaskPosition(task);
                const startPercent = parseFloat(position.left);
                const endPercent = startPercent + parseFloat(position.width);
                
                // Find the first row where this task fits
                let placedInRow = false;
                for (let i = 0; i < rows.length; i++) {
                  const row = rows[i];
                  let canFit = true;
                  
                  // Check if task overlaps with any task in this row
                  for (const existingTask of row) {
                    const existingStart = parseFloat(existingTask.position.left);
                    const existingEnd = existingStart + parseFloat(existingTask.position.width);
                    
                    // Check for overlap (with small padding)
                    if (!(endPercent <= existingStart + 0.5 || startPercent >= existingEnd - 0.5)) {
                      canFit = false;
                      break;
                    }
                  }
                  
                  if (canFit) {
                    row.push({ task, position });
                    placedInRow = true;
                    break;
                  }
                }
                
                // If no row fits, create a new row
                if (!placedInRow) {
                  rows.push([{ task, position }]);
                }
              });
              
              // Calculate total height needed
              const totalHeight = rows.length * 68;
              
              // Render all rows
              return (
                <div style={{ height: `${totalHeight}px` }}>
                  {rows.map((row, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="absolute left-0 right-0"
                      style={{ 
                        top: `${rowIndex * 68}px`,
                        height: '60px'
                      }}
                    >
                      {row.map(({ task, position }, taskIndex) => {
                        const durationSeconds = Math.floor((task.displayEnd - task.displayStart) / 1000);
                        const widthPercent = parseFloat(position.width);
                        const isNarrow = widthPercent < 8; // Less than ~2 hours
                        
                        return (
                          <div
                            key={`${task.id}-${taskIndex}`}
                            className="absolute h-full group"
                            style={position}
                          >
                            <div
                              className="h-full rounded-lg transition-all hover:scale-105 hover:z-10 cursor-pointer shadow-lg relative"
                              style={{
                                backgroundColor: task.categoryInfo.color,
                                opacity: 0.9
                              }}
                            >
                              <div className="h-full px-2 flex items-center overflow-hidden">
                                {isNarrow ? (
                                  // Minimal display for narrow tasks
                                  <div className="flex items-center justify-center w-full">
                                    <span className="text-lg">{task.categoryInfo.icon}</span>
                                  </div>
                                ) : (
                                  // Full display for wider tasks
                                  <>
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      <span className="text-xl flex-shrink-0">{task.categoryInfo.icon}</span>
                                      <div className="min-w-0">
                                        <div className="text-white font-medium text-sm truncate">
                                          {task.name}
                                        </div>
                                        <div className="text-white/70 text-xs">
                                          {formatTime(durationSeconds)}
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>

                              {/* Hover tooltip */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-xl">
                                <div className="text-white font-medium mb-1">{task.name}</div>
                                <div className="text-slate-300 text-xs mb-1">
                                  {task.categoryInfo.icon} {task.categoryInfo.name}
                                </div>
                                <div className="text-slate-400 text-xs">
                                  {formatTimeOfDay(task.displayStart)} - {formatTimeOfDay(task.displayEnd)}
                                </div>
                                <div className="text-purple-400 text-xs font-mono">
                                  Duration: {formatTime(durationSeconds)}
                                </div>
                                {task.notes && (
                                  <div className="text-slate-400 text-xs mt-1 italic max-w-xs">
                                    "{task.notes}"
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Total tracked time</span>
              <span className="text-lg font-bold text-purple-400">
                {formatTime(
                  dayTasks.reduce((sum, task) => 
                    sum + Math.floor((task.displayEnd - task.displayStart) / 1000), 0
                  )
                )}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 p-4 bg-slate-700/30 rounded-xl">
            <div className="text-sm font-medium text-slate-300 mb-3">Categories</div>
            <div className="flex flex-wrap gap-3">
              {Array.from(new Set(dayTasks.map(t => t.category)))
                .map(catId => {
                  const categoryInfo = CATEGORIES.find(c => c.id === catId) || CATEGORIES[CATEGORIES.length - 1];
                  const categoryTasks = dayTasks.filter(t => t.category === catId);
                  const totalTime = categoryTasks.reduce(
                    (sum, t) => sum + Math.floor((t.displayEnd - t.displayStart) / 1000),
                    0
                  );
                  
                  return (
                    <div
                      key={catId}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg"
                    >
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: categoryInfo.color }}
                      />
                      <span className="text-xs text-slate-300">
                        {categoryInfo.icon} {categoryInfo.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        ({formatTime(totalTime)})
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};