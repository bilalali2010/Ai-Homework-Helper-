"use client";

interface Props {
  setFile: (file: File | null) => void;
}

export default function UploadBox({ setFile }: Props) {
  return (
    <div className="mt-8">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
    </div>
  );
}
