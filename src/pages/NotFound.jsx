import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ marginTop: '150px', textAlign: 'center', minHeight: '50vh', padding: '0 24px' }}>
      <h1 style={{ fontSize: '80px', fontWeight: '800', color: 'var(--color-brand)', marginBottom: '8px' }}>404</h1>
      <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px' }}>Page Not Found</h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px', fontSize: '16px' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Go Home</button>
        <button className="btn btn-outline-primary" onClick={() => navigate('/menu')}>Browse Menu</button>
      </div>
    </div>
  );
}

export default NotFound;
