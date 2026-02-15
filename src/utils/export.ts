import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export async function exportToPDF(content: string, filename: string): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Professional color palette
  const COLORS = {
    navy: [20, 30, 60] as [number, number, number],
    teal: [20, 184, 166] as [number, number, number],
    tealLight: [204, 251, 241] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    textDark: [30, 41, 59] as [number, number, number],
    textMuted: [100, 116, 139] as [number, number, number],
    border: [226, 232, 240] as [number, number, number],
  };

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

  // Parse CV content to extract header info
  const lines = content.split('\n');
  let name = '';
  let contactInfo: string[] = [];
  let isHeaderSection = true;
  const sections: { title: string; content: string[] }[] = [];
  let currentSection: { title: string; content: string[] } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (isHeaderSection) {
      // First non-empty line is typically the name
      if (!name) {
        name = trimmed;
      } else if (trimmed.includes('@') || trimmed.includes('|') || /\d/.test(trimmed)) {
        // Contact info line
        contactInfo.push(trimmed);
      } else if (trimmed === trimmed.toUpperCase() && trimmed.length > 2 && !trimmed.startsWith('•')) {
        // Start of first section
        isHeaderSection = false;
        currentSection = { title: trimmed, content: [] };
      }
    } else {
      // Check if this is a new section header
      if (trimmed === trimmed.toUpperCase() && trimmed.length > 2 && !trimmed.startsWith('•') && !trimmed.match(/^\d/)) {
        if (currentSection && currentSection.content.length > 0) {
          sections.push(currentSection);
        }
        currentSection = { title: trimmed, content: [] };
      } else if (currentSection) {
        currentSection.content.push(trimmed);
      }
    }
  }
  if (currentSection && currentSection.content.length > 0) {
    sections.push(currentSection);
  }

  // === DRAW HEADER ===
  // Navy header bar
  pdf.setFillColor(...COLORS.navy);
  pdf.rect(0, 0, pageWidth, 35, 'F');

  // Name - prominently displayed
  pdf.setTextColor(...COLORS.white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.text(name || 'Professional CV', margin, 16);

  // Contact info
  if (contactInfo.length > 0) {
    const contactText = contactInfo.join('  |  ').replace(/\|/g, '•');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(220, 220, 220);
    pdf.text(contactText, margin, 25);
  }

  // Subtitle
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(200, 210, 230);
  pdf.text('Curriculum Vitae', margin, 32);

  y = 45;
  pdf.setTextColor(...COLORS.textDark);

  // === DRAW SECTIONS ===
  const drawSectionHeader = (title: string) => {
    addNewPageIfNeeded(14);
    
    // Centered section header without left border or background
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(...COLORS.navy);
    
    // Calculate text width for centering
    const textWidth = pdf.getStringUnitWidth(title.toUpperCase()) * 12 / pdf.internal.scaleFactor;
    const centerX = (pageWidth - textWidth) / 2;
    
    pdf.text(title.toUpperCase(), centerX, y + 5);
    
    // Add subtle underline
    pdf.setDrawColor(...COLORS.teal);
    pdf.setLineWidth(0.3);
    pdf.line(centerX - 5, y + 6, centerX + textWidth + 5, y + 6);
    
    pdf.setTextColor(...COLORS.textDark);
    y += 12;
  };

  const drawText = (text: string, options?: { bold?: boolean; size?: number; indent?: number; color?: [number, number, number] }) => {
    const { bold = false, size = 10, indent = 0, color = COLORS.textDark } = options || {};
    pdf.setFont('helvetica', bold ? 'bold' : 'normal');
    pdf.setFontSize(size);
    pdf.setTextColor(...color);
    const textLines = pdf.splitTextToSize(text, contentWidth - indent);
    for (const line of textLines) {
      addNewPageIfNeeded(5);
      pdf.text(line, margin + indent, y);
      y += 5;
    }
    pdf.setTextColor(...COLORS.textDark);
  };

  const drawDivider = () => {
    y += 2;
    pdf.setDrawColor(...COLORS.border);
    pdf.setLineWidth(0.3);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 5;
  };

  // Render each section
  for (const section of sections) {
    drawSectionHeader(section.title);

    for (const line of section.content) {
      // Check for separator lines
      if (line.includes('===') || line.includes('---')) {
        drawDivider();
        continue;
      }

      // Check if it's a bullet point
      if (line.startsWith('•') || line.startsWith('-')) {
        const bulletText = line.replace(/^[•-]\s*/, '');
        
        // Check if line contains position|date format
        if (bulletText.includes('|')) {
          const parts = bulletText.split('|').map(p => p.trim());
          drawText(parts[0], { bold: true, size: 10 });
          if (parts[1]) {
            pdf.setTextColor(...COLORS.textMuted);
            drawText(parts[1], { size: 9, indent: 2 });
            pdf.setTextColor(...COLORS.textDark);
          }
        } else {
          // Regular bullet point with smaller, lighter teal dot
          pdf.setFillColor(...COLORS.teal);
          pdf.setGState(new pdf.GState({ opacity: 0.7 }));
          pdf.circle(margin + 2, y - 2, 0.8, 'F');
          pdf.setGState(new pdf.GState({ opacity: 1 }));
          drawText(bulletText, { indent: 6, size: 10 });
        }
      } else if (line.includes('|')) {
        // Handle position|date format without bullet
        const parts = line.split('|').map(p => p.trim());
        drawText(parts[0], { bold: true, size: 10 });
        if (parts[1]) {
          pdf.setTextColor(...COLORS.textMuted);
          drawText(parts[1], { size: 9, indent: 2 });
          pdf.setTextColor(...COLORS.textDark);
        }
      } else {
        // Regular text
        drawText(line, { size: 10 });
      }
    }
    y += 3;
  }

  // === DRAW FOOTER ===
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    
    // Simple footer with just page numbers
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...COLORS.textMuted);
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 5);
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
          alignment: 'center',
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

export interface CareerPathwayData {
  profileAssessment: {
    overallScore: number;
    strengthLevel: string;
    summary: string;
    keyStrengths: string[];
    developmentAreas: string[];
  };
  roleReadiness: Array<{
    role: string;
    readinessScore: number;
    readinessLevel: string;
    matchingStrengths: string[];
    gapsToAddress: string[];
    estimatedTimeToReady: string;
  }>;
  careerPathways: Array<{
    pathName: string;
    probability: string;
    milestones: Array<{
      year: number;
      position: string;
      requirements: string;
    }>;
    salaryProgression: {
      year1: string;
      year3: string;
      year5: string;
    };
  }>;
  competitivePositioning: {
    percentile: number;
    benchmarkComparison: string;
    uniqueAdvantages: string[];
    criticalGaps: string[];
  };
  developmentPlan: {
    immediate: Array<{ action: string; timeframe: string; impact: string; resources: string }>;
    shortTerm: Array<{ action: string; timeframe: string; impact: string; resources: string }>;
    longTerm: Array<{ action: string; timeframe: string; impact: string; resources: string }>;
  };
  certificationRecommendations: Array<{
    name: string;
    provider: string;
    priority: string;
    value: string;
  }>;
}

export async function exportCareerPathwayToPDF(
  analysis: CareerPathwayData,
  candidateName: string
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
    if (y + requiredSpace > pageHeight - margin) {
      pdf.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  const drawHeader = () => {
    // Header background
    pdf.setFillColor(20, 184, 166); // Teal
    pdf.rect(0, 0, pageWidth, 35, 'F');
    
    // Title
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text('Career Pathway Analysis', margin, 15);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(candidateName || 'Career Professional', margin, 24);
    
    pdf.setFontSize(9);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 31);
    
    y = 45;
    pdf.setTextColor(0, 0, 0);
  };

  const drawSectionHeader = (title: string, iconChar: string = '►') => {
    addNewPageIfNeeded(20);
    pdf.setFillColor(240, 253, 250); // Light teal
    pdf.roundedRect(margin, y, contentWidth, 10, 2, 2, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(20, 184, 166);
    pdf.text(`${iconChar} ${title}`, margin + 4, y + 7);
    pdf.setTextColor(0, 0, 0);
    y += 15;
  };

  const drawText = (text: string, options?: { bold?: boolean; size?: number; indent?: number }) => {
    const { bold = false, size = 10, indent = 0 } = options || {};
    pdf.setFont('helvetica', bold ? 'bold' : 'normal');
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(text, contentWidth - indent);
    for (const line of lines) {
      addNewPageIfNeeded(6);
      pdf.text(line, margin + indent, y);
      y += 5;
    }
  };

  // Draw header
  drawHeader();

  // Profile Score Card
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(margin, y, contentWidth, 30, 3, 3, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(28);
  pdf.setTextColor(20, 184, 166);
  pdf.text(String(analysis.profileAssessment.overallScore), margin + 8, y + 20);
  pdf.setFontSize(10);
  pdf.setTextColor(100, 116, 139);
  pdf.text('Profile Score', margin + 8, y + 27);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  const summaryLines = pdf.splitTextToSize(analysis.profileAssessment.summary, contentWidth - 45);
  let summaryY = y + 8;
  for (const line of summaryLines.slice(0, 4)) {
    pdf.text(line, margin + 40, summaryY);
    summaryY += 5;
  }
  y += 38;

  // Key Strengths & Development Areas
  drawSectionHeader('Key Strengths', '✓');
  analysis.profileAssessment.keyStrengths.slice(0, 5).forEach((strength) => {
    addNewPageIfNeeded(6);
    pdf.setFillColor(34, 197, 94);
    pdf.setGState(new pdf.GState({ opacity: 0.8 }));
    pdf.circle(margin + 4, y - 1.5, 1.2, 'F');
    pdf.setGState(new pdf.GState({ opacity: 1 }));
    drawText(strength, { indent: 10 });
  });
  y += 5;

  drawSectionHeader('Development Areas', '!');
  analysis.profileAssessment.developmentAreas.slice(0, 5).forEach((area) => {
    addNewPageIfNeeded(6);
    pdf.setFillColor(251, 191, 36);
    pdf.setGState(new pdf.GState({ opacity: 0.8 }));
    pdf.circle(margin + 4, y - 1.5, 1.2, 'F');
    pdf.setGState(new pdf.GState({ opacity: 1 }));
    drawText(area, { indent: 10 });
  });
  y += 5;

  // Role Readiness
  drawSectionHeader('Role Readiness Assessment', '◎');
  analysis.roleReadiness.forEach((role) => {
    addNewPageIfNeeded(25);
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(margin, y, contentWidth, 20, 2, 2, 'F');
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    const roleTitle = role.role.charAt(0).toUpperCase() + role.role.slice(1);
    pdf.text(roleTitle, margin + 4, y + 7);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(`Readiness: ${role.readinessScore}% | ${role.readinessLevel.replace('-', ' ')}`, margin + 4, y + 14);
    pdf.setTextColor(100, 116, 139);
    pdf.text(role.estimatedTimeToReady, margin + contentWidth - 40, y + 7);
    pdf.setTextColor(0, 0, 0);
    
    y += 25;
  });

  // Career Pathways
  pdf.addPage();
  y = margin;
  drawSectionHeader('Predicted Career Pathways', '↗');
  
  analysis.careerPathways.forEach((pathway) => {
    addNewPageIfNeeded(40);
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(margin, y, contentWidth, 35, 3, 3, 'F');
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text(pathway.pathName, margin + 4, y + 8);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(20, 184, 166);
    pdf.text(`${pathway.probability.toUpperCase()} PROBABILITY`, margin + contentWidth - 35, y + 8);
    pdf.setTextColor(0, 0, 0);
    
    // Milestones
    let milestoneX = margin + 4;
    pathway.milestones.slice(0, 3).forEach((milestone, idx) => {
      pdf.setFontSize(8);
      pdf.setTextColor(20, 184, 166);
      pdf.text(`Year ${milestone.year}`, milestoneX, y + 16);
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(9);
      const posLines = pdf.splitTextToSize(milestone.position, 50);
      pdf.text(posLines[0], milestoneX, y + 22);
      if (idx < pathway.milestones.length - 1) {
        pdf.text('→', milestoneX + 52, y + 19);
      }
      milestoneX += 58;
    });
    
    // Salary progression
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Salary: Y1: ${pathway.salaryProgression.year1} | Y3: ${pathway.salaryProgression.year3} | Y5: ${pathway.salaryProgression.year5}`, margin + 4, y + 32);
    pdf.setTextColor(0, 0, 0);
    
    y += 42;
  });

  // Development Plan
  addNewPageIfNeeded(30);
  drawSectionHeader('Development Plan', '⚡');
  
  const renderPlanSection = (title: string, items: typeof analysis.developmentPlan.immediate) => {
    addNewPageIfNeeded(15);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text(title, margin, y);
    y += 6;
    
    items.slice(0, 3).forEach((item) => {
      addNewPageIfNeeded(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      const actionLines = pdf.splitTextToSize(`• ${item.action}`, contentWidth - 5);
      pdf.text(actionLines[0], margin + 2, y);
      y += 5;
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(8);
      pdf.text(`${item.timeframe} | Impact: ${item.impact}`, margin + 6, y);
      pdf.setTextColor(0, 0, 0);
      y += 6;
    });
    y += 3;
  };

  renderPlanSection('Immediate Actions', analysis.developmentPlan.immediate);
  renderPlanSection('Short-term Goals', analysis.developmentPlan.shortTerm);
  renderPlanSection('Long-term Vision', analysis.developmentPlan.longTerm);

  // Certifications
  addNewPageIfNeeded(30);
  drawSectionHeader('Recommended Certifications', '★');
  
  analysis.certificationRecommendations.slice(0, 4).forEach((cert) => {
    addNewPageIfNeeded(15);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text(`${cert.name} (${cert.priority} priority)`, margin + 4, y);
    y += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`${cert.provider} - ${cert.value}`, margin + 4, y);
    pdf.setTextColor(0, 0, 0);
    y += 8;
  });

  // Simple footer with just page numbers
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8);
  }

  pdf.save(`Career_Pathway_${candidateName?.replace(/\s+/g, '_') || 'Analysis'}.pdf`);
}