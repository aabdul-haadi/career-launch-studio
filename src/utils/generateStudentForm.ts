import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } from 'docx';

export async function generateStudentDataForm(): Promise<void> {
  const createHeader = (text: string) => new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: 28,
        color: '0D9488',
      }),
    ],
    spacing: { before: 400, after: 200 },
  });

  const createSubHeader = (text: string) => new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: 22,
      }),
    ],
    spacing: { before: 200, after: 100 },
  });

  const createFieldRow = (label: string, hint?: string) => new TableRow({
    children: [
      new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: label, bold: true, size: 20 }),
              hint ? new TextRun({ text: ` (${hint})`, italics: true, size: 18, color: '666666' }) : new TextRun({ text: '' }),
            ],
          }),
        ],
        width: { size: 35, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
          left: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
          right: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
        },
      }),
      new TableCell({
        children: [new Paragraph({ text: '' })],
        width: { size: 65, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
          left: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
          right: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
        },
      }),
    ],
  });

  const createMultiLineField = (label: string, hint?: string, lines: number = 3) => {
    const rows: Paragraph[] = [
      new Paragraph({
        children: [
          new TextRun({ text: label, bold: true, size: 20 }),
          hint ? new TextRun({ text: ` (${hint})`, italics: true, size: 18, color: '666666' }) : new TextRun({ text: '' }),
        ],
        spacing: { before: 200 },
      }),
    ];
    for (let i = 0; i < lines; i++) {
      rows.push(new Paragraph({
        text: '_'.repeat(90),
        spacing: { before: 100 },
      }));
    }
    return rows;
  };

  const createCheckboxList = (title: string, options: string[]) => {
    return [
      new Paragraph({
        children: [
          new TextRun({ text: title, bold: true, size: 20 }),
          new TextRun({ text: ' (check all that apply)', italics: true, size: 18, color: '666666' }),
        ],
        spacing: { before: 200, after: 100 },
      }),
      ...options.map(opt => new Paragraph({
        children: [new TextRun({ text: `☐ ${opt}`, size: 20 })],
        spacing: { before: 40 },
      })),
      new Paragraph({
        children: [new TextRun({ text: 'Other: ___________________________', size: 20 })],
        spacing: { before: 40 },
      }),
    ];
  };

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 720, right: 720, bottom: 720, left: 720 },
        },
      },
      children: [
        // Title
        new Paragraph({
          children: [
            new TextRun({
              text: 'Career Launch Pack - Student Data Form',
              bold: true,
              size: 36,
              color: '0D9488',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Please complete all sections. Your responses will be used to generate your personalized career documents.',
              italics: true,
              size: 20,
              color: '666666',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),

        // SECTION 1: Personal Information
        createHeader('1. Personal Information'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            createFieldRow('Full Name'),
            createFieldRow('Phone Number', 'with country code'),
            createFieldRow('Email Address'),
            createFieldRow('City'),
            createFieldRow('Country'),
            createFieldRow('LinkedIn URL', 'optional'),
          ],
        }),

        // SECTION 2: Education
        createHeader('2. Education'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            createFieldRow('Degree', 'PharmD / BPharm / MPharm / Other'),
            createFieldRow('University Name'),
            createFieldRow('Expected Graduation', 'Month Year'),
            createFieldRow('GPA', 'optional'),
          ],
        }),
        ...createCheckboxList('Relevant Coursework', [
          'Clinical Pharmacy', 'Pharmacology', 'Pharmaceutical Chemistry',
          'Pharmacokinetics', 'Drug Formulation', 'Hospital Pharmacy Practice',
          'Community Pharmacy Practice', 'Pharmaceutical Analysis', 'Quality Assurance',
          'Regulatory Affairs', 'Pharmacoeconomics', 'Drug Information',
          'Therapeutics', 'Toxicology', 'Biopharmaceutics',
        ]),

        // SECTION 3: Experience
        createHeader('3. Experience'),
        new Paragraph({
          children: [new TextRun({ text: 'List your internships, rotations, and part-time work (repeat for each experience):', italics: true, size: 20 })],
          spacing: { after: 200 },
        }),
        
        createSubHeader('Experience #1'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            createFieldRow('Organization Name'),
            createFieldRow('Department'),
            createFieldRow('Type', 'Internship / Rotation / Part-time'),
            createFieldRow('Start Date', 'Month Year'),
            createFieldRow('End Date', 'Month Year or Present'),
          ],
        }),
        ...createMultiLineField('Key Responsibilities', 'what you did day-to-day', 3),
        ...createMultiLineField('Achievements', 'specific accomplishments, metrics if possible', 3),

        createSubHeader('Experience #2'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            createFieldRow('Organization Name'),
            createFieldRow('Department'),
            createFieldRow('Type', 'Internship / Rotation / Part-time'),
            createFieldRow('Start Date'),
            createFieldRow('End Date'),
          ],
        }),
        ...createMultiLineField('Key Responsibilities', '', 3),
        ...createMultiLineField('Achievements', '', 3),

        createSubHeader('Experience #3 (if applicable)'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            createFieldRow('Organization Name'),
            createFieldRow('Department'),
            createFieldRow('Type'),
            createFieldRow('Start Date'),
            createFieldRow('End Date'),
          ],
        }),
        ...createMultiLineField('Key Responsibilities', '', 2),
        ...createMultiLineField('Achievements', '', 2),

        // SECTION 4: Final Year Project / Research
        createHeader('4. Final Year Project / Research'),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            createFieldRow('Project Title'),
          ],
        }),
        ...createMultiLineField('Research Objectives', 'what you aimed to achieve', 3),
        ...createMultiLineField('Methodology', 'how you conducted the research', 3),
        ...createMultiLineField('Key Outcomes/Findings', 'results, conclusions', 3),
        ...createCheckboxList('Tools & Software Used', [
          'SPSS', 'Microsoft Excel', 'GraphPad Prism', 'HPLC',
          'UV-Vis Spectrophotometry', 'Dissolution Apparatus', 'RevMan',
          'EndNote', 'NVivo', 'R Statistical Software',
        ]),

        // SECTION 5: Skills
        createHeader('5. Skills'),
        ...createCheckboxList('Technical/Hard Skills', [
          'Drug Dispensing', 'Prescription Verification', 'Drug-Drug Interaction Screening',
          'Patient Counseling', 'Medication Therapy Management', 'Compounding',
          'Sterile Preparation', 'Clinical Documentation', 'Adverse Drug Reaction Reporting',
          'Drug Utilization Review', 'Quality Control Testing', 'HPLC Analysis',
          'Dissolution Testing', 'Stability Studies', 'GMP Compliance',
        ]),
        ...createCheckboxList('Soft Skills', [
          'Communication', 'Teamwork', 'Problem-Solving', 'Critical Thinking',
          'Time Management', 'Attention to Detail', 'Patient Care', 'Leadership',
          'Adaptability', 'Empathy', 'Conflict Resolution', 'Organizational Skills',
        ]),
        ...createCheckboxList('Software & Tools', [
          'Microsoft Excel', 'Microsoft Word', 'Microsoft PowerPoint', 'SPSS',
          'EndNote', 'Mendeley', 'Pharmacy Management Systems', 'Electronic Health Records',
          'Drug Information Databases', 'Clinical Decision Support Systems', 'SAP',
          'Laboratory Information Systems',
        ]),

        // SECTION 6: Certifications
        createHeader('6. Certifications & Training'),
        new Paragraph({
          children: [new TextRun({ text: 'List any certifications, courses, or training completed:', italics: true, size: 20 })],
          spacing: { after: 200 },
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            createFieldRow('Certification #1 Name'),
            createFieldRow('Provider/Institution'),
            createFieldRow('Year Completed'),
          ],
        }),
        new Paragraph({ text: '', spacing: { before: 100 } }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            createFieldRow('Certification #2 Name'),
            createFieldRow('Provider/Institution'),
            createFieldRow('Year Completed'),
          ],
        }),
        new Paragraph({ text: '', spacing: { before: 100 } }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            createFieldRow('Certification #3 Name'),
            createFieldRow('Provider/Institution'),
            createFieldRow('Year Completed'),
          ],
        }),

        // SECTION 7: Activities
        createHeader('7. Extracurricular Activities'),
        ...createMultiLineField('Volunteering', 'organization, role, impact', 2),
        ...createMultiLineField('Society Memberships', 'pharmacy associations, student groups', 2),
        ...createMultiLineField('Presentations/Posters', 'conferences, symposiums', 2),
        ...createMultiLineField('Leadership Roles', 'positions held, responsibilities', 2),

        // SECTION 8: Target Roles
        createHeader('8. Career Preferences'),
        ...createCheckboxList('Which roles are you interested in?', [
          'Hospital/Clinical Pharmacy',
          'Pharmaceutical Industry (QA/QC/Regulatory)',
          'Community/Retail Pharmacy',
        ]),
        ...createMultiLineField('Specific Interest Areas', 'e.g., oncology pharmacy, drug safety, regulatory affairs', 2),
        ...createMultiLineField('Your Key Strengths', 'what makes you a great candidate', 3),
        ...createMultiLineField('Preferred Work Location', 'city, country preferences', 1),

        // SECTION 9: Job Description (Optional)
        createHeader('9. Target Job Description (Optional)'),
        new Paragraph({
          children: [new TextRun({ text: 'If you have a specific job posting you\'re applying to, paste it below:', italics: true, size: 20 })],
          spacing: { after: 200 },
        }),
        ...createMultiLineField('Job Description', '', 8),

        // Footer
        new Paragraph({
          children: [
            new TextRun({
              text: '\n\nThank you for completing this form! Your career pack will be generated based on this information.',
              italics: true,
              size: 20,
              color: '666666',
            }),
          ],
          spacing: { before: 400 },
          alignment: AlignmentType.CENTER,
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Career_Launch_Pack_Student_Form.docx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
