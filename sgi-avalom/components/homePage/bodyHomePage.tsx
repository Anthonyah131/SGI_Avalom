"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/lib/UserContext";
import cookie from "js-cookie";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ModeToggle } from "../modeToggle";
import { BreadcrumbResponsive } from "../breadcrumbResponsive";

const uesrSalesData = [
  {
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    saleAmount: "+$1,999.00",
  },
  {
    name: "Jackson Lee",
    email: "isabella.nguyen@email.com",
    saleAmount: "+$1,999.00",
  },
  {
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    saleAmount: "+$39.00",
  },
  {
    name: "William Kim",
    email: "will@email.com",
    saleAmount: "+$299.00",
  },
  {
    name: "Sofia Davis",
    email: "sofia.davis@email.com",
    saleAmount: "+$39.00",
  },
  {
    name: "David Wilson",
    email: "david.wilson@email.com",
    saleAmount: "+$99.00",
  },
  {
    name: "Sophia Johnson",
    email: "sophia.johnson@email.com",
    saleAmount: "+$199.00",
  },
  {
    name: "Emma Thompson",
    email: "emma.thompson@email.com",
    saleAmount: "+$299.00",
  },
  {
    name: "James Smith",
    email: "james.smith@email.com",
    saleAmount: "+$499.00",
  },
  {
    name: "Ava Anderson",
    email: "ava.anderson@email.com",
    saleAmount: "+$599.00",
  },
];

const cardData = [
  {
    label: "Total Revenue",
    amount: "$45,231.89",
    description: "+20.1% from last month",
  },
  {
    label: "Subscriptions",
    amount: "+2350",
    description: "+180.1% from last month",
  },
  {
    label: "Sales",
    amount: "+12,234",
    description: "+19% from last month",
  },
  {
    label: "Active Now",
    amount: "+573",
    description: "+201 since last hour",
  },
];

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

const BodyHomePage: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const { user } = useUser();

  const fetchData = async () => {
    const token = cookie.get("token"); // Obtener el token almacenado en la cookie
    if (!token) {
      // Manejar caso en el que no hay token
      console.error("No hay token disponible");
      return;
    }

    // try {
    //   const response = await fetch("/api/users/2", {
    //     method: "GET",
    //     headers: {
    //       Authorization: `Bearer ${token}`, // Enviar el token en la cabecera Authorization
    //       "Content-Type": "application/json",
    //     },
    //   });

    //   if (response.ok) {
    //     const data = await response.json();
    //     setUserData(data);
    //   } else {
    //     console.error("Error al obtener datos:", response.statusText);
    //   }
    // } catch (error) {
    //   console.error("Error en la solicitud:", error);
    // }
  };

  // Llamar a fetchData cuando el componente se monte
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="mx-auto p-4 space-y-8">
      <BreadcrumbResponsive items={[{ label: "Inicio" }]} />
      <h1 className="md:text-5xl text-3xl font-bold title-font mb-2">
        Dashboard
      </h1>
      <ModeToggle />
      <section className="grid w-full grid-cols-1 gap-4 gap-x-8 transition-all sm:grid-cols-2 xl:grid-cols-4">
        {cardData.map((d, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{d.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{d.amount}</div>
              <p className="text-xs text-muted-foreground">{d.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>
      <section className="grid grid-cols-1 gap-4 transition-all lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="p-4 font-semibold">Overview</p>
            <ChartContainer
              config={chartConfig}
              className="min-h-[350px] w-full"
            >
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
                <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-8">
            {uesrSalesData.map((d, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className=" h-12 w-12 rounded-full bg-gray-100 p-1">
                  <img
                    width={200}
                    height={200}
                    src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${d.name}`}
                    alt="avatar"
                  />
                </div>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">{d.name}</p>
                  <p className="text-sm text-muted-foreground text-ellipsis overflow-hidden">
                    {d.email}
                  </p>
                </div>
                <div className="ml-auto font-medium">{d.saleAmount}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default BodyHomePage;
