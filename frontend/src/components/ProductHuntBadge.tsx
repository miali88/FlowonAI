import React from 'react';

export const ProductHuntBadge: React.FC = () => {
  return (
    <div className="fixed bottom-4 left-4 z-50 hidden sm:block">
      <a 
        href="https://www.producthunt.com/posts/flowon-ai?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-flowon&#0045;ai" 
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Flowon AI on Product Hunt"
      >
        <img 
          src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=945333&theme=light&t=1742782263456" 
          alt="Flowon AI - AI Phone Answering Service | Product Hunt"
          width="250"
          height="54"
          style={{ width: '250px', height: '54px' }}
        />
      </a>
    </div>
  );
}; 