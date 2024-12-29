import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Sidebar from './Sidebar';

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen text-white">
      <Header />
      <div className="pt-16">
        <main className="w-full mb-32">
          <div className="mx-auto max-w-7xl">
            <div className="flex">
              <Sidebar />
              <div className="flex-1">
                {children}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}