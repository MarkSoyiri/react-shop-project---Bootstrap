import { motion } from 'framer-motion';

export function PageHeader({ title, subtitle, actions, children }) {
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
            {(actions || children) && (
                <div className="admin-page-actions">
                    {actions}
                    {children}
                </div>
            )}
        </motion.div>
    );
}
