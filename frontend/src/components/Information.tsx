'use client';

import { Type, Upload, Globe } from "lucide-react";

export function Information() {
  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold">Intelligent Information Retrieval</h2>
        <p className="text-gray-500 mt-3 max-w-3xl mx-auto">
          Our advanced knowledge base system transforms raw information into structured intelligence. 
          Through semantic analysis and context-aware processing, your AI agent doesn't just store data—it 
          comprehends relationships, extracts key insights, and delivers precise responses based on your 
          curated knowledge, whether from documents, websites, or direct input.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
        <div className="p-6 rounded-lg border border-gray-800 bg-black/40 backdrop-blur-sm hover:border-gray-700 transition-all duration-300 hover:scale-[1.02]">
          <div className="flex flex-col items-center text-center">
            <Type className="h-8 w-8 mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">Text</h3>
            <p className="text-gray-400">
              Input company policies, guidelines, or any text-based information to build your 
              agent's foundational knowledge
            </p>
          </div>
        </div>

        <div className="p-6 rounded-lg border border-gray-800 bg-black/40 backdrop-blur-sm hover:border-gray-700 transition-all duration-300 hover:scale-[1.02]">
          <div className="flex flex-col items-center text-center">
            <Upload className="h-8 w-8 mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">Document Intelligence</h3>
            <p className="text-gray-400">
              Upload and process various document formats, enabling your agent to understand 
              complex documentation
            </p>
          </div>
        </div>

        <div className="p-6 rounded-lg border border-gray-800 bg-black/40 backdrop-blur-sm hover:border-gray-700 transition-all duration-300 hover:scale-[1.02]">
          <div className="flex flex-col items-center text-center">
            <Globe className="h-8 w-8 mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">Web Integration</h3>
            <p className="text-gray-400">
              Automatically extract and learn from web content, keeping your agent updated 
              with the latest information
            </p>
          </div>
        </div>
      </div>

      <div className="text-center mt-12 max-w-3xl mx-auto px-4">
        <p className="text-gray-400">
          Transform your Flowon AI agent into a knowledgeable assistant that understands your 
          business inside and out. From company policies to technical documentation, your agent 
          learns and adapts to become an invaluable part of your team.
        </p>
      </div>
    </section>
  );
}
