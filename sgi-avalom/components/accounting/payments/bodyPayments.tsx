"use client";
import { BreadcrumbResponsive } from "@/components/breadcrumbResponsive";
import { ModeToggle } from "@/components/modeToggle";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useParams } from "next/navigation";

const BodyPayments: React.FC = () => {
  const { alqId } = useParams();

  return (
    <div className="mx-auto p-4 max-w-7xl space-y-8">
      <Card className="bg-background flex flex-col sm:flex-row justify-between items-center">
        <CardHeader>
          <BreadcrumbResponsive
            items={[
              { label: "Inicio", href: "/homePage" },
              { label: "Contabilidad", href: "/accounting" },
              { label: "Realizar movimiento" },
            ]}
          />
          <CardTitle className="text-2xl font-bold mb-4 sm:mb-0">
            Realizar movimiento
          </CardTitle>
        </CardHeader>
        <div className="flex flex-wrap justify-center gap-2 p-4">
          <ModeToggle />
        </div>
      </Card>

      <Card className="bg-background">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Alquileres Mensuales
          </CardTitle>
        </CardHeader>
        <CardContent>aca va el contenido</CardContent>
      </Card>
    </div>
  );
};

export default BodyPayments;
