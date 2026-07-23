export const SkeletonCard = () => (
  <div className="zc-product-card" style={styles.card}>
    <div className="skeleton skeleton-image" style={styles.cardImage} />
    <div style={styles.cardContent}>
      <div className="skeleton skeleton-title" style={{ width: '70%', height: 16 }} />
      <div className="skeleton skeleton-text" style={{ width: '90%', height: 12 }} />
      <div className="skeleton skeleton-text" style={{ width: '50%', height: 12 }} />
      <div style={styles.cardSpacer} />
      <div style={styles.cardFooter}>
        <div className="skeleton" style={{ width: 70, height: 20, borderRadius: 'var(--radius-sm)' }} />
        <div className="skeleton" style={{ width: 52, height: 30, borderRadius: 'var(--radius-sm)' }} />
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
    display: 'flex',
    flexDirection: 'column',
    height: 400,
  },
  cardImage: {
    height: 220,
    minHeight: 220,
    maxHeight: 220,
    width: '100%',
    borderRadius: 0,
  },
  cardContent: {
    flex: 1,
    padding: '14px 16px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  cardSpacer: {
    flex: 1,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTop: '1px solid var(--color-border-light)',
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
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 24,
  },
};
