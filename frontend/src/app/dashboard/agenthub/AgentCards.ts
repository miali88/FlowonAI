interface Agent {
  id: string;
  ui?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontSize?: number;
    borderRadius?: number;
    chatHeight?: number;
  };
  // ... other agent properties
}
