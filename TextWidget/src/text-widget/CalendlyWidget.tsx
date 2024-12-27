import { useEffect } from 'react';

const CalendlyWidget: React.FC = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div 
      className="calendly-inline-widget" 
      data-url="https://calendly.com/michael-flowon/30min?hide_event_type_details=1&hide_gdpr_banner=1" // // TODO: make this dynamic, import from agent metadata
      style={{ minWidth: '320px', height: '700px' }}
    />
  );
};

export default CalendlyWidget;