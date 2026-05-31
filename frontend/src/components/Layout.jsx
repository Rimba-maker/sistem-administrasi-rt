import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, DollarSign, Wallet, LogOut, LayoutDashboard, Menu } from 'lucide-react';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (e) {
            console.error(e);
        } finally {
            localStorage.removeItem('token');
            navigate('/login');
        }
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/houses', label: 'Rumah', icon: Home },
        { path: '/residents', label: 'Penghuni', icon: Users },
        { path: '/payments', label: 'Iuran', icon: DollarSign },
        { path: '/expenses', label: 'Pengeluaran', icon: Wallet },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-background">
            <div className="h-16 flex items-center px-6 border-b border-border">
                <h1 className="text-xl font-bold tracking-tight text-foreground">RT Admin</h1>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                isActive 
                                    ? 'bg-primary/5 text-foreground' 
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-border">
                <Button 
                    variant="ghost" 
                    className="w-full flex items-center justify-start space-x-3 text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={handleLogout}
                >
                    <LogOut size={18} strokeWidth={2} />
                    <span>Logout</span>
                </Button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-background w-full overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 border-r border-border shrink-0 flex-col">
                <SidebarContent />
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between h-14 px-4 border-b border-border bg-background shrink-0">
                    <h1 className="text-lg font-bold tracking-tight text-foreground">RT Admin</h1>
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="-mr-2">
                                <Menu size={24} />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 p-0">
                            <SheetHeader className="sr-only"><SheetTitle>Menu</SheetTitle></SheetHeader>
                            <SidebarContent />
                        </SheetContent>
                    </Sheet>
                </header>

                <main className="flex-1 overflow-auto bg-[#fafafa]">
                    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}