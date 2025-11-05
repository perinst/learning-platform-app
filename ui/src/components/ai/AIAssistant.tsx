import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { MarkdownRenderer } from '../MarkdownRenderer';
import type { ChatMessage, Lesson } from '../../utils/mockData';
import { getChatResponse } from '../../services/aiChatService';
import { toast } from 'sonner';

interface AIAssistantProps {
    lesson: Lesson;
}

export function AIAssistant({ lesson }: AIAssistantProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 1,
            role: 'assistant',
            content: `Hello! I'm your AI learning assistant powered by DeepSeek. I'm here to help you understand "${lesson.title}". Feel free to ask me any questions about the lesson content!`,
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await getChatResponse(input, lesson.content, messages);

            const assistantMessage: ChatMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: response,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error getting AI response:', error);
            toast.error('Failed to get AI response. Please try again.');

            const errorMessage: ChatMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try asking your question again.',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Card className="h-[600px] flex flex-col overflow-hidden">
            <CardHeader className="border-b shrink-0">
                <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-blue-600" />
                    AI Learning Assistant
                </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden min-h-0">
                <ScrollArea className="h-full p-4" ref={scrollRef}>
                    <div className="space-y-4 pr-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-3 items-start ${
                                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                                }`}
                            >
                                <div
                                    className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                                        message.role === 'user' ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                                >
                                    {message.role === 'user' ? (
                                        <User className="h-4 w-4 text-white" />
                                    ) : (
                                        <Bot className="h-4 w-4 text-gray-700" />
                                    )}
                                </div>

                                <div
                                    className={`flex-1 min-w-0 max-w-[75%] ${
                                        message.role === 'user'
                                            ? 'flex flex-col items-end'
                                            : 'flex flex-col items-start'
                                    }`}
                                >
                                    <div
                                        className={`w-full rounded-lg px-4 py-2 ${
                                            message.role === 'user'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-900'
                                        }`}
                                    >
                                        {message.role === 'user' ? (
                                            <p className="whitespace-pre-wrap break-words overflow-wrap-anywhere">
                                                {message.content}
                                            </p>
                                        ) : (
                                            <div className="prose prose-sm max-w-none overflow-hidden [&_*]:break-words [&_pre]:overflow-x-auto [&_code]:break-all [&_table]:overflow-x-auto">
                                                <MarkdownRenderer content={message.content} />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 px-1">
                                        {message.timestamp.toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3 items-start">
                                <div className="shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                    <Bot className="h-4 w-4 text-gray-700" />
                                </div>
                                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-gray-600">Thinking...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>

            <div className="border-t p-4 shrink-0 bg-white">
                <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask a question about this lesson..."
                        disabled={isLoading}
                    />
                    <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="icon">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift + Enter for new line</p>
            </div>
        </Card>
    );
}
