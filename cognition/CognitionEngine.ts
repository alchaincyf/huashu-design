import { CognitiveMatrix, UrgencyLevel, InteractionIntent, CognitiveToken } from './tokens';

// Guarda de Carga Cognitiva: Previne que a tela tenha mais de uma ação crítica
let activeCriticalActions = 0;
const MAX_CRITICAL_ACTIONS = 1;

export function resolveCognitiveToken(
  intent: InteractionIntent,
  urgency: UrgencyLevel
): CognitiveToken {
  // Regra de Acessibilidade e Psicologia: Só pode haver UMA urgência crítica por contexto
  if (urgency === 'critical' && intent !== 'cancel') {
    activeCriticalActions++;
    if (activeCriticalActions > MAX_CRITICAL_ACTIONS) {
      console.warn(
        '[Huashu Cognition Engine] ⚠️ Cognitive Overload Warning: You have multiple critical urgency components competing for attention. This causes decision paralysis in users.'
      );
    }
  }

  const token = CognitiveMatrix[urgency]?.[intent];

  if (!token) {
    console.error(`[Huashu Cognition Engine] Invalid mapping for Urgency: ${urgency}, Intent: ${intent}`);
    // Fallback seguro para não quebrar a UI
    return { componentAlias: 'Button', props: { variant: 'outline' } };
  }

  return token;
}

// Reseta o contador de carga cognitiva (útil em trocas de tela/unmount)
export function resetCognitiveLoad() {
  activeCriticalActions = 0;
}
