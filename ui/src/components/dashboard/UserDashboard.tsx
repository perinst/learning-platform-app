import { BookOpen, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress as ProgressBar } from '../ui/progress';
import { Button } from '../ui/button';
import type { Lesson } from '../../utils/mockData';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useCurrentUser } from '../../hooks/useAuth';
import { useLessons } from '../../hooks/useLessons';
import { useProgress } from '../../hooks/useProgress';

export function UserDashboard() {
    const navigate = useNavigate();
    const { data: currentUser } = useCurrentUser();
    const { data: lessons = [], isLoading: isLoadingLessons } = useLessons();
    const { data: progress = [], isLoading: isLoadingProgress } = useProgress();

    if (!currentUser || isLoadingLessons || isLoadingProgress) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    const publishedLessons = lessons.filter((l) => l.status === 'published');
    const completedCount = progress.filter((p) => p.userId === currentUser.id && p.completed).length;
    const inProgressLessons = progress.filter((p) => p.userId === currentUser.id && !p.completed);
    const totalProgress = progress.reduce((acc, p) => acc + (p.userId === currentUser.id ? p.progress : 0), 0);
    const averageProgress =
        progress.length > 0
            ? Math.round(totalProgress / progress.filter((p) => p.userId === currentUser.id).length)
            : 0;

    const recentLessons = [...progress]
        .filter((p) => p.userId === currentUser.id)
        .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
        .slice(0, 3)
        .map((p) => lessons.find((l) => l.id === p.lessonId))
        .filter((l): l is Lesson => l !== undefined);

    const handleSelectLesson = (lesson: Lesson) => {
        navigate(`/lessons/${lesson.id}`);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="mb-2">Welcome back, {currentUser.name}!</h1>
                <p className="text-gray-600">Continue your learning journey</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm">Total Lessons</CardTitle>
                        <BookOpen className="h-4 w-4 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl">{publishedLessons.length}</div>
                        <p className="text-xs text-gray-600 mt-1">Available to learn</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm">Completed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl">{completedCount}</div>
                        <p className="text-xs text-gray-600 mt-1">Lessons finished</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm">In Progress</CardTitle>
                        <Clock className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl">{inProgressLessons.length}</div>
                        <p className="text-xs text-gray-600 mt-1">Currently learning</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm">Avg Progress</CardTitle>
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl">{averageProgress}%</div>
                        <p className="text-xs text-gray-600 mt-1">Overall completion</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Continue Learning</CardTitle>
                        <CardDescription>Pick up where you left off</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {inProgressLessons.length > 0 ? (
                            <div className="space-y-4">
                                {inProgressLessons.slice(0, 3).map((prog) => {
                                    const lesson = lessons.find((l) => l.id === prog.lessonId);
                                    if (!lesson) return null;

                                    return (
                                        <div
                                            key={prog.lessonId}
                                            className="flex items-center gap-4 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                                            onClick={() => handleSelectLesson(lesson)}
                                        >
                                            {lesson.imageUrl && (
                                                <div className="w-16 h-16 rounded bg-gray-100 shrink-0 overflow-hidden">
                                                    <ImageWithFallback
                                                        src={lesson.imageUrl}
                                                        alt={lesson.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="truncate mb-1">{lesson.title}</h4>
                                                <div className="flex items-center gap-2">
                                                    <ProgressBar value={prog.progress} className="h-1.5 flex-1" />
                                                    <span className="text-xs text-gray-600 shrink-0">
                                                        {prog.progress}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600 mb-4">No lessons in progress</p>
                                <Button onClick={() => navigate('/lessons')}>Browse Lessons</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recently Accessed</CardTitle>
                        <CardDescription>Your recent learning activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentLessons.length > 0 ? (
                            <div className="space-y-4">
                                {recentLessons.map((lesson) => {
                                    const prog = progress.find(
                                        (p) => p.lessonId === lesson.id && p.userId === currentUser.id
                                    );

                                    return (
                                        <div
                                            key={lesson.id}
                                            className="flex items-center gap-4 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                                            onClick={() => handleSelectLesson(lesson)}
                                        >
                                            {lesson.imageUrl && (
                                                <div className="w-16 h-16 rounded bg-gray-100 shrink-0 overflow-hidden">
                                                    <ImageWithFallback
                                                        src={lesson.imageUrl}
                                                        alt={lesson.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="truncate mb-1">{lesson.title}</h4>
                                                <p className="text-xs text-gray-600">
                                                    {prog?.completed ? (
                                                        <span className="text-green-600 flex items-center gap-1">
                                                            <CheckCircle className="h-3 w-3" />
                                                            Completed
                                                        </span>
                                                    ) : (
                                                        `Last accessed ${new Date(prog!.lastAccessed).toLocaleDateString()}`
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600 mb-4">No recent activity</p>
                                <Button onClick={() => navigate('/lessons')}>Start Learning</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Learning Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <h4 className="mb-2 text-blue-900">Stay Consistent</h4>
                                <p className="text-sm text-blue-800">
                                    Try to learn a little bit every day for the best results
                                </p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                                <h4 className="mb-2 text-green-900">Use AI Assistant</h4>
                                <p className="text-sm text-green-800">
                                    Ask questions to deepen your understanding of topics
                                </p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg">
                                <h4 className="mb-2 text-purple-900">Practice Regularly</h4>
                                <p className="text-sm text-purple-800">
                                    Apply what you learn in real projects to retain knowledge
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
