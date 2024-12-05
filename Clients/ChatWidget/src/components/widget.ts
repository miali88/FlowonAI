export interface WidgetTheme {
    fontFamily?: string;
    backgroundColor?: string;
    borderColor?: string;
    shadowColor?: string;
    textColor?: string;
    accentColor?: string;
    borderRadius?: string;
    padding?: string;
    // ... other customizable properties
  }
  
  export interface WidgetConfig {
    theme?: WidgetTheme;
    agentId: string;
    domain: string;
  }