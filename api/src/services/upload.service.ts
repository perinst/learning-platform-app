import { UploadResult, FreeImageResponse } from '../types';

/**
 * Upload Service
 * Handles file upload operations
 */
export class UploadService {
    private freeImageApiKey: string;

    constructor(freeImageApiKey: string) {
        this.freeImageApiKey = freeImageApiKey;
    }

    /**
     * Upload image to FreeImage.host
     */
    async uploadImageToFreeImageHost(base64Image: string): Promise<UploadResult> {
        try {
            const formData = new URLSearchParams();
            formData.append('key', this.freeImageApiKey);
            formData.append('action', 'upload');
            formData.append('source', base64Image);
            formData.append('format', 'json');

            const response = await fetch('https://freeimage.host/api/1/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
            });

            const data = (await response.json()) as FreeImageResponse;

            if (data.status_code === 200 && data.image) {
                return {
                    success: true,
                    url: data.image.url,
                    display_url: data.image.display_url,
                };
            } else {
                return {
                    success: false,
                    error: data.error?.message || 'Upload failed',
                };
            }
        } catch (error) {
            console.error('[UploadService] Image upload error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}
