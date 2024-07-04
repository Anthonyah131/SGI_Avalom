"use client";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import cookie from 'js-cookie';

const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    const token = cookie.get('token');
    if (!token) {
      router.push('/'); // Redirige al login si no hay token
    }
  }, []); // Debes pasar un arreglo vacío para ejecutar el efecto solo una vez al montar

  return <>{children}</>;
};

export default AuthRoute;
