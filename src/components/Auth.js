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
    
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="2" fill="#1a1a1a"/>
              <path d="M24 14V24L30 30" stroke="white" strokeWidth="2" strokeLinecap="square"/>
              <circle cx="24" cy="24" r="9" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
          <h1 className="text-4xl font-light text-gray-900 mb-3 tracking-tight">
            Time Tracker
          </h1>
          <p className="text-gray-500 text-lg font-light">
            Track. Analyze. Improve.
          </p>
        </div>

        {/* Sign In Button */}
        <div className="space-y-6">
          <button
            onClick={handleClick}
            className="w-full flex items-center justify-center gap-4 px-6 py-4 bg-white border-2 border-gray-900 text-gray-900 font-medium hover:bg-gray-900 hover:text-white transition-all duration-200"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z" fill="#4285F4"/>
              <path d="M10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45c-.86.58-1.97.92-3.46.92-2.65 0-4.88-1.77-5.68-4.15H.96v2.52C2.7 17.73 6.17 20 10 20z" fill="#34A853"/>
              <path d="M4.32 11.9c-.2-.58-.31-1.2-.31-1.9 0-.7.11-1.32.31-1.9V5.58H.96A9.996 9.996 0 000 10c0 1.61.39 3.14 1.06 4.42l3.26-2.52z" fill="#FBBC05"/>
              <path d="M10 3.95c1.5 0 2.85.52 3.9 1.53l2.88-2.88C14.96.99 12.7 0 10 0 6.17 0 2.7 2.27.96 5.58l3.36 2.52C5.12 5.72 7.35 3.95 10 3.95z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400 uppercase tracking-wider text-xs">
                Features
              </span>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-4 pt-2">
            {[
              'Cross-device sync',
              'Goal tracking',
              'Detailed analytics',
              'Offline mode'
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-6 h-6 border-2 border-gray-900 flex items-center justify-center flex-shrink-0">
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5L4.5 8.5L11 1.5" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="square"/>
                  </svg>
                </div>
                <span className="text-gray-700 font-light">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wider">
            Secure & Private
          </p>
        </div>
      </div>
    </div>
  );
};