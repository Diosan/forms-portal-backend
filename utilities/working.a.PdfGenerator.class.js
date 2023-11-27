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
    const doc = new PDFDocument({ margin: 72 }); // 2cm margin
    // Calculate the output path using the parent directory of the application
    const appParentDirectory = path.join(__dirname, '..');
    const outputPath = path.join(appParentDirectory, outputFileName);
    // Ensure the output directory exists
    const outputDir = path.dirname(outputPath);
    await fsPromises.mkdir(outputDir, { recursive: true });

    // Create a write stream for the output PDF
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.pipe(fs.createWriteStream(outputPath));

    // Constants for layout
    const columnWidth = (doc.page.width - 72 * 2 - 28) / 2; // Subtract margins and spacing, then divide by 2 for two columns
    const spacing = 28; // 1cm spacing in points
    let currentColumn = 1;
    let yPosition = 72; // Start position

    this.template.sort((a, b) => a.order - b.order);

    this.template.forEach(field => {
      const value = this.data[field.field_name] || '';
      const title = field.title || '';
      let xPosition = currentColumn === 1 ? 72 : (72 + columnWidth + spacing);

      if (field.type === 'textarea') {
        // Textarea spans full width, reset to first column
        xPosition = 72;
        currentColumn = 1;
      }

      // Write the title and value
      doc.text(title, xPosition, yPosition);
      yPosition += doc.currentLineHeight();
      doc.text(value, xPosition, yPosition);
      yPosition += doc.currentLineHeight() + spacing;

      // Handle column and row positioning
      if (field.type !== 'textarea') {
        if (currentColumn === 1) {
          currentColumn = 2;
        } else {
          currentColumn = 1;
          yPosition += doc.currentLineHeight() + spacing; // Move to next row for next field
        }
      } else {
        yPosition += doc.currentLineHeight() + spacing; // Additional space after textarea
      }
    });

    doc.end();

    //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
      });
  }
}
