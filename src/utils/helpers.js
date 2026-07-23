export const API_BASE = import.meta.env.VITE_API_URL || 'https://express-js-on-vercel-liart-chi.vercel.app/api';

export const CATEGORIES = [
  { value: 'burgers', label: 'Burgers', icon: '🍔' },
  { value: 'meals', label: 'Meals', icon: '🍽️' },
  { value: 'combos', label: 'Combos', icon: '📦' },
  { value: 'sides', label: 'Sides', icon: '🍟' },
  { value: 'desserts', label: 'Desserts', icon: '🍰' },
  { value: 'drinks', label: 'Drinks', icon: '🥤' },
  { value: 'value deals', label: 'Value Deals', icon: '💰' },
  { value: 'promotions', label: 'Promotions', icon: '🔥' },
];

export const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: '#f59e0b', icon: '⏳' },
  { value: 'confirmed', label: 'Confirmed', color: '#3b82f6', icon: '✓' },
  { value: 'preparing', label: 'Preparing', color: '#8b5cf6', icon: '👨‍🍳' },
  { value: 'ready', label: 'Ready', color: '#10b981', icon: '✅' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: '#06b6d4', icon: '🚗' },
  { value: 'delivered', label: 'Delivered', color: '#22c55e', icon: '🎉' },
  { value: 'cancelled', label: 'Cancelled', color: '#ef4444', icon: '✕' },
];

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash on Delivery', icon: '💵' },
  { value: 'card', label: 'Credit/Debit Card', icon: '💳' },
  { value: 'mobile_money', label: 'Mobile Money', icon: '📱' },
];

export const formatCurrency = (amount) => {
  return `GH₵${Number(amount || 0).toFixed(2)}`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusInfo = (status) => {
  return ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];
};

export const debounce = (fn, ms) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};
