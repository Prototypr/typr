
export const checkImage = (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = (error) => {
      console.error('Error loading image:', error);
      reject(error);
    };
    img.src = "https://req.prototypr.io/" + imageUrl;
  });
};