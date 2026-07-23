export function SkeletonStatCards({ count = 4 }) {
    return (
        <div className="admin-stat-grid">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="admin-skeleton-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div className="admin-skeleton admin-skeleton-text" style={{ width: 80 }} />
                        <div className="admin-skeleton" style={{ width: 40, height: 40, borderRadius: 8 }} />
                    </div>
                    <div className="admin-skeleton admin-skeleton-heading" style={{ marginBottom: 8 }} />
                    <div className="admin-skeleton admin-skeleton-text" style={{ width: 100 }} />
                </div>
            ))}
        </div>
    );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
    return (
        <div className="admin-card">
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--admin-border-light)' }}>
                <div className="admin-skeleton admin-skeleton-text" style={{ width: 120, height: 20 }} />
            </div>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="admin-skeleton-table-row" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                    {Array.from({ length: cols }).map((_, j) => (
                        <div key={j} className="admin-skeleton admin-skeleton-text" style={{ height: 16, width: j === 0 ? '80%' : '60%' }} />
                    ))}
                </div>
            ))}
        </div>
    );
}
