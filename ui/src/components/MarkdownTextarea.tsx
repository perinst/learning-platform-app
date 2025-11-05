import { useRef, useState, forwardRef } from 'react';
import { Textarea } from './ui/textarea';
import { uploadImage, isImageFile } from '../utils/imageUpload';
import { toast } from 'sonner';
import { Image, Loader2 } from 'lucide-react';

interface MarkdownTextareaProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
    className?: string;
    id?: string;
    required?: boolean;
}

export const MarkdownTextarea = forwardRef<HTMLTextAreaElement, MarkdownTextareaProps>(
    ({ value, onChange, placeholder, rows = 10, className, id, required }, ref) => {
        const textareaRef = useRef<HTMLTextAreaElement>(null);
        const [isUploading, setIsUploading] = useState(false);

        const insertAtCursor = (text: string) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newValue = value.substring(0, start) + text + value.substring(end);

            onChange(newValue);

            // Set cursor position after inserted text
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + text.length, start + text.length);
            }, 0);
        };

        const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
            const items = Array.from(e.clipboardData.items);
            const imageItems = items.filter((item) => item.type.startsWith('image/'));

            if (imageItems.length === 0) return;

            e.preventDefault();
            setIsUploading(true);

            try {
                const uploadPromises = imageItems.map(async (item) => {
                    const file = item.getAsFile();
                    if (!file) return null;

                    const url = await uploadImage(file);
                    return url;
                });

                const urls = await Promise.all(uploadPromises);
                const validUrls = urls.filter((url): url is string => url !== null);

                if (validUrls.length > 0) {
                    const markdownImages = validUrls.map((url) => `![image](${url})`).join('\n\n');
                    insertAtCursor(markdownImages);
                    toast.success(`${validUrls.length} image(s) uploaded successfully!`);
                }
            } catch (error) {
                console.error('Upload error:', error);
                toast.error(error instanceof Error ? error.message : 'Failed to upload image');
            } finally {
                setIsUploading(false);
            }
        };

        const handleDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
            e.preventDefault();

            const files = Array.from(e.dataTransfer.files).filter(isImageFile);
            if (files.length === 0) return;

            setIsUploading(true);

            try {
                const uploadPromises = files.map((file) => uploadImage(file));
                const urls = await Promise.all(uploadPromises);

                const markdownImages = urls.map((url) => `![image](${url})`).join('\n\n');
                insertAtCursor(markdownImages);
                toast.success(`${urls.length} image(s) uploaded successfully!`);
            } catch (error) {
                console.error('Upload error:', error);
                toast.error(error instanceof Error ? error.message : 'Failed to upload image');
            } finally {
                setIsUploading(false);
            }
        };

        const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
            e.preventDefault();
        };

        return (
            <div className="relative">
                <Textarea
                    ref={(el) => {
                        textareaRef.current = el;
                        if (typeof ref === 'function') {
                            ref(el);
                        } else if (ref) {
                            ref.current = el;
                        }
                    }}
                    id={id}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onPaste={handlePaste}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    placeholder={placeholder}
                    rows={rows}
                    className={`${className} ${isUploading ? 'opacity-50' : ''}`}
                    disabled={isUploading}
                    required={required}
                />
                {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-md">
                        <div className="flex items-center gap-2 text-blue-600">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="text-sm font-medium">Uploading image...</span>
                        </div>
                    </div>
                )}
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <Image className="h-3 w-3" />
                    <span>Paste or drag & drop images to upload</span>
                </div>
            </div>
        );
    }
);

MarkdownTextarea.displayName = 'MarkdownTextarea';
