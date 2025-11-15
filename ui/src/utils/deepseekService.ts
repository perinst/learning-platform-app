const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = import.meta.env.VITE_DEEPSEEK_API_URL;

interface LessonAnalysisResult {
    title: string;
    description: string;
    content: string;
    category: string;
    summary: string;
    applications: Array<{
        title: string;
        description: string;
        examples: string[];
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
}
import { MAX_TOKENS } from '../constants';
import { LESSON_ANALYSIS_PROMPT } from '../constants/prompts';

export async function analyzeLessonContent(text: string): Promise<LessonAnalysisResult> {
    const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
                {
                    role: 'system',
                    content: LESSON_ANALYSIS_PROMPT,
                },
                {
                    role: 'user',
                    content: `Analyze this educational content and extract structured lesson information:\n\n${text}`,
                },
            ],
            temperature: 0.3,
            max_tokens: MAX_TOKENS,
            response_format: {
                type: 'json_object',
            }
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
        throw new Error('No content received from DeepSeek API');
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI');
    }

    const result: LessonAnalysisResult = JSON.parse(jsonMatch[0]);

    if (!result.title || !result.description || !result.content || !result.category) {
        throw new Error('Missing required fields in AI response');
    }

    return result;
}
