import jsPDF from 'jspdf';
import { GeneratedOutputs, RoleType, ROLE_DESCRIPTIONS } from '@/types/student';

interface BrandingInfo {
  name: string;
  instagram: string;
  instagramHandle: string;
}

const BRANDING: BrandingInfo = {
  name: 'Career Launch Pack',
  instagram: 'https://www.instagram.com/ariishaslife?igsh=MXdpczUyaDhrZmNhYQ==',
  instagramHandle: '@ariishaslife',
};

// Professional color palette
const COLORS = {
  navy: [20, 30, 60] as [number, number, number],
  teal: [20, 184, 166] as [number, number, number],
  tealLight: [204, 251, 241] as [number, number, number],
  amber: [245, 158, 11] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  offWhite: [248, 250, 252] as [number, number, number],
  textDark: [30, 41, 59] as [number, number, number],
  textMuted: [100, 116, 139] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
};

export async function exportBrandedCareerPack(
  outputs: GeneratedOutputs,
  studentName: string,
  referenceCode?: string
): Promise<void> {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const margin = 15;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addNewPageIfNeeded = (requiredSpace: number) => {
    if (y + requiredSpace > pageHeight - margin - 18) {
      pdf.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  const drawPageHeader = (title: string, subtitle?: string) => {
    // Navy header bar
    pdf.setFillColor(...COLORS.navy);
    pdf.rect(0, 0, pageWidth, 32, 'F');

    // Teal accent line
    pdf.setFillColor(...COLORS.teal);
    pdf.rect(0, 32, pageWidth, 1.5, 'F');

    // Brand name
    pdf.setTextColor(...COLORS.white);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text(BRANDING.name, margin, 13);

    // Title
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(title, margin, 21);

    // Student name + ref
    pdf.setFontSize(8);
    pdf.setTextColor(200, 210, 230);
    const refText = referenceCode ? `${studentName} • ${referenceCode}` : studentName;
    pdf.text(refText, margin, 28);

    // Amber accent dot
    pdf.setFillColor(...COLORS.amber);
    pdf.circle(pageWidth - margin, 16, 3, 'F');

    y = 42;
    pdf.setTextColor(...COLORS.textDark);
  };

  const drawSectionHeader = (title: string) => {
    addNewPageIfNeeded(14);
    // Teal left accent bar + light background
    pdf.setFillColor(...COLORS.tealLight);
    pdf.roundedRect(margin, y, contentWidth, 9, 1.5, 1.5, 'F');
    pdf.setFillColor(...COLORS.teal);
    pdf.rect(margin, y, 2.5, 9, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10.5);
    pdf.setTextColor(...COLORS.navy);
    pdf.text(title.toUpperCase(), margin + 6, y + 6);
    pdf.setTextColor(...COLORS.textDark);
    y += 13;
  };

  const drawText = (text: string, options?: { bold?: boolean; size?: number; indent?: number; color?: [number, number, number] }) => {
    const { bold = false, size = 10, indent = 0, color = COLORS.textDark } = options || {};
    pdf.setFont('helvetica', bold ? 'bold' : 'normal');
    pdf.setFontSize(size);
    pdf.setTextColor(...color);
    const lines = pdf.splitTextToSize(text, contentWidth - indent);
    for (const line of lines) {
      addNewPageIfNeeded(5);
      pdf.text(line, margin + indent, y);
      y += 4.8;
    }
    pdf.setTextColor(...COLORS.textDark);
  };

  const drawDivider = () => {
    y += 2;
    pdf.setDrawColor(...COLORS.border);
    pdf.setLineWidth(0.3);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 4;
  };

  const addFooter = () => {
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);

      // Footer bg
      pdf.setFillColor(...COLORS.offWhite);
      pdf.rect(0, pageHeight - 14, pageWidth, 14, 'F');
      pdf.setDrawColor(...COLORS.border);
      pdf.setLineWidth(0.3);
      pdf.line(0, pageHeight - 14, pageWidth, pageHeight - 14);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(...COLORS.navy);
      pdf.text(BRANDING.name, margin, pageHeight - 6);

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...COLORS.teal);
      pdf.textWithLink(BRANDING.instagramHandle, pageWidth / 2 - 8, pageHeight - 6, { url: BRANDING.instagram });

      pdf.setTextColor(...COLORS.textMuted);
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 18, pageHeight - 6);
    }
  };

  // === PAGE 1: CV ===
  drawPageHeader('Curriculum Vitae');
  const cvLines = outputs.cv.split('\n');
  for (const line of cvLines) {
    const trimmed = line.trim();
    if (!trimmed) { y += 2.5; continue; }
    if (trimmed.includes('===') || trimmed.includes('---')) { drawDivider(); continue; }

    const isHeader = trimmed === trimmed.toUpperCase() && trimmed.length < 60 && trimmed.length > 2;
    if (isHeader) {
      y += 2;
      drawSectionHeader(trimmed);
    } else if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
      drawText(trimmed, { size: 9.5, indent: 4 });
    } else {
      drawText(trimmed, { size: 9.5 });
    }
  }

  // === LinkedIn Profile ===
  pdf.addPage();
  y = margin;
  drawPageHeader('LinkedIn Optimization');

  drawSectionHeader('Headline');
  drawText(outputs.linkedin.headline);
  y += 4;

  drawSectionHeader('About Section');
  drawText(outputs.linkedin.about);
  y += 4;

  if (outputs.linkedin.experienceBullets?.length > 0) {
    drawSectionHeader('Experience Highlights');
    outputs.linkedin.experienceBullets.forEach(bullet => {
      drawText(`• ${bullet}`, { indent: 4, size: 9.5 });
    });
  }
  y += 4;

  if (outputs.linkedin.skills?.length > 0) {
    drawSectionHeader('Recommended Skills');
    drawText(outputs.linkedin.skills.join('  •  '), { size: 9.5 });
  }

  if (outputs.linkedin.networkingMessage) {
    y += 4;
    drawSectionHeader('Networking Message');
    drawText(outputs.linkedin.networkingMessage);
  }

  // === Cover Letters ===
  outputs.coverLetters.forEach(({ role, content }) => {
    pdf.addPage();
    y = margin;
    drawPageHeader(`Cover Letter — ${ROLE_DESCRIPTIONS[role]}`);

    const letterLines = content.split('\n');
    for (const line of letterLines) {
      if (!line.trim()) { y += 3; continue; }
      drawText(line, { size: 9.5 });
    }
  });

  // === Interview Prep ===
  outputs.interviewPrep.forEach(({ role, behavioral, technical, tellMeAboutYourself, questionsToAsk }) => {
    pdf.addPage();
    y = margin;
    drawPageHeader(`Interview Preparation — ${ROLE_DESCRIPTIONS[role]}`);

    drawSectionHeader('"Tell Me About Yourself"');
    drawText('Short Version:', { bold: true, size: 9.5 });
    drawText(tellMeAboutYourself.short, { size: 9.5 });
    y += 3;
    drawText('Extended Version:', { bold: true, size: 9.5 });
    drawText(tellMeAboutYourself.long, { size: 9.5 });
    y += 4;

    if (behavioral?.length > 0) {
      drawSectionHeader('Behavioral Questions');
      behavioral.slice(0, 4).forEach((qa, idx) => {
        addNewPageIfNeeded(20);
        drawText(`Q${idx + 1}: ${qa.question}`, { bold: true, size: 9.5 });
        drawText(qa.answer, { indent: 4, size: 9, color: COLORS.textMuted });
        y += 3;
      });
    }

    if (technical?.length > 0) {
      drawSectionHeader('Technical Questions');
      technical.slice(0, 4).forEach((qa, idx) => {
        addNewPageIfNeeded(20);
        drawText(`Q${idx + 1}: ${qa.question}`, { bold: true, size: 9.5 });
        drawText(qa.answer, { indent: 4, size: 9, color: COLORS.textMuted });
        y += 3;
      });
    }

    if (questionsToAsk?.length > 0) {
      drawSectionHeader('Questions to Ask the Interviewer');
      questionsToAsk.forEach(q => {
        drawText(`• ${q}`, { indent: 4, size: 9.5 });
      });
    }
  });

  addFooter();

  const filename = referenceCode
    ? `Career_Launch_Pack_${studentName.replace(/\s+/g, '_')}_${referenceCode}.pdf`
    : `Career_Launch_Pack_${studentName.replace(/\s+/g, '_')}.pdf`;
  pdf.save(filename);
}
