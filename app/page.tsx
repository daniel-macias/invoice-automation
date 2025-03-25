"use client";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK || "";

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    const mimeType = selectedFile.type;

    if (mimeType.includes("pdf")) {
      setFileType("PDF");
      setError(null);
    } else if (mimeType.includes("image")) {
      setFileType("IMAGE");
      setError(null);
    } else {
      setFileType("OTHER");
      setError("Invalid file type. Please upload a PDF or an image.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  // Handle file upload (to be connected to n8n)
  const handleUpload = async () => {
    if (!file) return;
  
    const formData = new FormData();
    formData.append("file", file);
  
    setIsUploading(true);
  
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();

      if (response.ok) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.error || "Unknown error"}`);
      }

      console.log("Upload response:", data);
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Upload failed", error);
      alert("Error uploading file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <div className="bg-white shadow-lg rounded-2xl p-6 max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold mb-2">Upload Your File</h1>
        <p className="text-gray-600 mb-4">Select a PDF or image invoice to process.</p>

        {/* File Upload Button */}
        <label className="w-full border-2 border-dashed border-gray-400 rounded-lg px-4 py-3 cursor-pointer bg-transparent hover:bg-gray-50 transition inline-block">
          <input type="file" className="hidden" onChange={handleFileChange} />
          <span className="text-gray-500">
            {file ? `Selected: ${file.name}` : "Click to upload or drag & drop"}
          </span>
        </label>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        {/* Send File Button */}
        <button
          className={`mt-4 w-full py-2 rounded-lg text-white font-semibold transition ${
            file && !error
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          onClick={handleUpload}
          disabled={!file || !!error || isUploading}
        >
          {isUploading ? "Uploading..." : "Send File"}
        </button>
      </div>
    </main>
  );
}
