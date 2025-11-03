import { useForm } from 'react-hook-form';
import { Button } from '@shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { useAuth } from './useAuth';
import { useState } from 'react';
import { Mail, Lock } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-[#0F1126] via-[#202552] to-[#353D89]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4">
        <Card className="w-full max-w-md !bg-[#1A1D2E] !border-[#2A2D3E]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-white">Tesorería Municipal</CardTitle>
            <CardDescription className="text-slate-300">
              Inicie sesión con las credenciales asignadas al Tesorero.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-label="Formulario de acceso">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white text-sm">
                  Correo institucional
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder=""
                    autoComplete="username"
                    className="pl-10 !bg-[#E8E5DC] border-none text-gray-900"
                    {...register('email', { required: true })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white text-sm">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder=""
                    autoComplete="current-password"
                    className="pl-10 !bg-[#E8E5DC] border-none text-gray-900"
                    {...register('password', { required: true })}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full !bg-[#E8E5DC] hover:!bg-[#D8D5CC] !text-gray-900 font-semibold uppercase tracking-wide"
                disabled={loading}
              >
                {loading ? 'Verificando…' : 'Ingresar'}
              </Button>
              <p className="text-center text-xs text-slate-300">
                Único usuario autorizado: tesorero@demo / demo1234
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};