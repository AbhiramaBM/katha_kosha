/**
 * File Magic Byte Inspection for security
 */

export function validateMagicBytes(buffer, mimeType, filename = '') {
  if (!buffer || buffer.length < 4) {
    return false;
  }

  // PDF: %PDF (hex: 25 50 44 46)
  if (mimeType === 'application/pdf') {
    return buffer[0] === 0x25 &&
           buffer[1] === 0x50 &&
           buffer[2] === 0x44 &&
           buffer[3] === 0x46;
  }

  // DOCX / EPUB: ZIP header PK\x03\x04 (hex: 50 4B 03 04)
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/epub+zip'
  ) {
    return buffer[0] === 0x50 &&
           buffer[1] === 0x4B &&
           buffer[2] === 0x03 &&
           buffer[3] === 0x04;
  }

  // DOC (Legacy Word): OLE CFB header D0 CF 11 E0
  if (mimeType === 'application/msword') {
    return buffer[0] === 0xD0 &&
           buffer[1] === 0xCF &&
           buffer[2] === 0x11 &&
           buffer[3] === 0xE0;
  }

  // TXT (Plain text): Ensure no binary null characters
  if (mimeType === 'text/plain') {
    const sample = buffer.slice(0, Math.min(buffer.length, 512));
    for (let i = 0; i < sample.length; i++) {
      if (sample[i] === 0) return false;
    }
    return true;
  }

  // Extension fallback if mimeType is octet-stream
  const ext = (filename || '').split('.').pop()?.toLowerCase();
  if (ext === 'pdf') {
    return buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
  }
  if (ext === 'docx' || ext === 'epub') {
    return buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04;
  }
  if (ext === 'doc') {
    return buffer[0] === 0xD0 && buffer[1] === 0xCF && buffer[2] === 0x11 && buffer[3] === 0xE0;
  }
  if (ext === 'txt') {
    const sample = buffer.slice(0, Math.min(buffer.length, 512));
    for (let i = 0; i < sample.length; i++) {
      if (sample[i] === 0) return false;
    }
    return true;
  }

  // JPEG: FF D8 FF
  if (mimeType === 'image/jpeg') {
    return buffer[0] === 0xFF &&
           buffer[1] === 0xD8 &&
           buffer[2] === 0xFF;
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (mimeType === 'image/png') {
    return buffer.length >= 8 &&
           buffer[0] === 0x89 &&
           buffer[1] === 0x50 &&
           buffer[2] === 0x4E &&
           buffer[3] === 0x47 &&
           buffer[4] === 0x0D &&
           buffer[5] === 0x0A &&
           buffer[6] === 0x1A &&
           buffer[7] === 0x0A;
  }

  // WebP: RIFF .... WEBP
  if (mimeType === 'image/webp') {
    if (buffer.length < 12) return false;
    const isRiff = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
    const isWebp = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
    return isRiff && isWebp;
  }

  return false;
}

