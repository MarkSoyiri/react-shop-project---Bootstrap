import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqData = [
  {
    question: 'How do I place an order?',
    answer: 'Simply browse our menu, add items to your cart, and proceed to checkout. You can choose delivery or pickup, select your payment method, and confirm your order.',
    category: 'Ordering',
  },
  {
    question: 'What are your delivery hours?',
    answer: 'We deliver from 10:00 AM to 10:00 PM, Monday through Saturday. Delivery times may vary based on demand and location.',
    category: 'Delivery',
  },
  {
    question: 'How long does delivery take?',
    answer: 'Standard delivery takes approximately 25-40 minutes depending on your location and order volume. You can track your order in real-time once it\'s confirmed.',
    category: 'Delivery',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept Cash on Delivery, Credit/Debit Cards, and Mobile Money (MTN Mobile Money, Vodafone Cash, AirtelTigo Money).',
    category: 'Payment',
  },
  {
    question: 'Can I cancel or modify my order?',
    answer: 'You can cancel your order as long as it hasn\'t been marked as "Preparing" yet. Once preparation begins, cancellations are no longer possible.',
    category: 'Ordering',
  },
  {
    question: 'Do you offer free delivery?',
    answer: 'Yes! We offer free delivery on orders above GH₵50. A standard delivery fee of GH₵5 applies for orders below this amount.',
    category: 'Delivery',
  },
  {
    question: 'How do I use a promo code?',
    answer: 'Enter your promo code at checkout in the "Coupon Code" field and click "Apply". The discount will be reflected in your order total.',
    category: 'Payment',
  },
  {
    question: 'Are your ingredients fresh?',
    answer: 'Absolutely! We use only the freshest ingredients, sourced locally where possible. All our food is prepared fresh to order.',
    category: 'General',
  },
  {
    question: 'Do you cater for dietary restrictions?',
    answer: 'We offer vegetarian options and can accommodate some dietary requests. Please check our menu for vegetarian items and add special instructions when ordering.',
    category: 'General',
  },
  {
    question: 'How can I contact customer support?',
    answer: 'You can reach us through our Contact page, call us at +233 507 478 237, or email info@zestycave.com. We respond within 24 hours.',
    category: 'General',
  },
];

const categories = ['All', ...new Set(faqData.map(f => f.category))];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = useMemo(() => {
    return faqData.filter((faq) => {
      const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
      const matchesSearch = faq.question.toLowerCase().includes(search.toLowerCase()) ||
        faq.answer.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  return (
    <div style={{ marginTop: '150px', marginBottom: '80px' }}>
      <div style={{ maxWidth: 740, margin: '0 auto', padding: '0 24px' }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: 'var(--color-text)', textAlign: 'center', marginBottom: 8 }}>
          Frequently Asked Questions
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 16, marginBottom: 32 }}>
          Find answers to common questions about ordering, delivery, and more.
        </p>

        {/* Search */}
        <div style={{ marginBottom: 20 }}>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOpenIndex(null); }}
            placeholder="Search questions..."
            style={{
              width: '100%', padding: '12px 18px', borderRadius: 12,
              border: '1.5px solid var(--color-border)', fontSize: 15,
              outline: 'none', boxSizing: 'border-box', background: '#fff'
            }}
          />
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
              style={{
                padding: '8px 18px', borderRadius: 20, border: 'none',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: activeCategory === cat ? 'var(--color-brand)' : 'var(--color-bg-alt)',
                color: activeCategory === cat ? '#fff' : 'var(--color-text-secondary)',
                transition: 'all 0.2s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 40 }}>
              No questions found. Try a different search.
            </p>
          )}
          {filtered.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                style={{
                  background: '#fff', borderRadius: 14, overflow: 'hidden',
                  boxShadow: isOpen
                    ? '0 2px 12px rgba(0,0,0,0.06)'
                    : '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'box-shadow 0.2s'
                }}
              >
                <div
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '18px 22px', cursor: 'pointer', gap: 12
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: 15 }}>
                    {faq.question}
                  </span>
                  <span style={{
                    fontSize: 12, color: 'var(--color-text-secondary)',
                    transition: 'transform 0.25s', flexShrink: 0,
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}>▼</span>
                </div>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                    >
                      <div style={{
                        padding: '0 22px 18px',
                        color: 'var(--color-text-secondary)',
                        fontSize: 14.5, lineHeight: 1.7
                      }}>
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default FAQ;
