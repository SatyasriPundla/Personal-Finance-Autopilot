import React from 'react';
import {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Receipt,
  Film,
  HeartPulse,
  GraduationCap,
  Plane,
  Layers,
  Banknote,
  Laptop,
  Briefcase,
  TrendingUp,
  Gift,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';

export const CATEGORY_METADATA = {
  Food: {
    icon: UtensilsCrossed,
    color: '#F43F5E', // Coral Red
    bg: 'bg-rose-50 text-rose-600 border-rose-100',
    gradient: 'from-rose-500 to-pink-600',
  },
  Transportation: {
    icon: Car,
    color: '#F59E0B', // Amber
    bg: 'bg-amber-50 text-amber-600 border-amber-100',
    gradient: 'from-amber-500 to-orange-600',
  },
  Shopping: {
    icon: ShoppingBag,
    color: '#EC4899', // Pink
    bg: 'bg-pink-50 text-pink-600 border-pink-100',
    gradient: 'from-pink-500 to-rose-600',
  },
  Bills: {
    icon: Receipt,
    color: '#6366F1', // Indigo
    bg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    gradient: 'from-indigo-500 to-violet-600',
  },
  Entertainment: {
    icon: Film,
    color: '#8B5CF6', // Violet
    bg: 'bg-purple-50 text-purple-600 border-purple-100',
    gradient: 'from-purple-500 to-indigo-600',
  },
  Healthcare: {
    icon: HeartPulse,
    color: '#10B981', // Emerald
    bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    gradient: 'from-emerald-500 to-teal-600',
  },
  Education: {
    icon: GraduationCap,
    color: '#0EA5E9', // Sky Blue
    bg: 'bg-sky-50 text-sky-600 border-sky-100',
    gradient: 'from-sky-500 to-blue-600',
  },
  Travel: {
    icon: Plane,
    color: '#14B8A6', // Bright Teal
    bg: 'bg-teal-50 text-teal-600 border-teal-100',
    gradient: 'from-teal-500 to-emerald-600',
  },
  Other: {
    icon: Layers,
    color: '#64748B', // Slate
    bg: 'bg-slate-50 text-slate-600 border-slate-200',
    gradient: 'from-slate-500 to-slate-700',
  },
  // Income categories
  Salary: {
    icon: Banknote,
    color: '#10B981', // Emerald
    bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    gradient: 'from-emerald-500 to-green-600',
  },
  Freelance: {
    icon: Laptop,
    color: '#14B8A6', // Bright Teal
    bg: 'bg-teal-50 text-teal-600 border-teal-100',
    gradient: 'from-teal-500 to-cyan-600',
  },
  Business: {
    icon: Briefcase,
    color: '#8B5CF6', // Violet
    bg: 'bg-violet-50 text-violet-600 border-violet-100',
    gradient: 'from-violet-500 to-purple-600',
  },
  Investments: {
    icon: TrendingUp,
    color: '#F59E0B', // Amber
    bg: 'bg-amber-50 text-amber-600 border-amber-100',
    gradient: 'from-amber-500 to-yellow-600',
  },
  Gifts: {
    icon: Gift,
    color: '#EC4899', // Pink
    bg: 'bg-pink-50 text-pink-600 border-pink-100',
    gradient: 'from-pink-500 to-rose-500',
  },
};

export function getCategoryMeta(categoryName) {
  return CATEGORY_METADATA[categoryName] || CATEGORY_METADATA['Other'];
}

export function CategoryBadge({ category, size = 'default' }) {
  const meta = getCategoryMeta(category);
  const Icon = meta.icon;

  const sizeClasses = {
    small: 'text-[10px] px-2 py-0.5 gap-1',
    default: 'text-xs px-2.5 py-1 gap-1.5',
    large: 'text-sm px-3 py-1.5 gap-2',
  }[size] || 'text-xs px-2.5 py-1 gap-1.5';

  const iconSizes = {
    small: 'w-3 h-3',
    default: 'w-3.5 h-3.5',
    large: 'w-4 h-4',
  }[size] || 'w-3.5 h-3.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-xl border ${meta.bg} ${sizeClasses}`}
    >
      <Icon className={iconSizes} />
      <span>{category}</span>
    </span>
  );
}

export function CategoryIconCircle({ category, size = 'default' }) {
  const meta = getCategoryMeta(category);
  const Icon = meta.icon;

  const sizeClasses = {
    small: 'w-7 h-7 rounded-lg',
    default: 'w-9 h-9 rounded-xl',
    large: 'w-11 h-11 rounded-2xl',
  }[size] || 'w-9 h-9 rounded-xl';

  const iconSizes = {
    small: 'w-3.5 h-3.5',
    default: 'w-4 h-4',
    large: 'w-5 h-5',
  }[size] || 'w-4 h-4';

  return (
    <div
      className={`flex items-center justify-center shrink-0 border ${meta.bg} ${sizeClasses} shadow-xs`}
    >
      <Icon className={iconSizes} />
    </div>
  );
}
