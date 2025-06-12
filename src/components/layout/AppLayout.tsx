
import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Home, 
  Calendar, 
  Coins, 
  Trophy, 
  Gamepad2, 
  Users, 
  Settings,
  Menu,
  LogOut,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
}

const navigation: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: Home },
  { title: 'Activities', href: '/activities', icon: Activity },
  { title: 'Calendar', href: '/calendar', icon: Calendar },
  { title: 'Rewards', href: '/rewards', icon: Trophy },
  { title: 'Games', href: '/games', icon: Gamepad2 },
  { title: 'Family', href: '/family', icon: Users },
];

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut, user } = useAuth();
  const location = useLocation();

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-purple-50">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b">
        <span className="text-xl font-bold text-purple-600">🌟 GrowWise</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive 
                  ? "bg-purple-100 text-purple-700" 
                  : "text-gray-700 hover:bg-purple-100 hover:text-purple-700"
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <p className="font-medium text-gray-900">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-gray-500 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </Sheet>
            <span className="text-lg font-semibold text-purple-600">🌟 GrowWise</span>
            <div className="w-8" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
