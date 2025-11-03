import { useEffect } from 'react';
import { KPIWidgets } from '../components/KPIWidgets';
import { useDashboard } from '../hooks/useDashboard';
import { useUIStore } from '@shared/store/ui.store';
import { Button } from '@shared/components/ui/button';
import { RefreshCcw } from 'lucide-react';

export const DashboardTesoreria = () => {
  const { data, isLoading, refetch } = useDashboard();
  const setBreadcrumb = useUIStore((state) => state.setBreadcrumb);

  useEffect(() => {
    setBreadcrumb(['Tesorería', 'Dashboard']);
  }, [setBreadcrumb]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Panel general</h1>
          <p className="text-sm text-muted-foreground">Seguimiento financiero diario del municipio.</p>
        </div>
        <Button 
          className="!bg-[#0E1024] hover:!bg-[#1a1d3a] active:!bg-[#060812] !border !border-[#1a1d3a] !text-white" 
          size="sm" 
          onClick={() => refetch()}
        >
          <RefreshCcw className="mr-2 h-4 w-4" /> Actualizar
        </Button>
      </div>
      <KPIWidgets data={data} isLoading={isLoading} />
    </div>
  );
};