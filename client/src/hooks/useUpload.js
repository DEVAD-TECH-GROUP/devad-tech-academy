import { useState } from "react";
import api from "../api/Api";

export default function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (file, endpoint) => {
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          setProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      return res.data.data;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return { upload, uploading, progress };
}
