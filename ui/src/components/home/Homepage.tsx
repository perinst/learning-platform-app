import { Link } from 'react-router-dom';
import { useLessons } from '../../hooks/useLessons';
import { useCurrentUser } from '../../hooks/useAuth';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
    Clock,
    BookOpen,
    TrendingUp,
    GraduationCap,
    LayoutDashboard,
    User as UserIcon,
    ChevronDown,
    LogOut,
} from 'lucide-react';
import { useLogout } from '../../hooks/useAuth';
import { toast } from 'sonner';

export function Homepage() {
    const { data: lessons = [], isLoading } = useLessons();
    const { data: currentUser } = useCurrentUser();
    const logoutMutation = useLogout();

    const handleLogout = async () => {
        try {
            await logoutMutation.mutateAsync();
            toast.success('Logged out successfully');
        } catch {
            toast.error('Logout failed');
        }
    };

    // Filter published lessons only
    const publishedLessons = lessons.filter((lesson) => lesson.status === 'published');

    // Get featured lesson (first one)
    const featuredLesson = publishedLessons[0];

    // Get top stories (next 3)
    const topStories = publishedLessons.slice(1, 4);

    // Get latest news (rest of lessons)
    const latestNews = publishedLessons.slice(4);

    // Group by category
    const categories = Array.from(new Set(publishedLessons.map((l) => l.category)));

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Navigation - Same as Admin */}
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

                            {currentUser && (
                                <Button variant="ghost" size="sm" asChild className="gap-2">
                                    <Link to={currentUser.role === 'admin' ? '/admin' : '/dashboard'}>
                                        <LayoutDashboard className="h-4 w-4" />
                                        <span className="hidden sm:inline">Dashboard</span>
                                    </Link>
                                </Button>
                            )}
                        </nav>
                    </div>

                    {currentUser ? (
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
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {currentUser.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem disabled>
                                    <span className="text-xs text-muted-foreground capitalize">
                                        Role: {currentUser.role}
                                    </span>
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
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login">
                                <Button variant="ghost" size="sm">
                                    Login
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button size="sm">Get Started</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                {/* Featured Section */}
                {featuredLesson && (
                    <div className="mb-8">
                        <Link to={`/lessons/${featuredLesson.id}`}>
                            <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                                <div className="grid md:grid-cols-2 gap-0">
                                    <div className="aspect-video md:aspect-auto bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                        {featuredLesson.imageUrl ? (
                                            <img
                                                src={featuredLesson.imageUrl}
                                                alt={featuredLesson.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <BookOpen className="w-24 h-24 text-white opacity-50" />
                                        )}
                                    </div>
                                    <div className="p-8">
                                        <Badge className="mb-3">{featuredLesson.category}</Badge>
                                        <h1 className="text-3xl font-bold mb-4 text-gray-900">
                                            {featuredLesson.title}
                                        </h1>
                                        <p className="text-gray-600 mb-6 line-clamp-3">{featuredLesson.description}</p>
                                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                                            <span className="flex items-center">
                                                <Clock className="w-4 h-4 mr-1" />
                                                {new Date(featuredLesson.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center">
                                                <TrendingUp className="w-4 h-4 mr-1" />
                                                Featured
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    </div>
                )}

                {/* Main Grid Layout */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Top Stories */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-blue-600 pb-2 mb-4">
                            Top Stories
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            {topStories.map((lesson) => (
                                <Link key={lesson.id} to={`/lessons/${lesson.id}`}>
                                    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                                        <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                            {lesson.imageUrl ? (
                                                <img
                                                    src={lesson.imageUrl}
                                                    alt={lesson.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <BookOpen className="w-12 h-12 text-white opacity-50" />
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <Badge variant="secondary" className="mb-2 text-xs">
                                                {lesson.category}
                                            </Badge>
                                            <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900">
                                                {lesson.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                                {lesson.description}
                                            </p>
                                            <div className="text-xs text-gray-500">
                                                {new Date(lesson.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>

                        {/* Latest News Section */}
                        <div className="mt-8">
                            <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-blue-600 pb-2 mb-4">
                                Latest News
                            </h2>
                            <div className="space-y-4">
                                {latestNews.map((lesson) => (
                                    <Link key={lesson.id} to={`/lessons/${lesson.id}`}>
                                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                            <div className="flex gap-4 p-4">
                                                <div className="w-32 h-24 flex-shrink-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded flex items-center justify-center">
                                                    {lesson.imageUrl ? (
                                                        <img
                                                            src={lesson.imageUrl}
                                                            alt={lesson.title}
                                                            className="w-full h-full object-cover rounded"
                                                        />
                                                    ) : (
                                                        <BookOpen className="w-8 h-8 text-white opacity-50" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <Badge variant="secondary" className="mb-1 text-xs">
                                                        {lesson.category}
                                                    </Badge>
                                                    <h3 className="font-bold text-base mb-1 line-clamp-2 text-gray-900">
                                                        {lesson.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                                        {lesson.description}
                                                    </p>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(lesson.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        {/* Categories */}
                        <Card className="p-6">
                            <h3 className="font-bold text-lg mb-4 text-gray-900">Categories</h3>
                            <div className="space-y-2">
                                {categories.map((category) => {
                                    const count = publishedLessons.filter((l) => l.category === category).length;
                                    return (
                                        <a
                                            key={category}
                                            href={`#${category}`}
                                            className="flex items-center justify-between p-2 rounded hover:bg-gray-100 transition"
                                        >
                                            <span className="text-sm text-gray-700">{category}</span>
                                            <Badge variant="outline">{count}</Badge>
                                        </a>
                                    );
                                })}
                            </div>
                        </Card>

                        {/* Popular Lessons */}
                        <Card className="p-6">
                            <h3 className="font-bold text-lg mb-4 text-gray-900">Popular Lessons</h3>
                            <div className="space-y-4">
                                {publishedLessons.slice(0, 5).map((lesson, index) => (
                                    <Link key={lesson.id} to={`/lessons/${lesson.id}`}>
                                        <div className="flex gap-3 hover:bg-gray-50 p-2 rounded transition cursor-pointer">
                                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-semibold line-clamp-2 text-gray-900 mb-1">
                                                    {lesson.title}
                                                </h4>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(lesson.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </Card>

                        {/* Call to Action */}
                        <Card className="p-6 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                            <h3 className="font-bold text-lg mb-2">Start Learning Today</h3>
                            <p className="text-sm mb-4 opacity-90">
                                Join thousands of learners and access premium content.
                            </p>
                            <Link to="/register">
                                <Button className="w-full bg-white text-blue-600 hover:bg-gray-100">Sign Up Now</Button>
                            </Link>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 mt-16">
                <div className="container mx-auto px-4 py-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <h4 className="font-bold text-white mb-4">Learning Platform</h4>
                            <p className="text-sm">Empowering learners worldwide with quality educational content.</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link to="/lessons" className="hover:text-white">
                                        All Lessons
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/register" className="hover:text-white">
                                        Sign Up
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/login" className="hover:text-white">
                                        Login
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4">Categories</h4>
                            <ul className="space-y-2 text-sm">
                                {categories.slice(0, 4).map((category) => (
                                    <li key={category}>
                                        <a href={`#${category}`} className="hover:text-white">
                                            {category}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4">Contact</h4>
                            <p className="text-sm">Email: info@learningplatform.com</p>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
                        <p>&copy; 2025 Learning Platform. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
