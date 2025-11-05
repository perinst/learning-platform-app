import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, BookOpen, Clock, CheckCircle, Plus } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { Lesson } from '../../utils/mockData';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useCurrentUser } from '../../hooks/useAuth';
import { useLessons } from '../../hooks/useLessons';
import { useProgress } from '../../hooks/useProgress';

export function LessonList() {
    const navigate = useNavigate();
    const { data: currentUser } = useCurrentUser();
    const { data: lessons = [], isLoading: isLoadingLessons } = useLessons();
    const { data: progress = [], isLoading: isLoadingProgress } = useProgress();

    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    if (!currentUser || isLoadingLessons || isLoadingProgress) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    // Get unique categories, filter out empty strings
    const categories = Array.from(new Set(lessons.map((l) => l.category))).filter((cat) => cat && cat.trim());

    // Filter lessons
    const filteredLessons = lessons.filter((lesson) => {
        // Hide drafts from regular users
        if (currentUser.role !== 'admin' && lesson.status === 'draft') {
            return false;
        }

        const matchesSearch =
            lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lesson.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = categoryFilter === 'all' || lesson.category === categoryFilter;
        const matchesStatus = statusFilter === 'all' || lesson.status === statusFilter;

        return matchesSearch && matchesCategory && matchesStatus;
    });

    const getLessonProgress = (lessonId: string | number) => {
        return progress.find((p) => p.lessonId.toString() === lessonId.toString() && p.userId === currentUser.id);
    };

    const handleSelectLesson = (lesson: Lesson) => {
        navigate(`/lessons/${lesson.id}`);
    };

    const handleCreateLesson = () => {
        navigate('/lessons/create');
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="mb-2">All Lessons</h1>
                    <p className="text-gray-600">
                        {filteredLessons.length} {filteredLessons.length === 1 ? 'lesson' : 'lessons'} available
                    </p>
                </div>

                {currentUser.role === 'admin' && (
                    <Button onClick={handleCreateLesson} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Lesson
                    </Button>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search lessons..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full md:w-48">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                                {category}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {currentUser.role === 'admin' && (
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLessons.map((lesson) => {
                    const lessonProgress = getLessonProgress(lesson.id);

                    return (
                        <Card
                            key={lesson.id}
                            className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                            onClick={() => handleSelectLesson(lesson)}
                        >
                            {lesson.imageUrl && (
                                <div className="relative h-48 bg-gray-100">
                                    <ImageWithFallback
                                        src={lesson.imageUrl}
                                        alt={lesson.title}
                                        className="w-full h-full object-cover"
                                    />
                                    {lessonProgress?.completed && (
                                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                                            <CheckCircle className="h-5 w-5" />
                                        </div>
                                    )}
                                </div>
                            )}

                            <CardHeader>
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <Badge variant="secondary" className="shrink-0">
                                        {lesson.category}
                                    </Badge>
                                    {lesson.status === 'draft' && <Badge variant="outline">Draft</Badge>}
                                </div>
                                <CardTitle className="line-clamp-2">{lesson.title}</CardTitle>
                                <CardDescription className="line-clamp-2">{lesson.description}</CardDescription>
                            </CardHeader>

                            <CardContent>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <BookOpen className="h-4 w-4" />
                                        <span>Lesson</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{new Date(lesson.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {lessonProgress && !lessonProgress.completed && (
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-gray-600">Progress</span>
                                            <span className="text-blue-600">{lessonProgress.progress}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-600 transition-all"
                                                style={{ width: `${lessonProgress.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {filteredLessons.length === 0 && (
                <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-gray-600 mb-2">No lessons found</h3>
                    <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
            )}
        </div>
    );
}
