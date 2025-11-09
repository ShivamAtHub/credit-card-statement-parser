const fs = require("fs");
const { PDFParse } = require("pdf-parse");

module.exports = async function parsePDF(filePath) {
  let parser = null;
  try {
    const dataBuffer = fs.readFileSync(filePath);
    
    // Use the new PDFParse class API
    parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    const text = result.text;
    
    // Clean up parser
    await parser.destroy();
    parser = null;

    // Normalize text for better matching (remove extra spaces, convert to lowercase for searching)
    const normalizedText = text.replace(/\s+/g, " ");

    // Helper function to extract with multiple patterns
    const extract = (patterns) => {
      for (const pattern of patterns) {
        const match = normalizedText.match(pattern);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
      return "Not Found";
    };

    // Extract Card Holder Name (multiple patterns)
    const cardHolderName = extract([
      /(?:card\s*holder|account\s*holder|name)[\s:]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
      /(?:name)[\s:]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
      /([A-Z][a-z]+\s+[A-Z][a-z]+)(?:\s+Card|Statement)/i,
    ]);

    // Extract Last 4 Digits (multiple patterns)
    const last4Digits = extract([
      /(?:card\s*number|account\s*number)[\s:]*\*+\s*(\d{4})/i,
      /(\d{4})(?:\s*[-]?\s*\d{4}){3,}/, // Match last 4 of a card number pattern
      /\*{8,12}(\d{4})/, // Masked card number
      /XXXX\s*(\d{4})/i,
      /(\d{4})(?=\s*Exp|$)/, // Last 4 digits before expiration or end
    ]);

    // Extract Billing Cycle (start and end dates)
    const billingCycle = extract([
      /(?:billing\s*cycle|billing\s*period|statement\s*period)[\s:]+([A-Z][a-z]+\s+\d{1,2}[\s,-]+\d{4}\s*[-–—]\s*[A-Z][a-z]+\s+\d{1,2}[\s,-]+\d{4})/i,
      /(?:billing\s*cycle|billing\s*period)[\s:]+([A-Z][a-z]+\s+\d{1,2}[\s,-]+\d{4}\s*to\s*[A-Z][a-z]+\s+\d{1,2}[\s,-]+\d{4})/i,
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\s*[-–—]\s*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
      /(?:from|from\s*date)[\s:]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})[\s\S]*?(?:to|to\s*date)[\s:]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    ]);

    // Extract Payment Due Date
    const dueDate = extract([
      /(?:payment\s*due\s*date|due\s*date|pay\s*by)[\s:]+([A-Z][a-z]+\s+\d{1,2}[,\s]+\d{4})/i,
      /(?:payment\s*due\s*date|due\s*date)[\s:]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /(?:due\s*date)[\s:]+([A-Z][a-z]+\s+\d{1,2})/i,
      /due[\s:]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    ]);

    // Extract Total Amount Due
    const totalAmountDue = extract([
      /(?:total\s*amount\s*due|amount\s*due|total\s*due|balance\s*due)[\s:]*[₹$]?\s*([\d,]+\.?\d*)/i,
      /(?:total\s*due)[\s:]*[₹$]?\s*([\d,]+\.?\d*)/i,
      /[₹$]\s*([\d,]+\.?\d*)(?:\s*(?:total|due|balance))/i,
    ]);

    return {
      cardHolderName: cardHolderName,
      last4Digits: last4Digits,
      billingCycle: billingCycle,
      dueDate: dueDate,
      totalAmountDue: totalAmountDue,
      rawText: text.substring(0, 500), // Include first 500 chars for debugging
    };
  } catch (error) {
    console.error("PDF parsing error:", error);
    // Clean up parser on error
    if (parser) {
      try {
        await parser.destroy();
      } catch (destroyError) {
        console.error("Error destroying parser:", destroyError);
      }
    }
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
};
