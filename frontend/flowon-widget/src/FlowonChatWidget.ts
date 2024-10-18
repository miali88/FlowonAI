import './styles/globals.css';
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import React from 'react';
import ReactDOM from 'react-dom';
import ChatBotMini from './ChatBotMini';

@customElement('flowon-chat-widget')
export class FlowonChatWidget extends LitElement {
  @property({ type: String }) agentId = '';

  static styles = css`
    :host {
      display: block;
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
    }
  `;

  render() {
    return html`
      <div id="chat-container"></div>
    `;
  }

  firstUpdated() {
    const container = this.shadowRoot?.getElementById('chat-container');
    if (container) {
      ReactDOM.render(
        React.createElement(ChatBotMini, {
          agentId: this.agentId,
          isStreaming: false,
          setIsStreaming: () => {},
          isLiveKitActive: false,
          setIsLiveKitActive: () => {},
          token: null,
          setToken: () => {},
          url: null,
          setUrl: () => {},
          isConnecting: false,
          setIsConnecting: () => {},
          onStreamEnd: () => {},
          onStreamStart: () => {},
          bypassShowChatInputCondition: true,
          localParticipant: null,
          setLocalParticipant: () => {},
        }),
        container
      );
    }
  }
}
