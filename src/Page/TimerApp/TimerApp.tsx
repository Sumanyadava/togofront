import React, { useState, useEffect } from "react";
// @ts-ignore
import { storage, db } from "../../../firebase.js";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Upload, Image as ImageIcon, Loader2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface UploadedImage {
  id: string;
  url: string;
  createdAt: any;
  name: string;
}

const TimerApp = () => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // Fetch images in real-time
  useEffect(() => {
    const q = query(collection(db, "timer_images"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedImages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as UploadedImage[];
      setImages(fetchedImages);
    });

    return () => unsubscribe();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select an image first!");
      return;
    }

    setUploading(true);
    try {
      // 1. Upload to Storage
      const storageRef = ref(storage, `timer_images/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // 2. Save to Firestore
      await addDoc(collection(db, "timer_images"), {
        url: downloadURL,
        name: file.name,
        createdAt: serverTimestamp(),
      });

      setFile(null);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 pt-24 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Image Gallery
            </h1>
            <p className="text-gray-400 mt-2">Upload and manage your project images.</p>
          </div>

          {/* Upload Section */}
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-2 rounded-2xl backdrop-blur-md">
            <label className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors rounded-xl border border-white/10">
              <Plus className="w-5 h-5" />
              <span>{file ? file.name.slice(0, 15) + "..." : "Select Image"}</span>
              <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
            </label>
            
            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-medium transition-all ${
                uploading || !file 
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
              }`}
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </header>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {images.map((img) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm"
              >
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <p className="text-xs text-white/80 truncate w-full">{img.name}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {images.length === 0 && !uploading && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl bg-white/2">
              <ImageIcon className="w-12 h-12 text-gray-600 mb-4" />
              <p className="text-gray-500 text-lg">No images uploaded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimerApp;
