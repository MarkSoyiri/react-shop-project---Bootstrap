function Terms() {
  const sectionStyle = { marginBottom: 36 };
  const headingStyle = {
    fontSize: 20, fontWeight: 700, color: 'var(--color-text)',
    marginTop: 36, marginBottom: 12
  };
  const textStyle = {
    color: 'var(--color-text-secondary)', fontSize: 15, lineHeight: 1.8, marginBottom: 10
  };
  const listStyle = {
    color: 'var(--color-text-secondary)', fontSize: 15, lineHeight: 1.8,
    paddingLeft: 22, marginBottom: 10
  };

  return (
    <div style={{ marginTop: '150px', marginBottom: '80px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: 'var(--color-text)', marginBottom: 8 }}>
          Terms of Service
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 40 }}>
          Last updated: July 2026
        </p>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>1. Acceptance of Terms</h2>
          <p style={textStyle}>
            By accessing and using Zesty Cave's services, you agree to be bound by these Terms of Service.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>2. Ordering</h2>
          <ul style={listStyle}>
            <li>All orders are subject to availability</li>
            <li>Prices are displayed in Ghana Cedis (GH₵) and include applicable taxes</li>
            <li>We reserve the right to refuse or cancel orders</li>
            <li>Order confirmation does not guarantee delivery if items are unavailable</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>3. Payment</h2>
          <ul style={listStyle}>
            <li>Payment must be made at the time of ordering or upon delivery (for cash payments)</li>
            <li>We accept Cash, Cards, and Mobile Money</li>
            <li>All prices are inclusive of applicable taxes</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>4. Delivery</h2>
          <ul style={listStyle}>
            <li>Delivery times are estimates and may vary</li>
            <li>Free delivery is available for orders above GH₵50</li>
            <li>Delivery is limited to our service area</li>
            <li>You must be available to receive your order at the delivery address</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>5. Cancellation & Refunds</h2>
          <ul style={listStyle}>
            <li>Orders can be cancelled before preparation begins</li>
            <li>Refunds for cancelled orders will be processed within 3-5 business days</li>
            <li>If your order is incorrect or unsatisfactory, please contact us within 24 hours</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>6. Promotions & Coupons</h2>
          <ul style={listStyle}>
            <li>Promo codes are subject to their specific terms and conditions</li>
            <li>Only one promo code can be used per order unless stated otherwise</li>
            <li>We reserve the right to modify or cancel promotions at any time</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>7. Account Responsibilities</h2>
          <ul style={listStyle}>
            <li>You are responsible for maintaining the security of your account</li>
            <li>You must provide accurate and complete information</li>
            <li>One account per person</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>8. Limitation of Liability</h2>
          <p style={textStyle}>
            Zesty Cave shall not be liable for any indirect, incidental, or consequential damages
            arising from the use of our services.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>9. Changes to Terms</h2>
          <p style={textStyle}>
            We may update these terms from time to time. Continued use of our services constitutes
            acceptance of the updated terms.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>10. Contact</h2>
          <p style={textStyle}>
            For questions about these Terms, contact us at{' '}
            <strong>info@zestycave.com</strong> or <strong>+233 507 478 237</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Terms;
