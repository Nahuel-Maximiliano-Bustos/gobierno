import { formatDate } from '../lib/utils';

interface AuditTrailEntry {
  ts: string;
  user: string;
  action: string;
  before?: unknown;
  after?: unknown;
}

interface AuditTrailProps {
  entries: AuditTrailEntry[];
}

export const AuditTrail = ({ entries }: AuditTrailProps) => {
  if (!entries?.length) {
    return <p className="text-sm text-muted-foreground">Sin movimientos registrados.</p>;
  }
  return (
    <ol className="space-y-3">
      {entries.map((entry) => (
        <li key={`${entry.ts}-${entry.action}`} className="rounded-lg border border-dashed border-border p-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatDate(entry.ts)}</span>
            <span>{entry.user}</span>
          </div>
          <p className="mt-1 text-sm font-medium text-foreground">{entry.action}</p>
          {entry.before || entry.after ? (
            <pre className="mt-2 overflow-x-auto rounded bg-muted/20 p-2 text-xs text-muted-foreground">
              {JSON.stringify({ before: entry.before, after: entry.after }, null, 2)}
            </pre>
          ) : null}
        </li>
      ))}
    </ol>
  );
};
