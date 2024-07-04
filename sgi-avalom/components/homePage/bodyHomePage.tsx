"use client";
import { useState, useEffect } from "react";
import cookie from "js-cookie";

const BodyHomePage: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const fetchData = async () => {
    const token = cookie.get("token"); // Obtener el token almacenado en la cookie
    if (!token) {
      // Manejar caso en el que no hay token
      console.error("No hay token disponible");
      return;
    }

    try {
      const response = await fetch("/api/users/1", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Enviar el token en la cabecera Authorization
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        console.error("Error al obtener datos:", response.statusText);
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  };

  // Llamar a fetchData cuando el componente se monte
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container px-5 py-14 mx-auto rounded-lg bg-background-2 body-font">
      <div className="flex flex-wrap w-full mb-10 flex-col items-center text-center">
        <h1 className="md:text-5xl text-3xl font-bold title-font mb-2">
          Dashboard
        </h1>
        <div>{JSON.stringify(userData, null, 2)}</div>
      </div>
    </div>
  );
};

export default BodyHomePage;
