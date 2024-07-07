// screenshotService.js
import html2canvas from 'html2canvas';

const takeScreenshot = async (element) => {
  const canvas = await html2canvas(element);
  return canvas.toDataURL('image/png').split(',')[1];
};

export { takeScreenshot };
