import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');

@Injectable()
export class PdfExporterService {
  private readonly logger = new Logger(PdfExporterService.name);

  generateQuotationPdf(order: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        // Multi-candidate Font Path Resolution (Works in src, dist, docker & Windows)
        const candidateFontPaths = [
          path.join(process.cwd(), 'src', 'common', 'pdf', 'fonts', 'arial.ttf'),
          path.join(process.cwd(), 'dist', 'common', 'pdf', 'fonts', 'arial.ttf'),
          path.join(__dirname, 'fonts', 'arial.ttf'),
          'C:\\Windows\\Fonts\\arial.ttf',
        ];

        const fontPath = candidateFontPaths.find((p) => fs.existsSync(p));
        const fontBoldPath = fontPath ? (fs.existsSync(fontPath.replace('arial.ttf', 'arialbd.ttf')) ? fontPath.replace('arial.ttf', 'arialbd.ttf') : fontPath) : null;

        if (fontPath) doc.registerFont('Arial', fontPath);
        if (fontBoldPath) doc.registerFont('Arial-Bold', fontBoldPath);

        const regularFont = fontPath ? 'Arial' : 'Helvetica';
        const boldFont = fontBoldPath ? 'Arial-Bold' : 'Helvetica-Bold';

        // Header Company Info
        doc.font(boldFont).fillColor('#1e293b').fontSize(18).text('CÔNG TY TNHH PHỤ TÙNG Ô TÔ Q. BA', { align: 'center' });
        doc.font(regularFont).fontSize(9).fillColor('#64748b').text('Địa chỉ: 123 QL1A, Q. Liên Chiểu, TP. Đà Nẵng | Hotline: 0903.588.176', { align: 'center' });
        doc.moveDown(0.5);

        // Divider
        doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
        doc.moveDown(0.8);

        // Document Title
        doc.font(boldFont).fillColor('#0f172a').fontSize(14).text(`PHIẾU BÁO GIÁ / ĐƠN BÁN HÀNG: ${order.orderNumber || 'SO-NEW'}`, { align: 'center' });
        doc.moveDown(0.8);

        // Order & Customer Details
        const leftX = 40;
        const rightX = 320;
        const startY = doc.y;

        doc.font(regularFont).fontSize(9).fillColor('#334155');
        doc.text(`Khách hàng: ${order.customerName || 'Khách lẻ'}`, leftX, startY);
        doc.text(`Số điện thoại: ${order.customerPhone || 'N/A'}`, leftX, startY + 15);
        doc.text(`Địa chỉ: ${order.customerAddress || 'N/A'}`, leftX, startY + 30);

        doc.text(`Ngày lập: ${new Date(order.orderDate || order.createdAt || Date.now()).toLocaleDateString('vi-VN')}`, rightX, startY);
        doc.text(`Trạng thái: ${order.status || 'CONFIRMED'}`, rightX, startY + 15);
        doc.text(`Mã số thuế: ${order.customerTaxCode || 'N/A'}`, rightX, startY + 30);

        doc.moveDown(3);

        // Function to draw Table Header
        const drawTableHeader = (y: number) => {
          doc.font(boldFont).fillColor('#0f172a').fontSize(8.5);
          doc.text('STT', 40, y);
          doc.text('Mã Phụ Tùng', 75, y);
          doc.text('Tên Sản Phẩm / Phụ Tùng', 165, y);
          doc.text('SL', 360, y, { width: 30, align: 'right' });
          doc.text('Đơn Giá (VNĐ)', 395, y, { width: 75, align: 'right' });
          doc.text('Thành Tiền (VNĐ)', 475, y, { width: 80, align: 'right' });
          doc.strokeColor('#cbd5e1').lineWidth(0.8).moveTo(40, y + 15).lineTo(555, y + 15).stroke();
        };

        let itemY = doc.y + 10;
        drawTableHeader(itemY);
        itemY += 22;

        // Items Table Rows with Dynamic Pagination
        const items = order.items || [];
        items.forEach((item: any, idx: number) => {
          const nameText = item.productName || 'Phụ tùng';

          // ALWAYS SET FONT TO REGULAR BEFORE MEASURING AND PRINTING
          doc.font(regularFont).fillColor('#334155').fontSize(8.5);

          const nameHeight = doc.heightOfString(nameText, { width: 190 });
          const rowHeight = Math.max(16, nameHeight + 4);

          // Page Break Check
          if (itemY + rowHeight > 740) {
            doc.addPage();
            itemY = 40;
            drawTableHeader(itemY);
            itemY += 22;
            // RE-APPLY REGULAR FONT FOR ROW ITEM AFTER HEADER
            doc.font(regularFont).fillColor('#334155').fontSize(8.5);
          }

          doc.text(String(idx + 1), 40, itemY);
          doc.text(item.productCode || '-', 75, itemY, { width: 85 });
          doc.text(nameText, 165, itemY, { width: 190 });
          doc.text(Number(item.quantity || 0).toLocaleString('vi-VN'), 360, itemY, { width: 30, align: 'right' });
          doc.text(Number(item.unitPrice || 0).toLocaleString('vi-VN'), 395, itemY, { width: 75, align: 'right' });
          doc.text(Number(item.amount || (item.quantity * item.unitPrice)).toLocaleString('vi-VN'), 475, itemY, { width: 80, align: 'right' });

          itemY += rowHeight;
        });

        doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(40, itemY).lineTo(555, itemY).stroke();
        itemY += 12;

        if (itemY + 120 > 750) {
          doc.addPage();
          itemY = 40;
        }

        // Totals Summary
        const subtotal = Number(order.subtotal || 0);
        const taxAmount = Number(order.taxAmount || 0);
        const totalAmount = Number(order.totalAmount || subtotal + taxAmount);

        doc.font(regularFont).fontSize(9.5).fillColor('#0f172a');
        doc.text('Tiền hàng:', 350, itemY, { width: 110, align: 'right' });
        doc.font(boldFont).text(`${subtotal.toLocaleString('vi-VN')} VNĐ`, 465, itemY, { width: 90, align: 'right' });

        itemY += 15;
        doc.font(regularFont).text(`Thuế GTGT (${order.taxRate || 10}%):`, 350, itemY, { width: 110, align: 'right' });
        doc.font(boldFont).text(`${taxAmount.toLocaleString('vi-VN')} VNĐ`, 465, itemY, { width: 90, align: 'right' });

        itemY += 18;
        doc.font(boldFont).fillColor('#1e40af').fontSize(10.5);
        doc.text('TỔNG CỘNG:', 350, itemY, { width: 110, align: 'right' });
        doc.text(`${totalAmount.toLocaleString('vi-VN')} VNĐ`, 465, itemY, { width: 90, align: 'right' });

        // Signatures
        itemY += 45;
        doc.font(boldFont).fontSize(9.5).fillColor('#334155');
        doc.text('Đại diện Khách hàng', 80, itemY, { align: 'center' });
        doc.text('Đại diện Công ty Q. BA', 380, itemY, { align: 'center' });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
