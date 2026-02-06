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
    pdf.circle(margin + 4, y - 1.5, 1.5, 'F');
    drawText(strength, { indent: 10 });
  });
  y += 5;

  drawSectionHeader('Development Areas', '!');
  analysis.profileAssessment.developmentAreas.slice(0, 5).forEach((area) => {
    addNewPageIfNeeded(6);
    pdf.setFillColor(251, 191, 36);
    pdf.circle(margin + 4, y - 1.5, 1.5, 'F');
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

  // Footer
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      `Career Pathway Analysis | Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  pdf.save(`Career_Pathway_${candidateName?.replace(/\s+/g, '_') || 'Analysis'}.pdf`);
}
