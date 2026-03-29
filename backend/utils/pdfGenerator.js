import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generates a PDF invoice locally and returns the relative file path to be served via static URL.
 * @param {Object} invoice - The invoice data
 * @param {Object} order - The order data (populated with product info)
 * @returns {Promise<string>} - Local relative URL of the generated PDF (e.g. "/invoices/INV-00001.pdf")
 */
export const generateInvoicePDF = (invoice, order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const invoicesDir = path.join(__dirname, "..", "invoices");
      
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const fileName = `${invoice.invoiceNumber}.pdf`;
      const filePath = path.join(invoicesDir, fileName);
      const writeStream = fs.createWriteStream(filePath);

      doc.pipe(writeStream);

      // Header
      doc
        .fillColor("#444444")
        .fontSize(20)
        .text("VypaarFlow Business", 50, 57)
        .fontSize(10)
        .text("123 Business Avenue", 50, 80)
        .text("New Delhi, India, 110001", 50, 95)
        .text("GSTIN: 07AABCU9603R1ZJ", 50, 110)
        .moveDown();

      // Invoice info right-aligned
      doc
        .fillColor("#444444")
        .fontSize(20)
        .text("INVOICE", 50, 50, { align: "right" })
        .fontSize(10)
        .text(`Invoice Number: ${invoice.invoiceNumber}`, 50, 80, { align: "right" })
        .text(`Date: ${new Date(invoice.createdAt).toLocaleDateString("en-IN")}`, 50, 95, { align: "right" })
        .text(`Status: ${invoice.status.toUpperCase()}`, 50, 110, { align: "right" })
        .moveDown();

      generateHr(doc, 140);

      // Customer Info
      doc
        .fontSize(10)
        .text("Bill To:", 50, 160)
        .font("Helvetica-Bold")
        .text(order.customer.name, 50, 175)
        .font("Helvetica")
        .text(`Mob: +91 ${order.customer.mobile}`, 50, 190)
        .moveDown();

      generateHr(doc, 220);

      // Table Header
      const invoiceTableTop = 250;
      doc.font("Helvetica-Bold");
      generateTableRow(doc, invoiceTableTop, "Item", "Quantity", "Unit Price", "Total");
      generateHr(doc, invoiceTableTop + 20);
      doc.font("Helvetica");

      // Table Rows
      let i = 0;
      for (i = 0; i < invoice.items.length; i++) {
        const item = invoice.items[i];
        const position = invoiceTableTop + (i + 1) * 30;
        generateTableRow(
          doc,
          position,
          item.name,
          item.quantity,
          `Rs. ${item.price}`,
          `Rs. ${item.total}`
        );
        generateHr(doc, position + 20);
      }

      // Grand Total
      const subTotalPosition = invoiceTableTop + (i + 1) * 30;
      doc.font("Helvetica-Bold");
      generateTableRow(
        doc,
        subTotalPosition,
        "",
        "",
        "Grand Total",
        `Rs. ${invoice.totalAmount}`
      );
      doc.font("Helvetica");

      // Footer
      doc
        .fontSize(10)
        .text("Thank you for your business. For any queries, please contact support.", 50, 700, {
          align: "center",
          width: 500,
        });

      doc.end();

      writeStream.on("finish", () => {
        resolve(`/invoices/${fileName}`);
      });
      writeStream.on("error", (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};

function generateHr(doc, y) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

function generateTableRow(doc, y, item, quantity, unitCost, lineTotal) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(quantity, 280, y, { width: 90, align: "right" })
    .text(unitCost, 370, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
}
