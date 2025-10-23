import { useRef } from 'react';
import { Button } from './ui/button';
import { validateFile } from '../lib/validators';
import { toast } from '../hooks/useToast';

interface UploaderProps {
  accept?: string;
  maxSizeMB?: number;
  onFiles: (files: File[]) => void;
  onRemove?: (fileName: string) => void;
  files?: { name: string; size: number }[];
}

export const Uploader = ({ accept, maxSizeMB = 5, onFiles, files = [], onRemove }: UploaderProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const trigger = () => inputRef.current?.click();

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const parsed: File[] = [];
    Array.from(fileList).forEach((file) => {
      const validation = validateFile(file, maxSizeMB);
      if (validation === true) {
        parsed.push(file);
      } else {
        toast({ title: 'Archivo no válido', description: validation, variant: 'warning' });
      }
    });
    if (parsed.length > 0) {
      onFiles(parsed);
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        accept={accept}
        onChange={(event) => handleFiles(event.target.files)}
      />
      <Button type="button" variant="outline" onClick={trigger}>
        Cargar archivos
      </Button>
      <ul className="space-y-1 text-sm text-muted-foreground">
        {files.map((file) => (
          <li key={file.name} className="flex items-center justify-between rounded border border-dashed border-border px-2 py-1">
            <span>
              {file.name}{' '}
              <span className="text-xs">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
            </span>
            {onRemove ? (
              <button type="button" className="text-xs text-primary" onClick={() => onRemove(file.name)}>
                Quitar
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
};
