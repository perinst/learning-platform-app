// Simulate AI processing delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock AI service to generate summaries
export async function generateSummary(content: string): Promise<string> {
    await delay(1500);

    // Extract first paragraph or create a summary based on content length
    const lines = content.split('\n').filter((line) => line.trim() && !line.startsWith('#'));
    const firstParagraph = lines.find((line) => line.length > 50) || lines[0] || '';

    if (firstParagraph.length > 200) {
        return firstParagraph.substring(0, 200) + '...';
    }

    return `This lesson provides comprehensive coverage of the topic with practical examples and best practices. ${firstParagraph.substring(
        0,
        100
    )}...`;
}

// Mock AI chat responses
export async function getChatResponse(message: string): Promise<string> {
    await delay(1000);

    const lowerMessage = message.toLowerCase();

    // Context-aware responses
    if (lowerMessage.includes('summary') || lowerMessage.includes('summarize')) {
        return 'Based on this lesson, the key points are: understanding the fundamental concepts, learning the syntax and best practices, and applying them in real-world scenarios. Would you like me to explain any specific section in more detail?';
    }

    if (lowerMessage.includes('example') || lowerMessage.includes('show me')) {
        return "Here's a practical example:\n\n```javascript\n// Example code based on the lesson\nconst example = () => {\n  console.log('This demonstrates the concept');\n};\n```\n\nThis example shows how to apply the concepts from the lesson. Would you like me to explain any part of it?";
    }

    if (lowerMessage.includes('what is') || lowerMessage.includes('explain')) {
        return "Let me explain that concept from the lesson: It's a fundamental principle that helps you understand how things work together. The key benefit is that it makes your code more maintainable and easier to understand. Would you like more details on any specific aspect?";
    }

    if (lowerMessage.includes('why') || lowerMessage.includes('reason')) {
        return "That's a great question! The main reason is to improve code quality and developer experience. This approach helps prevent common errors and makes the codebase more scalable. The lesson covers several benefits including better performance and maintainability.";
    }

    if (lowerMessage.includes('how') || lowerMessage.includes('can i')) {
        return 'You can implement this by following these steps:\n\n1. Start by understanding the basic concept\n2. Practice with simple examples\n3. Gradually move to more complex scenarios\n4. Apply it in your own projects\n\nThe lesson provides detailed guidance on each of these steps. Would you like me to elaborate on any particular step?';
    }

    if (lowerMessage.includes('difference') || lowerMessage.includes('vs') || lowerMessage.includes('versus')) {
        return 'The main differences are:\n\n• Syntax and structure - they use different approaches\n• Use cases - each is better suited for specific scenarios\n• Performance - there can be trade-offs depending on the context\n• Learning curve - one may be easier to grasp initially\n\nThe lesson explains when to use each approach. Would you like me to compare specific aspects?';
    }

    if (lowerMessage.includes('best practice') || lowerMessage.includes('should i')) {
        return "According to industry best practices covered in the lesson:\n\n✓ Always follow consistent naming conventions\n✓ Keep your code DRY (Don't Repeat Yourself)\n✓ Write clear comments and documentation\n✓ Test your code thoroughly\n\nThese practices will help you write more professional and maintainable code. Would you like specific examples of any of these?";
    }

    if (lowerMessage.includes('error') || lowerMessage.includes('wrong') || lowerMessage.includes('problem')) {
        return 'Common errors to watch out for, as mentioned in the lesson:\n\n1. Syntax errors - double-check your code structure\n2. Logic errors - ensure your implementation matches the concept\n3. Type mismatches - verify data types align properly\n\nThe lesson provides debugging strategies for each type. What specific issue are you encountering?';
    }

    if (lowerMessage.includes('quiz') || lowerMessage.includes('test') || lowerMessage.includes('question')) {
        return 'Great idea to test your knowledge! Here are some questions based on the lesson:\n\n1. What are the main concepts covered?\n2. Can you explain the key difference between the approaches discussed?\n3. When would you use this in a real project?\n\nTry answering these, and I can provide feedback!';
    }

    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
        return "You're welcome! I'm here to help you learn. Feel free to ask any other questions about the lesson!";
    }

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return "Hello! I'm your AI learning assistant. I'm here to help you understand this lesson better. What would you like to know?";
    }

    // Default response
    return "That's an interesting question about the lesson! Based on the content, I can help you understand this better. The lesson covers several important aspects that relate to your question. Could you be more specific about what you'd like to know? For example, you can ask about specific concepts, request examples, or ask for clarification on any topic.";
}

// Mock AI to generate quiz questions
export async function generateQuiz(): Promise<
    Array<{
        question: string;
        options: string[];
        correctAnswer: number;
    }>
> {
    await delay(2000);

    // Return mock quiz questions
    return [
        {
            question: 'What is the main purpose of this topic?',
            options: [
                'To make code more complex',
                'To improve code quality and maintainability',
                'To slow down development',
                'To confuse developers',
            ],
            correctAnswer: 1,
        },
        {
            question: 'Which of the following is a best practice?',
            options: [
                'Write unclear variable names',
                'Avoid comments entirely',
                'Follow consistent naming conventions',
                'Ignore error handling',
            ],
            correctAnswer: 2,
        },
        {
            question: 'When should you apply this concept?',
            options: [
                'Never',
                'Only in small projects',
                'In real-world scenarios and production code',
                'Only for academic purposes',
            ],
            correctAnswer: 2,
        },
    ];
}

// Mock AI to expand knowledge
export async function expandKnowledge(topic: string): Promise<string> {
    await delay(1500);

    return `# Expanded Knowledge: ${topic}

## Related Concepts

This topic is closely related to several other important concepts in modern development:

### Advanced Patterns
Building on the basics, you can explore advanced patterns that take this concept further. These patterns are used in production applications to solve complex problems.

### Real-World Applications
In practice, this is used by major companies and frameworks:
- Industry leaders apply these principles
- Popular frameworks implement similar approaches
- Best-in-class tools support this methodology

### Further Learning Resources
To deepen your understanding:
- Practice with hands-on projects
- Study open-source implementations
- Join community discussions
- Read technical documentation

### Common Pitfalls
Watch out for these common mistakes:
- Over-engineering simple solutions
- Ignoring performance implications
- Not considering edge cases
- Failing to test thoroughly

### Next Steps
After mastering this topic, consider learning:
- Related advanced topics
- Complementary technologies
- Integration patterns
- Testing strategies`;
}
