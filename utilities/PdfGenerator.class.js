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

    // Sort the template by 'order'
    this.template.sort((a, b) => a.order - b.order);

    // Iterate through the sorted template and add data to the PDF
    this.template.forEach(field => {
      const value = this.data[field.field_name] || '';
      const title = field.title || '';
      // You can add more complex layout logic based on 'column', 'type', etc.
      doc.text(title + ': ' + value);
    });

    doc.end();

    return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
      });
  }
}
