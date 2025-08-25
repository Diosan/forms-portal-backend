import fs from 'fs';
import { promises as fsPromises } from 'fs';
import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));


export class PDFGenerator {
  constructor(data, templatePath) {
    this.data = data;
    this.template = JSON.parse(fs.readFileSync(path.join(__dirname, 'templates', 'form_template.json'), 'utf8'));
  }
  //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  async generatePDF(outputFileName) {
    const doc = new PDFDocument({ margin: 30 }); // 2cm margin
    const appParentDirectory = path.join(__dirname, '..');
    const outputPath = path.join(appParentDirectory, outputFileName);
    const outputDir = path.dirname(outputPath);
    await fsPromises.mkdir(outputDir, { recursive: true });

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Constants for layout
    const pageWidth = doc.page.width - 72 * 2; // Subtract margins
    const labelWidth = pageWidth / 2.5;
    const dataStart = 30 + labelWidth; // Start of data
    const fullDataWidth = pageWidth; // Full width for textarea
    const spacing = 20; // 1cm spacing in points
    const titleSpacing = 7; // 0.25cm spacing after title for textarea
    let yPosition = 30; // Start position

    // Print the Header with specific styles
    const headerStyles = {
      formCountry: { fontSize: 10, font: 'Helvetica-Bold' },
      formTitle: { fontSize: 14, font: 'Helvetica-Bold' },
      formSubtitle: { fontSize: 12, font: 'Helvetica-Bold' },
      dateSubmitted: { fontSize: 10, font: 'Helvetica-Bold' }
    };
    

     // Function to print side text
     const printSideText = () => {
      const sideTextXPosition = 14.1732283; // 0.5 cm from left
      const sideTextYPosition = doc.page.height - 30; // 0.5 cm from bottom

      doc.save(); // Save the current state
      doc.rotate(-90, { origin: [sideTextXPosition, sideTextYPosition] })
          .font('Helvetica')
          .fontSize(6)
          .text(this.template.side.disclaimer, sideTextXPosition, sideTextYPosition, {
              lineBreak: false
          });
      doc.restore(); // Restore to previous state
    };

    // Print the Header
    Object.entries(this.template.header).forEach(([key, value]) => {
      const style = headerStyles[key];
      if (style) {
        doc.font(style.font).fontSize(style.fontSize);
      }
      doc.text(`${value}`, 50, yPosition);
      yPosition += doc.currentLineHeight() + 8.5; // 0.3 cm spacing
    });
    // Add a space of 1.5 cm after the header
    // ---------------------------------------
    yPosition += 30;
    // ---------------------------------------

    // Sort the template by 'order'
    this.template.content.sort((a, b) => a.order - b.order);

     // Initially print the side text on the first page
     printSideText();

    // Iterate through the sorted template and add data to the PDF
    this.template.content.forEach(field => {
      const value = this.data[field.field_name] || '';
      const title = field.title || '';
      let currentLabelWidth = labelWidth;
      let currentDataStart = dataStart;
      let currentDataWidth = pageWidth - labelWidth;

      doc.font('Helvetica-Bold').fontSize(9);

      if (field.type === 'textarea') {
          currentLabelWidth = pageWidth;
          currentDataStart = 50;
          currentDataWidth = fullDataWidth;
      }

      // Check if enough space is left on the current page
      const fieldHeight = doc.heightOfString(value, { align: 'left', width: currentDataWidth });
      if (yPosition + fieldHeight > doc.page.height - 50) {
          doc.addPage();
          yPosition = 40; // Reset yPosition to top margin of the new page
          printSideText();
      }

      doc.font('Helvetica-Bold').fontSize(9);
      doc.text(title + ':', 50, yPosition, { width: currentLabelWidth });

      if (field.type === 'textarea') {
          yPosition += doc.currentLineHeight() + titleSpacing;
      }
      doc.font('Helvetica').fontSize(9);
      doc.text(value, currentDataStart, yPosition, { align: 'left', width: currentDataWidth });

      yPosition += fieldHeight + spacing;
    });

    // Add a space of 1.5 
    // ---------------------------------------
    // yPosition += 30;
    // ---------------------------------------


    // Print the Footer
    Object.entries(this.template.footer).forEach(([key, value]) => {
      // Ensure there is space for the footer
      if (yPosition > doc.page.height - 72 * 2) {
          doc.addPage();
          yPosition = 72;
      }
      doc.text(`${value}`, 72, yPosition);
      yPosition += doc.currentLineHeight() + spacing;
    });

    doc.end();

    //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
      });
  }
}
