import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { UploadService } from '../services/upload.service';

/**
 * Upload Controller
 * Handles file upload-related HTTP requests
 */
export class UploadController {
    private uploadService: UploadService;

    constructor(uploadService: UploadService) {
        this.uploadService = uploadService;
    }

    /**
     * POST /api/upload/image
     * Upload an image to FreeImage.host (Admin only)
     */
    uploadImage = async (req: Request, res: Response): Promise<void> => {
        try {
            const { base64Image } = req.body;

            if (!base64Image) {
                res.status(400).json({
                    success: false,
                    error: 'No image provided',
                } as ApiResponse);
                return;
            }

            const result = await this.uploadService.uploadImageToFreeImageHost(base64Image);

            if (!result.success) {
                res.status(400).json(result);
                return;
            }

            res.status(200).json(result);
        } catch (error) {
            console.error('[UploadController] Image upload error:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Image upload failed',
            } as ApiResponse);
        }
    };
}
