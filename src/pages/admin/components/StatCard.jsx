import { motion } from 'framer-motion';

export function StatCard({ label, title, value, change, changeLabel, icon, color = 'brand', delay = 0 }) {
    const displayLabel = label || title;
    const isPositive = change >= 0;
    return (
        <motion.div
            className={`admin-stat-card ${color}`}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            <div className="admin-stat-header">
                <span className="admin-stat-label">{displayLabel}</span>
                {icon && <div className={`admin-stat-icon ${color}`}>{icon}</div>}
            </div>
            <div className="admin-stat-value">{value}</div>
            {change !== undefined && (
                <div className={`admin-stat-change ${isPositive ? 'up' : 'down'}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        {isPositive
                            ? <polyline points="18 15 12 9 6 15" />
                            : <polyline points="6 9 12 15 18 9" />
                        }
                    </svg>
                    {isPositive ? '+' : ''}{change}%
                    {changeLabel && <span className="admin-stat-change-label">{changeLabel}</span>}
                </div>
            )}
        </motion.div>
    );
}
