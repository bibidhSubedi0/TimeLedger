import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Tag, Palette } from 'lucide-react';

const DEFAULT_COLORS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#10b981', // Green
  '#f59e0b', // Orange
  '#06b6d4', // Cyan
  '#f97316', // Dark Orange
  '#64748b', // Gray
  '#ef4444', // Red
  '#14b8a6', // Teal
  '#a855f7', // Violet
  '#eab308', // Yellow
];

const DEFAULT_ICONS = [
  '📚', '💼', '🎮', '💪', '😴', '📖', '💻', '🎨', '🎵', '🍔',
  '✈️', '🏃', '🎬', '📱', '🎯', '🔧', '🎓', '💡', '🌟', '⚡',
  '🔥', '💰', '🏠', '🚗', '☕', '📝', '🎤', '🏋️', '🧘', '🛒'
];

export const CategoryManager = ({ categories, onUpdateCategories, onClose }) => {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [editColor, setEditColor] = useState('');
  
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('📌');
  const [newColor, setNewColor] = useState('#3b82f6');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleAddCategory = () => {
    if (!newName.trim()) {
      alert('Please enter a category name');
      return;
    }

    // Create category ID from name (lowercase, no spaces)
    const id = newName.toLowerCase().replace(/\s+/g, '_');

    // Check if ID already exists
    if (categories.find(c => c.id === id)) {
      alert('A category with this name already exists');
      return;
    }

    const newCategory = {
      id,
      name: newName.trim(),
      icon: newIcon,
      color: newColor,
      isCustom: true
    };

    onUpdateCategories([...categories, newCategory]);
    
    // Reset form
    setNewName('');
    setNewIcon('📌');
    setNewColor('#3b82f6');
  };

  const handleDeleteCategory = (categoryId) => {
    // Prevent deleting default categories
    const category = categories.find(c => c.id === categoryId);
    if (!category.isCustom) {
      alert('Cannot delete default categories');
      return;
    }

    if (window.confirm(`Delete category "${category.name}"?`)) {
      onUpdateCategories(categories.filter(c => c.id !== categoryId));
    }
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditIcon(category.icon);
    setEditColor(category.color);
  };

  const saveEdit = () => {
    if (!editName.trim()) {
      alert('Category name cannot be empty');
      return;
    }

    onUpdateCategories(
      categories.map(c =>
        c.id === editingId
          ? { ...c, name: editName.trim(), icon: editIcon, color: editColor }
          : c
      )
    );
    
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditIcon('');
    setEditColor('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Tag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Manage Categories</h2>
              <p className="text-sm text-slate-400">Add or edit your task categories</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Add New Category */}
        <div className="p-6 border-b border-slate-700 bg-slate-900/30">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Add New Category</h3>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              {/* Icon Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center text-3xl hover:border-purple-500 transition-colors"
                  title="Choose icon"
                >
                  {newIcon}
                </button>
                
                {showIconPicker && (
                  <div className="absolute top-full left-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-2xl z-20 w-64">
                    <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                      {DEFAULT_ICONS.map(icon => (
                        <button
                          key={icon}
                          onClick={() => {
                            setNewIcon(icon);
                            setShowIconPicker(false);
                          }}
                          className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Name Input */}
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Category name..."
                className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-200"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              />

              {/* Color Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-16 h-16 border-2 border-slate-700 rounded-lg hover:border-purple-500 transition-colors"
                  style={{ backgroundColor: newColor }}
                  title="Choose color"
                />
                
                {showColorPicker && (
                  <div className="absolute top-full right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-2xl z-20">
                    <div className="grid grid-cols-4 gap-2">
                      {DEFAULT_COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => {
                            setNewColor(color);
                            setShowColorPicker(false);
                          }}
                          className="w-10 h-10 rounded-lg border-2 border-slate-700 hover:border-white transition-colors"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleAddCategory}
              className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Category
            </button>
          </div>
        </div>

        {/* Existing Categories */}
        <div className="p-6">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Your Categories ({categories.length})</h3>
          
          <div className="space-y-2">
            {categories.map(category => {
              if (editingId === category.id) {
                return (
                  <div key={category.id} className="p-4 bg-slate-700/30 rounded-xl border border-slate-600">
                    <div className="flex gap-3 mb-3">
                      {/* Icon Selector */}
                      <input
                        type="text"
                        value={editIcon}
                        onChange={(e) => setEditIcon(e.target.value)}
                        className="w-16 text-center text-2xl px-2 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:border-purple-500 focus:outline-none"
                      />
                      
                      {/* Name Input */}
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:border-purple-500 focus:outline-none text-slate-200"
                      />
                      
                      {/* Color Input */}
                      <input
                        type="color"
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        className="w-16 h-12 rounded-lg cursor-pointer"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 px-4 py-2 bg-slate-600/50 hover:bg-slate-600 text-slate-300 rounded-lg flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600/50 hover:border-purple-500/50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      {category.icon}
                    </div>
                    <div>
                      <div className="font-medium text-slate-200">{category.name}</div>
                      <div className="text-xs text-slate-500">
                        {category.isCustom ? 'Custom' : 'Default'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(category)}
                      className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/20 rounded-lg transition-all"
                      title="Edit category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {category.isCustom && (
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-900/30">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};