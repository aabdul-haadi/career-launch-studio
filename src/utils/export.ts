import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export async function exportToPDF(content: string, filename: string): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const margin = 20;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const maxWidth = pageWidth - margin * 2;
  const lineHeight = 6;
  let y = margin;

  // Set font
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);

  // Split content into lines
  const lines = content.split('\n');

  for (const line of lines) {
    // Check for headers (lines that are all caps or have specific patterns)
    const isHeader = line === line.toUpperCase() && line.trim().length > 0 && !line.startsWith('•');
    const isSectionHeader = line.includes('===') || line.includes('---');

    if (isSectionHeader) {
      y += 3;
      continue;
    }

    if (isHeader && line.trim()) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
    } else {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
    }

    // Word wrap
    const splitLines = pdf.splitTextToSize(line || ' ', maxWidth);

    for (const splitLine of splitLines) {
      // Check if we need a new page
      if (y + lineHeight > pageHeight - margin) {
        pdf.addPage();
        y = margin;
      }

      pdf.text(splitLine, margin, y);
      y += lineHeight;
    }
  }

  pdf.save(`${filename}.pdf`);
}

export async function exportToDOCX(content: string, filename: string): Promise<void> {
  const lines = content.split('\n');
  const paragraphs: Paragraph[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip separator lines
    if (trimmedLine.includes('===') || trimmedLine.includes('---')) {
      continue;
    }

    // Detect headers (all caps, not too long)
    const isHeader = 
      trimmedLine === trimmedLine.toUpperCase() && 
      trimmedLine.length > 0 && 
      trimmedLine.length < 60 &&
      !trimmedLine.startsWith('•');

    if (isHeader && trimmedLine) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmedLine,
              bold: true,
              size: 26, // 13pt
            }),
          ],
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (trimmedLine.startsWith('•') || trimmedLine.match(/^\d+\./)) {
      // Bullet points
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmedLine,
              size: 22, // 11pt
            }),
          ],
          spacing: { before: 60, after: 60 },
        })
      );
    } else {
      // Regular paragraph
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              size: 22, // 11pt
            }),
          ],
          spacing: { before: 60, after: 60 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720, // 0.5 inch
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
