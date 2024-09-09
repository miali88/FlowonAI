import React, { useEffect, useState } from 'react';
import Vapi from '@vapi-ai/web';
import { Button } from './ui/button';
import { MessageSquare, Loader2, PhoneOff } from 'lucide-react';

const API_KEY = process.env.NEXT_PUBLIC_VAPI_API_KEY;
const ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

const VapiButton: React.FC = () => {
  const [vapiInstance, setVapiInstance] = useState<Vapi | null>(null);
  const [buttonState, setButtonState] = useState<'idle' | 'loading' | 'active'>('idle');

  useEffect(() => {
    if (!API_KEY || !ASSISTANT_ID) {
      console.error('VAPI API key or Assistant ID is missing');
      return;
    }

    const vapi = new Vapi(API_KEY);
    setVapiInstance(vapi);

    vapi.on('call-start', () => setButtonState('active'));
    vapi.on('call-end', () => setButtonState('idle'));
    vapi.on('error', (error) => {
      console.error('VAPI error:', error);
      setButtonState('idle');
    });

    return () => {
      vapi.destroy();
    };
  }, []);

  const handleClick = async () => {
    if (!vapiInstance) return;

    if (buttonState === 'idle') {
      setButtonState('loading');
      try {
        await vapiInstance.start({ assistantId: ASSISTANT_ID });
      } catch (error) {
        console.error('Failed to start VAPI call:', error);
        setButtonState('idle');
      }
    } else if (buttonState === 'active') {
      await vapiInstance.stop();
    }
  };

  const getButtonContent = () => {
    switch (buttonState) {
      case 'idle':
        return (
          <>
            <MessageSquare className="mr-2 h-4 w-4" />
            Start Voice Chat
          </>
        );
      case 'loading':
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        );
      case 'active':
        return (
          <>
            <PhoneOff className="mr-2 h-4 w-4" />
            End Call
          </>
        );
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={buttonState === 'loading'}
      variant={buttonState === 'active' ? 'destructive' : 'default'}
    >
      {getButtonContent()}
    </Button>
  );
};

export default VapiButton;