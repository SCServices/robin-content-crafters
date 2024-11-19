import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Building2, FileText, History, BarChart, Share2, Cable, Settings, User } from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Building2, label: "Companies", path: "/companies" },
    { icon: FileText, label: "Saved Content", path: "/content" },
    { icon: History, label: "History", path: "/history" },
    { icon: BarChart, label: "Reporting", path: "/reporting" },
    { icon: Share2, label: "Backlink Outreach", path: "/backlinks" },
    { icon: Cable, label: "Integrations", path: "/integrations" },
    { icon: Settings, label: "Settings", path: "/settings" },
    { icon: User, label: "Account", path: "/account" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200">
        <div className="p-6">
          <img src="/og-image.svg" alt="Robin" className="h-8 w-auto" />
          <p className="text-sm text-neutral-500 mt-2">Automate Your SEO Success</p>
        </div>
        
        <nav className="px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2 my-1 rounded-lg text-sm ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
});

export default Layout;