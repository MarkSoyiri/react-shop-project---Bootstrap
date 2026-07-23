export function Pagination({ page, totalPages, total, onPageChange }) {
    if (totalPages <= 1) return null;

    const pages = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    return (
        <div className="admin-pagination">
            <span className="admin-pagination-info">
                Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, total)} of {total}
            </span>
            <div className="admin-pagination-btns">
                <button
                    className="admin-page-btn"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                {start > 1 && (
                    <>
                        <button className="admin-page-btn" onClick={() => onPageChange(1)}>1</button>
                        {start > 2 && <span style={{ padding: '0 4px', color: 'var(--admin-text-muted)' }}>...</span>}
                    </>
                )}
                {pages.map(p => (
                    <button
                        key={p}
                        className={`admin-page-btn ${p === page ? 'active' : ''}`}
                        onClick={() => onPageChange(p)}
                    >
                        {p}
                    </button>
                ))}
                {end < totalPages && (
                    <>
                        {end < totalPages - 1 && <span style={{ padding: '0 4px', color: 'var(--admin-text-muted)' }}>...</span>}
                        <button className="admin-page-btn" onClick={() => onPageChange(totalPages)}>{totalPages}</button>
                    </>
                )}
                <button
                    className="admin-page-btn"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
            </div>
        </div>
    );
}
