// components/GoogleSignInButton.jsx
//
// Uses Google Identity Services (the official "Sign in with Google" widget,
// loaded via the <script> tag in index.html). Google renders its own button
// inside the div we provide, and calls our callback with a signed ID token
// once the person picks an account. We send that token to our backend,
// which verifies it server-side before creating a session.
import React, { useEffect, useRef } from 'react';
import { GOOGLE_CLIENT_ID } from '../config/contacts';

export default function GoogleSignInButton({ onToken, onError }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    function tryInit() {
      if (!window.google?.accounts?.id || !buttonRef.current) {
        // Google's script may still be loading (it's loaded with `defer`) — retry shortly.
        setTimeout(tryInit, 150);
        return;
      }
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response?.credential) {
            onToken(response.credential);
          } else {
            onError?.('Google sign-in did not return a token');
          }
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'continue_with',
      });
    }
    tryInit();
  }, []);

  return <div ref={buttonRef} style={{ display: 'flex', justifyContent: 'center' }} />;
}
