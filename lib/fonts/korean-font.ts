import { NANUMGOTHIC_BASE64 } from './nanumgothic-base64';

export function setupKoreanFont(doc: any) {
  // Each call gets a fresh jsPDF instance, so the font must be embedded into
  // THIS doc every time — a module-level "already added" flag (the previous
  // approach) silently skips re-embedding on the 2nd+ PDF generated in a
  // session, and setFont() then fails quietly and falls back to Helvetica,
  // which has no Korean glyphs and produces garbled text.
  try {
    doc.addFileToVFS('NanumGothic.ttf', NANUMGOTHIC_BASE64);
    doc.addFont('NanumGothic.ttf', 'NanumGothic', 'normal');
  } catch (error) {
    console.error('Failed to add Korean font:', error);
  }

  try {
    doc.setFont('NanumGothic', 'normal');
  } catch (error) {
    console.error('Failed to set Korean font:', error);
    doc.setFont('helvetica', 'normal');
  }
}
