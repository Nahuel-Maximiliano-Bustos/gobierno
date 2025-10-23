import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/components/ui/card';

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const ChartCard = ({ title, description, children, footer }: ChartCardProps) => (
  <Card className="h-full">
    <CardHeader>
      <CardTitle className="text-base font-semibold">{title}</CardTitle>
      {description ? <CardDescription>{description}</CardDescription> : null}
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="min-h-[220px] w-full">
        {children}
      </div>
      {footer ? <div className="border-t border-border/60 pt-3 text-xs text-muted-foreground">{footer}</div> : null}
    </CardContent>
  </Card>
);

