"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import cookie from "js-cookie";
import { useUser } from "@/lib/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Loader2Icon, LogInIcon } from "lucide-react";
import Image from "next/image";
import { ModeToggle } from "../modeToggle";

const Login: React.FC = () => {
  const router = useRouter();
  const { setUser } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const { token, user } = data;

        cookie.set("token", token, { expires: 1 });
        setUser(user);
        router.push("/homePage");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Ocurrió un error desconocido.");
      }
    } catch (error) {
      setError("Hubo un error al intentar iniciar sesión. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = cookie.get("token");
    if (token) router.push("/homePage");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="transition-all duration-300 shadow-md hover:shadow-lg bg-card">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-extrabold">
            Inicia sesión con tu cuenta
          </CardTitle>
          <ModeToggle />
        </CardHeader>
        <div className="flex justify-center">
          <Image
            src="/sgi-avalom-logo-transparent.svg"
            alt="Login"
            width={150}
            height={150}
          />
        </div>
        <CardContent>
          {error && <Alert className="mt-2" variant="destructive">{error}</Alert>}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                  placeholder="Ingresa tu correo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full"
                variant="default"
                disabled={!email || !password || isLoading}
              >
                {isLoading ? (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogInIcon className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "Cargando..." : "Iniciar sesión"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
