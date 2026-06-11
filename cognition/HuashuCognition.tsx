import React, { useEffect } from 'react';
import { resolveCognitiveToken, resetCognitiveLoad } from './CognitionEngine';
import { UrgencyLevel, InteractionIntent } from './tokens';

export interface HuashuCognitionProps {
  /**
   * A intenção de negócio dessa interação.
   * O Engine vai decidir o visual com base nisso.
   */
  intent: InteractionIntent;
  
  /**
   * O nível de urgência psicológica.
   */
  urgency: UrgencyLevel;
  
  /**
   * O conteúdo do componente (texto, ícones, etc.)
   */
  children: React.ReactNode;
  
  /**
   * Callback de click
   */
  onClick?: () => void;
}

/**
 * HuashuCognition: O Compilador de Intenção Visual.
 * Desenvolvedores param de escolher variantes de botões e passam a declarar intenções de negócio.
 */
export const HuashuCognition: React.FC<HuashuCognitionProps> = ({
  intent,
  urgency,
  children,
  onClick,
}) => {
  // 1. Resolve a intenção no Token Cognitivo
  const cognitiveToken = resolveCognitiveToken(intent, urgency);

  // 2. Mapeia o alias para o componente real do huashu-design
  // NOTA: Nesta prova de conceito, renderizamos um botão nativo estilizado com as props resolvidas.
  // Em integração real, isso faria um import dinâmico do componente 'huashu-design/Button'
  const RenderedComponent = (props: any) => <button {...props} />;

  // 3. Reseta a carga cognitiva ao desmontar (limpeza de contexto)
  useEffect(() => {
    return () => {
      if (urgency === 'critical' && intent !== 'cancel') {
        resetCognitiveLoad();
      }
    };
  }, [urgency, intent]);

  return (
    <RenderedComponent
      {...cognitiveToken.props}
      onClick={onClick}
      data-cognition-intent={intent}
      data-cognition-urgency={urgency}
      className={`huashu-cognition ${cognitiveToken.microInteraction || ''}`}
    >
      {children}
    </RenderedComponent>
  );
};
