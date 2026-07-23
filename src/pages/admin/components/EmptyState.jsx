import { motion } from 'framer-motion';

export function EmptyState({ icon, title, description, action, message }) {
    const displayTitle = title || message;
    return (
        <motion.div
            className="admin-empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            {icon && <div className="admin-empty-icon">{icon}</div>}
            {displayTitle && <h3>{displayTitle}</h3>}
            {description && <p>{description}</p>}
            {action && (
                typeof action === 'object' && action.label ? (
                    <button className="admin-btn admin-btn-primary" onClick={action.onClick}>
                        {action.label}
                    </button>
                ) : action
            )}
        </motion.div>
    );
}
