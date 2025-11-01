import { useForm } from 'react-hook-form';
import { Button } from '@shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { useAuth } from './useAuth';
import { useState } from 'react';

interface LoginFormValues {
  email: string;
  password: string;
}

export const LoginPage = () => {
  const { handleSubmit, register } = useForm<LoginFormValues>({
    defaultValues: { email: 'tesorero@demo', password: 'demo1234' }
  });
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
    } finally {
      setLoading(false);
    }
  };

  return (
    // <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-800 to-slate-900">
<div className="min-h-screen bg-gradient-to-br from-green-200 via-green-300 to-green-400">

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4">
        <Card className="w-full max-w-md border-green-700/40 bg-green-900/70 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Tesorería Municipal</CardTitle>
            <CardDescription className="text-slate-300">
              Inicie sesión con las credenciales asignadas al Tesorero.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-label="Formulario de acceso">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">
                  Correo institucional
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tesorero@demo"
                  autoComplete="username"
                  {...register('email', { required: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password', { required: true })}
                />
              </div>
              <Button
  type="submit"
  className="w-full bg-green-400 hover:bg-green-200 bg-green-300 text-white font-semibold"
  disabled={loading}
>
                {loading ? 'Verificando…' : 'Ingresar'}
              </Button>
              <p className="text-center text-xs text-white">
                Único usuario autorizado: tesorero@demo / demo1234
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
