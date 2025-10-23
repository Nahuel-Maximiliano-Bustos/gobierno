import { describe, expect, it } from 'vitest';
import { StatusBadge } from '../components/StatusBadge';

describe('StatusBadge', () => {
  it('normaliza estados con espacios y acentos', () => {
    const element = StatusBadge({ status: 'En revisión' });
    expect(element.props.children).toBe('En revisión');
  });

  it('usa variante outline para estados desconocidos', () => {
    const element = StatusBadge({ status: 'Personalizado' });
    expect(element.props.children).toBe('Personalizado');
    expect(element.props.variant).toBe('outline');
  });
});
