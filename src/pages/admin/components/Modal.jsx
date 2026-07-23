import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Modal({ open, onClose, title, children, footer, wide }) {
    const ref = useRef();

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        if (open) window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="admin-modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
                >
                    <motion.div
                        ref={ref}
                        className={`admin-modal ${wide ? 'wide' : ''}`}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.25 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {title && (
                            <div className="admin-modal-header">
                                <h3 className="admin-modal-title">{title}</h3>
                                <button className="admin-modal-close" onClick={onClose}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                        )}
                        <div className="admin-modal-body">{children}</div>
                        {footer && <div className="admin-modal-footer">{footer}</div>}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
