import { Modal } from './Modal';

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete', type = 'danger', loading }) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title=""
            footer={
                <>
                    <button className="admin-btn admin-btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
                    <button
                        className={`admin-btn admin-btn-${type === 'danger' ? 'danger' : 'primary'}`}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : confirmLabel}
                    </button>
                </>
            }
        >
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div className={`admin-confirm-icon ${type}`}>
                    {type === 'danger' ? (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    ) : (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    )}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'var(--admin-text-secondary)' }}>{message}</p>
            </div>
        </Modal>
    );
}
