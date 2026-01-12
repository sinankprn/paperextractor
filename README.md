# Paper Extractor

Extract specific information from your PDF documents using AI. Upload a PDF, tell the app what information you need, and it will automatically find it and show you exactly where it came from in the document.

## What Does This Do?

This tool uses Google's Gemini AI to automatically extract specific pieces of information from PDF documents. Instead of manually searching through pages, you simply:

1. Upload your PDF
2. Tell it what you're looking for
3. Get structured results and text snippets showing where each piece of information was found

## How It Works

The application uses a two-stage AI process:

1. **Stage 1**: Converts your PDF to high-quality Markdown text (preserving tables, headers, and layout)
2. **Stage 2**: Extracts your requested fields with proof snippets

You can view three panels side-by-side:

- **Left**: Your original PDF pages displayed as images
- **Middle**: The full derendered text extracted from the PDF
- **Right**: Your extracted data with values and snippets

## What You'll Need

### Required

1. **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
2. **Google Gemini API Key** (free) - [Get one here](https://aistudio.google.com/app/apikey)

### Nice to Have

- Basic familiarity with command line/terminal
- A PDF document to test with

## Installation & Setup

### Step 1: Get Your Free API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key that appears (you'll need it in Step 3)

> **Note**: The free tier includes generous limits suitable for most personal projects.

### Step 2: Install the Application

Open your terminal (Command Prompt on Windows, Terminal on Mac/Linux) and navigate to the project folder:

```bash
# Navigate to the project directory
cd paperextractor

# Install all dependencies (this may take a minute)
npm install
```

### Step 3: Configure Your API Key

1. Navigate to the `server` folder in the project
2. Find the file named `.env.example`
3. Make a copy and rename it to `.env`
4. Open `.env` in any text editor
5. Replace `your_api_key_here` with your actual API key from Step 1

Your `.env` file should look like this:

```
GEMINI_API_KEY=AIzaSyAbc123YourActualKeyHere
PORT=3001
```

**Important**: Never share your `.env` file or commit it to version control.

### Step 4: Start the Application

In your terminal, run:

```bash
npm run dev
```

You should see output like:

```
Server running on http://localhost:3001
Frontend running on http://localhost:5173
```

### Step 5: Open in Your Browser

Navigate to: **http://localhost:5173**

## How to Use

### Basic Workflow

1. **Upload Your PDF**

   - Click "Choose File" or drag and drop your PDF into the upload area
   - File must be under 50 MB
   - Multi-page PDFs are fully supported

2. **Define Fields to Extract**

   - Click "Add Field" to create a new field
   - Give it a name (e.g., "Invoice Number")
   - Choose a type:
     - **Text**: Standard text (names, addresses, invoice numbers)
     - **Number**: Numeric values (prices, quantities, amounts)
     - **Date**: Date values (invoice dates, due dates)
     - **Boolean**: Yes/No answers
     - **List**: Multiple items (product lists, line items)
   - Optionally add context (extra instructions to help the AI find the right information)

3. **Click "Extract Fields"**

   - Processing typically takes 10-30 seconds depending on PDF size
   - The AI analyses your document in two stages
   - Progress is shown with a loading indicator

4. **Review Results**

   - **Results Panel** (right): Shows all extracted values
   - **Derendered Text Viewer** (middle): Full text content with search highlighting
   - **Page Viewer** (left): Your original PDF rendered as images
   - Hover over any result to see it highlighted in the text
   - Click the copy icon to copy any value to your clipboard

5. **Export Your Data**
   - **Export JSON**: Full structured data with all metadata
   - **Export CSV**: Spreadsheet format with Field Name, Value, and Snippet columns

### Advanced Features

#### Field Context

Add extra instructions to help the AI find specific information:

- Example field: "Total Amount"
- Example context: "The final total at the bottom of the invoice, not subtotals"

#### Focus on Main Study (Research Papers)

- Check this box when extracting from academic papers
- Tells the AI to ignore data from cited/referenced studies
- Only extracts from the primary research being presented

#### Multiple Values

If a field appears multiple times in your document (e.g., multiple dates), all instances will be extracted:

- Each value comes with its own snippet
- Click "Show all values" to expand and see everything
  > **Note**: Not guaranteed

## Tips for Best Results

### Field Names

- **Be specific**: "Invoice Date" instead of just "Date"
- **Use document language**: If the PDF says "PO Number", use "PO Number" not "Purchase Order ID"
- **One thing per field**: Instead of "Name and Address", create separate "Name" and "Address" fields

### Field Types

- Use **Number** type for values you might calculate with (prices, quantities)
- Use **Text** type for identifiers that contain numbers (like "INV-12345")
- Use **List** type when you expect multiple similar items (product names, line items)

### Context Instructions

Add context when:

- Multiple similar values exist (e.g., "Invoice Date" vs "Due Date")
- The field name might be ambiguous
- You want to exclude certain values (e.g., "Final total only, not subtotals")

### Document Quality

- **Digital PDFs** (created from Word, Excel, etc.) work best
- **Scanned PDFs** with clear text work well
- **Handwritten documents** may have lower accuracy
- **Low-quality scans** may produce unreliable results

## Common Questions

### Is my data secure?

- Files are processed through Google's Gemini API (see [Google's Privacy Policy](https://policies.google.com/privacy))
- Files are not permanently stored
- Your API key is stored locally in the `.env` file
- Never commit `.env` to version control

### Why is processing slow?

Processing time depends on:

- PDF size (larger files take longer)
- Number of pages (each page adds ~2-3 seconds)
- Number of fields requested
- Internet connection speed

Typical times:

- 1-page PDF with 5 fields: ~10 seconds
- 10-page PDF with 10 fields: ~30-45 seconds
- 50-page PDF: ~2-3 minutes

### What's the file size limit?

Maximum PDF size is 50 MB. If you need to process larger files, consider splitting them into smaller PDFs.

## Troubleshooting

### "Failed to process document"

**Possible causes:**

- Invalid API key in `server/.env`
- No internet connection
- PDF file is corrupted or invalid
- Gemini API is temporarily unavailable

**Solutions:**

1. Verify your API key at [Google AI Studio](https://aistudio.google.com/)
2. Check your internet connection
3. Try a different PDF to rule out file issues
4. Check server console output for detailed error messages

### Application won't start

**Check these:**

- Is Node.js installed? Run `node --version` to verify
- Did you run `npm install`?
- Is port 3001 or 5173 already in use by another application?
- Are you in the correct directory?

**Solutions:**

- Close other applications that might use these ports
- Restart your terminal
- Try running `npm install` again

### PDF not displaying

**Possible causes:**

- Browser can't render base64 images
- PDF conversion failed
- Response size too large for browser

**Solutions:**

- Check browser console (F12) for errors
- Try a smaller PDF
- Check server logs for conversion errors

### Extraction returns wrong or empty values

**Possible causes:**

- Field name is too vague
- PDF doesn't actually contain the requested information
- Scanned PDF has poor image quality
- Field type mismatch (e.g., using Number for text)

**Solutions:**

- Make field names more specific
- Add context to guide the AI
- Review the OCR text (middle panel) to verify the content was read correctly
- Try different field type

### Out of memory errors

**Possible causes:**

- PDF is too large or complex
- Too many pages being processed

**Solutions:**

- Split large PDFs into smaller chunks
- Reduce PDF file size using compression tools
- Restart the application

## Technical Details

For developers and those interested in the technical implementation:

### Architecture

- **Frontend**: React 18.3 + Vite 5.4 + Tailwind CSS 3.4
- **Backend**: Express.js 4.21 + Node.js (ES modules)
- **AI**: Google Gemini 2.0 with JSON schema mode
- **PDF Processing**: pdf-to-img (2x scale for quality)

### Project Structure

```
paperextractor/
├── client/          # React frontend (port 5173)
│   └── src/
│       ├── App.jsx                # Main app logic
│       └── components/            # UI components
├── server/          # Express backend (port 3001)
│   └── src/
│       ├── index.js              # Server setup
│       ├── routes/extract.js     # API endpoint
│       └── services/
│           ├── gemini.js         # AI integration
│           └── pdfToImage.js     # PDF conversion
└── package.json     # Monorepo configuration
```

### API Endpoint

```
POST /api/extract
Content-Type: multipart/form-data
Body: { file: [PDF], fields: [JSON array] }

Response: {
  images: ["base64...", ...],        // PDF pages as PNG
  extractions: [...],                 // Extracted field data
  ocrText: "..."                     // Full OCR markdown text
}
```

### Two-Stage Extraction

1. **Stage 1**: PDF → Markdown (preserves structure, tables, layout)
2. **Stage 2**: Markdown → Structured JSON (extracts fields)

## Command Reference

```bash
# Install dependencies
npm install

# Start both server and client (development mode)
npm run dev

# Run only the server (port 3001)
npm run dev:server

# Run only the frontend (port 5173)
npm run dev:client

# Build frontend for production
npm run build

# Start production server
npm run start
```

## Development Mode vs Production

**Development** (`npm run dev`):

- Hot Module Replacement (HMR) for instant updates
- Server auto-restarts on file changes
- Vite dev server with fast rebuilds
- Detailed error messages

**Production** (`npm run build` + `npm run start`):

- Optimized frontend bundle
- Minified JavaScript and CSS
- Static file serving from `client/dist/`
- Better performance

## File Limits & Specifications

| Feature            | Limit                                     |
| ------------------ | ----------------------------------------- |
| Max PDF Size       | 50 MB                                     |
| Page Count         | Unlimited (performance scales with pages) |
| Fields per Request | Unlimited (recommended: < 20)             |
| Supported Types    | text, number, date, boolean, list         |
| Response Format    | JSON                                      |
| Export Formats     | JSON, CSV                                 |

## Privacy & Data Handling

### What Gets Uploaded

- Your PDF file (temporarily)
- Field definitions (names, types, context)

### Where Data Goes

1. Your local server (`localhost:3001`)
2. Google Gemini API (for AI processing)

### Data Retention

- **Your computer**: Files deleted immediately after processing
- **Google Gemini**: Files deleted by the application after extraction
- **No long-term storage**: Nothing is permanently stored by this application

### Recommendations

- Don't use with highly sensitive documents (financial records, medical records, legal documents with PII)
- For sensitive data, review Google's enterprise options or use on-premise AI solutions
- Always verify extracted data before using it in production systems

## Future Enhancements

Planned features:

- Handling of figures
- Batch processing (multiple PDFs)
- Visual bounding boxes showing exact extraction locations on PDF
- Field templates (save/load common configurations)
- Excel export format
- Field validation rules
- Comparison mode (extract from multiple PDFs, compare side-by-side)

## Acknowledgments

Built with:

- [Google Gemini AI](https://ai.google.dev/) - AI-powered extraction
- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Express.js](https://expressjs.com/) - Backend framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [pdf-to-img](https://www.npmjs.com/package/pdf-to-img) - PDF rendering

---

**Ready to extract?** Run `npm run dev` and open http://localhost:5173 to get started!
