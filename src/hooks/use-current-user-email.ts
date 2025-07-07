
"use client";

import { useState, useEffect } from 'react';

const USER_EMAIL_KEY = 'currentUserEmail';

/**
 * Custom hook to get the current user's email from localStorage.
 * @returns `string` if email is found, `null` if not found, `undefined` while loading.
 */
export function useCurrentUserEmail(): string | null | undefined {
  const [email, setEmail] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    // This effect runs once on mount to get the initial value from localStorage.
    if (typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem(USER_EMAIL_KEY);
      setEmail(storedEmail); // Sets state to the stored string or null
    }
  }, []);

  // This effect listens for changes from other tabs or the sign-in gate.
  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        const storedEmail = localStorage.getItem(USER_EMAIL_KEY);
        setEmail(storedEmail);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange); 

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);


  return email;
}
