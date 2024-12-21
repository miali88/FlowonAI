// In your main layout or page component
import Sidebar from './Sidebar';

function MainLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        {/* Your main content */}
      </main>
    </div>
  );
}

export default MainLayout;