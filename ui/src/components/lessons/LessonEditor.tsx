import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, Loader2, Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { MarkdownTextarea } from '../MarkdownTextarea';
import { ImageUrlInput } from '../ImageUrlInput';
import { DocumentUploader } from '../DocumentUploader';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { generateSummary } from '../../utils/aiService';
import { useCreateLesson, useUpdateLesson, useLessons, useLesson } from '../../hooks/useLessons';
import { useCurrentUser } from '../../hooks/useAuth';
import { toast } from 'sonner';
import type { LessonApplication, LessonQuestion, QuestionChoice } from '../../utils/mockData';

export function LessonEditor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: currentUser } = useCurrentUser();
    const { data: lessons = [] } = useLessons();
    const { data: lesson, isLoading: isLoadingLesson } = useLesson(id || '');

    const [title, setTitle] = useState(lesson?.title || '');
    const [description, setDescription] = useState(lesson?.description || '');
    const [content, setContent] = useState(lesson?.content || '');
    const [category, setCategory] = useState(lesson?.category || '');
    const [isNewCategory, setIsNewCategory] = useState(false);
    const [status, setStatus] = useState<'draft' | 'published'>(lesson?.status || 'draft');
    const [summary, setSummary] = useState(lesson?.summary || '');
    const [imageUrl, setImageUrl] = useState(lesson?.imageUrl || '');
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Applications state
    const [applications, setApplications] = useState<LessonApplication[]>(lesson?.applications || []);

    // Questions state
    const [questions, setQuestions] = useState<LessonQuestion[]>(lesson?.questions || []);

    const createLessonMutation = useCreateLesson();
    const updateLessonMutation = useUpdateLesson();

    // Get unique categories from all lessons, filter out empty strings
    const categories = Array.from(new Set(lessons.map((l) => l.category))).filter((cat) => cat && cat.trim());

    // Handle category selection change
    const handleCategoryChange = (value: string) => {
        if (value === '+ Add New Category') {
            setIsNewCategory(true);
            setCategory('');
        } else {
            setIsNewCategory(false);
            setCategory(value);
        }
    };

    // Handle switching back from new category to select
    const handleCancelNewCategory = () => {
        setIsNewCategory(false);
        setCategory('');
    };

    // Update form when lesson data loads
    if (lesson && !title && !isLoadingLesson) {
        setTitle(lesson.title);
        setDescription(lesson.description);
        setContent(lesson.content);
        setCategory(lesson.category);
        setStatus(lesson.status);
        setSummary(lesson.summary || '');
        setImageUrl(lesson.imageUrl || '');
        setApplications(lesson.applications || []);
        setQuestions(lesson.questions || []);
    }

    // Applications handlers
    const addApplication = () => {
        setApplications([...applications, { title: '', description: '', displayOrder: applications.length }]);
    };

    const updateApplication = (index: number, field: keyof LessonApplication, value: string | number) => {
        const updated = [...applications];
        updated[index] = { ...updated[index], [field]: value };
        setApplications(updated);
    };

    const removeApplication = (index: number) => {
        setApplications(applications.filter((_, i) => i !== index));
    };

    // Questions handlers
    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                questionText: '',
                displayOrder: questions.length,
                choices: [
                    { choiceText: '', isCorrect: false, displayOrder: 0 },
                    { choiceText: '', isCorrect: false, displayOrder: 1 },
                ],
            },
        ]);
    };

    const updateQuestion = (index: number, field: keyof LessonQuestion, value: string | number) => {
        const updated = [...questions];
        updated[index] = { ...updated[index], [field]: value };
        setQuestions(updated);
    };

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const addChoice = (questionIndex: number) => {
        const updated = [...questions];
        const question = updated[questionIndex];
        question.choices.push({
            choiceText: '',
            isCorrect: false,
            displayOrder: question.choices.length,
        });
        setQuestions(updated);
    };

    const updateChoice = (
        questionIndex: number,
        choiceIndex: number,
        field: keyof QuestionChoice,
        value: string | boolean | number
    ) => {
        const updated = [...questions];
        updated[questionIndex].choices[choiceIndex] = {
            ...updated[questionIndex].choices[choiceIndex],
            [field]: value,
        };
        setQuestions(updated);
    };

    const removeChoice = (questionIndex: number, choiceIndex: number) => {
        const updated = [...questions];
        updated[questionIndex].choices = updated[questionIndex].choices.filter((_, i) => i !== choiceIndex);
        setQuestions(updated);
    };

    const handleBack = () => {
        navigate('/lessons');
    };

    const handleGenerateSummary = async () => {
        if (!content.trim()) {
            toast.error('Please add some content first');
            return;
        }

        setIsGeneratingSummary(true);
        try {
            const generatedSummary = await generateSummary(content);
            setSummary(generatedSummary);
            toast.success('Summary generated successfully!');
        } catch (error) {
            console.error('Error generating summary:', error);
            toast.error('Failed to generate summary');
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    const handleDocumentAnalysis = (data: {
        title: string;
        description: string;
        content: string;
        category: string;
        summary: string;
        applications: Array<{
            title: string;
            description: string;
            displayOrder: number;
        }>;
        questions: Array<{
            questionText: string;
            displayOrder: number;
            choices: Array<{
                choiceText: string;
                isCorrect: boolean;
                displayOrder: number;
            }>;
        }>;
    }) => {
        // Fill in the form with AI-generated data
        setTitle(data.title);
        setDescription(data.description);
        setContent(data.content);
        setCategory(data.category);
        setSummary(data.summary || '');
        setApplications(data.applications || []);
        setQuestions(data.questions || []);

        toast.success('Lesson data filled from document!');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) return;

        if (!currentUser) {
            toast.error('You must be logged in to save lessons');
            return;
        }

        const lessonData = {
            title,
            description,
            content,
            category,
            status,
            summary,
            imageUrl,
            applications,
            questions,
        };

        setIsSubmitting(true);
        try {
            if (lesson) {
                await updateLessonMutation.mutateAsync({ id: lesson.id, data: lessonData });
                toast.success('Lesson updated successfully!');
            } else {
                await createLessonMutation.mutateAsync({ data: lessonData });
                toast.success('Lesson created successfully!');
            }
            handleBack();
        } catch (error) {
            console.error('Save lesson error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast.error(
                lesson ? `Failed to update lesson: ${errorMessage}` : `Failed to create lesson: ${errorMessage}`
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b sticky top-16 z-40">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" onClick={handleBack} className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                            <h1>{lesson ? 'Edit Lesson' : 'Create New Lesson'}</h1>
                        </div>

                        <Button type="submit" form="lesson-form" className="gap-2" disabled={isSubmitting}>
                            <Save className="h-4 w-4" />
                            {isSubmitting ? 'Saving...' : 'Save Lesson'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <form id="lesson-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* AI Document Uploader */}
                        {!lesson && <DocumentUploader onAnalysisComplete={handleDocumentAnalysis} />}

                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Enter lesson title"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description *</Label>
                                    <MarkdownTextarea
                                        id="description"
                                        value={description}
                                        onChange={setDescription}
                                        placeholder="Brief description of the lesson. You can paste images!"
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="imageUrl">Image URL</Label>
                                    <ImageUrlInput
                                        id="imageUrl"
                                        value={imageUrl}
                                        onChange={setImageUrl}
                                        placeholder="https://example.com/image.jpg or paste/drop image here"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Optional: Enter a URL, paste an image, or drag & drop an image file for the
                                        lesson's thumbnail
                                    </p>
                                    {imageUrl && (
                                        <div className="mt-2">
                                            <img
                                                src={imageUrl}
                                                alt="Preview"
                                                className="w-full max-w-md h-48 object-cover rounded-lg border"
                                                onError={(e) => {
                                                    e.currentTarget.src =
                                                        'https://via.placeholder.com/400x200?text=Invalid+Image+URL';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category *</Label>
                                        {isNewCategory ? (
                                            <div className="flex gap-2">
                                                <Input
                                                    id="category"
                                                    value={category}
                                                    onChange={(e) => setCategory(e.target.value)}
                                                    placeholder="Enter new category name"
                                                    required
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleCancelNewCategory}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        ) : (
                                            <Select value={category} onValueChange={handleCategoryChange} required>
                                                <SelectTrigger id="category">
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="+ Add New Category">
                                                        + Add New Category
                                                    </SelectItem>
                                                    {categories.map((cat) => (
                                                        <SelectItem key={cat} value={cat}>
                                                            {cat}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status *</Label>
                                        <Select
                                            value={status}
                                            onValueChange={(v) => setStatus(v as 'draft' | 'published')}
                                        >
                                            <SelectTrigger id="status">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="published">Published</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Lesson Content</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="content">Content (Markdown supported) *</Label>
                                    <MarkdownTextarea
                                        id="content"
                                        value={content}
                                        onChange={setContent}
                                        placeholder="Write your lesson content here... You can use Markdown formatting. Paste images directly!"
                                        rows={15}
                                        className="font-mono text-sm"
                                        required
                                    />
                                    <p className="text-xs text-gray-500">
                                        Tip: Use # for headings, ** for bold, * for italic, ``` for code blocks
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>AI-Generated Summary</CardTitle>
                                    <Button
                                        type="button"
                                        onClick={handleGenerateSummary}
                                        disabled={isGeneratingSummary || !content.trim()}
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                    >
                                        {isGeneratingSummary ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-4 w-4" />
                                                Generate Summary
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="summary">Summary</Label>
                                    <Textarea
                                        id="summary"
                                        value={summary}
                                        onChange={(e) => setSummary(e.target.value)}
                                        placeholder="AI-generated summary will appear here, or write your own"
                                        rows={4}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Real-World Applications Section */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Real-World Applications</CardTitle>
                                    <Button
                                        type="button"
                                        onClick={addApplication}
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Application
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {applications.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-4">
                                        No applications added yet. Click "Add Application" to add real-world use cases.
                                    </p>
                                ) : (
                                    applications.map((app, index) => (
                                        <Card key={index} className="border-l-4 border-l-blue-500">
                                            <CardContent className="pt-4 space-y-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <GripVertical className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm font-medium text-gray-600">
                                                            Application #{index + 1}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        onClick={() => removeApplication(index)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Title</Label>
                                                    <Input
                                                        value={app.title}
                                                        onChange={(e) =>
                                                            updateApplication(index, 'title', e.target.value)
                                                        }
                                                        placeholder="e.g., Web Development, Data Science"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Description</Label>
                                                    <MarkdownTextarea
                                                        value={app.description}
                                                        onChange={(value) =>
                                                            updateApplication(index, 'description', value)
                                                        }
                                                        placeholder="Describe how this lesson applies to real-world scenarios. You can paste images!"
                                                        rows={3}
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        {/* Multiple Choice Questions Section */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Quiz Questions</CardTitle>
                                    <Button
                                        type="button"
                                        onClick={addQuestion}
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Question
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {questions.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-4">
                                        No questions added yet. Click "Add Question" to create quiz questions.
                                    </p>
                                ) : (
                                    questions.map((question, qIndex) => (
                                        <Card key={qIndex} className="border-l-4 border-l-green-500">
                                            <CardContent className="pt-4 space-y-4">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <GripVertical className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm font-medium text-gray-600">
                                                            Question #{qIndex + 1}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        onClick={() => removeQuestion(qIndex)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Question Text</Label>
                                                    <Textarea
                                                        value={question.questionText}
                                                        onChange={(e) =>
                                                            updateQuestion(qIndex, 'questionText', e.target.value)
                                                        }
                                                        placeholder="Enter your question here"
                                                        rows={2}
                                                    />
                                                </div>

                                                {/* Choices */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <Label>Answer Choices</Label>
                                                        <Button
                                                            type="button"
                                                            onClick={() => addChoice(qIndex)}
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 text-xs gap-1"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                            Add Choice
                                                        </Button>
                                                    </div>
                                                    {question.choices.map((choice, cIndex) => (
                                                        <div
                                                            key={cIndex}
                                                            className="flex items-start gap-2 p-3 bg-gray-50 rounded-md"
                                                        >
                                                            <Checkbox
                                                                checked={choice.isCorrect}
                                                                onCheckedChange={(checked) =>
                                                                    updateChoice(
                                                                        qIndex,
                                                                        cIndex,
                                                                        'isCorrect',
                                                                        checked as boolean
                                                                    )
                                                                }
                                                                className="mt-1"
                                                            />
                                                            <div className="flex-1 space-y-1">
                                                                <Label className="text-xs text-gray-600">
                                                                    Choice {cIndex + 1}
                                                                </Label>
                                                                <Input
                                                                    value={choice.choiceText}
                                                                    onChange={(e) =>
                                                                        updateChoice(
                                                                            qIndex,
                                                                            cIndex,
                                                                            'choiceText',
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    placeholder="Enter answer choice"
                                                                    className="bg-white"
                                                                />
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                onClick={() => removeChoice(qIndex, cIndex)}
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 mt-5"
                                                                disabled={question.choices.length <= 2}
                                                            >
                                                                <Trash2 className="h-3 w-3 text-red-600" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <p className="text-xs text-gray-500">
                                                        Check the box next to the correct answer(s)
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </div>
        </div>
    );
}
