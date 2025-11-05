# AI Document Analyzer for Lesson Creation

This feature allows you to upload PDF or DOCX files and automatically generate lesson content using DeepSeek AI.

## Features

- ✅ Upload DOCX or TXT files
- ✅ Extract text from documents
- ✅ Analyze content with DeepSeek AI
- ✅ Auto-fill lesson form with:
    - Title
    - Description
    - Content (Markdown formatted)
    - Category
    - Summary
    - Applications (real-world use cases)
    - Questions (multiple choice with answers)

## Current Implementation

The feature is **already working** with:

- ✅ **DOCX files** (basic text extraction)
- ✅ **TXT files** (plain text)
- ✅ **DeepSeek AI integration**

## Optional: Enable PDF Support

If you want to support PDF files, install these packages:

```bash
cd ui
npm install pdfjs-dist mammoth
```

Then update `src/components/DocumentUploader.tsx` to use the full implementations from `src/utils/fileExtractor.ts`.

## How to Use

1. Go to **Create New Lesson** page
2. You'll see the **"AI-Powered Lesson Generator"** card at the top
3. Click **"Choose File"** or drag & drop a DOCX/TXT file
4. Click **"Generate Lesson with AI"**
5. Wait for the AI to analyze (10-30 seconds)
6. All form fields will be automatically filled!
7. Review and adjust the content as needed
8. Click **"Save Lesson"**

## API Key

The DeepSeek API key is already configured in the code:

```
sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **For production**, move this to environment variables:

- Create `.env` file in `ui/` folder
- Add: `VITE_DEEPSEEK_API_KEY=your-key-here`
- Update code to use: `import.meta.env.VITE_DEEPSEEK_API_KEY`

## Supported File Types

| Type | Status      | Notes                         |
| ---- | ----------- | ----------------------------- |
| DOCX | ✅ Working  | Basic text extraction         |
| TXT  | ✅ Working  | Full support                  |
| PDF  | ⚠️ Optional | Requires `pdfjs-dist` package |

## Example Workflow

1. **Upload**: Drop a course material DOCX file
2. **AI Analysis**: DeepSeek reads and structures the content
3. **Auto-fill**:
    - Title: "Introduction to React Hooks"
    - Category: "Programming"
    - Content: Formatted Markdown with sections
    - Applications: Real-world use cases
    - Questions: 5 quiz questions with answers
4. **Save**: Review and publish the lesson

## Troubleshooting

**Issue**: "Could not extract readable text from DOCX"

- Solution: File may be empty or image-based. Use a text-based DOCX.

**Issue**: "DeepSeek API error: 401"

- Solution: Check API key is valid and has credits.

**Issue**: "Invalid JSON response from AI"

- Solution: Content may be too complex. Try with simpler text or shorter document.

## Advanced: Customize AI Prompt

Edit the `PROMPT` variable in `DocumentUploader.tsx` to customize what the AI extracts or how it formats the content.

Example: Add more question types, specify content structure, etc.
