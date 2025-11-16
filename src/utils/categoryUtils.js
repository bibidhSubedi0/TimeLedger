export const getDefaultCategories = () => [
  { id: 'sleep', name: 'Sleep or Nap', color: '#6366f1', icon: '😴', isCustom: false },
  { id: 'college_work_and_study', name: 'College Work and Study', color: '#3b82f6', icon: '📚', isCustom: false },
  { id: 'extra_study', name: 'Extra Study', color: '#8b5cf6', icon: '📖', isCustom: false },
  { id: 'household_work', name: 'Household Work', color: '#10b981', icon: '🛒', isCustom: false },
  { id: 'slacking', name: 'Slacking', color: '#64748b', icon: '😴', isCustom: false },
  { id: 'gaming', name: 'Gaming', color: '#ec4899', icon: '🎮', isCustom: false },
  { id: 'exercise', name: 'Exercise', color: '#f59e0b', icon: '💪', isCustom: false },
  { id: 'general_life', name: 'General Life', color: '#06b6d4', icon: '🌟', isCustom: false },
  { id: 'projects', name: 'Projects', color: '#66ccff', icon: '📽️', isCustom: false },
];

export const getAllCategories = (customCategories = []) => {
  return [...getDefaultCategories(), ...customCategories];
};