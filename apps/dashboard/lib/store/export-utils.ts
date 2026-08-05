// import { domToCanvas } from "modern-screenshot";

/**
 * Export image with gradient background from an element
 * @param elementId - The ID of the element to export
 */
export async function exportImageWithGradient(
  elementId: string
): Promise<void> {
  const element = document.getElementById(elementId);

  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  try {
    // Use modern-screenshot for better CSS fidelity
    // const canvas = await domToCanvas(element, {
    //   backgroundColor: null, // Transparent background to preserve gradients
    //   scale: 2, // Higher quality
    //   width: element.scrollWidth,
    //   height: element.scrollHeight,
    // });

    // // Convert canvas to blob and download
    // return new Promise((resolve, reject) => {
    //   canvas.toBlob((blob) => {
    //     if (!blob) {
    //       reject(new Error("Failed to create blob from canvas"));
    //       return;
    //     }

    //     // Create download link
    //     const url = URL.createObjectURL(blob);
    //     const link = document.createElement("a");
    //     link.href = url;
    //     link.download = `image-${Date.now()}.png`;
    //     document.body.appendChild(link);
    //     link.click();
    //     document.body.removeChild(link);

    //     // Clean up
    //     URL.revokeObjectURL(url);
    //     resolve();
    //   }, "image/png");
    // });
    return await Promise.reject(
      new Error(
        "domToCanvas is not implemented. Please uncomment the code and ensure modern-screenshot is installed."
      )
    );
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  }
}
