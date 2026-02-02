"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  onFilesUploaded: (urls: string[]) => void;
  orderId: string;
  maxFiles?: number;
  minFiles?: number;
}

interface FileWithPreview extends File {
  preview: string;
}

export function UploadDropzone({
  onFilesSelected,
  onFilesUploaded,
  orderId,
  maxFiles = 20,
  minFiles = 10,
}: UploadDropzoneProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      const allFiles = [...files, ...newFiles].slice(0, maxFiles);
      setFiles(allFiles);
      onFilesSelected(allFiles);
    },
    [files, maxFiles, onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploading,
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const uploadFiles = async () => {
    if (files.length < minFiles) {
      setError(`Please upload at least ${minFiles} photos for best results.`);
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("orderId", orderId);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const data = await response.json();
        uploadedUrls.push(data.url);

        setUploadProgress(((i + 1) / files.length) * 100);
      }

      onFilesUploaded(uploadedUrls);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
          ${uploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-1">
          {isDragActive ? "Drop your photos here" : "Drag & drop your photos"}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          or click to select files (JPG, PNG, WebP up to 10MB each)
        </p>
        <p className="text-xs text-gray-400">
          Upload {minFiles}-{maxFiles} photos for best results
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              {files.length} photo{files.length !== 1 ? "s" : ""} selected
              {files.length < minFiles && (
                <span className="text-amber-600 ml-2">
                  (need {minFiles - files.length} more)
                </span>
              )}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFiles([]);
                onFilesSelected([]);
              }}
            >
              Clear all
            </Button>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {files.map((file, index) => (
              <div key={index} className="relative group aspect-square">
                <img
                  src={file.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-gray-500 text-center">
                Uploading... {Math.round(uploadProgress)}%
              </p>
            </div>
          )}

          <Button
            onClick={uploadFiles}
            disabled={uploading || files.length < minFiles}
            size="lg"
            className="w-full"
          >
            {uploading ? (
              "Uploading..."
            ) : (
              <>
                <ImageIcon className="h-5 w-5 mr-2" />
                Start Processing ({files.length} photos)
              </>
            )}
          </Button>
        </div>
      )}

      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Photo Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-green-700 mb-2">Good photos:</p>
            <ul className="space-y-1 text-gray-600">
              <li>• Clear, well-lit face shots</li>
              <li>• Different angles (front, side, 3/4)</li>
              <li>• Various expressions</li>
              <li>• Recent photos (within 6 months)</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-red-700 mb-2">Avoid:</p>
            <ul className="space-y-1 text-gray-600">
              <li>• Blurry or low-quality images</li>
              <li>• Group photos</li>
              <li>• Sunglasses or hats covering face</li>
              <li>• Heavy filters or edits</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
