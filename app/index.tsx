import { getAccessToken, getRole } from '@/services/tokenStorage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

export default function Index() {
  type Route = '/auth/login' | '/car-owner' | '/repair-shop';
  const [redirectTo, setRedirectTo] = useState<Route | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getAccessToken();
      const role = await getRole();

      if (!token) {
        setRedirectTo('/auth/login');
      } else if (role === 'car-owner') {
        setRedirectTo('/car-owner');
      } else {
        setRedirectTo('/repair-shop');
      }
    };

    checkAuth();
  }, []);

  if (!redirectTo) return null;

  return <Redirect href={redirectTo} />;
}
