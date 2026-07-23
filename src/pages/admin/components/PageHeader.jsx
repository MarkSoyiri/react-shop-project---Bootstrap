import { motion } from 'framer-motion';

export function PageHeader({ title, subtitle, actions, children, action, actionLabel, onAction }) {
    const renderActions = () => {
        if (children) return children;
        if (actions) return actions;
        if (actionLabel && onAction) {
            return (
                <button className="admin-btn admin-btn-primary" onClick={onAction}>
                    {actionLabel}
                </button>
            );
        }
        if (action && typeof action === 'object' && action.label) {
            return (
                <button className="admin-btn admin-btn-primary" onClick={action.onClick}>
                    {action.label}
                </button>
            );
        }
        return null;
    };

    const renderedActions = renderActions();

    return (
        <motion.div
            className="admin-page-header"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div>
                <h1>{title}</h1>
                {subtitle && <p>{subtitle}</p>}
            </div>
            {renderedActions && (
                <div className="admin-page-actions">
                    {renderedActions}
                </div>
            )}
        </motion.div>
    );
}
