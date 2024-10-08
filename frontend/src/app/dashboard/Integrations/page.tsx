import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ConnectPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('embed');

  const iframeCode = `<iframe
src="https://www.chatbase.co/chatbot-iframe/wIUFUJndcHvGEIBGksUdU"
width="100%"
style="height: 100%; min-height: 700px"
frameborder="0"
></iframe>`;

  const scriptCode = `<script>
window.embeddedChatbotConfig = {
  chatbotId: "wIUFUJndcHvGEIBGksUdU",
  domain: "www.chatbase.co"
}
</script>
<script
src="https://www.chatbase.co/embed.min.js"
chatbotId="wIUFUJndcHvGEIBGksUdU"
domain="www.chatbase.co"
defer
></script>`;

  const renderContent = () => {
    switch (activeTab) {
      case 'embed':
        return (
          <Card className="embed-section">
            <CardHeader>
              <CardTitle>Embed</CardTitle>
            </CardHeader>
            <CardContent>
              <p>www.chatbase.co</p>
              <p>To add the chatbot anywhere on your website, add this iframe to your HTML code:</p>
              <div className="code-block">
                <pre>{iframeCode}</pre>
                <Button onClick={() => navigator.clipboard.writeText(iframeCode)}>Copy Iframe</Button>
              </div>
              <p>To add a chat bubble to the bottom right of your website, add this script tag to your HTML:</p>
              <div className="code-block">
                <pre>{scriptCode}</pre>
                <Button onClick={() => navigator.clipboard.writeText(scriptCode)}>Copy Script</Button>
              </div>
            </CardContent>
          </Card>
        );
      case 'share':
        return (
          <div className="share-section">
            <h2>Share</h2>
            {/* Share related content goes here */}
          </div>
        );
      case 'integrations':
        return (
          <div className="integrations-section">
            <h2>Integrations</h2>
            {/* Integrations related content goes here */}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="connect-page">
      {/* Shadcn Tabs Component */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="nav-tabs">
          <TabsTrigger value="embed" className={`nav-item ${activeTab === 'embed' ? 'active' : ''}`}>
            Embed
          </TabsTrigger>
          <TabsTrigger value="share" className={`nav-item ${activeTab === 'share' ? 'active' : ''}`}>
            Share
          </TabsTrigger>
          <TabsTrigger value="integrations" className={`nav-item ${activeTab === 'integrations' ? 'active' : ''}`}>
            Integrations <span className="new-badge">New</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}>
            Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="tab-content">
          {renderContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConnectPage;
