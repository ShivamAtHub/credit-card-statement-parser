# Credit Card Statement PDF Parser

This project extracts important information from credit card statement PDFs using a React (Vite) frontend and a Node.js (Express) backend. The backend receives the uploaded PDF, parses the extracted text, applies pattern matching (regex), and returns structured result data to the frontend.

---

## Objective

Credit card statements are often unstructured and difficult to process automatically.  
The goal of this project is to extract critical details from PDF statements to reduce manual work.

The parser extracts:

- Cardholder Name
- Last four digits of the credit card
- Billing cycle
- Payment due date
- Total amount due

---

## Tech Stack

**Backend**
- Node.js
- Express
- Multer (file upload handling)
- pdf-parse (PDF text extraction)

**Frontend**
- React (Vite)
- Tailwind CSS
- Axios (for API communication)

---

## Project Structure

```
credit-card-parser/
│
├── backend/
│   ├── server.js                  # Express server, PDF upload endpoint
│   ├── parsers/
│   │   └── pdfParser.js           # PDF extraction and regex logic
│   ├── package.json
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── components/
    │   │   └── FileUpload.jsx     # Frontend upload UI
    ├── package.json
```

---

## Setup Instructions

### Clone the repository
```
git clone https://github.com/ShivamAtHub/credit-card-statement-parser.git
cd credit-card-parser
```

---

## Backend Setup (Node.js)

```
cd backend
npm install
node server.js
```

Backend runs on:
```
http://localhost:5000
```

---

## Frontend Setup (React + Vite)

```
cd frontend
npm install
npm run dev
```

Frontend runs on:
```
http://localhost:5173/
```

---

## Usage Flow

1. Start backend.
2. Start frontend.
3. Open frontend in browser.
4. Upload a credit card statement PDF.
5. Extracted information is displayed on the screen.

The backend extracts text from the PDF and applies regex-based pattern matching to identify values.

---

## Example Output (JSON)

```
{
  "cardHolder": "John Doe",
  "last4Digits": "5678",
  "billingCycle": "01 Oct 2024 - 31 Oct 2024",
  "dueDate": "20 Nov 2024",
  "totalAmountDue": "₹14,590.00"
}
```

---

## Future Improvements

- Add support for scanned PDFs (OCR).
- Handle multiple bank formats with more robust pattern detection.
- Visual analytics dashboard based on extracted statements.

---

## Conclusion

This project demonstrates handling and extracting structured information from unstructured PDF financial documents, converting them into usable data through a full-stack implementation.

