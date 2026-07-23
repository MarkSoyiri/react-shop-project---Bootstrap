import DirectionCard from '../components/DirectionCard';

function StoreLocation() {
  return (
    <div style={{ marginTop: '150px', marginBottom: '80px' }}>
      <div className="container-lg">
        <h1 style={{
          fontSize: 36, fontWeight: 800, color: 'var(--color-text)',
          textAlign: 'center', marginBottom: 8
        }}>
          Find a Store Near You
        </h1>
        <p style={{
          textAlign: 'center', color: 'var(--color-text-secondary)',
          fontSize: 16, marginBottom: 40
        }}>
          Visit us for fresh, zesty food made to order.
        </p>

        {/* Map placeholder */}
        <div style={{
          width: '100%', height: 260, borderRadius: 20,
          background: 'var(--color-bg-alt)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          marginBottom: 48, gap: 8
        }}>
          <span style={{ fontSize: 36 }}>🗺️</span>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, fontWeight: 500, margin: 0 }}>
            Map coming soon
          </p>
        </div>

        {/* Direction cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340, 1fr))',
          gap: 24
        }} className="store-grid">
          <DirectionCard />
        </div>
      </div>

      <style>{`
        .store-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        @media (max-width: 768px) {
          .store-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default StoreLocation;
