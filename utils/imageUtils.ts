import { Area } from '../types';
import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal';

export const readFile = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result as string), false);
    reader.readAsDataURL(file);
  });
};

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); 
    image.src = url;
  });

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

/**
 * Creates a cropped image from the source image.
 * @param imageSrc The source image URL
 * @param pixelCrop The crop area in pixels (x, y, width, height)
 * @param rotation Rotation in degrees
 * @param flip Optional flip configuration
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  flip = { horizontal: false, vertical: false }
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return '';
  }

  const rotRad = getRadianAngle(rotation);

  // calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  // set canvas size to match the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  // draw rotated image
  ctx.drawImage(image, 0, 0);

  // croppedAreaPixels values are bounding-box relative
  // extract the cropped image using these values
  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  );

  // set canvas width to final desired crop size - this will clear existing context
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // paste generated rotate image with correct offsets for x,y crop values.
  ctx.putImageData(data, 0, 0);

  // Return high quality jpeg
  return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Uses @imgly/background-removal to remove background.
 * Now using default configuration which infers asset paths from the ESM module location.
 */
export async function removeBackground(imageSrc: string): Promise<string> {
  try {
    // 1. Remove background using imgly
    const blob = await imglyRemoveBackground(imageSrc, {
      progress: (key, current, total) => {
        console.log(`Downloading ${key}: ${current} of ${total}`);
      },
      debug: true
    });

    const transparentUrl = URL.createObjectURL(blob);
    const transparentImage = await createImage(transparentUrl);

    // 2. Composite onto White Background
    const canvas = document.createElement('canvas');
    canvas.width = transparentImage.width;
    canvas.height = transparentImage.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error("Could not get canvas context");

    // Fill white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw transparent image on top
    ctx.drawImage(transparentImage, 0, 0);

    // Clean up
    URL.revokeObjectURL(transparentUrl);

    return canvas.toDataURL('image/jpeg', 0.95);
  } catch (error) {
    console.error("Background removal failed:", error);
    throw error;
  }
}

/**
 * Generates a tiled layout for print.
 */
export async function generatePrintLayout(
  imageSrc: string,
  widthMm: number,
  heightMm: number
): Promise<string> {
  const image = await createImage(imageSrc);
  
  const PPI = 300;
  const MM_PER_INCH = 25.4;
  
  // Standard 4x6 inch paper size
  const dim1 = 4 * PPI; // 1200 px
  const dim2 = 6 * PPI; // 1800 px
 
  const gapPx = 0

  const itemWidthPx = (widthMm / MM_PER_INCH) * PPI;
  const itemHeightPx = (heightMm / MM_PER_INCH) * PPI;
  
  const countFit = (dim: number, itemSize: number, gap: number) => {
    return Math.round((dim + gap) / (itemSize + gap));
  };

  // Check fit for Portrait Canvas (4x6)
  const colsP = countFit(dim1, itemWidthPx, gapPx);
  const rowsP = countFit(dim2, itemHeightPx, gapPx);
  const countP = colsP * rowsP;
  
  // Check fit for Landscape Canvas (6x4)
  const colsL = countFit(dim2, itemWidthPx, gapPx);
  const rowsL = countFit(dim1, itemHeightPx, gapPx);
  const countL = colsL * rowsL;
  
  // Choose orientation
  let canvasWidth, canvasHeight, cols, rows;
  if (countL >= countP) {
      canvasWidth = dim2;
      canvasHeight = dim1;
      cols = colsL;
      rows = rowsL;
  } else {
      canvasWidth = dim1;
      canvasHeight = dim2;
      cols = colsP;
      rows = rowsP;
  }

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // White background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  const startX = gapPx;
  const startY = gapPx;
  
  // Draw
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
        const x = startX + c * (itemWidthPx + gapPx);
        const y = startY + r * (itemHeightPx + gapPx);
        
        ctx.drawImage(image, x, y, itemWidthPx, itemHeightPx);
        
        // Crop marks (light gray border)
        ctx.strokeStyle = '#e5e7eb'; // light gray
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, itemWidthPx, itemHeightPx);
    }
  }
  
  return canvas.toDataURL('image/jpeg', 0.95);
}