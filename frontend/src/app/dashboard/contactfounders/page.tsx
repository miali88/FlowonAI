export default function ContactFounders() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Contact Founders</h1>
      <p className="mb-4">Get in touch with the founders directly:</p>
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold">Email</h2>
          <a href="mailto:founders@yourcompany.com" className="text-blue-500 hover:underline">
            founders@yourcompany.com
          </a>
        </div>
        {/* Add more contact methods as needed */}
      </div>
    </div>
  );
} 