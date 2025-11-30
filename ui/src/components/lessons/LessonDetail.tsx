import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Clock,
    User,
    BookOpen,
    CheckCircle,
    MessageSquare,
    Sparkles,
    Lightbulb,
    HelpCircle,
    Check,
    X,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress as ProgressBar } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AIAssistant } from '../ai/AIAssistant';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useCurrentUser } from '../../hooks/useAuth';
import { useLesson } from '../../hooks/useLessons';
import { useLessonProgress, useUpdateProgress } from '../../hooks/useProgress';
import { toast } from 'sonner';

import { MarkdownRenderer } from '../MarkdownRenderer';
import type { LessonApplication } from '../../types/api.types';

export function LessonDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: currentUser } = useCurrentUser();
    const { data: lesson, isLoading: isLoadingLesson } = useLesson(id!);
    const { data: progress, isLoading: isLoadingProgress } = useLessonProgress(currentUser?.id || '', id || '');
    const [activeTab, setActiveTab] = useState('content');
    const updateProgressMutation = useUpdateProgress();
    const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
    const [showResults, setShowResults] = useState(false);
    const [currentAppPage, setCurrentAppPage] = useState(0);

    if (!currentUser || !id || isLoadingLesson || isLoadingProgress) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">Loading...</div>
                </div>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">Lesson not found</div>
                </div>
            </div>
        );
    }

    const handleBack = () => {
        navigate('/lessons');
    };

    const handleComplete = () => {
        updateProgressMutation.mutate(
            {
                userId: currentUser.id,
                lessonId: lesson.id.toString(),
                progress: 100,
                completed: true,
            },
            {
                onSuccess: () => toast.success('Lesson completed! 🎉'),
                onError: () => toast.error('Failed to update progress'),
            }
        );
    };

    const handleUpdateProgress = () => {
        const newProgress = Math.min((progress?.progress || 0) + 25, 100);
        updateProgressMutation.mutate(
            {
                userId: currentUser.id,
                lessonId: lesson.id.toString(),
                progress: newProgress,
                completed: newProgress === 100,
            },
            {
                onSuccess: () => toast.success('Progress updated!'),
                onError: () => toast.error('Failed to update progress'),
            }
        );
    };

    const handleSelectAnswer = (questionIndex: number, choiceIndex: number) => {
        if (showResults) return; // Prevent changing after checking
        setUserAnswers((prev) => ({
            ...prev,
            [questionIndex]: choiceIndex,
        }));
    };

    const handleCheckAnswers = () => {
        setShowResults(true);
        const correctCount =
            lesson.questions?.filter((q, idx) => {
                const userChoice = userAnswers[idx];
                if (userChoice === undefined) return false;
                return q.choices[userChoice]?.isCorrect;
            }).length || 0;

        const total = lesson.questions?.length || 0;
        toast.success(`You got ${correctCount} out of ${total} correct!`);
    };

    const handleResetQuiz = () => {
        setUserAnswers({});
        setShowResults(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b sticky top-16 z-40">
                <div className="container mx-auto px-4 py-4">
                    <Button variant="ghost" onClick={handleBack} className="mb-4 gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Lessons
                    </Button>

                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary">{lesson.category}</Badge>
                                {lesson.status === 'draft' && <Badge variant="outline">Draft</Badge>}
                            </div>
                            <h1 className="mb-2">{lesson.title}</h1>
                            <div className="text-gray-600 mb-4">
                                <MarkdownRenderer content={lesson.description} />
                            </div>

                            <div className="flex items-center gap-6 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{new Date(lesson.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    <span>Instructor</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <BookOpen className="h-4 w-4" />
                                    <span>Reading Material</span>
                                </div>
                            </div>
                        </div>

                        {progress?.completed ? (
                            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg">
                                <CheckCircle className="h-5 w-5" />
                                <span>Completed</span>
                            </div>
                        ) : (
                            <div className="shrink-0">
                                <Button onClick={handleComplete} className="gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    Mark Complete
                                </Button>
                            </div>
                        )}
                    </div>

                    {progress && !progress.completed && (
                        <div className="mt-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-gray-600">Your Progress</span>
                                <span className="text-blue-600">{progress.progress}%</span>
                            </div>
                            <ProgressBar value={progress.progress} className="h-2" />
                        </div>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-6">
                        <TabsTrigger value="content" className="gap-2">
                            <BookOpen className="h-4 w-4" />
                            Content
                        </TabsTrigger>
                        {lesson.applications && lesson.applications.length > 0 && (
                            <TabsTrigger value="applications" className="gap-2">
                                <Lightbulb className="h-4 w-4" />
                                Applications
                            </TabsTrigger>
                        )}
                        {lesson.questions && lesson.questions.length > 0 && (
                            <TabsTrigger value="quiz" className="gap-2">
                                <HelpCircle className="h-4 w-4" />
                                Quiz
                            </TabsTrigger>
                        )}
                        <TabsTrigger value="ai-assistant" className="gap-2">
                            <MessageSquare className="h-4 w-4" />
                            AI Assistant
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="content">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                {lesson.imageUrl && (
                                    <div className="relative h-96 rounded-lg overflow-hidden bg-gray-100">
                                        <ImageWithFallback
                                            src={lesson.imageUrl}
                                            alt={lesson.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                <Card>
                                    <CardContent className="p-6">
                                        <MarkdownRenderer content={lesson.content} />
                                    </CardContent>
                                </Card>

                                {!progress?.completed && (
                                    <div className="flex justify-center">
                                        <Button onClick={handleUpdateProgress} variant="outline" size="lg">
                                            Continue Learning (+25%)
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                {lesson.summary && (
                                    <Card>
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Sparkles className="h-5 w-5 text-blue-600" />
                                                <h3>AI Summary</h3>
                                            </div>
                                            <MarkdownRenderer content={lesson.summary} className="text-gray-700" />
                                        </CardContent>
                                    </Card>
                                )}

                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="mb-4">Quick Tips</h3>
                                        <ul className="space-y-2 text-sm text-gray-700">
                                            <li className="flex gap-2">
                                                <span className="text-blue-600">•</span>
                                                <span>Take notes while learning</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="text-blue-600">•</span>
                                                <span>Practice with examples</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="text-blue-600">•</span>
                                                <span>Ask the AI assistant questions</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="text-blue-600">•</span>
                                                <span>Review regularly to retain knowledge</span>
                                            </li>
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="applications">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold mb-2">Real-World Applications</h2>
                                <p className="text-gray-600">See how this knowledge is applied in practice</p>
                            </div>

                            {lesson.applications && lesson.applications.length > 0 && (
                                <>
                                    {(() => {
                                        const totalApps = lesson.applications.length;
                                        const currentApp: LessonApplication = lesson.applications[
                                            currentAppPage
                                        ] as unknown as LessonApplication;

                                        return (
                                            <>
                                                <Card className="mb-6">
                                                    <CardContent className="p-8">
                                                        <div className="flex gap-6">
                                                            <div className="shrink-0">
                                                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                                                                    <Lightbulb className="h-8 w-8 text-white" />
                                                                </div>
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between mb-4">
                                                                    <h3 className="text-2xl font-bold text-gray-900">
                                                                        {currentApp.title}
                                                                    </h3>
                                                                    <Badge variant="secondary">
                                                                        Application {currentAppPage + 1} of {totalApps}
                                                                    </Badge>
                                                                </div>

                                                                <div className="prose prose-slate max-w-none mb-6">
                                                                    <MarkdownRenderer
                                                                        content={currentApp.description}
                                                                    />
                                                                </div>

                                                                {currentApp.examples &&
                                                                    currentApp.examples.length > 0 && (
                                                                        <div className="mt-6 border-t pt-6">
                                                                            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                                                <Sparkles className="h-5 w-5 text-blue-600" />
                                                                                Practical Examples
                                                                            </h4>
                                                                            <div className="space-y-6">
                                                                                {currentApp.examples.map(
                                                                                    (example: string, idx: number) => (
                                                                                        <div
                                                                                            key={idx}
                                                                                            className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                                                                                        >
                                                                                            <div className="flex items-start gap-3">
                                                                                                <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                                                                                    {idx + 1}
                                                                                                </div>
                                                                                                <div className="flex-1 prose prose-slate max-w-none">
                                                                                                    <MarkdownRenderer
                                                                                                        content={
                                                                                                            example
                                                                                                        }
                                                                                                    />
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                <div className="flex items-center justify-between">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() =>
                                                            setCurrentAppPage((prev) => Math.max(0, prev - 1))
                                                        }
                                                        disabled={currentAppPage === 0}
                                                        className="gap-2"
                                                    >
                                                        <ChevronLeft className="h-4 w-4" />
                                                        Previous
                                                    </Button>

                                                    <div className="flex gap-2">
                                                        {Array.from({ length: totalApps }, (_, i) => (
                                                            <button
                                                                key={i}
                                                                onClick={() => setCurrentAppPage(i)}
                                                                className={`w-2.5 h-2.5 rounded-full transition-all ${
                                                                    i === currentAppPage
                                                                        ? 'bg-blue-600 w-8'
                                                                        : 'bg-gray-300 hover:bg-gray-400'
                                                                }`}
                                                                aria-label={`Go to application ${i + 1}`}
                                                            />
                                                        ))}
                                                    </div>

                                                    <Button
                                                        variant="outline"
                                                        onClick={() =>
                                                            setCurrentAppPage((prev) =>
                                                                Math.min(totalApps - 1, prev + 1)
                                                            )
                                                        }
                                                        disabled={currentAppPage === totalApps - 1}
                                                        className="gap-2"
                                                    >
                                                        Next
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="quiz">
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold mb-2">Test Your Knowledge</h2>
                                <p className="text-gray-600">
                                    {showResults
                                        ? 'Review your answers below'
                                        : 'Select the correct answer for each question'}
                                </p>
                            </div>

                            {lesson.questions?.map((question, qIndex) => {
                                const userChoice = userAnswers[qIndex];

                                return (
                                    <Card key={question.id || qIndex}>
                                        <CardContent className="p-6">
                                            <div className="mb-4">
                                                <div className="flex gap-2 mb-3">
                                                    <span className="font-semibold text-blue-600">Q{qIndex + 1}.</span>
                                                    <h3 className="font-semibold flex-1">{question.questionText}</h3>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {question.choices?.map((choice, cIndex) => {
                                                    const isSelected = userChoice === cIndex;
                                                    const isCorrect = choice.isCorrect;
                                                    const showCorrect = showResults && isCorrect;
                                                    const showWrong = showResults && isSelected && !isCorrect;

                                                    return (
                                                        <button
                                                            key={choice.id || cIndex}
                                                            onClick={() => handleSelectAnswer(qIndex, cIndex)}
                                                            disabled={showResults}
                                                            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                                                                showCorrect
                                                                    ? 'border-green-500 bg-green-50'
                                                                    : showWrong
                                                                      ? 'border-red-500 bg-red-50'
                                                                      : isSelected
                                                                        ? 'border-blue-500 bg-blue-50'
                                                                        : 'border-gray-200 hover:border-gray-400 bg-white'
                                                            } ${showResults ? 'cursor-default' : 'cursor-pointer'}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="shrink-0">
                                                                    {showCorrect ? (
                                                                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                                                            <Check className="h-4 w-4 text-white" />
                                                                        </div>
                                                                    ) : showWrong ? (
                                                                        <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                                                                            <X className="h-4 w-4 text-white" />
                                                                        </div>
                                                                    ) : isSelected ? (
                                                                        <div className="w-6 h-6 rounded-full bg-blue-500" />
                                                                    ) : (
                                                                        <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                                                                    )}
                                                                </div>
                                                                <span
                                                                    className={
                                                                        showCorrect
                                                                            ? 'text-green-900 font-medium'
                                                                            : showWrong
                                                                              ? 'text-red-900 font-medium'
                                                                              : isSelected
                                                                                ? 'text-blue-900 font-medium'
                                                                                : 'text-gray-700'
                                                                    }
                                                                >
                                                                    {choice.choiceText}
                                                                </span>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}

                            {lesson.questions && lesson.questions.length > 0 && (
                                <div className="flex justify-center gap-4 pt-4">
                                    {!showResults ? (
                                        <Button
                                            onClick={handleCheckAnswers}
                                            disabled={Object.keys(userAnswers).length !== lesson.questions.length}
                                            size="lg"
                                        >
                                            Check Answers
                                        </Button>
                                    ) : (
                                        <Button onClick={handleResetQuiz} variant="outline" size="lg">
                                            Try Again
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="ai-assistant">
                        <div className="max-w-4xl mx-auto">
                            <AIAssistant lesson={lesson} />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
