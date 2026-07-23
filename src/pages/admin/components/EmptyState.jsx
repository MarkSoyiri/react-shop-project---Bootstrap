import { motion } from 'framer-motion';

export function EmptyState({ icon, title, description, action }) {
    return (
        <motion.div
            className="admin-empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="admin-empty-icon">{icon}</div>
            <h3>{title}</h3>
            {description && <p>{description}</p>}
            {action}
        </motion.div>
    );
}
