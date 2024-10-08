import React from 'react';

const ConnectPage: React.FC = () => {
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

  return (
    <div className="connect-page">
      <h1>Connect</h1>
      <nav>
        <ul>
          <li className="active">Embed</li>
          <li>Share</li>
          <li>Integrations <span className="new-badge">New</span></li>
        </ul>
      </nav>
      <div className="embed-section">
        <h2>Embed</h2>
        <p>www.chatbase.co</p>
        <p>To add the chatbot any where on your website, add this iframe to your html code</p>
        <div className="code-block">
          <pre>{iframeCode}</pre>
          <button onClick={() => navigator.clipboard.writeText(iframeCode)}>Copy Iframe</button>
        </div>
        <p>To add a chat bubble to the bottom right of your website add this script tag to your html</p>
        <div className="code-block">
          <pre>{scriptCode}</pre>
          <button onClick={() => navigator.clipboard.writeText(scriptCode)}>Copy Script</button>
        </div>
      </div>
    </div>
  );
};

export default ConnectPage;
