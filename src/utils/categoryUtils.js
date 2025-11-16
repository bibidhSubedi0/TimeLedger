export const getDefaultCategories = () => [
  { id: 'study', name: 'Study', color: '#3b82f6', icon: '📚', isCustom: false },
  { id: 'work', name: 'Work', color: '#8b5cf6', icon: '💼', isCustom: false },
  { id: 'gaming', name: 'Gaming', color: '#ec4899', icon: '🎮', isCustom: false },
  { id: 'exercise', name: 'Exercise', color: '#10b981', icon: '💪', isCustom: false },
  { id: 'slacking', name: 'Slacking', color: '#64748b', icon: '😴', isCustom: false },
];

export const getAllCategories = (customCategories = []) => {
  return [...getDefaultCategories(), ...customCategories];
};