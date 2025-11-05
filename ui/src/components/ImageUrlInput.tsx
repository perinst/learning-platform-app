import { useState } from 'react';
import { Input } from './ui/input';
import { uploadImage, isImageFile } from '../utils/imageUpload';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ImageUrlInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    id?: string;
}

export function ImageUrlInput({
    value,
    onChange,
    placeholder = 'https://example.com/image.jpg',
    className,
    id,
}: ImageUrlInputProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
        const items = Array.from(e.clipboardData.items);
        const imageItems = items.filter((item) => item.type.startsWith('image/'));

        if (imageItems.length === 0) return;

        e.preventDefault();
        setIsUploading(true);

        try {
            const file = imageItems[0].getAsFile();
            if (!file) return;

            const url = await uploadImage(file);
            onChange(url);
            toast.success('Image uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files).filter(isImageFile);
        if (files.length === 0) {
            toast.error('Please drop an image file');
            return;
        }

        setIsUploading(true);

        try {
            const url = await uploadImage(files[0]);
            onChange(url);
            toast.success('Image uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative ${isDragging ? 'ring-2 ring-blue-500 ring-offset-2 rounded-md' : ''}`}
        >
            <Input
                id={id}
                type="url"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onPaste={handlePaste}
                placeholder={placeholder}
                className={className}
                disabled={isUploading}
            />
            {isUploading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
            )}
        </div>
    );
}
