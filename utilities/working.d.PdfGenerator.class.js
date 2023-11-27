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

    // Constants for layout
    const pageWidth = doc.page.width - 72 * 2; // Subtract margins
    const labelWidth = pageWidth / 3;
    const dataStart = 72 + labelWidth; // Start of data
    const fullDataWidth = pageWidth; // Full width for textarea
    const spacing = 28; // 1cm spacing in points
    const titleSpacing = 7; // 0.25cm spacing after title for textarea
    let yPosition = 72; // Start position

    // Sort the template by 'order'
    this.template.sort((a, b) => a.order - b.order);

    // Iterate through the sorted template and add data to the PDF
    this.template.forEach(field => {
        const value = this.data[field.field_name] || '';
        const title = field.title || '';
        let currentLabelWidth = labelWidth;
        let currentDataStart = dataStart;
        let currentDataWidth = pageWidth - labelWidth;

        if (field.type === 'textarea') {
            // Textarea spans full width
            currentLabelWidth = pageWidth;
            currentDataStart = 72;
            currentDataWidth = fullDataWidth;

            // Write the title
            doc.text(title + ':', 72, yPosition, { width: currentLabelWidth });

            // Add space after the title for textarea
            yPosition += doc.currentLineHeight() + titleSpacing;
        } else {
            // Write the title for non-textarea
            doc.text(title + ':', 72, yPosition, { width: currentLabelWidth });
        }

        // Write the data
        doc.text(value, currentDataStart, yPosition, { align: 'left', width: currentDataWidth });

        // Move yPosition to the next row
        yPosition += doc.heightOfString(value, { align: 'left', width: currentDataWidth }) + spacing;
    });

    doc.end();

    //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
      });
  }
}
