function About() {
  const values = [
    {
      emoji: '🌿',
      title: 'Fresh',
      desc: 'Locally sourced ingredients prepared fresh to order — no shortcuts, no compromise.',
    },
    {
      emoji: '⚡',
      title: 'Fast',
      desc: 'Quick service without cutting corners. Your food is ready when you are.',
    },
    {
      emoji: '🤝',
      title: 'Friendly',
      desc: 'A warm, welcoming vibe that makes every visit feel like coming home.',
    },
  ];

  return (
    <div>
      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
        padding: '140px 24px 80px', textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: 42, fontWeight: 900, color: '#fff', margin: 0
        }}>
          About Zesty Cave
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.6)', fontSize: 18, marginTop: 12, maxWidth: 520, margin: '12px auto 0'
        }}>
          Ghana's ultimate destination for bold flavors, quick bites, and a touch of local flair.
        </p>
      </div>

      {/* Story */}
      <div style={{ padding: '72px 24px', maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{
          fontSize: 28, fontWeight: 800, color: 'var(--color-text)', marginBottom: 20, textAlign: 'center'
        }}>
          Our Story
        </h2>
        <div style={{
          color: 'var(--color-text-secondary)', fontSize: 16, lineHeight: 1.8,
          display: 'flex', flexDirection: 'column', gap: 18
        }}>
          <p style={{ margin: 0 }}>
            At <strong>Zesty Cave</strong>, we believe fast food should never be ordinary.
            That's why every meal we serve is crafted with passion, made fresh, and seasoned
            with the rich, vibrant tastes of Africa. From our juicy grilled burgers to our
            crispy fries and spicy wings, every bite takes you on a flavorful journey that's
            uniquely Ghanaian.
          </p>
          <p style={{ margin: 0 }}>
            We started <strong>Zesty Cave</strong> with a simple mission: to bring people
            together through good food, great vibes, and unforgettable taste. Whether you're
            grabbing lunch on the go, hanging out with friends, or craving a late-night snack,
            Zesty Cave is your spot for fresh, zesty satisfaction — fast!
          </p>
          <p style={{ margin: 0, fontWeight: 600, textAlign: 'center', marginTop: 8 }}>
            Come hungry. Leave happy.<br />
            <span style={{ color: 'var(--color-brand-dark)' }}>Taste the</span>{' '}
            <span style={{ color: '#d97706' }}>fire, feel</span>{' '}
            <span style={{ color: 'var(--color-accent)' }}>the rhythm!</span>
          </p>
        </div>
      </div>

      {/* Values */}
      <div style={{ padding: '72px 24px', background: 'var(--color-bg-alt)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 28, fontWeight: 800, color: 'var(--color-text)',
            textAlign: 'center', marginBottom: 48
          }}>
            What We Stand For
          </h2>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 28
          }} className="values-grid">
            {values.map((v) => (
              <div key={v.title} style={{
                background: '#fff', borderRadius: 20, padding: '36px 28px',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)'
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: '#fff3e6', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, margin: '0 auto 20px'
                }}>
                  {v.emoji}
                </div>
                <h3 style={{
                  fontSize: 20, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 10px'
                }}>
                  {v.title}
                </h3>
                <p style={{
                  color: 'var(--color-text-secondary)', fontSize: 14.5,
                  lineHeight: 1.7, margin: 0
                }}>
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .values-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export default About;
