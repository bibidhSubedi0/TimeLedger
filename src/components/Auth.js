import React from 'react';

export const Auth = ({ onSignIn }) => {
  const handleClick = () => {
    console.log('=== BUTTON CLICKED ===');
    console.log('onSignIn function:', onSignIn);
    console.log('typeof onSignIn:', typeof onSignIn);
    
    if (typeof onSignIn === 'function') {
      console.log('Calling onSignIn...');
      onSignIn().then(() => {
        console.log('onSignIn completed');
      }).catch(err => {
        console.error('onSignIn error:', err);
      });
    } else {
      console.error('onSignIn is not a function!');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px'
      }}>
        {/* Logo */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px',
            marginBottom: '1.5rem',
            boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="18" stroke="white" strokeWidth="2.5" opacity="0.3"/>
              <circle cx="24" cy="24" r="14" stroke="white" strokeWidth="2.5"/>
              <path d="M24 14 L24 24 L30 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="24" cy="24" r="2" fill="white"/>
            </svg>
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '300',
            color: '#1f2937',
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em'
          }}>
            Time Tracker
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: '#6b7280',
            fontWeight: '300'
          }}>
            Track time beautifully
          </p>
        </div>

        {/* Sign in card */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '2.5rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
          marginBottom: '2rem'
        }}>
          <button
            onClick={handleClick}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '16px 24px',
              background: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '16px',
              fontSize: '1rem',
              fontWeight: '500',
              color: '#1f2937',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#667eea';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(102, 126, 234, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z" fill="#4285F4"/>
              <path d="M10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45c-.86.58-1.97.92-3.46.92-2.65 0-4.88-1.77-5.68-4.15H.96v2.52C2.7 17.73 6.17 20 10 20z" fill="#34A853"/>
              <path d="M4.32 11.9c-.2-.58-.31-1.2-.31-1.9 0-.7.11-1.32.31-1.9V5.58H.96A9.996 9.996 0 000 10c0 1.61.39 3.14 1.06 4.42l3.26-2.52z" fill="#FBBC05"/>
              <path d="M10 3.95c1.5 0 2.85.52 3.9 1.53l2.88-2.88C14.96.99 12.7 0 10 0 6.17 0 2.7 2.27.96 5.58l3.36 2.52C5.12 5.72 7.35 3.95 10 3.95z" fill="#EA4335"/>
            </svg>
            <span>Sign in with Google</span>
          </button>

          <div style={{
            marginTop: '2rem',
            paddingTop: '2rem',
            borderTop: '1px solid #f3f4f6'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}>
              {[
                ['⚡', 'Fast & Simple'],
                ['🔒', 'Secure'],
                ['📊', 'Analytics'],
                ['☁️', 'Cloud Sync']
              ].map(([icon, text], i) => (
                <div key={i} style={{
                  padding: '12px',
                  background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{icon}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>{text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p style={{
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#9ca3af'
        }}>
          Free to use • No credit card required
        </p>
      </div>
    </div>
  );
};