import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

const HowKenneth: React.FC = () => {
    const mermaidRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        mermaid.initialize({ startOnLoad: true });
        mermaid.run();
    }, []);

    const diagramDefinition = `
flowchart TD
    B{User Input}
    B --> D{Search Type?}
    D -->|Quick Search| E[Retrieval from database]
    D -->|Deep Search| F[Retrieval from database]
    
    F --> I[AI agents filter for relevancy]
    
    E --> J{Documents Found?}
    I --> J
    
    J -->|Yes| K[Documents fed to the LLM]
    J -->|No| L[Kenneth responds]
    
    K --> M[Kenneth responds with references]
    
    M --> Q[End]
    L --> Q
    
    style B fill:#99ff99,stroke:#00cc00,color:#000000
    style D fill:#99ff99,stroke:#00cc00,color:#000000
    style E fill:#99ffcc,stroke:#00cc66,color:#000000
    style F fill:#99ffcc,stroke:#00cc66,color:#000000
    style I fill:#99ffcc,stroke:#00cc66,color:#000000
    style J fill:#99ff99,stroke:#00cc00,color:#000000
    style K fill:#99ffcc,stroke:#00cc66,color:#000000
    style L fill:#99ffcc,stroke:#00cc66,color:#000000
    style M fill:#99ffcc,stroke:#00cc66,color:#000000
    style Q fill:#99ffcc,stroke:#00cc66,color:#000000

    `;

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <p>To learn more about how Kenneth AI works, <a href="https://small-limit-60e.notion.site/How-Kenneth-AI-Works-10e53e390487803983b9d3de456d0605" target="_blank" rel="noopener noreferrer" style={{ color: 'cyan' }}>please click here</a>.</p>
            <div ref={mermaidRef} style={{ maxWidth: '600px', margin: '20px auto' }}>
                <pre className="mermaid">
                    {diagramDefinition}
                </pre>
            </div>
        </div>
    );
};

export default HowKenneth;
