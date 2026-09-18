import { NANUMGOTHIC_BASE64 } from './nanumgothic-base64';

let fontAdded = false;

export function setupKoreanFont(doc: any) {
  if (!fontAdded) {
    try {
      // Add the Korean font file to VFS
      doc.addFileToVFS('NanumGothic.ttf', NANUMGOTHIC_BASE64);
      
      // Register the font with jsPDF
      doc.addFont('NanumGothic.ttf', 'NanumGothic', 'normal');
      
      fontAdded = true;
    } catch (error) {
      console.error('Failed to add Korean font:', error);
    }
  }
  
  // Set as default font
  try {
    doc.setFont('NanumGothic', 'normal');
  } catch (error) {
    console.error('Failed to set Korean font:', error);
    doc.setFont('helvetica', 'normal');
  }
}
