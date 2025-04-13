'use client';

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";



export default function Home() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 overflow-auto">
          <h1 className="text-3xl font-bold mb-4">Welcome back to Ai-eigo!</h1>
          {/* Add your dashboard content here */}
          <div className="bg-blue-500 text-white text-xl p-4 rounded shadow">
  ✅ If this box is styled, Tailwind is finally working!
</div>

        </main>
      </div>
    </div>
  );
}
