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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="w-full max-w-md">
        <Card className="transition-all duration-500 shadow-2xl hover:shadow-3xl border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-6 pb-8">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                <Image
                  src="/sgi-avalom-logo-transparent.svg"
                  alt="SGI Avalom Logo"
                  width={120}
                  height={120}
                  className="relative z-10 drop-shadow-lg"
                />
              </div>
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Bienvenido
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Inicia sesión con tu cuenta para continuar
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            {error && (
              <Alert
                className="animate-in slide-in-from-top-2 duration-300 border-destructive/50 bg-destructive/10"
                variant="destructive"
              >
                {error}
              </Alert>
            )}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-foreground/90"
                  >
                    Correo electrónico
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="h-11 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 border-input/50 bg-background/50"
                    required
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground/90"
                  >
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    className="h-11 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 border-input/50 bg-background/50"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                variant="default"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2Icon className="mr-2 h-5 w-5 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <LogInIcon className="mr-2 h-5 w-5" />
                    Iniciar sesión
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
