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
        <div className="popup-overlay active">
          <div className="popup">
            <div className="popup-header">
              <h2 className="popup-title">Información de perfil</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowPopup(false)}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group" style={{flex: 1}}>
                  <label htmlFor="nombre">Nombre</label>
                  <input 
                    type="text" 
                    id="nombre" 
                    required
                    value={nuevoUsuario.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                  />
                </div>
                <div className="form-group" style={{flex: 1}}>
                  <label htmlFor="apellido">Apellido</label>
                  <input 
                    type="text" 
                    id="apellido" 
                    required
                    value={nuevoUsuario.apellido}
                    onChange={(e) => handleInputChange('apellido', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group" style={{flex: 1}}>
                  <label htmlFor="rfc">RFC</label>
                  <input 
                    type="text" 
                    id="rfc" 
                    required
                    value={nuevoUsuario.rfc}
                    onChange={(e) => handleInputChange('rfc', e.target.value)}
                  />
                </div>
                <div className="form-group" style={{flex: 1}}>
                  <label htmlFor="telefono">Teléfono</label>
                  <input 
                    type="tel" 
                    id="telefono" 
                    required
                    value={nuevoUsuario.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="mail">Mail</label>
                <input 
                  type="email" 
                  id="mail" 
                  required
                  value={nuevoUsuario.mail}
                  onChange={(e) => handleInputChange('mail', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="rol">Rol</label>
                <input 
                  type="text" 
                  id="rol" 
                  required
                  value={nuevoUsuario.rol}
                  onChange={(e) => handleInputChange('rol', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="direccion">Dirección</label>
                <input 
                  type="text" 
                  id="direccion" 
                  required
                  value={nuevoUsuario.direccion}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancelar" 
                  onClick={() => setShowPopup(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s, visibility 0.3s;
        }
        
        .popup-overlay.active {
          opacity: 1;
          visibility: visible;
        }
        
        .popup {
          background-color: white;
          width: 90%;
          max-width: 500px;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          padding: 30px;
          transform: scale(0.8);
          transition: transform 0.3s;
        }
        
        .popup-overlay.active .popup {
          transform: scale(1);
        }
        
        .popup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        
        .popup-title {
          font-size: 24px;
          color: #2c3e50;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #7f8c8d;
          transition: color 0.3s;
        }
        
        .close-btn:hover {
          color: #e74c3c;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-row {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #2c3e50;
        }
        
        .form-group input {
          width: 100%;
          padding: 10px 15px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 16px;
          transition: border-color 0.3s;
        }
        
        .form-group input:focus {
          border-color: #3498db;
          outline: none;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 30px;
        }
        
        .btn-cancelar {
          background-color: #e74c3c;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.3s;
        }
        
        .btn-cancelar:hover {
          background-color: #c0392b;
        }
        
        .btn-guardar {
          background-color: #2ecc71;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.3s;
        }
        
        .btn-guardar:hover {
          background-color: #27ae60;
        }
      `}</style>
    </div>
  );
};