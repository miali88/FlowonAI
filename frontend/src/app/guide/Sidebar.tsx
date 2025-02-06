'use client'

import React, { useState } from 'react';
import Link from 'next/link';

export default function Sidebar() {
  const [isAgentOpen, setAgentOpen] = useState(false);
  const [isIntegrationsOpen, setIntegrationsOpen] = useState(false);

  return (
    <div className="w-64 bg-gray-800 text-white h-full p-4">
      <h2 className="text-lg font-bold mb-4">Reference</h2>
      
      {/* Building an Agent Dropdown */}
      <div>
        <button
          onClick={() => setAgentOpen(!isAgentOpen)}
          className="w-full text-left font-semibold mb-2"
        >
          Building an Agent
        </button>
        {isAgentOpen && (
          <ul className="ml-4 mb-4">
            <li>
              <Link href="/agent/overview" className="hover:text-blue-300">
                Overview
              </Link>
            </li>
            <li>
              <Link href="/agent/setup" className="hover:text-blue-300">
                Setup
              </Link>
            </li>
            {/* Add more links as needed */}
          </ul>
        )}
      </div>

      {/* Integrations Dropdown */}
      <div>
        <button
          onClick={() => setIntegrationsOpen(!isIntegrationsOpen)}
          className="w-full text-left font-semibold mb-2"
        >
          Integrations
        </button>
        {isIntegrationsOpen && (
          <ul className="ml-4">
            <li>
              <Link href="/guide/bubble" className="hover:text-blue-300">
                Bubble
              </Link>
            </li>
            {/* <li>
              <Link href="/guide/whatsapp" className="hover:text-blue-300">
                Whatsapp
              </Link>
            </li>
            <li>
              <Link hr  ef="/guide/zapier" className="hover:text-blue-300">
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