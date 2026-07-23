import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '0 24px',
      flexDirection: 'column', textAlign: 'center'
    }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <p style={{
          fontSize: 120, fontWeight: 900, color: 'var(--color-brand)',
          lineHeight: 1, margin: 0
        }}>
          404
        </p>
      </motion.div>

      <motion.p
        style={{ fontSize: 32, marginBottom: 8, marginTop: 16 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        🍔
      </motion.p>

      <h2 style={{
        fontSize: 26, fontWeight: 700, color: 'var(--color-text)',
        marginBottom: 8
      }}>
        Page Not Found
      </h2>
      <p style={{
        color: 'var(--color-text-secondary)', fontSize: 16,
        marginBottom: 36, maxWidth: 380
      }}>
        The page you're looking for doesn't exist or has been moved.
      </p>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '13px 28px', borderRadius: 12,
            background: 'var(--color-brand)', color: '#fff', border: 'none',
            fontSize: 15, fontWeight: 600, cursor: 'pointer'
          }}
        >
          Go Home
        </button>
        <button
          onClick={() => navigate('/menu')}
          style={{
            padding: '13px 28px', borderRadius: 12,
            background: 'transparent', color: 'var(--color-brand)',
            border: '2px solid var(--color-brand)',
            fontSize: 15, fontWeight: 600, cursor: 'pointer'
          }}
        >
          Browse Menu
        </button>
      </div>
    </div>
  );
}

export default NotFound;
