export const SkeletonCard = () => (
  <div className="menu-card" style={styles.card}>
    <div className="skeleton skeleton-image" style={styles.cardImage} />
    <div style={styles.cardContent}>
      <div className="skeleton skeleton-title" style={{ width: '65%', height: 16 }} />
      <div className="skeleton skeleton-text" style={{ width: '85%', height: 12 }} />
      <div className="skeleton skeleton-text" style={{ width: '45%', height: 12 }} />
      <div style={styles.cardFooter}>
        <div className="skeleton" style={{ width: 70, height: 20, borderRadius: 'var(--radius-sm)' }} />
        <div className="skeleton" style={{ width: 64, height: 32, borderRadius: 'var(--radius-sm)' }} />
      </div>
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div style={styles.tableWrap}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} style={styles.tableRow}>
        <div className="skeleton skeleton-avatar" style={{ width: 40, height: 40, borderRadius: 'var(--radius-full)' }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton skeleton-text" style={{ width: '60%', height: 14, marginBottom: 8 }} />
          <div className="skeleton skeleton-text" style={{ width: '40%', height: 12 }} />
        </div>
        <div className="skeleton" style={{ width: 80, height: 18, borderRadius: 'var(--radius-sm)' }} />
      </div>
    ))}
  </div>
);

export const SkeletonStat = () => (
  <div style={styles.statCard}>
    <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)' }} />
    <div style={{ marginTop: 16 }}>
      <div className="skeleton skeleton-title" style={{ width: '50%', height: 20, marginBottom: 8 }} />
      <div className="skeleton skeleton-text" style={{ width: '70%', height: 14 }} />
    </div>
  </div>
);

export const SkeletonPage = () => (
  <div style={styles.pageWrap}>
    <div className="skeleton" style={{ width: 220, height: 32, borderRadius: 'var(--radius-sm)', marginBottom: 32 }} />
    <div className="skeleton" style={{ width: 340, height: 16, borderRadius: 'var(--radius-sm)', marginBottom: 40 }} />
    <div style={styles.pageGrid}>
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
);

const styles = {
  card: {
    background: 'var(--color-bg-card)',
    borderRadius: 'var(--radius-2xl)',
    overflow: 'hidden',
    border: '1px solid var(--color-border-light)',
  },
  cardImage: {
    height: 200,
    width: '100%',
    borderRadius: 0,
  },
  cardContent: {
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  tableWrap: {
    padding: 24,
  },
  tableRow: {
    display: 'flex',
    gap: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  statCard: {
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    padding: 24,
  },
  pageWrap: {
    padding: '120px 24px 80px',
    maxWidth: 1100,
    margin: '0 auto',
  },
  pageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 24,
  },
};
