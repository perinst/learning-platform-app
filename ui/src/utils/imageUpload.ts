import { API_CONFIG } from '../config/api.config';

export interface ImageUploadResponse {
    success: boolean;
    url?: string;
    display_url?: string;
    error?: string;
}

export async function uploadImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async () => {
            try {
                const base64String = (reader.result as string).split(',')[1];
                const token = localStorage.getItem('access_token'); // Fix: use correct storage key

                const response = await fetch(`${API_CONFIG.baseURL}/api/upload-image`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                    body: JSON.stringify({
                        base64Image: base64String,
                    }),
                });

                const data: ImageUploadResponse = await response.json();

                if (response.status === 403) {
                    reject(new Error('Only administrators can upload images'));
                } else if (response.status === 401) {
                    reject(new Error('Please login to upload images'));
                } else if (data.success && data.url) {
                    resolve(data.url);
                } else {
                    reject(new Error(data.error || 'Upload failed'));
                }
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsDataURL(file);
    });
}

export function isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
}
