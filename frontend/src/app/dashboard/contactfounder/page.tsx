"use client";

export default function ContactFounders() {
  return (
    <div className="p-6">
      <p className="mb-4">If you'd like support, or give feedback, you can schedule a meeting below:</p>
      
      <div className="space-y-6">
        {/* Cal.com Embed */}
        <iframe
          src="https://cal.com/michael-ali-5fcg8p/30min"
          style={{
            width: "100%",
            height: "700px",
            border: "none",
            borderRadius: "8px",
          }}
        />
        
        <div className="p-4 border rounded-lg bg-gray-50">
          <h2 className="font-semibold mb-2">Direct Contact</h2>
          <p className="text-sm text-gray-600 mb-2">
            Prefer to email? Reach out directly:
          </p>
          <a 
            href="mailto:michael@flowon.ai" 
            className="text-blue-500 hover:underline flex items-center"
          >
            michael@flowon.ai
          </a>
        </div>
      </div>
    </div>
  );
} 