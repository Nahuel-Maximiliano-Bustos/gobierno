import { FormEvent, useState } from 'react';
import { Bell, LogOut, Search, User } from 'lucide-react';
import { Input } from '@shared/components/ui/input';
import { Button } from '@shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@shared/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@shared/components/ui/avatar';
import { useAuth } from '@auth/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from '@shared/hooks/useToast';

interface TopbarProps {
  onSearch?: (term: string) => void;
  searchRef?: React.RefObject<HTMLInputElement>;
}

export const Topbar = ({ onSearch, searchRef }: TopbarProps) => {
  const [term, setTerm] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch?.(term);
    toast({ title: 'Búsqueda global', description: term ? `Resultados para “${term}”` : 'Sin filtros' });
  };

  return (
<header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-green-100/90 px-6 backdrop-blur">
      <form onSubmit={handleSubmit} className="relative flex-1 max-w-xl" role="search">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          r ef={searchRef}
          placeholder="Buscar en Tesorería (/)"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          className="pl-9"
          aria-label="Buscar"
        />
      </form>
<Button variant="ghost" size="icon" aria-label="Notificaciones">
  <Bell className="h-5 w-5 text-white" />
</Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            <Avatar>
              <AvatarFallback className="bg-[#85E971] text-green-900 ">{user?.nombre?.[0] ?? 'T'}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium md:inline text-white">{user?.nombre ?? 'TESORERO'}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Sesión activa</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => navigate('/tesoreria/config')}>
            <User className="mr-2 h-4 w-4" /> Perfil
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={logout} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};
