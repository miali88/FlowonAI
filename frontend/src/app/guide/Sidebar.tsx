'use client'

import React, { useState } from 'react';
import Link from 'next/link';

export default function Sidebar() {
  const [isAgentOpen, setAgentOpen] = useState(false);
  const [isIntegrationsOpen, setIntegrationsOpen] = useState(false);
  const [isConfigurationOpen, setConfigurationOpen] = useState(false);

  return (
    <div className="w-56 bg-gray-900 text-gray-200 h-full p-4">
      <h2 className="text-base font-bold mb-4">Reference</h2>
      
      {/* Building an Agent Dropdown */}
      <div className="mb-3">
        <button
          onClick={() => setAgentOpen(!isAgentOpen)}
          className="w-full text-left font-semibold mb-1 text-sm flex items-center justify-between"
        >
          <span>Building an Agent</span>
          <span className="text-xs">{isAgentOpen ? '−' : '+'}</span>
        </button>
        {isAgentOpen && (
          <ul className="ml-3 mb-2 space-y-1">
            <li>
              <Link href="/agent/overview" className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
                Overview
              </Link>
            </li>
            <li>
              <Link href="/agent/setup" className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
                Setup
              </Link>
            </li>
            {/* Add more links as needed */}
          </ul>
        )}
      </div>

      {/* Configuration Dropdown */}
      <div className="mb-3">
        <button
          onClick={() => setConfigurationOpen(!isConfigurationOpen)}
          className="w-full text-left font-semibold mb-1 text-sm flex items-center justify-between"
        >
          <span>Configuration</span>
          <span className="text-xs">{isConfigurationOpen ? '−' : '+'}</span>
        </button>
        {isConfigurationOpen && (
          <ul className="ml-3 mb-2 space-y-1">
            <li>
              <Link href="/guide/call_forwarding" className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
                Call Forwarding
              </Link>
            </li>
            {/* Add more configuration links as needed */}
          </ul>
        )}
      </div>

      {/* Integrations Dropdown */}
      <div className="mb-3">
        <button
          onClick={() => setIntegrationsOpen(!isIntegrationsOpen)}
          className="w-full text-left font-semibold mb-1 text-sm flex items-center justify-between"
        >
          <span>Integrations</span>
          <span className="text-xs">{isIntegrationsOpen ? '−' : '+'}</span>
        </button>
        {isIntegrationsOpen && (
          <ul className="ml-3 space-y-1">
            <li>
              <Link href="/guide/bubble" className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
                Bubble
              </Link>
            </li>
            {/* <li>
              <Link href="/guide/whatsapp" className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
                Whatsapp
              </Link>
            </li>
            <li>
              <Link href="/guide/zapier" className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
                Zapier
              </Link>
            </li> */}
            {/* Add more links as needed */}
          </ul>
        )}
      </div>
    </div>
  );
}