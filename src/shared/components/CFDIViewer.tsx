import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface CFDIViewerProps {
  uuid: string;
  xmlUrl?: string;
  pdfUrl?: string;
}

export const CFDIViewer = ({ uuid, xmlUrl, pdfUrl }: CFDIViewerProps) => {
  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">UUID</p>
          <p className="text-xs text-muted-foreground">{uuid}</p>
        </div>
        <Badge variant="outline">CFDI 3.3</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={!xmlUrl} onClick={() => xmlUrl && window.open(xmlUrl, '_blank')?.focus()}>
          Ver XML
        </Button>
        <Button type="button" variant="outline" disabled={!pdfUrl} onClick={() => pdfUrl && window.open(pdfUrl, '_blank')?.focus()}>
          Ver PDF
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Documentos demostrativos cargados en este compromiso.</p>
    </div>
  );
};
