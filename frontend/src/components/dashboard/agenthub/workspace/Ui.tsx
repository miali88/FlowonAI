// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { ColorPicker, DEFAULT_COLOR } from '@/components/ui/color-picker';
// import { Slider } from "@/components/ui/slider";
// import dynamic from 'next/dynamic';
// import { useEffect } from 'react';

// const ChatWidget = dynamic(() => import('@/app/chat-widget/[agentId]/components/main'), {
//   ssr: false
// });

// interface UiProps {
//   selectedAgent: Agent | null;
//   setSelectedAgent: React.Dispatch<React.SetStateAction<Agent | null>>;
// }

// interface Agent {
//   id: string;
//   uiConfig?: {
//     primaryColor?: string;
//     secondaryColor?: string;
//     fontSize?: number;
//     borderRadius?: number;
//     chatboxHeight?: number;
//   };
// }

// const Ui: React.FC<UiProps> = ({
//   selectedAgent,
//   setSelectedAgent,
// }) => {
//   useEffect(() => {
//     if (selectedAgent) {
//       window.embeddedChatbotConfig = {
//         agentId: selectedAgent.id,
//         domain: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
//       }
//     }
//   }, [selectedAgent]);

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>UI Customization</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="flex space-x-4">
//           <div className="w-1/2 space-y-6">
//             <div>
//               <Label htmlFor="primaryColor">Primary Color</Label>
//               <ColorPicker
//                 value={selectedAgent?.uiConfig?.primaryColor || DEFAULT_COLOR}
//                 onChange={(color) => setSelectedAgent({
//                   ...selectedAgent,
//                   uiConfig: { ...selectedAgent?.uiConfig, primaryColor: color }
//                 })}
//               />
//             </div>
//             <div>
//               <Label htmlFor="secondaryColor">Secondary Color</Label>
//               <ColorPicker
//                 value={selectedAgent?.uiConfig?.secondaryColor || DEFAULT_COLOR}
//                 onChange={(color) => {
//                   if (!selectedAgent?.id) return;
//                   const updatedAgent = {
//                     id: selectedAgent.id as string,
//                     uiConfig: {
//                       ...selectedAgent.uiConfig,
//                       secondaryColor: color
//                     }
//                   } satisfies Agent;
//                   setSelectedAgent(updatedAgent);
//                 }}
//               />
//             </div>
//             <div>
//               <Label htmlFor="fontSize">Font Size</Label>
//               <Slider
//                 id="fontSize"
//                 min={12}
//                 max={24}
//                 step={1}
//                 value={[selectedAgent?.uiConfig?.fontSize || 16]}
//                 onValueChange={(value) => setSelectedAgent(selectedAgent ? {
//                   ...selectedAgent,
//                   uiConfig: { ...selectedAgent.uiConfig, fontSize: value[0] }
//                 } : null)}
//               />
//               <span className="text-sm text-muted-foreground">{selectedAgent?.uiConfig?.fontSize || 16}px</span>
//             </div>
//             <div>
//               <Label htmlFor="borderRadius">Border Radius</Label>
//               <Slider
//                 id="borderRadius"
//                 min={0}
//                 max={20}
//                 step={1}
//                 value={[selectedAgent?.uiConfig?.borderRadius || 4]}
//                 onValueChange={(value) => setSelectedAgent(selectedAgent ? {
//                   ...selectedAgent,
//                   uiConfig: { ...selectedAgent.uiConfig, borderRadius: value[0] }
//                 } : null)}
//               />
//               <span className="text-sm text-muted-foreground">{selectedAgent?.uiConfig?.borderRadius || 4}px</span>
//             </div>
//             <div>
//               <Label htmlFor="chatboxHeight">Chatbox Height</Label>
//               <Slider
//                 id="chatboxHeight"
//                 min={300}
//                 max={800}
//                 step={10}
//                 value={[selectedAgent?.uiConfig?.chatboxHeight || 500]}
//                 onValueChange={(value) => setSelectedAgent(selectedAgent ? {
//                   ...selectedAgent,
//                   uiConfig: { ...selectedAgent.uiConfig, chatboxHeight: value[0] }
//                 } : null)}
//               />
//               <span className="text-sm text-muted-foreground">{selectedAgent?.uiConfig?.chatboxHeight || 500}px</span>
//             </div>
//           </div>
//           <div className="w-1/2">
//             <div className="border rounded-lg p-4" style={{ height: `${selectedAgent?.uiConfig?.chatboxHeight || 500}px` }}>
//               {selectedAgent && (
//                 <div id="embedded-chatbot-container" className="w-full h-full">
//                   <ChatWidget />
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// declare global {
//   interface Window {
//     embeddedChatbotConfig: {
//       agentId: string
//       domain: string
//     }
//   }
// }

// export default Ui;
