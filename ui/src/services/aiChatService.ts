const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = import.meta.env.VITE_DEEPSEEK_API_URL;

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export async function getChatResponse(
    userMessage: string,
    lessonContext: string,
    chatHistory: ChatMessage[]
): Promise<string> {
    const systemPrompt = `You are an expert educational AI assistant helping students learn. You have access to the following lesson content:

${lessonContext}

Your role:
- Answer questions about the lesson content clearly and concisely
- Provide practical examples when asked
- Explain concepts in simple terms
- Encourage learning and understanding
- If the question is not related to the lesson, politely redirect to lesson topics
- Keep responses focused and helpful
- Use markdown formatting when appropriate (bold, italic, code blocks, lists)`;

    const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...chatHistory.slice(-10).map((msg) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
        })),
        { role: 'user', content: userMessage },
    ];

    const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'deepseek-chat',
            messages,
            temperature: 0.7,
            max_tokens: 1000,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
        throw new Error('No response received from AI');
    }

    return content.trim();
}
