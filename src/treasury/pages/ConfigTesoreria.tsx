import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Switch } from '@shared/components/ui/switch';
import { useUIStore } from '@shared/store/ui.store';
import { useAuthStore } from '@auth/auth.store';
import { toast } from '@shared/hooks/useToast';

export const ConfigTesoreriaPage = () => {
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);
  const user = useAuthStore((state) => state.user);
  const [uuidObligatorio, setUuidObligatorio] = useState(true);
  const [moneda, setMoneda] = useState('MXN');
  const [formatoFecha, setFormatoFecha] = useState('DD/MM/YYYY');
  const [showPopup, setShowPopup] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    apellido: '',
    rfc: '',
    mail: '',
    telefono: '',
    direccion: '',
    rol: ''
  });

  useEffect(() => {
    setBreadcrumb(['Tesorería', 'Configuración de Tesorería']);
  }, [setBreadcrumb]);

  const handleInputChange = (field: string, value: string) => {
    setNuevoUsuario(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para guardar el usuario
    toast({
      title: 'Usuario agregado',
      description: 'El usuario ha sido agregado correctamente'
    });
    setShowPopup(false);
    setNuevoUsuario({
      nombre: '',
      apellido: '',
      rfc: '',
      mail: '',
      telefono: '',
      direccion: '',
      rol: ''
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Sección de Parámetros de validación */}
      <Card>
        <CardHeader>
          <CardTitle>Parámetros de validación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">UUID obligatorio</p>
              <p className="text-xs text-muted-foreground">Exigir UUID en egresos y compromisos.</p>
            </div>
            <Switch 
              checked={uuidObligatorio} 
              onCheckedChange={(value) => setUuidObligatorio(Boolean(value))} 
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium mb-2">Formato de fecha</p>
              <Input 
                value={formatoFecha} 
                onChange={(event) => setFormatoFecha(event.target.value)} 
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Moneda oficial</p>
              <Input 
                value={moneda} 
                onChange={(event) => setMoneda(event.target.value)} 
              />
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => toast({ 
              title: 'Configuración guardada', 
              description: 'Las reglas se aplicarán en próximos registros.' 
            })}
            className="!bg-[#0E1024] hover:!bg-[#1a1d3a] active:!bg-[#060812] !border !border-[#1a1d3a] !text-white"
          >
            Guardar cambios
          </Button>
        </CardContent>
      </Card>

      {/* Sección de Usuarios autorizados */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios autorizados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-2">Usuario activo:</p>
          <div className="rounded border border-gray-200 p-3 text-sm bg-gray-50">
            <p className="font-semibold">{user?.nombre}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            <p className="text-xs">Rol: {user?.rol}</p>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Solo el TESORERO está habilitado en este módulo.
          </p>
        </CardContent>
      </Card>

      {/* Sección de Listado de usuarios */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-left">Listado de usuarios</CardTitle>
            <Button 
              className="!bg-[#0E1024] hover:!bg-[#1a1d3a] active:!bg-[#060812] !border !border-[#1a1d3a] !text-white" 
              size="sm" 
              onClick={() => setShowPopup(true)}
            >
              Agregar usuario
            </Button>
          </div> 
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-[#0E1024]">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-[#0E1024]">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-[#0E1024]">Apellido</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-[#0E1024]">RFC</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-[#0E1024]">Mail</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-[#0E1024]">Teléfono</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-[#0E1024]">Dirección</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-[#0E1024]">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider bg-[#0E1024]">Rol</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Fila vacía para mostrar estructura */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">-</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">-</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">-</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">-</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">-</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">-</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">-</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">-</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Popup para agregar usuario */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Información de perfil</h2>
              <button 
                className="text-gray-500 hover:text-gray-700 text-2xl"
                onClick={() => setShowPopup(false)}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input 
                    type="text" 
                    id="nombre" 
                    required
                    value={nuevoUsuario.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                  </label>
                  <input 
                    type="text" 
                    id="apellido" 
                    required
                    value={nuevoUsuario.apellido}
                    onChange={(e) => handleInputChange('apellido', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="rfc" className="block text-sm font-medium text-gray-700 mb-1">
                    RFC
                  </label>
                  <input 
                    type="text" 
                    id="rfc" 
                    required
                    value={nuevoUsuario.rfc}
                    onChange={(e) => handleInputChange('rfc', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input 
                    type="tel" 
                    id="telefono" 
                    required
                    value={nuevoUsuario.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="mail" className="block text-sm font-medium text-gray-700 mb-1">
                  Mail
                </label>
                <input 
                  type="email" 
                  id="mail" 
                  required
                  value={nuevoUsuario.mail}
                  onChange={(e) => handleInputChange('mail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="rol" className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <input 
                  type="text" 
                  id="rol" 
                  required
                  value={nuevoUsuario.rol}
                  onChange={(e) => handleInputChange('rol', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input 
                  type="text" 
                  id="direccion" 
                  required
                  value={nuevoUsuario.direccion}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowPopup(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#0E1024] hover:bg-[#1a1d3a] rounded-md transition-colors"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};