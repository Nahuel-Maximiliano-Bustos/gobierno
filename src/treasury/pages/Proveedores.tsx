import { useEffect, useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { DataTable } from '@shared/components/DataTable';
import { useProveedores, useCrearProveedor, useActualizarProveedor, useEliminarProveedor } from '../hooks/useProveedores';
import type { Proveedor } from '@treasury/types';
import { validateRFC } from '@shared/lib/validators';
import { toast } from '@shared/hooks/useToast';
import { useUIStore } from '@shared/store/ui.store';
import { Save, Trash } from 'lucide-react';

export const ProveedoresPage = () => {
  const [busqueda, setBusqueda] = useState('');
  const { data, isLoading, refetch } = useProveedores(busqueda);
  const crear = useCrearProveedor();
  const actualizar = useActualizarProveedor();
  const eliminar = useEliminarProveedor();
  const [nuevo, setNuevo] = useState<Partial<Proveedor>>({ nombre: '', rfc: '', email: '', telefono: '', direccion: '' });
  const [editing, setEditing] = useState<Record<string, Partial<Proveedor>>>({});
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);

  useEffect(() => {
    setBreadcrumb(['Tesorería', 'Proveedores']);
  }, [setBreadcrumb]);

  const columns = useMemo<ColumnDef<Proveedor>[]>(
    () => [
      {
        accessorKey: 'nombre',
        header: 'Nombre',
        cell: ({ row }) => (
          <Input
            defaultValue={row.original.nombre}
            onChange={(event) => setEditing((prev) => ({ ...prev, [row.original.id]: { ...prev[row.original.id], nombre: event.target.value } }))}
          />
        )
      },
      {
        accessorKey: 'rfc',
        header: 'RFC',
        cell: ({ row }) => (
          <Input
            defaultValue={row.original.rfc}
            onChange={(event) => setEditing((prev) => ({ ...prev, [row.original.id]: { ...prev[row.original.id], rfc: event.target.value } }))}
          />
        )
      },
      {
        accessorKey: 'email',
        header: 'Correo',
        cell: ({ row }) => (
          <Input
            defaultValue={row.original.email}
            onChange={(event) => setEditing((prev) => ({ ...prev, [row.original.id]: { ...prev[row.original.id], email: event.target.value } }))}
          />
        )
      },
      {
        accessorKey: 'telefono',
        header: 'Teléfono',
        cell: ({ row }) => (
          <Input
            defaultValue={row.original.telefono}
            onChange={(event) => setEditing((prev) => ({ ...prev, [row.original.id]: { ...prev[row.original.id], telefono: event.target.value } }))}
          />
        )
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={async () => {
                const draft = editing[row.original.id];
                if (!draft) {
                  toast({ title: 'Sin cambios por guardar', variant: 'warning' });
                  return;
                }
                if (draft.rfc) {
                  const resultado = validateRFC(draft.rfc);
                  if (resultado !== true) {
                    toast({ title: 'RFC inválido', description: String(resultado), variant: 'warning' });
                    return;
                  }
                }
                await actualizar.mutateAsync({ id: row.original.id, payload: draft });
                setEditing((prev) => {
                  const next = { ...prev };
                  delete next[row.original.id];
                  return next;
                });
                refetch();
              }}
            >
              <Save className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="destructive"
              onClick={async () => {
                await eliminar.mutateAsync(row.original.id);
                refetch();
              }}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        )
      }
    ],
    [actualizar, eliminar, editing, refetch]
  );

  const handleCrear = async () => {
    if (!nuevo.nombre || !nuevo.rfc) {
      toast({ title: 'Complete nombre y RFC', variant: 'warning' });
      return;
    }
    const resultado = validateRFC(nuevo.rfc);
    if (resultado !== true) {
      toast({ title: 'RFC inválido', description: String(resultado), variant: 'warning' });
      return;
    }
    await crear.mutateAsync(nuevo);
    setNuevo({ nombre: '', rfc: '', email: '', telefono: '', direccion: '' });
    refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Buscar proveedor"
          className="w-64"
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
        />
        <Button variant="ghost" size="sm" onClick={() => setBusqueda('')}>
          Limpiar
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-5">
        <Input placeholder="Nombre" value={nuevo.nombre ?? ''} onChange={(event) => setNuevo((prev) => ({ ...prev, nombre: event.target.value }))} />
        <Input placeholder="RFC" value={nuevo.rfc ?? ''} onChange={(event) => setNuevo((prev) => ({ ...prev, rfc: event.target.value.toUpperCase() }))} />
        <Input placeholder="Correo" value={nuevo.email ?? ''} onChange={(event) => setNuevo((prev) => ({ ...prev, email: event.target.value }))} />
        <Input placeholder="Teléfono" value={nuevo.telefono ?? ''} onChange={(event) => setNuevo((prev) => ({ ...prev, telefono: event.target.value }))} />
        <Button onClick={handleCrear} disabled={crear.isPending}>
          Agregar proveedor
        </Button>
      </div>
      <DataTable data={data ?? []} columns={columns} />
      {isLoading ? <p className="text-sm text-muted-foreground">Cargando proveedores…</p> : null}
    </div>
  );
};
