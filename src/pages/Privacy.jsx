function Privacy() {
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
          Privacy Policy
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 40 }}>
          Last updated: July 2026
        </p>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>1. Information We Collect</h2>
          <p style={textStyle}>We collect information you provide directly to us, including:</p>
          <ul style={listStyle}>
            <li>Name, email address, and phone number when you create an account</li>
            <li>Delivery addresses for order fulfillment</li>
            <li>Payment information processed securely through our payment partners</li>
            <li>Order history and preferences to improve your experience</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>2. How We Use Your Information</h2>
          <p style={textStyle}>We use the information we collect to:</p>
          <ul style={listStyle}>
            <li>Process and fulfill your orders</li>
            <li>Send order updates and notifications</li>
            <li>Improve our services and customer experience</li>
            <li>Send promotional communications (with your consent)</li>
            <li>Ensure the security of our platform</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>3. Information Sharing</h2>
          <p style={textStyle}>We do not sell your personal information. We may share your information with:</p>
          <ul style={listStyle}>
            <li>Delivery partners to fulfill your orders</li>
            <li>Payment processors to handle transactions</li>
            <li>Legal authorities when required by law</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>4. Data Security</h2>
          <p style={textStyle}>
            We implement appropriate security measures to protect your personal information.
            All sensitive data is encrypted and stored securely.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>5. Your Rights</h2>
          <p style={textStyle}>You have the right to:</p>
          <ul style={listStyle}>
            <li>Access your personal information</li>
            <li>Update or correct your information</li>
            <li>Delete your account</li>
            <li>Opt out of marketing communications</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={headingStyle}>6. Contact Us</h2>
          <p style={textStyle}>
            If you have questions about this Privacy Policy, please contact us at{' '}
            <strong>info@zestycave.com</strong> or <strong>+233 507 478 237</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Privacy;
