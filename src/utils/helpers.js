export const API_BASE = import.meta.env.VITE_API_URL || 'https://express-js-on-vercel-liart-chi.vercel.app/api';
export const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_your_public_key_here';
export const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'https://react-shop-project-bootstrap.vercel.app';

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
  { value: 'pay_online', label: 'Pay Online (Paystack)', icon: '💳', description: 'Pay securely with card, mobile money, or bank transfer' },
  { value: 'cash', label: 'Cash on Delivery', icon: '💵', description: 'Pay when your order arrives' },
];

export const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending', color: '#f59e0b', icon: '⏳', bgColor: '#fef3c7' },
  { value: 'paid', label: 'Paid', color: '#22c55e', icon: '✓', bgColor: '#dcfce7' },
  { value: 'failed', label: 'Failed', color: '#ef4444', icon: '✕', bgColor: '#fef2f2' },
  { value: 'cancelled', label: 'Cancelled', color: '#6b7280', icon: '✕', bgColor: '#f3f4f6' },
  { value: 'refunded', label: 'Refunded', color: '#8b5cf6', icon: '↩', bgColor: '#ede9fe' },
  { value: 'partially_refunded', label: 'Partially Refunded', color: '#a855f7', icon: '↩', bgColor: '#f3e8ff' },
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

export const getPaymentStatusInfo = (status) => {
  return PAYMENT_STATUSES.find(s => s.value === status) || PAYMENT_STATUSES[0];
};

export const getPaymentMethodLabel = (method) => {
  const methodMap = {
    cash: 'Cash on Delivery',
    card: 'Credit/Debit Card',
    mobile_money: 'Mobile Money',
    pay_online: 'Online Payment',
    bank_transfer: 'Bank Transfer',
    ussd: 'USSD',
    card_no: 'Card',
  };
  return methodMap[method] || method;
};

export const debounce = (fn, ms) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};
