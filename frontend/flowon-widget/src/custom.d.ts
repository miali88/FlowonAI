declare namespace JSX {
    interface IntrinsicElements {
      'flowon-chat-widget': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { agentId?: string };
    }
  }