import { useState, useRef } from 'react';
import { Upload, FileText, Loader2, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { toast } from 'sonner';
import { isValidDocumentFile } from '../utils/fileExtractor';
import { analyzeDocument } from '../services/documentAnalyzer';

interface DocumentUploaderProps {
    onAnalysisComplete: (data: {
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
    }) => void;
}

export function DocumentUploader({ onAnalysisComplete }: DocumentUploaderProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (isValidDocumentFile(file)) {
                setUploadedFile(file);
            } else {
                toast.error('Please upload a PDF or DOCX file');
                e.target.value = '';
            }
        }
    };

    const handleAnalyze = async () => {
        if (!uploadedFile) {
            toast.error('Please select a file first');
            return;
        }

        setIsProcessing(true);
        const toastId = toast.loading('Analyzing document...');

        try {
            toast.loading('Analyzing document and generating lesson...', { id: toastId });
            const analysisResult = await analyzeDocument(uploadedFile);
            toast.success('Document analyzed successfully!', { id: toastId });
            onAnalysisComplete(analysisResult);
            setUploadedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Document analysis error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to analyze document';
            toast.error(errorMessage, { id: toastId });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];

        if (file && isValidDocumentFile(file)) {
            setUploadedFile(file);
        } else {
            toast.error('Please upload a PDF or DOCX file');
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    return (
        <Card className="border-2 border-dashed">
            <CardContent className="p-6">
                <div onDrop={handleDrop} onDragOver={handleDragOver} className="text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-blue-50 rounded-full">
                            <Sparkles className="h-8 w-8 text-blue-600" />
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-1">AI-Powered Lesson Generator</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Upload a PDF or DOCX file to automatically generate lesson content
                            </p>
                        </div>

                        {uploadedFile ? (
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <FileText className="h-5 w-5 text-gray-600" />
                                <span className="text-sm">{uploadedFile.name}</span>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.docx"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="document-upload"
                                />
                                <label htmlFor="document-upload">
                                    <Button type="button" variant="outline" className="gap-2 cursor-pointer" asChild>
                                        <span>
                                            <Upload className="h-4 w-4" />
                                            Choose File
                                        </span>
                                    </Button>
                                </label>
                                <p className="text-xs text-gray-500">or drag and drop a PDF or DOCX file here</p>
                            </div>
                        )}

                        {uploadedFile && (
                            <Button onClick={handleAnalyze} disabled={isProcessing} className="gap-2 w-full max-w-xs">
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4" />
                                        Generate Lesson with AI
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
