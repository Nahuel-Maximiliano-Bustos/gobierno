import { Link } from 'react-router-dom';
import { Button } from '@shared/components/ui/button';

export const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4">
    <h1 className="text-4xl font-bold">404</h1>
    <p className="text-sm text-muted-foreground">Ruta no encontrada dentro del módulo de Tesorería.</p>
    <Button asChild>
      <Link to="/tesoreria/dashboard">Regresar al dashboard</Link>
    </Button>
  </div>
);
