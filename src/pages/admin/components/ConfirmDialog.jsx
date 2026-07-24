import { Modal } from './Modal';

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete',
    type = 'danger', loading, show, onCancel, onOk, isOpen, danger, close, confirm }) {
    const isOpenState = open ?? show ?? isOpen ?? false;
    const handleClose = onClose ?? onCancel ?? close;
    const handleConfirm = onConfirm ?? onOk ?? confirm;

    const iconMap = {
        danger: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
        ),
        warning: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
        ),
        info: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
        ),
    };

    const severity = (type === 'danger' || danger) ? 'danger' : type;

    return (
        <Modal open={isOpenState} onClose={handleClose}>
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div className={`admin-confirm-icon ${severity}`}>
                    {iconMap[severity] || iconMap.info}
                </div>
                {title && <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--admin-text)', margin: '0 0 8px' }}>{title}</h3>}
                {message && <p style={{ fontSize: 14, color: 'var(--admin-text-secondary)', margin: 0, lineHeight: 1.6 }}>{message}</p>}
            </div>
            <div className="admin-modal-footer" style={{ border: 'none', paddingTop: 20 }}>
                <button className="admin-btn admin-btn-secondary" onClick={handleClose} disabled={loading}>Cancel</button>
                <button
                    className={`admin-btn ${severity === 'danger' ? 'admin-btn-danger' : 'admin-btn-primary'}`}
                    onClick={handleConfirm}
                    disabled={loading}
                >
                    {loading ? 'Processing...' : confirmLabel}
                </button>
            </div>
        </Modal>
    );
}
