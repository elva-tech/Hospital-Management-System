import { useState } from 'react';

export default function Login({ setToken, setUser }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('hms_token', data.token);
        localStorage.setItem('hms_user', JSON.stringify(data));
        setToken(data.token);
        setUser(data);
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (err) {
      setError('Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #185FA5 0%, #002244 100%)',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        color: 'white',
        animation: 'fadeIn 0.5s ease-out'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '28px', fontWeight: 'bold' }}>
          Clinic Portal
        </h2>
        <p style={{ textAlign: 'center', color: '#ccc', marginBottom: '30px', fontSize: '14px' }}>
          Please sign in to access modules
        </p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#ddd' }}>Phone Number</label>
            <input 
              type="text" 
              placeholder="e.g., 0000"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border 0.2s'
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#ddd' }}>Password</label>
            <input 
              type="password" 
              placeholder="e.g., admin"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border 0.2s'
              }}
              required
            />
          </div>

          {error && <div style={{ background: 'rgba(255,0,0,0.2)', color: '#ffb3b3', padding: '10px', borderRadius: '4px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            style={{
              padding: '14px',
              borderRadius: '8px',
              border: 'none',
              background: '#4CAF50',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              marginTop: '10px'
            }}
            onMouseOver={(e) => { if(!loading) e.currentTarget.style.background = '#45a049'; }}
            onMouseOut={(e) => { if(!loading) e.currentTarget.style.background = '#4CAF50'; }}
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input:focus {
          border: 1px solid #4CAF50 !important;
          background: rgba(255,255,255,0.1) !important;
        }
      `}</style>
    </div>
  );
}
