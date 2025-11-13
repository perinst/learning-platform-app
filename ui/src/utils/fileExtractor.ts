import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.mjs';

export async function extractTextFromPDF(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
                const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;

                let fullText = '';

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item) => (item as TextItem).str).join(' ');
                    fullText += pageText + '\n\n';
                }

                resolve(fullText.trim());
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('Failed to read PDF file'));
        reader.readAsArrayBuffer(file);
    });
}

export async function extractTextFromDOCX(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target?.result as ArrayBuffer;
                const result = await mammoth.extractRawText({ arrayBuffer });
                resolve(result.value.trim());
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('Failed to read DOCX file'));
        reader.readAsArrayBuffer(file);
    });
}

export async function extractTextFromFile(file: File): Promise<string> {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        return extractTextFromPDF(file);
    } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.endsWith('.docx')
    ) {
        return extractTextFromDOCX(file);
    } else {
        throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
    }
}

export function isValidDocumentFile(file: File): boolean {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    return (
        fileType === 'application/pdf' ||
        fileName.endsWith('.pdf') ||
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.endsWith('.docx')
    );
}
