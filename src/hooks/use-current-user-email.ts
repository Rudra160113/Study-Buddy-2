
"use client";

import { useState, useEffect } from 'react';

const USER_EMAIL_KEY = 'currentUserEmail';

export function useCurrentUserEmail(): string | null {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Ensure localStorage is accessed only on the client side
    if (typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem(USER_EMAIL_KEY);
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }
  }, []);

  // This effect will update the email state if localStorage changes from another tab/window
  // or if the EmailSignInGate sets it.
  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        const storedEmail = localStorage.getItem(USER_EMAIL_KEY);
        setEmail(storedEmail);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Also check on focus in case of EmailSignInGate update without storage event
    window.addEventListener('focus', handleStorageChange); 

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);


  return email;
}
