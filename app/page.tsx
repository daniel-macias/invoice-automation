"use client";
import { useState } from "react";
import { ClipLoader } from 'react-spinners';

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
  discount: number;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<InvoiceData | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

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

    // Function to simulate saving data to a database
    const handleSaveToDatabase = async () => {
      if (!editedData) return;

      setIsSaving(true);
    
      try {
        const response = await fetch("/api/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedData),
        });
    
        const result = await response.json();
        console.log("Save response:", result);
        setSaveMessage("Saved successfully!");
      } catch (error) {
        console.error("Error saving data:", error);
        setSaveMessage("Failed to save data.");
      }finally {
        setIsSaving(false); 
      }
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
      <h1 className="text-3xl font-semibold mb-2">Invoice Automator</h1>
      <div className="bg-white shadow-lg rounded-2xl p-6 max-w-md w-full text-center">
        <h2 className="text-2xl font-semibold mb-2">Upload Your File</h2>
        <p className="text-gray-600 mb-4">Select a PDF or image invoice to process.</p>
        
        {/* File Upload Button */}
        <label className="w-full border-2 border-dashed border-gray-400 rounded-lg px-4 py-3 cursor-pointer bg-transparent hover:bg-gray-50 transition inline-block">
          <input type="file" className="hidden" onChange={handleFileChange} />
          <span className="text-gray-500">
            {file ? `Selected: ${file.name}` : "Click to upload or drag & drop"}
          </span>
        </label>

        {isUploading && (<ClipLoader className="mt-5" color="#3498db" loading={true} size={50} />)}

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
          <div className="mt-6 border rounded-lg p-4 bg-gray-50">
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
      {/* Save to Database Button */}
      {invoiceData && (
        
        <button
          className="mt-6 p-2 rounded-lg text-white font-semibold bg-green-600 hover:bg-green-700 transition"
          onClick={handleSaveToDatabase}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save to Database"}
          
        </button>
        
      )}
      {isSaving && <ClipLoader className="mt-3" color="#28a745" loading={true} size={40} />}
      {/* Success Message */}
      {saveMessage && <p className="mt-3 text-green-600">{saveMessage}</p>}
    </main>
  );
}
