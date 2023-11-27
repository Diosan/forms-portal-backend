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
    const pageWidth = doc.page.width - 72 * 2; // Subtract margins
    const labelWidth = pageWidth / 3;
    const dataWidth = pageWidth * 2 / 3 - 28; // Subtract 1cm spacing
    const spacing = 28; // 1cm spacing in points
    let yPosition = 72; // Start position

    this.template.sort((a, b) => a.order - b.order);

    this.template.forEach(field => {
      const value = this.data[field.field_name] || '';
      const title = field.title || '';

      // Write the title on the left
      doc.text(title + ':', 72, yPosition, { width: labelWidth, continued: true });

      // Write the value on the right
      doc.text(value, { width: dataWidth });

      yPosition += doc.currentLineHeight() + spacing; // Adjust yPosition for the next field
    });

    doc.end();

    //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
      });
  }
}
