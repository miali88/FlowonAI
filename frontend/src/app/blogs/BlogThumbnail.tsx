import React from 'react';

interface BlogThumbnailProps {
  category?: string;
}

export const BlogThumbnail: React.FC<BlogThumbnailProps> = ({ category = 'Blog' }) => {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative text-white text-opacity-80 font-medium">
        {category}
      </div>
    </div>
  );
};
