/**
 * Huashu Cognition Engine - Semantic Cognitive Tokens
 * Traduz Intenção do Negócio e Carga Cognitiva em Decisões de UI.
 */

export type UrgencyLevel = 'critical' | 'high' | 'medium' | 'low';
export type CognitiveLoad = 'high' | 'low'; // O usuário precisa focar ou explorar?
export type InteractionIntent = 'submit' | 'cancel' | 'explore' | 'delete' | 'confirm';

export interface CognitiveToken {
  componentAlias: string; // Mapeia para o componente real do huashu-design
  props: Record<string, any>; // Props visuais e de acessibilidade injetadas
  microInteraction?: string; // Animações cognitivas (ex: pulse para atrair atenção)
}

// A Matriz de Decisão
export const CognitiveMatrix: Record<UrgencyLevel, Record<InteractionIntent, CognitiveToken>> = {
  critical: {
    submit: { componentAlias: 'Button', props: { variant: 'primary', size: 'lg', 'aria-live': 'assertive' }, microInteraction: 'pulse' },
    delete: { componentAlias: 'Button', props: { variant: 'destructive', size: 'lg', 'aria-live': 'assertive' }, microInteraction: 'shake' },
    cancel: { componentAlias: 'Button', props: { variant: 'ghost', size: 'sm', 'aria-live': 'polite' } },
    explore: { componentAlias: 'Button', props: { variant: 'outline', size: 'md', 'aria-live': 'off' } },
    confirm: { componentAlias: 'Button', props: { variant: 'destructive', size: 'lg', 'aria-live': 'assertive' } },
  },
  high: {
    submit: { componentAlias: 'Button', props: { variant: 'primary', size: 'md', 'aria-live': 'polite' } },
    delete: { componentAlias: 'Button', props: { variant: 'destructive', size: 'md', 'aria-live': 'polite' } },
    cancel: { componentAlias: 'Button', props: { variant: 'ghost', size: 'sm' } },
    explore: { componentAlias: 'Button', props: { variant: 'outline', size: 'md' } },
    confirm: { componentAlias: 'Button', props: { variant: 'primary', size: 'md' } },
  },
  medium: {
    submit: { componentAlias: 'Button', props: { variant: 'primary', size: 'md' } },
    delete: { componentAlias: 'Button', props: { variant: 'outline', size: 'sm' } },
    cancel: { componentAlias: 'Button', props: { variant: 'ghost', size: 'sm' } },
    explore: { componentAlias: 'Button', props: { variant: 'ghost', size: 'md' } },
    confirm: { componentAlias: 'Button', props: { variant: 'secondary', size: 'md' } },
  },
  low: {
    submit: { componentAlias: 'Button', props: { variant: 'link', size: 'sm' } },
    delete: { componentAlias: 'Button', props: { variant: 'link', size: 'sm' } },
    cancel: { componentAlias: 'Button', props: { variant: 'link', size: 'sm' } },
    explore: { componentAlias: 'Button', props: { variant: 'link', size: 'md' } },
    confirm: { componentAlias: 'Button', props: { variant: 'link', size: 'sm' } },
  },
};
