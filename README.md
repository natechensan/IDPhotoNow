# ID Photo Now! 📸

ID Photo Now! is a privacy-first, client-side web application that allows users to create professional-quality passport and ID photos directly in their browser. It combines intuitive cropping tools with AI-powered background removal to generate compliant photos for various countries.

[Try it here](https://natechensan.github.io/IDPhotoNow/)

Disclaimer: not affiliated with www.idphotonow.com (which was launched after this tool anyway)

## ✨ Features

*   **ID Presets:** One-click configuration for standard ID sizes, including:
    *   🇺🇸 U.S. Passport/Visa
    *   🇯🇵 Japanese Passport/Visa
    *   🇨🇳 Chinese Passport/Visa
    *   🇬🇧 UK Passport/Visa
    *   🇪🇺 EU/Schengen Visa
    *   🇮🇳 Indian Passport/Visa
*   **Smart Editing Tools:**
    *   Precise cropping, zooming, and rotation.
    *   "Face Guide" overlay to ensure correct head positioning.
*   **AI Background Removal:** Instantly removes image backgrounds and replaces them with white (standard for ID photos) using WebAssembly.
*   **4×6 Print Layout Generator:** Automatically tiles the cropped photo onto a standard 4x6 inch (10x15cm) canvas. It optimizes for landscape vs. portrait orientation to fit the maximum number of copies and includes crop marks for easy cutting.
*   **Privacy First:** All image processing (cropping, AI background removal, layout generation) happens locally in your browser. **Your photos are never uploaded to a server.**

## 🛠️ Usage

1.  **Upload:** Select a photo from your device or drag and drop an image.
2.  **Select Region:** Choose the ID preset for your target country from the sidebar (e.g., U.S. Passport).
3.  **Adjust:**
    *   Use the **Face Guide** to align the head within the oval.
    *   Use the Zoom and Rotate sliders to perfect the composition.
4.  **Remove Background (Optional):** Click **"Remove Background"** to automatically isolate the subject and apply a white background.
5.  **Download:**
    *   **Download Single Photo:** Saves the single cropped image.
    *   **4×6 Print:** Generates a high-resolution tiled sheet ready for printing on standard photo paper.

## 🧰 Tech Stack

*   **Framework:** React (v18), TypeScript
*   **Styling:** Tailwind CSS
*   **Cropping:** `react-easy-crop`
*   **AI Engine:** `@imgly/background-removal` (runs client-side via WASM)
*   **Icons:** `lucide-react`

## 🚀 How to Run Locally

Because this project uses ES Modules and loads AI models via WebAssembly, **you cannot simply open `index.html` by double-clicking it**. Browser security policies (CORS) require the files to be served over a local HTTP server.

### Method 1: Using Node.js (Recommended)
If you have Node.js installed, you can use `npx` to spin up a server instantly without installing dependencies.

1. Open your terminal/command prompt in the project folder.
2. Run the following command:
   ```bash
   npx serve .
Open the URL shown in the terminal (usually http://localhost:3000) in your browser.

### Method 2: Using Python
Open your terminal and go to the project folder.
Run:
```
python3 -m http.server
```
Open http://localhost:8000 in your browser.

## ⚠️ Printing Note

The **4×6 Print** feature creates a layout at **300 DPI**. When printing:
1.  Use standard 4x6 inch (10x15cm) photo paper.
2.  Ensure your printer settings are set to "100% Scale" or "Do Not Scale" to maintain the correct physical dimensions of the ID photos.

## 📄 License

[MIT](LICENSE)
