import React, { useState } from 'react';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { GoogleGenAI, Type } from "@google/genai";

export default function UploadPanel({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFileIndex, setCurrentFileIndex] = useState<number | null>(null);
  const [processedCount, setProcessedCount] = useState(0);
  const [lastSessionId, setLastSessionId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      setError(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);
    setProcessedCount(0);
    setLastSessionId(null);
    const sessionId = `session_${Date.now()}`;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    try {
      for (let i = 0; i < files.length; i++) {
        setCurrentFileIndex(i);
        const file = files[i];
        const base64Data = await fileToBase64(file);

        const prompt = `
          Analyze this document. It is a government application form.
          
          TASK 1: FORM TYPE DETECTION
          Detect the type of form based on these rules:
          - If text contains "APAAR ID" or "NIELIT AI" -> classify as "NIELIT AI Course Form"
          - If text contains "CCC / BCC / ECC / IT-O Level" or "NIELIT Registration" -> classify as "NIELIT Course Registration Form"
          - If text contains "IndiaAI" -> classify as "IndiaAI Application Form"
          - Otherwise -> classify as "General Government Form"
          
          TASK 2: FIELD EXTRACTION
          Extract ALL identifiable fields present in the form. 
          Common fields to look for:
          - Course Name, Name, Father Name, Mother Name, Date of Birth, Gender, Qualification, Category, Religion, Aadhaar Number, APAAR ID, Mobile Number, Email, Address, PIN, Employment Status
          
          TASK 3: BOUNDING BOXES
          - Identify the bounding box of the passport photograph.
          - Identify the bounding box of the signature area.
          
          Return bounding boxes as [ymin, xmin, ymax, xmax] in normalized coordinates (0-1000).
          
          If it is NOT a government application form, set isGovernmentForm to false.
          Return the data in a structured JSON format.
        `;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: file.type || "image/jpeg",
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isGovernmentForm: { type: Type.BOOLEAN },
                formType: { type: Type.STRING },
                "Course Name": { type: Type.STRING },
                "Name": { type: Type.STRING },
                "Father Name": { type: Type.STRING },
                "Mother Name": { type: Type.STRING },
                "Date of Birth": { type: Type.STRING },
                "Gender": { type: Type.STRING },
                "Qualification": { type: Type.STRING },
                "Category": { type: Type.STRING },
                "Religion": { type: Type.STRING },
                "Aadhaar Number": { type: Type.STRING },
                "APAAR ID": { type: Type.STRING },
                "Mobile Number": { type: Type.STRING },
                "Email": { type: Type.STRING },
                "Address": { type: Type.STRING },
                "PIN": { type: Type.STRING },
                "Employment Status": { type: Type.STRING },
                photoBoundingBox: {
                  type: Type.ARRAY,
                  items: { type: Type.NUMBER },
                  description: "[ymin, xmin, ymax, xmax] normalized 0-1000",
                },
                signatureBoundingBox: {
                  type: Type.ARRAY,
                  items: { type: Type.NUMBER },
                  description: "[ymin, xmin, ymax, xmax] normalized 0-1000",
                },
              },
              required: ["isGovernmentForm"],
            },
          },
        });

        const extractedData = JSON.parse(response.text);

        if (!extractedData.isGovernmentForm) {
          console.warn(`File "${file.name}" is not recognized as a valid government application form. Skipping...`);
          setProcessedCount(prev => prev + 1);
          continue;
        }

        const formData = new FormData();
        formData.append('document', file);
        formData.append('data', JSON.stringify(extractedData));
        formData.append('sessionId', sessionId);

        await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        setProcessedCount(prev => prev + 1);
      }

      setFiles([]);
      onUploadSuccess();
      setLastSessionId(sessionId);
    } catch (err) {
      setError('Failed to process documents. Please check your connection and try again.');
      console.error(err);
    } finally {
      setUploading(false);
      setCurrentFileIndex(null);
      setProcessedCount(0);
    }
  };

  const currentProgress = uploading 
    ? Math.round((processedCount / files.length) * 100) 
    : 0;

  return (
    <div id="upload" className="gov-panel p-6">
      <h2 className="gov-title">Upload Scanned Documents</h2>

      {uploading && (
        <div className="mb-6 p-4 bg-gray-50 border border-gov-border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gov-blue uppercase">Processing Progress</span>
            <span className="text-xs font-bold text-gov-blue">{currentProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 h-2 overflow-hidden">
            <div 
              className="bg-gov-blue h-full transition-all duration-500"
              style={{ width: `${currentProgress}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-gray-600 mt-2">
            Processing file {currentFileIndex! + 1} of {files.length}
          </p>
        </div>
      )}

      <div 
        className="border border-gov-border p-8 flex flex-col items-center justify-center bg-[#fcfcfc] hover:bg-gray-50 transition-colors cursor-pointer relative"
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <Upload className="w-10 h-10 text-gray-400 mb-3" />
        <p className="text-sm font-bold text-gov-text">Select files to upload or drag and drop</p>
        <p className="text-xs text-gray-500 mt-1">Supported formats: JPG, PNG, PDF (Max 10MB per file)</p>
        <input 
          id="fileInput"
          type="file" 
          multiple 
          className="hidden" 
          onChange={handleFileChange}
          accept="image/*,.pdf"
        />
      </div>

      {files.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-xs font-bold text-gray-700 uppercase border-b border-gov-border pb-1">Selected Files ({files.length})</h3>
          <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
            {files.map((file, index) => (
              <div key={index} className={`flex items-center justify-between p-2 border ${
                currentFileIndex === index ? 'border-gov-blue bg-blue-50' : 'border-gov-border'
              }`}>
                <div className="flex items-center space-x-2">
                  <File className={`w-4 h-4 ${currentFileIndex === index ? 'text-gov-blue animate-pulse' : 'text-gray-400'}`} />
                  <span className="text-xs font-medium text-gov-text truncate max-w-xs">{file.name}</span>
                  <span className="text-[10px] text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                {!uploading && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                    className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-700 bg-red-50 p-2 border border-red-200 text-xs">
              <AlertCircle className="w-3 h-3" />
              <span>{error}</span>
            </div>
          )}

          {lastSessionId && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 flex flex-col items-center">
              <p className="text-xs font-bold text-green-800 mb-2 uppercase">Batch Processing Complete!</p>
              <button 
                onClick={() => window.open(`/api/download-excel?sessionId=${lastSessionId}`, '_blank')}
                className="flex items-center space-x-2 text-xs font-bold text-white bg-green-700 hover:bg-green-800 px-4 py-2 rounded transition-colors"
              >
                <File className="w-3 h-3" />
                <span>Download Session Dataset</span>
              </button>
            </div>
          )}

          <button 
            onClick={handleUpload}
            disabled={uploading}
            className={`w-full gov-button py-3 ${
              uploading ? 'bg-gray-400 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? `Processing... (${currentFileIndex! + 1}/${files.length})` : 'Start Processing'}
          </button>
        </div>
      )}
    </div>
  );
}
