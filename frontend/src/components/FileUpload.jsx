import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FileUpload() {
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset states
    setFileName(file.name);
    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");

      if (!response.ok) {
        let errorMessage = "Upload failed";
        
        if (isJson) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (parseError) {
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
        } else {
          // If not JSON, it's probably an HTML error page
          errorMessage = `Server error: ${response.status}. Make sure the backend server is running on port 5000.`;
        }
        
        throw new Error(errorMessage);
      }

      if (!isJson) {
        throw new Error("Server returned non-JSON response. Make sure the backend is running correctly.");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Upload failed:", error);
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        setError("Cannot connect to server. Please make sure the backend is running on http://localhost:5000");
      } else {
        setError(error.message || "Failed to upload and parse PDF. Please try again.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white border-b border-gray-200"
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-light tracking-wide text-gray-800">
            FileExtract
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
            <button className="hover:text-gray-900 transition-colors">
              Upload
            </button>
            <button className="hover:text-gray-900 transition-colors">
              Help
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-8 sm:py-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-3xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-light text-gray-800 mb-2">
              Upload Your Document
            </h1>
            <p className="text-base text-gray-500">
              Extract data from PDF files with ease
            </p>
          </div>

          <motion.div
            whileHover={{ scale: 1.005 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-md border border-gray-200 p-8"
          >
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center"
              >
                <svg
                  className="w-14 h-14 text-gray-400 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-base text-gray-600 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-400">PDF files only</p>
              </motion.div>
              <input
                id="file-upload"
                type="file"
                accept="application/pdf"
                onChange={handleFile}
                className="hidden"
              />
            </label>

            <AnimatePresence>
              {fileName && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-5 text-sm text-gray-600 text-center bg-gray-50 rounded-md py-2 px-3"
                >
                  Selected: <span className="font-medium">{fileName}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {isUploading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-5 flex justify-center"
              >
                <div className="flex items-center gap-2.5 text-sm text-gray-600">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                  Processing...
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-5 bg-red-50 border border-red-200 rounded-lg p-4"
                >
                  <p className="text-sm text-red-600">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <AnimatePresence>
            {result && !isUploading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="mt-6 bg-white rounded-xl shadow-md border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-light text-gray-800">
                    Extracted Data
                  </h2>
                  <button
                    onClick={() => {
                      setResult(null);
                      setError(null);
                      setFileName("");
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-2 py-1 hover:bg-gray-100 rounded"
                  >
                    Clear
                  </button>
                </div>
                
                {/* Formatted Data Display */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Card Holder Name</p>
                      <p className="text-base font-medium text-gray-800">
                        {result.cardHolderName || "Not Found"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Last 4 Digits</p>
                      <p className="text-base font-medium text-gray-800">
                        {result.last4Digits || "Not Found"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Billing Cycle</p>
                      <p className="text-base font-medium text-gray-800">
                        {result.billingCycle || "Not Found"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Payment Due Date</p>
                      <p className="text-base font-medium text-gray-800">
                        {result.dueDate || "Not Found"}
                      </p>
                    </div>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                    <p className="text-xs text-indigo-600 mb-1">Total Amount Due</p>
                    <p className="text-2xl font-semibold text-indigo-900">
                      {result.totalAmountDue || "Not Found"}
                    </p>
                  </div>
                </div>

                {/* Raw JSON (collapsible for debugging) */}
                <details className="mt-6">
                  <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 mb-2">
                    View Raw JSON
                  </summary>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-auto border border-gray-200">
                    <pre className="text-xs text-gray-700 font-mono leading-relaxed">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                </details>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white border-t border-gray-200 mt-auto"
      >
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div>
              © 2025{" "}
              <a
                href="https://www.linkedin.com/in/shivamdarekar2206/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:font-bold transition-all duration-300 ease-in-out"
              >
                Shivam Darekar
              </a>
              . All rights reserved.
            </div>
            <div className="flex gap-6">
              <button className="hover:text-gray-700 transition-colors">
                Privacy
              </button>
              <button className="hover:text-gray-700 transition-colors">
                Terms
              </button>
              <button className="hover:text-gray-700 transition-colors">
                Contact
              </button>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}