const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const parsePDF = require("./parsers/pdfParser");

const app = express();
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({ 
  dest: uploadsDir,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  }
});

app.post("/upload", (req, res) => {
  upload.single("file")(req, res, async (err) => {
    // Handle multer errors
    if (err) {
      return res.status(400).json({ 
        error: "File upload error", 
        message: err.message 
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;

    try {
      const extractedData = await parsePDF(filePath);
      
      // Clean up uploaded file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      res.json(extractedData);
    } catch (error) {
      console.error("Error parsing PDF:", error);
      
      // Clean up uploaded file on error
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkError) {
          console.error("Error deleting file:", unlinkError);
        }
      }
      
      res.status(500).json({ 
        error: "Failed to parse PDF", 
        message: error.message 
      });
    }
  });
});

// Catch-all route for 404 - always return JSON
app.use((req, res) => {
  res.status(404).json({ 
    error: "Route not found", 
    message: `The endpoint ${req.method} ${req.path} does not exist` 
  });
});

// Global error handler - always return JSON
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ 
    error: "Internal server error", 
    message: err.message 
  });
});

app.listen(5000, () => console.log("✅ Backend running on port 5000"));