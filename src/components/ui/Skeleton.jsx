export const SkeletonCard = () => (
  <div className="menu-card">
    <div className="skeleton skeleton-image" />
    <div style={{ padding: '16px' }}>
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-text" style={{ width: '80%' }} />
      <div className="skeleton skeleton-text" style={{ width: '40%' }} />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div style={{ padding: '24px' }}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center' }}>
        <div className="skeleton skeleton-avatar" />
        <div style={{ flex: 1 }}>
          <div className="skeleton skeleton-text" style={{ width: '60%' }} />
          <div className="skeleton skeleton-text" style={{ width: '40%' }} />
        </div>
        <div className="skeleton skeleton-text" style={{ width: '80px' }} />
      </div>
    ))}
  </div>
);

export const SkeletonStat = () => (
  <div className="stat-card">
    <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 8, marginBottom: 16 }} />
    <div className="skeleton skeleton-title" style={{ width: '50%' }} />
    <div className="skeleton skeleton-text" style={{ width: '70%' }} />
  </div>
);

export const SkeletonPage = () => (
  <div style={{ padding: '120px 24px 80px', maxWidth: 1100, margin: '0 auto' }}>
    <div className="skeleton skeleton-title" style={{ width: '200px', marginBottom: 32 }} />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
);
