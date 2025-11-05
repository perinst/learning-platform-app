import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
    return (
        <div className={`prose prose-slate max-w-none ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={{
                    img: (props) => (
                        <img {...props} className="max-w-full h-auto rounded-lg my-4" alt={props.alt || 'Image'} />
                    ),
                    p: (props) => <p {...props} className="mb-4 leading-7 last:mb-0" />,
                    h1: (props) => <h1 {...props} className="text-3xl font-bold mb-4 mt-6" />,
                    h2: (props) => <h2 {...props} className="text-2xl font-bold mb-3 mt-5" />,
                    h3: (props) => <h3 {...props} className="text-xl font-semibold mb-2 mt-4" />,
                    h4: (props) => <h4 {...props} className="text-lg font-semibold mb-2 mt-3" />,
                    ul: (props) => <ul {...props} className="list-disc list-inside mb-4 space-y-2 ml-4" />,
                    ol: (props) => <ol {...props} className="list-decimal list-inside mb-4 space-y-2 ml-4" />,
                    li: (props) => <li {...props} className="leading-7" />,
                    code: (props) => {
                        const { className, children } = props;
                        const inline = !className?.includes('language-');
                        return inline ? (
                            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
                        ) : (
                            <code
                                {...props}
                                className="block bg-gray-900 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto font-mono text-sm"
                            />
                        );
                    },
                    pre: (props) => <pre {...props} className="bg-gray-900 rounded-lg overflow-hidden my-4" />,
                    blockquote: (props) => (
                        <blockquote {...props} className="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-700" />
                    ),
                    a: (props) => (
                        <a
                            {...props}
                            className="text-blue-600 hover:text-blue-800 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        />
                    ),
                    strong: (props) => <strong {...props} className="font-bold" />,
                    em: (props) => <em {...props} className="italic" />,
                    hr: (props) => <hr {...props} className="my-6 border-gray-300" />,
                    table: (props) => (
                        <div className="overflow-x-auto my-4">
                            <table {...props} className="min-w-full divide-y divide-gray-300" />
                        </div>
                    ),
                    thead: (props) => <thead {...props} className="bg-gray-50" />,
                    tbody: (props) => <tbody {...props} className="divide-y divide-gray-200 bg-white" />,
                    tr: (props) => <tr {...props} />,
                    th: (props) => (
                        <th {...props} className="px-4 py-2 text-left text-sm font-semibold text-gray-900" />
                    ),
                    td: (props) => <td {...props} className="px-4 py-2 text-sm text-gray-700" />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
