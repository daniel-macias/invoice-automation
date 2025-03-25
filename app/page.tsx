"use client";
import { useState } from "react";

interface InvoiceData {
  invoice_number: string;
  item_name: string;
  item_description: string;
  quantity: number;
  invoice_date: string;
  unit_price: number;
  subtotal_amount: number;
  tax: number;
  total_amount: number;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<InvoiceData | null>(null);

  const handleEditChange = (field: keyof InvoiceData, value: string | number) => {
    setEditedData((prev) => {
      if (!prev) return null;
  
      const updated = { ...prev, [field]: value };
  
      return updated;
    });
  };

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
        setInvoiceData(data.output);
        setEditedData(data.output);
      } else {
        setError("Failed to upload the file");
      }


      console.log("Upload response:", data);
    } catch (error) {
      console.error("Upload failed", error);
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

        {/* Display Invoice Data if available */}
        {invoiceData && (
          <div className="border rounded-lg p-4 bg-gray-50">
            {/* Invoice Number */}
            <div className="mb-4 text-center">
              <p className="text-xl font-bold">Invoice # {invoiceData.invoice_number}</p>
              <p className="text-gray-500">Date: {invoiceData.invoice_date}</p>
            </div>

            {/* Editable Fields */}
            {isEditing ? (
              <div className="grid grid-cols-2 gap-4">
                {Object.keys(invoiceData).map((key) => (
                  
                    <div key={key}>
                      <label className="block text-sm font-semibold text-gray-600">
                        {key.replace(/_/g, " ").toUpperCase()}
                      </label>
                      <input
                        type={typeof invoiceData[key as keyof InvoiceData] === "number" ? "number" : "text"}
                        className="w-full p-2 border rounded-lg mt-1"
                        value={editedData ? editedData[key as keyof InvoiceData] : ""}
                        onChange={(e) =>
                          handleEditChange(key as keyof InvoiceData, e.target.value)
                        }
                      />
                    </div>
                  
                ))}
              </div>
            ) : (
              <>
                {/* Item Details */}
                <div className="border-b pb-4 mb-4">
                  <p className="text-lg font-semibold">{invoiceData.item_name}</p>
                  <p className="text-gray-600">{invoiceData.item_description}</p>
                  <p className="text-gray-700 mt-2">Quantity: <span className="font-semibold">{invoiceData.quantity}</span></p>
                </div>

                {/* Pricing Table */}
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="text-gray-600">Unit Price:</td>
                      <td className="text-right font-medium">${invoiceData.unit_price}</td>
                    </tr>
                    <tr>
                      <td className="text-gray-600">Subtotal:</td>
                      <td className="text-right font-medium">${invoiceData.subtotal_amount}</td>
                    </tr>
                    <tr>
                      <td className="text-gray-600">Tax:</td>
                      <td className="text-right font-medium">${invoiceData.tax}</td>
                    </tr>
                    <tr className="border-t">
                      <td className="text-lg font-bold">Total:</td>
                      <td className="text-right text-lg font-bold text-green-600">${invoiceData.total_amount}</td>
                    </tr>
                  </tbody>
                </table>
              </>
            )}

            {/* Action Buttons */}
            <div className="mt-4 flex justify-between">
              {isEditing ? (
                <>
                  <button
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    onClick={() => {
                      setInvoiceData(editedData);
                      setIsEditing(false);
                    }}
                  >
                    Save
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="w-full py-2 rounded-lg text-white bg-yellow-500 hover:bg-yellow-600"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
