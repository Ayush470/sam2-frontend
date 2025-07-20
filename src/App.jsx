import React, { useRef, useState } from "react";
import { ClipLoader } from "react-spinners";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function App() {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageId, setImageId] = useState("");
  const [masks, setMasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [maskOverlay, setMaskOverlay] = useState(null);
  const [showMask, setShowMask] = useState(true);
  const [lastUploadedImage, setLastUploadedImage] = useState(null);
  const imgRef = useRef();

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImageUrl(URL.createObjectURL(file));
      setImageId("");
      setMasks([]);
      setMaskOverlay(null);
      setLastUploadedImage(null); // Reset last uploaded image when a new file is chosen
    }
  };

  // Upload image to backend
  const uploadImage = async () => {
    if (!image) return;
    // Prevent uploading the same image again
    if (
      lastUploadedImage &&
      image.name === lastUploadedImage.name &&
      image.size === lastUploadedImage.size &&
      image.lastModified === lastUploadedImage.lastModified
    ) {
      alert("This image has already been uploaded. Please select a new image to upload again.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", image);
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setImageId(data.image_id);
      setLastUploadedImage(image); // Track the last uploaded image
      alert("Image uploaded successfully! Now you can generate masks.");
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Generate masks
  const generateMasks = async () => {
    if (!imageId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/generate-masks?image_id=${imageId}`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setMasks(data.mask_files || []);
      if (data.already_generated) {
        alert("Masks have already been generated for this image.");
      }
    } catch (error) {
      console.error("Error generating masks:", error);
      alert("Failed to generate masks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle click on image to fetch mask for that point
  const handleImageClick = async (e) => {
    if (!imageId) return;
    const rect = imgRef.current.getBoundingClientRect();
    // Coordinates relative to displayed image
    const displayedX = e.clientX - rect.left;
    const displayedY = e.clientY - rect.top;
    // Get displayed and natural image sizes
    const displayedWidth = imgRef.current.width;
    const displayedHeight = imgRef.current.height;
    const naturalWidth = imgRef.current.naturalWidth;
    const naturalHeight = imgRef.current.naturalHeight;
    // Scale coordinates to natural/original image size
    const scaleX = naturalWidth / displayedWidth;
    const scaleY = naturalHeight / displayedHeight;
    const x = Math.round(displayedX * scaleX);
    const y = Math.round(displayedY * scaleY);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/mask?x=${x}&y=${y}&image_id=${imageId}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const blob = await res.blob();
      setMaskOverlay(URL.createObjectURL(blob));
    } catch (error) {
      console.error("Error fetching mask:", error);
      alert("Failed to fetch mask. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1 className="app-title">SAM2 Mask Generator</h1>
      <div className="upload-section">
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </div>
      {image && (
        <div className="image-area" style={{ margin: "1rem 0" }}>
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Preview"
            style={{ maxWidth: "100%", cursor: "crosshair", position: "relative" }}
            onClick={handleImageClick}
          />
          {maskOverlay && showMask && (
            <img
              src={maskOverlay}
              alt="Mask Overlay"
              // className="mask-overlay"
              style={{
                position: "absolute", // now handled by class
                top: imgRef.current?.offsetTop,
                left: imgRef.current?.offsetLeft,
                width: imgRef.current?.width,
                height: imgRef.current?.height,
                pointerEvents: "none",
                opacity: 0.5,
                zIndex: 2,
              }}
            />
          )}
        </div>
      )}
      <div className="button-group">
        <button onClick={uploadImage} disabled={!image || loading} style={{ marginRight: 8 }}>
          Upload Image
        </button>
        <button onClick={generateMasks} disabled={!imageId || loading} style={{ marginRight: 8 }}>
          Generate Masks
        </button>
        <button onClick={() => setShowMask((v) => !v)} disabled={!maskOverlay}>
          {showMask ? "Hide Mask" : "Show Mask"}
        </button>
      </div>
      {loading && (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
          margin: "1rem 0"
        }}>
          <ClipLoader color="#36d7b7" size={50} />
        </div>
      )}
      {masks.length > 0 && <div className="status-message info">{masks.length} masks generated.</div>}
      {imageId && <div className="status-message success">✅ Image uploaded (ID: {imageId})</div>}
      {masks.length > 0 && <div className="status-message info">🎭 {masks.length} masks available. Click on the image to see masks!</div>}
    </div>
  );
}

export default App;
