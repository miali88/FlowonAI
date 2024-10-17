import React from 'react';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-6">Flowon AI</h1>
      <p className="text-xl text-center mb-8">
        Connecting you with your customers through real-time AI
      </p>
      <div className="max-w-2xl mx-auto">
        <p className="mb-4">
          Flowon AI is a cutting-edge platform that leverages artificial intelligence to enhance your customer interactions. Our real-time AI technology helps you:
        </p>
        <ul className="list-disc list-inside mb-6">
          <li>Understand customer needs instantly</li>
          <li>Provide personalized recommendations</li>
          <li>Streamline communication processes</li>
          <li>Improve customer satisfaction</li>
        </ul>
        <div className="text-center">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

