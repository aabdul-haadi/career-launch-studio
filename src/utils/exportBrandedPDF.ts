import jsPDF from 'jspdf';
import { GeneratedOutputs, RoleType, ROLE_DESCRIPTIONS } from '@/types/student';

interface BrandingInfo {
  name: string;
  instagram: string;
}

const BRANDING: BrandingInfo = {
  name: 'Career Launch Pack',
  instagram: 'https://www.instagram.com/ariishaslife?igsh=MXdpczUyaDhrZmNhYQ==',
};

export async function exportBrandedCareerPack(
  outputs: GeneratedOutputs,
  studentName: string
): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const margin = 15;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addNewPageIfNeeded = (requiredSpace: number) => {
    if (y + requiredSpace > pageHeight - margin - 15) {
      pdf.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  const drawHeader = (title: string) => {
    // Header background - teal gradient look
    pdf.setFillColor(20, 184, 166);
    pdf.rect(0, 0, pageWidth, 30, 'F');
    
    // Title
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text(BRANDING.name, margin, 12);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(title, margin, 20);
    
    pdf.setFontSize(8);
    pdf.text(studentName, margin, 26);
    
    y = 40;
    pdf.setTextColor(0, 0, 0);
  };

  const drawSectionHeader = (title: string) => {
    addNewPageIfNeeded(15);
    pdf.setFillColor(240, 253, 250);
    pdf.roundedRect(margin, y, contentWidth, 8, 2, 2, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(20, 184, 166);
    pdf.text(title, margin + 4, y + 5.5);
    pdf.setTextColor(0, 0, 0);
    y += 12;
  };

  const drawText = (text: string, options?: { bold?: boolean; size?: number; indent?: number }) => {
    const { bold = false, size = 10, indent = 0 } = options || {};
    pdf.setFont('helvetica', bold ? 'bold' : 'normal');
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(text, contentWidth - indent);
    for (const line of lines) {
      addNewPageIfNeeded(5);
      pdf.text(line, margin + indent, y);
      y += 5;
    }
  };

  const addFooter = () => {
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      
      // Footer background
      pdf.setFillColor(248, 250, 252);
      pdf.rect(0, pageHeight - 12, pageWidth, 12, 'F');
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      
      // Branding
      pdf.text(BRANDING.name, margin, pageHeight - 5);
      
      // Instagram
      pdf.setTextColor(20, 184, 166);
      pdf.textWithLink('@ariishaslife', pageWidth / 2, pageHeight - 5, {
        url: BRANDING.instagram,
      });
      pdf.setTextColor(100, 116, 139);
      
      // Page number
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 5);
    }
  };

  // === PAGE 1: CV ===
  drawHeader('Curriculum Vitae');
  const cvLines = outputs.cv.split('\n');
  for (const line of cvLines) {
    const trimmed = line.trim();
    if (!trimmed) {
      y += 3;
      continue;
    }
    if (trimmed.includes('===') || trimmed.includes('---')) continue;
    
    const isHeader = trimmed === trimmed.toUpperCase() && trimmed.length < 60;
    if (isHeader) {
      y += 3;
      drawText(trimmed, { bold: true, size: 11 });
    } else {
      drawText(trimmed, { size: 10 });
    }
  }

  // === PAGE 2+: LinkedIn Profile ===
  pdf.addPage();
  y = margin;
  drawHeader('LinkedIn Optimization');
  
  drawSectionHeader('Headline');
  drawText(outputs.linkedin.headline);
  y += 5;
  
  drawSectionHeader('About Section');
  drawText(outputs.linkedin.about);
  y += 5;
  
  if (outputs.linkedin.experienceBullets?.length > 0) {
    drawSectionHeader('Experience Highlights');
    outputs.linkedin.experienceBullets.forEach((bullet) => {
      drawText(`• ${bullet}`, { indent: 4 });
    });
  }
  y += 5;
  
  if (outputs.linkedin.skills?.length > 0) {
    drawSectionHeader('Recommended Skills');
    drawText(outputs.linkedin.skills.join(' | '));
  }
  
  if (outputs.linkedin.networkingMessage) {
    y += 5;
    drawSectionHeader('Networking Message');
    drawText(outputs.linkedin.networkingMessage);
  }

  // === Cover Letters ===
  outputs.coverLetters.forEach(({ role, content }) => {
    pdf.addPage();
    y = margin;
    drawHeader(`Cover Letter - ${ROLE_DESCRIPTIONS[role]}`);
    
    const letterLines = content.split('\n');
    for (const line of letterLines) {
      if (!line.trim()) {
        y += 3;
        continue;
      }
      drawText(line);
    }
  });

  // === Interview Prep ===
  outputs.interviewPrep.forEach(({ role, behavioral, technical, tellMeAboutYourself, questionsToAsk }) => {
    pdf.addPage();
    y = margin;
    drawHeader(`Interview Preparation - ${ROLE_DESCRIPTIONS[role]}`);
    
    drawSectionHeader('"Tell Me About Yourself"');
    drawText('Short Version:', { bold: true });
    drawText(tellMeAboutYourself.short);
    y += 3;
    drawText('Extended Version:', { bold: true });
    drawText(tellMeAboutYourself.long);
    y += 5;
    
    if (behavioral?.length > 0) {
      drawSectionHeader('Behavioral Questions');
      behavioral.slice(0, 4).forEach((qa, idx) => {
        addNewPageIfNeeded(25);
        drawText(`Q${idx + 1}: ${qa.question}`, { bold: true });
        drawText(qa.answer, { indent: 4 });
        y += 3;
      });
    }
    
    if (technical?.length > 0) {
      drawSectionHeader('Technical Questions');
      technical.slice(0, 4).forEach((qa, idx) => {
        addNewPageIfNeeded(25);
        drawText(`Q${idx + 1}: ${qa.question}`, { bold: true });
        drawText(qa.answer, { indent: 4 });
        y += 3;
      });
    }
    
    if (questionsToAsk?.length > 0) {
      drawSectionHeader('Questions to Ask the Interviewer');
      questionsToAsk.forEach((q) => {
        drawText(`• ${q}`, { indent: 4 });
      });
    }
  });

  // Add footer to all pages
  addFooter();

  pdf.save(`Career_Launch_Pack_${studentName.replace(/\s+/g, '_')}.pdf`);
}
