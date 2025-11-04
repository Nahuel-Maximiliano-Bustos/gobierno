import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { useUIStore } from '@shared/store/ui.store';
import { useAuthStore } from '@auth/auth.store';
import { toast } from '@shared/hooks/useToast';

export const PerfilTesoreriaPage = () => {
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);
  const user = useAuthStore((state) => state.user);
  const [perfilData, setPerfilData] = useState({
    nombre: '',
    apellido: '',
    rfc: '',
    telefono: '',
    mail: '',
    direccion: ''
  });

  useEffect(() => {
    setBreadcrumb(['Tesorería', 'Perfil']);
  }, [setBreadcrumb]);

  const handleInputChange = (field: string, value: string) => {
    setPerfilData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para guardar el perfil
    toast({
      title: 'Perfil actualizado',
      description: 'La información del perfil se ha guardado correctamente'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Sección de Información de perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Información de perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna izquierda */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre
                  </label>
                  <Input 
                    value={perfilData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    placeholder="Ingresa tu nombre"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RFC
                  </label>
                  <Input 
                    value={perfilData.rfc}
                    onChange={(e) => handleInputChange('rfc', e.target.value)}
                    placeholder="Ingresa tu RFC"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mail
                  </label>
                  <Input 
                    type="email"
                    value={perfilData.mail}
                    onChange={(e) => handleInputChange('mail', e.target.value)}
                    placeholder="Ingresa tu correo electrónico"
                  />
                </div>
              </div>

              {/* Columna derecha */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido
                  </label>
                  <Input 
                    value={perfilData.apellido}
                    onChange={(e) => handleInputChange('apellido', e.target.value)}
                    placeholder="Ingresa tu apellido"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <Input 
                    type="tel"
                    value={perfilData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    placeholder="Ingresa tu teléfono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <Input 
                    value={perfilData.direccion}
                    onChange={(e) => handleInputChange('direccion', e.target.value)}
                    placeholder="Ingresa tu dirección"
                  />
                </div>
              </div>
            </div>

            {/* Botón Guardar cambios */}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                className="!bg-[#0E1024] hover:!bg-[#1a1d3a] active:!bg-[#060812] !border !border-[#1a1d3a] !text-white"
              >
                Guardar cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

    </div>
  );
};