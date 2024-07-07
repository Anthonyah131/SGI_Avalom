"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import cookie from "js-cookie";
import { useUser } from "@/lib/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { ModeToggle } from "@/components/modeToggle";
import { LogInIcon } from "lucide-react";
import Image from 'next/image';

const Login: React.FC = () => {
  const router = useRouter();
  const { setUser } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
        setError("Login failed");
      }
    } catch (error) {
      setError("Error during login: " + error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-extrabold">
            Inicia sesión con tu cuenta
          </CardTitle>
        </CardHeader>
        <div className="flex justify-center">
        <Image src="/sgi-avalom-logo-transparent.svg" alt="Login" width={150} height={150} />

        </div>
        <CardContent>
          {error && <Alert variant="destructive">{error}</Alert>}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <input type="hidden" name="remember" value="true" />
            <div className="rounded-md shadow-sm space-y-5">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Button type="submit" className="w-full">
                <LogInIcon className="mr-2 h-4 w-4" />
                Sign in
              </Button>
              <ModeToggle />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
