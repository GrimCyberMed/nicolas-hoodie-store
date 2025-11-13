'use client';

import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = 'Product Image' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // For now, we'll use a placeholder URL
      // In production, upload to Supabase Storage
      // const { data, error } = await supabase.storage
      //   .from('products')
      //   .upload(`${Date.now()}-${file.name}`, file);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, use the file reader result
      const url = URL.createObjectURL(file);
      onChange(url);
      
      alert('Image uploaded successfully! (Demo mode - using local URL)');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    setPreview(url);
    onChange(url);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-foreground">
        {label}
      </label>

      {/* URL Input */}
      <div className="flex gap-2">
        <input
          type="url"
          value={value}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          isLoading={isUploading}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Image Preview */}
      {preview && (
        <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted border border-border">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <button
            type="button"
            onClick={() => {
              setPreview('');
              onChange('');
            }}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            title="Remove image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Upload Instructions */}
      <div className="text-sm text-secondary">
        <p>• Supported formats: JPG, PNG, GIF, WebP</p>
        <p>• Maximum file size: 5MB</p>
        <p>• Recommended size: 800x800px or larger</p>
      </div>
    </div>
  );
}
