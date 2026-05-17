import { useState } from 'react';
import { uploadApi } from '../../api/upload.api';
import { toast, toastError } from '../../utils/toast';

interface Props {
  initialUrl?: string | null;
  onUploaded: (photoId: number, url: string) => void;
  onCleared?: () => void;
}

export const PhotoUploader = ({ initialUrl, onUploaded, onCleared }: Props) => {
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadApi.uploadPhoto(file);
      if (!res.data) throw new Error(res.message);
      setPreview(res.data.url);
      setUploaded(true);
      onUploaded(res.data.photoId, res.data.url);
      toast.success('Photo uploaded.');
    } catch (err) {
      toastError(err);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setPreview(null);
    setUploaded(false);
    onCleared?.();
  };

  return (
    <div className="photo-uploader">
      {preview && (
        <div className="photo-uploader-preview">
          <img src={preview} alt="preview" />
          {uploaded && <span className="photo-uploader-badge">✓ Uploaded</span>}
        </div>
      )}
      <div className="photo-uploader-actions">
        <input type="file" accept="image/*" onChange={handleChange} disabled={uploading} />
        {uploaded && (
          <button type="button" onClick={handleReset} className="btn-ghost">Reset</button>
        )}
      </div>
    </div>
  );
};
