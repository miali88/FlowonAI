import React from 'react';
import { createRoot } from 'react-dom/client';
import MorphingStreamButton from './components/MorphingStreamButton';

const App = () => (
  <div>
    <MorphingStreamButton
      onStreamToggle={() => console.log('Toggle')}
      isStreaming={false}
      showTextBox={false}
      isConnecting={false}
    />
  </div>
);

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(<App />);
}