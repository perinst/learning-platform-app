import { BookOpen, LogOut, User as UserIcon, LayoutDashboard, GraduationCap, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useCurrentUser, useLogout } from '../../hooks/useAuth';
import { toast } from 'sonner';

export function Header() {
    const { data: currentUser } = useCurrentUser();
    const logoutMutation = useLogout();

    if (!currentUser) return null;

    const handleLogout = async () => {
        try {
            await logoutMutation.mutateAsync();
            toast.success('Logged out successfully');
        } catch (error) {
            toast.error('Logout failed');
        }
    };

    return (
        <header className="border-b bg-white sticky top-0 z-40 shadow-sm">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <GraduationCap className="h-6 w-6 text-blue-600" />
                        <span className="hidden sm:inline">Learning Platform</span>
                    </Link>

                    <nav className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild className="gap-2">
                            <Link to="/lessons">
                                <BookOpen className="h-4 w-4" />
                                <span className="hidden sm:inline">Lessons</span>
                            </Link>
                        </Button>

                        <Button variant="ghost" size="sm" asChild className="gap-2">
                            <Link to={currentUser.role === 'admin' ? '/admin' : '/dashboard'}>
                                <LayoutDashboard className="h-4 w-4" />
                                <span className="hidden sm:inline">Dashboard</span>
                            </Link>
                        </Button>
                    </nav>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
                            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                                <UserIcon className="h-4 w-4" />
                            </div>
                            <div className="hidden sm:flex flex-col items-start">
                                <span className="text-sm">{currentUser.name}</span>
                                <span className="text-xs text-gray-500 capitalize">{currentUser.role}</span>
                            </div>
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 z-[9999]">
                        <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled>
                            <span className="text-xs text-muted-foreground capitalize">Role: {currentUser.role}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="gap-2 text-red-600 focus:text-red-600 cursor-pointer"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
