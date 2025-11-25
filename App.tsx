import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { Upload, Download, RefreshCw, User, Image as ImageIcon, Camera, CheckCircle, RotateCw, Wand2, Loader2, Trash2, Grid } from 'lucide-react';
import { ID_PRESETS } from './constants';
import { IDPreset } from './types';
import { getCroppedImg, readFile, removeBackground, generatePrintLayout } from './utils/imageUtils';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<IDPreset>(ID_PRESETS[0]);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState<string>("");
  const [showFaceGuide, setShowFaceGuide] = useState(true);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
      setZoom(1);
      setRotation(0);
    }
  };

  const handleRemovePhoto = () => {
    setImageSrc(null);
    setZoom(1);
    setRotation(0);
    setCrop({ x: 0, y: 0 });
    setProcessingMessage("");
  };

  const handleDownload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsProcessing(true);
    setProcessingMessage("Generating...");
    try {
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      );
      
      const link = document.createElement('a');
      link.href = croppedImage;
      link.download = `id-photo-${selectedPreset.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
      setProcessingMessage("");
    }
  };

  const handleDownloadPrint = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsProcessing(true);
    setProcessingMessage("Creating Print Layout...");
    try {
      // 1. Get the single cropped ID photo first
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      );

      // 2. Generate the print sheet
      const printLayout = await generatePrintLayout(
        croppedImage,
        selectedPreset.widthMm,
        selectedPreset.heightMm
      );
      
      const link = document.createElement('a');
      link.href = printLayout;
      link.download = `id-photo-print-${selectedPreset.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert("Failed to generate print layout");
    } finally {
      setIsProcessing(false);
      setProcessingMessage("");
    }
  };

  const handleRemoveBackground = async () => {
    if (!imageSrc) return;
    setIsProcessing(true);
    setProcessingMessage("Applying AI Magic...");
    
    try {
      // Small delay to let UI show processing state
      await new Promise(resolve => setTimeout(resolve, 100));
      const processedImage = await removeBackground(imageSrc);
      setImageSrc(processedImage);
    } catch (e) {
      console.error("Failed to remove background", e);
      alert("Could not process background. Please try again or use a different photo.");
    } finally {
      setIsProcessing(false);
      setProcessingMessage("");
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 text-gray-900 overflow-hidden">
      {/* Sidebar - Presets */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col h-full z-10 shadow-sm hidden md:flex">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">ID Photo Now!</h1>
          </div>
          <p className="text-sm text-gray-500">Professional ID photos in seconds.</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Select Format</h2>
          {ID_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setSelectedPreset(preset)}
              className={cn(
                "w-full text-left p-3 rounded-xl transition-all duration-200 border-2",
                selectedPreset.id === preset.id
                  ? "bg-blue-50 border-blue-500 shadow-sm"
                  : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-200"
              )}
            >
              <div className="flex justify-between items-start">
                <span className="font-semibold text-sm block">{preset.name}</span>
                {selectedPreset.id === preset.id && <CheckCircle className="w-4 h-4 text-blue-500" />}
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500">{preset.widthMm} x {preset.heightMm} mm</span>
                <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                  {preset.region}
                </span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative">
        {/* Toolbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
             {/* Mobile/Tablet: Show simplified title if sidebar hidden */}
             <div className="md:hidden flex items-center gap-2 mr-2">
               <Camera className="w-6 h-6 text-blue-600" />
               <span className="font-bold hidden sm:inline">ID Photo Now</span>
             </div>

             <label className="flex items-center gap-2 cursor-pointer bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload Photo</span>
                <span className="sm:hidden">Upload</span>
                <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
              </label>
              
              {imageSrc && (
                <>
                 <button 
                  onClick={() => setShowFaceGuide(!showFaceGuide)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border whitespace-nowrap",
                    showFaceGuide ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-200 text-gray-700"
                  )}
                 >
                   <User className="w-4 h-4" />
                   <span className="hidden sm:inline">Face Guide</span>
                 </button>

                 <button
                    onClick={handleRemovePhoto}
                    className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-red-200 whitespace-nowrap"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                </>
              )}
          </div>

          {imageSrc && (
            <div className="flex items-center gap-3">
              <button 
                onClick={handleRemoveBackground}
                disabled={isProcessing}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap"
                title="Use AI to remove background (White)"
              >
                {isProcessing && processingMessage.includes("AI") ? (
                   <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
                   <Wand2 className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Remove Background</span>
                <span className="sm:hidden">Fix BG</span>
              </button>
              
              <div className="h-6 w-px bg-gray-300 mx-1 hidden sm:block" />

              <button
                onClick={handleDownloadPrint}
                disabled={isProcessing}
                className="group relative flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 whitespace-nowrap"
              >
                 <Grid className="w-4 h-4" />
                 <span className="hidden sm:inline">4x6 Print</span>
                 {/* Tooltip */}
                 <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-128 p-3 bg-gray-900 text-white text-xs font-normal leading-relaxed rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50 pointer-events-none text-left">
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45"></div>
                    <p className="mb-1 text-white">The 4x6 print format is optimized for 51x51mm photos.</p>
                    <p className="text-gray-400">Other sizes might require cropping after printing.</p>
                 </div>
              </button>

              <button
                onClick={handleDownload}
                disabled={isProcessing}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 whitespace-nowrap"
              >
                {isProcessing && !processingMessage.includes("AI") && !processingMessage.includes("Print") ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span className="hidden sm:inline">Download Single Photo</span>
                <span className="sm:hidden">Save</span>
              </button>
            </div>
          )}
        </header>

        {/* Workspace */}
        <div className="flex-1 relative bg-[#e5e7eb] overflow-hidden flex items-center justify-center p-4 sm:p-8">
          {/* Loading Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-3 text-center max-w-xs mx-4">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <div>
                      <p className="font-semibold text-gray-900">Processing...</p>
                      <p className="text-sm text-gray-500">{processingMessage}</p>
                    </div>
                </div>
            </div>
          )}

          {!imageSrc ? (
            <div className="text-center max-w-md w-full">
              <div className="border-4 border-dashed border-gray-300 rounded-3xl p-8 sm:p-12 bg-gray-50 flex flex-col items-center mx-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <ImageIcon className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Upload your photo</h3>
                <p className="text-gray-500 mb-8 text-sm">
                  Drag and drop or click to upload. We recommend using a photo with good lighting and simple background.
                </p>
                <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  Select Photo
                  <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                </label>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
               <div className="relative w-full h-full rounded-lg overflow-hidden shadow-2xl bg-black">
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={selectedPreset.aspectRatio}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                    onRotationChange={setRotation}
                    showGrid={true}
                    objectFit="contain"
                    cropShape="rect"
                    style={{
                      containerStyle: { background: '#1f2937' },
                      cropAreaStyle: { border: '2px solid rgba(255, 255, 255, 0.5)', boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)' },
                    }}
                  />
                  
                  {/* Face Guide Overlay */}
                  {showFaceGuide && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-40 opacity-60">
                        <svg viewBox="0 0 200 200" className="h-[75%] w-auto max-w-[80%] text-white drop-shadow-md">
                          <ellipse cx="100" cy="90" rx="40" ry="60" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4"/>
                          <path d="M 40 200 Q 100 160 160 200" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4"/>
                          <line x1="100" y1="0" x2="100" y2="200" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.5"/>
                          <line x1="0" y1="85" x2="200" y2="85" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.5"/>
                        </svg>
                    </div>
                  )}
               </div>
               
               {/* Controls */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-white/20 px-4 sm:px-8 py-4 rounded-2xl shadow-xl flex items-center gap-4 sm:gap-8 w-[90%] sm:w-auto max-w-2xl overflow-x-auto scrollbar-hide z-50">
                  <div className="flex flex-col gap-1 min-w-[120px]">
                    <label className="text-xs font-semibold text-gray-600 flex justify-between">
                      Zoom
                      <span>{Math.round(zoom * 100)}%</span>
                    </label>
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      aria-labelledby="Zoom"
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  <div className="w-px h-8 bg-gray-300 hidden sm:block"></div>

                  <div className="flex flex-col gap-1 min-w-[120px]">
                    <label className="text-xs font-semibold text-gray-600 flex justify-between">
                      Rotation
                      <span>{rotation}°</span>
                    </label>
                    <input
                      type="range"
                      value={rotation}
                      min={-180}
                      max={180}
                      step={1}
                      aria-labelledby="Rotation"
                      onChange={(e) => setRotation(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                  
                  <button 
                    onClick={() => { setRotation(0); setZoom(1); setCrop({ x: 0, y: 0 }); }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-2 shrink-0"
                    title="Reset"
                  >
                    <RotateCw className="w-5 h-5 text-gray-600" />
                  </button>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}