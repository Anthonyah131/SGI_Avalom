"use Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ModeToggle } from "@/components/modeToggle";
import axios from "axios";
import { useEffect } from "react";
import { Plus } from "lucide-react";
import cookie from "js-cookie";

const BodyMantUser: React.FC = () => {
  return (
    <div className="flex flex-col w-full space-y-10 md:flex-row md:space-y-0 md:space-x-10">
      <section className="p-4 md:px-5 md:py-10 mx-auto w-full flex flex-col space-y-10">
        <Card className="flex flex-col md:flex-row justify-between items-center w-full p-2">
          <h1 className="text-xl md:text-2xl font-bold">Gestión de Usuarios</h1>
          <div className="flex flex-wrap justify-center md:justify-end">
            <Button className="m-2">Nuevo Usuario</Button>
            <Button className="m-2">Exportar Usuarios</Button>
            <Button className="m-2">Descargar Plantilla</Button>
            <Button className="m-2">Importar</Button>
            <ModeToggle />
          </div>
        </Card>
        <Card>
          <CardContent>Aca va la tabla</CardContent>
        </Card>
      </section>
    </div>
  );
};

export default BodyMantUser;
