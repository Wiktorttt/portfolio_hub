'use client';

import { useState, useRef, useCallback } from 'react';
import { X, Upload, FileText, Image, FileSpreadsheet } from 'lucide-react';
import { FileAttachment } from '@/lib/webhook_config';
import { FILE_UPLOAD_DEFAULTS } from '@/lib/config';

interface FileUploadProps {
  onFilesChange: (files: FileAttachment[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  maxTotalSize?: number; // in bytes
  acceptedTypes?: string[];
}

const DEFAULT_ACCEPTED_TYPES = [
  'text/css', // .css
  'text/csv', // .csv
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'text/html', // .html
  'application/javascript', // .js
  'application/json', // .json
  'text/markdown', // .md
  'application/pdf', // .pdf
  'text/plain', // .txt, .php, .py, .ts
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'text/xml', // .xml
  'image/webp', // .webp
  'image/png', // .png
  'image/jpeg' // .jpeg, .jpg
];

const FILE_TYPE_ICONS: Record<string, React.ReactNode> = {
  'text/css': <FileText className="w-5 h-5" />,
  'text/csv': <FileSpreadsheet className="w-5 h-5" />,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': <FileText className="w-5 h-5" />,
  'text/html': <FileText className="w-5 h-5" />,
  'application/javascript': <FileText className="w-5 h-5" />,
  'application/json': <FileText className="w-5 h-5" />,
  'text/markdown': <FileText className="w-5 h-5" />,
  'application/pdf': <FileText className="w-5 h-5" />,
  'text/plain': <FileText className="w-5 h-5" />,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': <FileSpreadsheet className="w-5 h-5" />,
  'text/xml': <FileText className="w-5 h-5" />,
  'image/webp': <Image className="w-5 h-5" />,
  'image/png': <Image className="w-5 h-5" />,
  'image/jpeg': <Image className="w-5 h-5" />
};

export default function FileUpload({
  onFilesChange,
  maxFiles = FILE_UPLOAD_DEFAULTS.maxFiles,
  maxFileSize = FILE_UPLOAD_DEFAULTS.maxFileSizeBytes,
  maxTotalSize = FILE_UPLOAD_DEFAULTS.maxTotalSizeBytes,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES
}: FileUploadProps) {
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file type and extension
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const supportedExtensions = ['.css', '.csv', '.docx', '.html', '.js', '.json', '.md', '.pdf', '.txt', '.php', '.py', '.ts', '.xlsx', '.xml', '.webp', '.png', '.jpeg', '.jpg'];
    
    if (!acceptedTypes.includes(file.type) && !supportedExtensions.includes(fileExtension)) {
      return `File type "${file.type}" is not supported. Please upload: Images, Text Files, Spreadsheets, or Code Files.`;
    }

    // Check file size
    if (file.size > maxFileSize) {
      return `File "${file.name}" is too large. Maximum size is ${(maxFileSize / 1024 / 1024).toFixed(1)}MB.`;
    }

    // Check if we already have this file
    if (files.some(f => f.filename === file.name)) {
      return `File "${file.name}" is already uploaded.`;
    }

    // Check total files limit
    if (files.length >= maxFiles) {
      return `Maximum ${maxFiles} files allowed.`;
    }

    // Check total size
    const newTotalSize = files.reduce((sum, f) => sum + f.size, 0) + file.size;
    if (newTotalSize > maxTotalSize) {
      return `Total file size would exceed ${(maxTotalSize / 1024 / 1024).toFixed(1)}MB.`;
    }

    return null;
  }, [files, maxFiles, maxFileSize, maxTotalSize, acceptedTypes]);

  const convertFileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }, []);

  const addFile = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    try {
      const base64Data = await convertFileToBase64(file);
      const newFile: FileAttachment = {
        filename: file.name,
        type: file.type,
        size: file.size,
        data: base64Data
      };

      const updatedFiles = [...files, newFile];
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
    } catch {
      setError(`Failed to process file "${file.name}". Please try again.`);
    }
  }, [files, validateFile, convertFileToBase64, onFilesChange]);

  const removeFile = useCallback((index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
    setError(null);
  }, [files, onFilesChange]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    selectedFiles.forEach(addFile);
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [addFile]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(event.dataTransfer.files);
    droppedFiles.forEach(addFile);
  }, [addFile]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    return FILE_TYPE_ICONS[type] || <FileText className="w-5 h-5" />;
  };

  return (
    <div className="space-y-4">
      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
            : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-8 h-8 mx-auto mb-3 text-slate-400" />
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
          Przeciągnij i upuść pliki tutaj, lub{' '}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 underline"
          >
            wyszukaj na komputerze
          </button>
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-500">
        Obsługiwane: Obrazy, Pliki Tekstowe, Arkusze Kalkulacyjne, Pliki Kodu. (max {formatFileSize(maxFileSize)} każdy plik. Max {maxFiles} pliki)
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".css,.csv,.docx,.html,.js,.json,.md,.pdf,.txt,.php,.py,.ts,.xlsx,.xml,.webp,.png,.jpeg,.jpg,text/css,text/csv,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/html,application/javascript,application/json,text/markdown,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/xml,image/webp,image/png,image/jpeg"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Attached Files ({files.length}/{maxFiles})
          </h4>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-lg p-3"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-slate-500 dark:text-slate-400">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {file.filename}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  aria-label={`Remove ${file.filename}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          {/* Total Size Indicator */}
          <div className="text-xs text-slate-500 dark:text-slate-400 text-right">
            Total: {formatFileSize(files.reduce((sum, f) => sum + f.size, 0))} / {formatFileSize(maxTotalSize)}
          </div>
        </div>
      )}
    </div>
  );
} 