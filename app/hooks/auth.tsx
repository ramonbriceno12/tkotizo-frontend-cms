import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function useAuth() {
    const [user, setUser] = useState(null); // Store the authenticated user
    const [loading, setLoading] = useState(true); // Keep track of the loading state
    const router = useRouter();
  
    async function fetchUser() {
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          credentials: 'include',
        });
        if (!response.ok) {
          setUser(null);
          router.push('/auth/login'); // Redirect to login if not authenticated
        } else {
          const data = await response.json();
          setUser(data);
        }
      } catch (err) {
        console.error(err.message);
        setUser(null);
      } finally {
        setLoading(false); // Stop loading after the request completes
      }
    }
  
    useEffect(() => {
      fetchUser();
    }, []);
  
    const login = async (email: string, password: string) => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Invalid credentials');
        }
        const data = await response.json();
        setUser(data);
        router.push('/dashboard'); // Redirect on successful login
      } catch (err) {
        console.error(err.message);
        setUser(null);
      }
    };
  
    const logout = async () => {
      try {
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
        setUser(null);
        router.push('/'); // Redirect on logout
      } catch (err) {
        console.error(err.message);
      }
    };
  
    return { user, loading, login, logout }; // Include loading in the returned object
  }
  
