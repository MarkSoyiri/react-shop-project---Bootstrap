import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqData = [
  {
    question: 'How do I place an order?',
    answer: 'Simply browse our menu, add items to your cart, and proceed to checkout. You can choose delivery or pickup, select your payment method, and confirm your order.',
  },
  {
    question: 'What are your delivery hours?',
    answer: 'We deliver from 10:00 AM to 10:00 PM, Monday through Saturday. Delivery times may vary based on demand and location.',
  },
  {
    question: 'How long does delivery take?',
    answer: 'Standard delivery takes approximately 25-40 minutes depending on your location and order volume. You can track your order in real-time once it\'s confirmed.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept Cash on Delivery, Credit/Debit Cards, and Mobile Money (MTN Mobile Money, Vodafone Cash, AirtelTigo Money).',
  },
  {
    question: 'Can I cancel or modify my order?',
    answer: 'You can cancel your order as long as it hasn\'t been marked as "Preparing" yet. Once preparation begins, cancellations are no longer possible.',
  },
  {
    question: 'Do you offer free delivery?',
    answer: 'Yes! We offer free delivery on orders above GH₵50. A standard delivery fee of GH₵5 applies for orders below this amount.',
  },
  {
    question: 'How do I use a promo code?',
    answer: 'Enter your promo code at checkout in the "Coupon Code" field and click "Apply". The discount will be reflected in your order total.',
  },
  {
    question: 'Are your ingredients fresh?',
    answer: 'Absolutely! We use only the freshest ingredients, sourced locally where possible. All our food is prepared fresh to order.',
  },
  {
    question: 'Do you cater for dietary restrictions?',
    answer: 'We offer vegetarian options and can accommodate some dietary requests. Please check our menu for vegetarian items and add special instructions when ordering.',
  },
  {
    question: 'How can I contact customer support?',
    answer: 'You can reach us through our Contact page, call us at +233 507 478 237, or email info@zestycave.com. We respond within 24 hours.',
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="legal-page">
      <div className="legal-content" style={{ padding: '0 24px' }}>
        <h1>Frequently Asked Questions</h1>
        <p className="last-updated">Find answers to common questions about ordering, delivery, and more.</p>

        <div style={{ marginTop: 32 }}>
          {faqData.map((faq, i) => (
            <motion.div
              key={i}
              className={`faq-item ${openIndex === i ? 'open' : ''}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div
                className="faq-question"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span>{faq.question}</span>
                <span className="faq-arrow">▼</span>
              </div>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="faq-answer">{faq.answer}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FAQ;
