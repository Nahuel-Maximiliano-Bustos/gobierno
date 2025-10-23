import { useState } from 'react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

export interface WizardStep<Props extends Record<string, any> = Record<string, any>> {
  id: string;
  title: string;
  description?: string;
  content: (props: Props & { onChange: (values: Partial<Props>) => void }) => React.ReactNode;
  validator?: (values: Props) => string | true;
}

interface WizardProps<Props extends Record<string, any>> {
  steps: WizardStep<Props>[];
  initialValues: Props;
  onFinish: (values: Props) => Promise<void> | void;
  autosave?: (values: Props) => void;
}

export function Wizard<Props extends Record<string, any>>(props: WizardProps<Props>) {
  const { steps, initialValues, onFinish, autosave } = props;
  const [values, setValues] = useState<Props>(initialValues);
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const isLast = activeIndex === steps.length - 1;
  const activeStep = steps[activeIndex];

  const handleNext = async () => {
    const validation = activeStep.validator?.(values) ?? true;
    if (validation !== true) {
      setError(validation);
      return;
    }
    setError(null);
    if (isLast) {
      await onFinish(values);
      return;
    }
    setActiveIndex((prev) => Math.min(prev + 1, steps.length - 1));
    autosave?.(values);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => Math.max(prev - 1, 0));
  };

  const onChange = (patch: Partial<Props>) => {
    setValues((prev) => {
      const next = { ...prev, ...patch } as Props;
      autosave?.(next);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <ol className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
        {steps.map((step, index) => (
          <li key={step.id} className="flex items-center gap-3">
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold',
                index === activeIndex && 'border-primary text-primary',
                index < activeIndex && 'border-emerald-500 bg-emerald-500 text-white'
              )}
            >
              {index + 1}
            </span>
            <div>
              <p className="text-sm font-medium">{step.title}</p>
              {step.description ? <p className="text-xs text-muted-foreground">{step.description}</p> : null}
            </div>
          </li>
        ))}
      </ol>
      <div className="rounded-lg border border-dashed border-border p-4">
        {activeStep.content({ ...(values as Props & { onChange: (values: Partial<Props>) => void }), onChange })}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handlePrev} disabled={activeIndex === 0}>
          Anterior
        </Button>
        <Button onClick={handleNext}>{isLast ? 'Finalizar' : 'Siguiente'}</Button>
      </div>
    </div>
  );
}
