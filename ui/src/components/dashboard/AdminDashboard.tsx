import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { BookOpen, Users, Activity, TrendingUp, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '../ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import type { Lesson } from '../../utils/mockData';
import { useLessons, useDeleteLesson } from '../../hooks/useLessons';
import { useUsers } from '../../hooks/useAuth';
import { useProgress } from '../../hooks/useProgress';
import { toast } from 'sonner';

export function AdminDashboard() {
    const navigate = useNavigate();
    const { data: lessons = [], isLoading: isLoadingLessons } = useLessons();
    const { data: users = [], isLoading: isLoadingUsers } = useUsers();
    const { data: progress = [], isLoading: isLoadingProgress } = useProgress();
    const deleteLessonMutation = useDeleteLesson();

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    if (isLoadingLessons || isLoadingUsers || isLoadingProgress) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    const handleCreateLesson = () => {
        navigate('/lessons/create');
    };

    const handleEditLesson = (lesson: Lesson) => {
        navigate(`/lessons/${lesson.id}/edit`);
    };

    const handleSelectLesson = (lesson: Lesson) => {
        navigate(`/lessons/${lesson.id}`);
    };

    const handleDeleteLesson = (lessonId: number) => {
        deleteLessonMutation.mutate(lessonId, {
            onSuccess: () => toast.success('Lesson deleted successfully'),
            onError: () => toast.error('Failed to delete lesson'),
        });
    };
    const publishedCount = lessons.filter((l) => l.status === 'published').length;
    const draftCount = lessons.filter((l) => l.status === 'draft').length;
    const userCount = users.filter((u) => u.role === 'user').length;
    const totalCompletions = progress.filter((p) => p.completed).length;

    // Sort lessons by creation date
    const sortedLessons = [...lessons].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Calculate pagination
    const totalPages = Math.ceil(sortedLessons.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedLessons = sortedLessons.slice(startIndex, endIndex);

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(1, prev - 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="mb-2">Admin Dashboard</h1>
                    <p className="text-gray-600">Manage your learning platform</p>
                </div>
                <Button onClick={handleCreateLesson} className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Create Lesson
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm">Total Lessons</CardTitle>
                        <BookOpen className="h-4 w-4 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl">{lessons.length}</div>
                        <p className="text-xs text-gray-600 mt-1">
                            {publishedCount} published, {draftCount} drafts
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl">{userCount}</div>
                        <p className="text-xs text-gray-600 mt-1">Active learners</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm">Completions</CardTitle>
                        <Activity className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl">{totalCompletions}</div>
                        <p className="text-xs text-gray-600 mt-1">Total lessons completed</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm">Engagement</CardTitle>
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl">{progress.length}</div>
                        <p className="text-xs text-gray-600 mt-1">Active enrollments</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Lessons</CardTitle>
                        <CardDescription>Manage your lesson content</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedLessons.map((lesson) => (
                                    <TableRow key={lesson.id}>
                                        <TableCell>
                                            <div className="max-w-xs">
                                                <div className="truncate">{lesson.title}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="text-xs">
                                                {lesson.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={lesson.status === 'published' ? 'default' : 'outline'}
                                                className="text-xs"
                                            >
                                                {lesson.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600">
                                            {new Date(lesson.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => handleSelectLesson(lesson)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => handleEditLesson(lesson)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            disabled={deleteLessonMutation.isPending}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete "{lesson.title}"? This
                                                                action cannot be undone. All associated progress data
                                                                will also be removed.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel
                                                                disabled={deleteLessonMutation.isPending}
                                                            >
                                                                Cancel
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDeleteLesson(lesson.id)}
                                                                className="bg-red-600 hover:bg-red-700"
                                                                disabled={deleteLessonMutation.isPending}
                                                            >
                                                                {deleteLessonMutation.isPending
                                                                    ? 'Deleting...'
                                                                    : 'Delete'}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Pagination Controls */}
                        {sortedLessons.length > itemsPerPage && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <div className="text-sm text-gray-600">
                                    Showing {startIndex + 1} to {Math.min(endIndex, sortedLessons.length)} of{' '}
                                    {sortedLessons.length} lessons
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handlePreviousPage}
                                        disabled={currentPage === 1}
                                        className="gap-1"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>
                                    <div className="text-sm text-gray-600">
                                        Page {currentPage} of {totalPages}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                        className="gap-1"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>User Activity</CardTitle>
                        <CardDescription>Recent learner engagement</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {users
                                .filter((u) => u.role === 'user')
                                .slice(0, 5)
                                .map((user) => {
                                    const userProgress = progress.filter((p) => p.userId === user.id);
                                    const completed = userProgress.filter((p) => p.completed).length;

                                    return (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="truncate">{user.name}</p>
                                                <p className="text-xs text-gray-600 truncate">{user.email}</p>
                                            </div>
                                            <Badge variant="secondary" className="ml-2">
                                                {completed} completed
                                            </Badge>
                                        </div>
                                    );
                                })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Avg. Completion Rate</span>
                            <span className="text-sm">
                                {progress.length > 0 ? Math.round((totalCompletions / progress.length) * 100) : 0}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Most Popular Category</span>
                            <span className="text-sm">Web Development</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">New Users (30d)</span>
                            <span className="text-sm">{userCount}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="text-sm">
                            <p className="text-gray-600">No recent administrative actions</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Platform Health</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">System Status</span>
                            <Badge className="bg-green-500">Operational</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">AI Services</span>
                            <Badge className="bg-green-500">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Database</span>
                            <Badge className="bg-green-500">Connected</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
