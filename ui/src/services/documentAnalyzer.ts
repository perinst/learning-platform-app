import { extractTextFromFile } from '../utils/fileExtractor';
import { analyzeLessonContent } from '../utils/deepseekService';

export async function analyzeDocument(file: File, customPrompt?: string) {
    const text = await extractTextFromFile(file);

    if (!text || text.length < 100) {
        throw new Error('Document appears to be empty or too short');
    }

    const analysis = await analyzeLessonContent(text, customPrompt);
    return analysis;
}
