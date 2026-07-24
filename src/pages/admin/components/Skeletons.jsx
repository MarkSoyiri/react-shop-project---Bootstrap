export function SkeletonStatCards({ count = 4 }) {
    return (
        <div className="admin-stat-grid">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="admin-skeleton-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div className="admin-skeleton" style={{ width: 80, height: 14 }} />
                        <div className="admin-skeleton" style={{ width: 36, height: 36, borderRadius: 8 }} />
                    </div>
                    <div className="admin-skeleton" style={{ width: 120, height: 28, marginBottom: 8 }} />
                    <div className="admin-skeleton" style={{ width: 60, height: 14 }} />
                </div>
            ))}
        </div>
    );
}

export function SkeletonTable({ rows = 5, cols = 5, columns }) {
    const numCols = cols || columns || 5;
    return (
        <div className="admin-card">
            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            {Array.from({ length: numCols }).map((_, i) => (
                                <th key={i}><div className="admin-skeleton" style={{ width: '60%', height: 12 }} /></th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: rows }).map((_, row) => (
                            <tr key={row}>
                                {Array.from({ length: numCols }).map((_, col) => (
                                    <td key={col}>
                                        <div className="admin-skeleton" style={{ width: col === 0 ? '80%' : '60%', height: 14 }} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
