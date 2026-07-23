import { useState } from "react";

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSent(true);
    setTimeout(() => setSent(false), 5000);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div style={{ marginTop: '150px', marginBottom: '80px' }}>
      <div className="container-lg">
        {sent && (
          <div style={{
            maxWidth: 520, margin: '0 auto 40px', padding: '24px 32px',
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16
          }}>
            <span style={{ fontSize: 32, lineHeight: 1 }}>✅</span>
            <div>
              <p style={{ fontWeight: 600, color: '#166534', margin: 0 }}>Message sent!</p>
              <p style={{ color: '#15803d', margin: '4px 0 0', fontSize: 14 }}>We'll get back to you within 24 hours.</p>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 48, alignItems: 'start' }}>
          {/* Left column — info */}
          <div style={{ paddingTop: 12 }}>
            <h1 style={{ fontSize: 36, fontWeight: 800, color: 'var(--color-text)', marginBottom: 12 }}>
              Get in Touch
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 16, lineHeight: 1.7, marginBottom: 40 }}>
              Have a question, feedback, or just want to say hi? We'd love to hear from you.
              Our team typically responds within 24 hours.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: '#fff3e6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0
                }}>✉️</div>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--color-text)', margin: 0, fontSize: 15 }}>Email</p>
                  <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0', fontSize: 14 }}>info@zestycave.com</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: '#fff3e6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0
                }}>📞</div>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--color-text)', margin: 0, fontSize: 15 }}>Phone</p>
                  <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0', fontSize: 14 }}>+233 507 478 237</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: '#fff3e6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0
                }}>📍</div>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--color-text)', margin: 0, fontSize: 15 }}>Address</p>
                  <p style={{ color: 'var(--color-text-secondary)', margin: '4px 0 0', fontSize: 14 }}>Tech Area, Kumasi, Ghana</p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 40, display: 'flex', gap: 12 }}>
              {['Facebook', 'Instagram', 'Twitter'].map((s) => (
                <span key={s} style={{
                  padding: '8px 16px', borderRadius: 10,
                  background: 'var(--color-bg-alt)', color: 'var(--color-text-secondary)',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer'
                }}>{s}</span>
              ))}
            </div>
          </div>

          {/* Right column — form card */}
          <div style={{
            background: '#fff', borderRadius: 20,
            padding: '40px 36px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)'
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)', marginBottom: 28 }}>
              Send us a message
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Your name"
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 12,
                    border: '1.5px solid var(--color-border)', fontSize: 15,
                    outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  placeholder="you@example.com"
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 12,
                    border: '1.5px solid var(--color-border)', fontSize: 15,
                    outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>Message *</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  required
                  rows={5}
                  placeholder="How can we help?"
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 12,
                    border: '1.5px solid var(--color-border)', fontSize: 15,
                    outline: 'none', resize: 'vertical', boxSizing: 'border-box'
                  }}
                />
              </div>
              <button type="submit" style={{
                width: '100%', padding: '14px 0', borderRadius: 12,
                background: 'var(--color-brand)', color: '#fff', border: 'none',
                fontSize: 16, fontWeight: 600, cursor: 'pointer',
                transition: 'background 0.2s'
              }}>Send Message</button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .container-lg > div:last-of-type {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Contact;
