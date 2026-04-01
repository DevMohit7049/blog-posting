import { useState } from "react";
import { Upload, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { ImageData } from "@/types/blog";
import { validateImageFile } from "@/lib/blog-validation";

interface ImageUploadFieldProps {
  label: string;
  value: ImageData;
  onChange: (data: ImageData) => void;
  suggestedAltText?: string;
  required?: boolean;
  helpText?: string;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  suggestedAltText,
  required = false,
  helpText,
}: ImageUploadFieldProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setUploadError(null);

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || "Invalid file");
      return;
    }

    onChange({
      ...value,
      file,
    });

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onChange({ ...value, file: null });
    setPreview(null);
    setUploadError(null);
  };

  const handleAltTextChange = (alt: string) => {
    onChange({
      ...value,
      alt,
    });
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {helpText && <p className="text-sm text-gray-600">{helpText}</p>}

      {/* Upload Area */}
      {!value.file ? (
        <>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-50"
            }`}
          >
            <Upload className="w-8 h-8 mx-auto mb-3 text-gray-400" />
            <p className="font-medium text-gray-900 mb-1">
              Drag and drop your image here
            </p>
            <p className="text-sm text-gray-600 mb-4">or</p>
            <label>
              <Button variant="outline" asChild>
                <span>Browse Files</span>
              </Button>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleInputChange}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-4">
              JPG, PNG, or WebP • Max 5MB • Landscape format recommended
            </p>
          </div>

          {uploadError && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 p-3 rounded">
              <AlertCircle className="w-4 h-4" />
              {uploadError}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative rounded-lg overflow-hidden bg-gray-100">
            <img
              src={preview || ""}
              alt="Preview"
              className="w-full h-48 object-cover"
            />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded">
            <CheckCircle2 className="w-4 h-4" />
            {value.file.name}
          </div>
        </div>
      )}

      {/* Alt Text */}
      <div>
        <Label htmlFor={`alt-${label}`} className="text-sm font-medium mb-2 block">
          Alt Text {required && <span className="text-red-500">*</span>}
        </Label>
        <p className="text-xs text-gray-600 mb-2">
          Describe what's in the image. This helps with SEO and accessibility.
        </p>
        <Input
          id={`alt-${label}`}
          type="text"
          placeholder={suggestedAltText || "Describe the image..."}
          value={value.alt}
          onChange={(e) => handleAltTextChange(e.target.value)}
          className="text-sm"
        />
        {suggestedAltText && !value.alt && (
          <p className="text-xs text-gray-500 mt-2">
            💡 Suggested: "{suggestedAltText}"
          </p>
        )}
      </div>
    </div>
  );
}
