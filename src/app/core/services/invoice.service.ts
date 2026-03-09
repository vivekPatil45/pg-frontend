import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Booking } from '../../models/booking.model';
import { DatePipe } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class InvoiceService {

    constructor(private datePipe: DatePipe) { }

    generateInvoice(booking: Booking) {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 14;

        // ─── BRAND COLORS ───────────────────────────────────────────────
        const primaryColor: [number, number, number] = [30, 58, 138];   // deep navy
        const accentColor: [number, number, number] = [245, 158, 11];  // gold
        const lightBg: [number, number, number] = [239, 246, 255]; // pale blue
        const textDark: [number, number, number] = [15, 23, 42];
        const textGray: [number, number, number] = [100, 116, 139];
        const white: [number, number, number] = [255, 255, 255];
        const borderColor: [number, number, number] = [203, 213, 225];

        // ─── HEADER BANNER ──────────────────────────────────────────────
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 50, 'F');

        // Gold accent bar
        doc.setFillColor(...accentColor);
        doc.rect(0, 50, pageWidth, 3, 'F');

        // Hotel name
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.setTextColor(...white);
        doc.text('Silver PG', pageWidth / 2, 22, { align: 'center' });

        // Tagline
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(186, 214, 255);
        doc.text('Premium Living & Comfort | Pune, Maharashtra', pageWidth / 2, 30, { align: 'center' });

        // Contact line
        doc.setTextColor(186, 214, 255);
        doc.setFontSize(8);
        doc.text('12, Koregaon Park Road, Pune 411001  •  +91 98765 43210  •  support@silverpg.com', pageWidth / 2, 38, { align: 'center' });

        // INVOICE label on right corner
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(...accentColor);
        doc.text('TAX INVOICE', pageWidth - margin, 20, { align: 'right' });

        // ─── INVOICE META SECTION ──────────────────────────────────────
        const bookingStr = booking.bookingId || booking._id || '';
        const invoiceId = 'INV-' + bookingStr.substring(bookingStr.length - 8).toUpperCase();
        const invoiceDate = this.datePipe.transform(new Date(), 'dd MMM yyyy, hh:mm a') ?? '';

        // Light blue box for invoice info
        doc.setFillColor(...lightBg);
        doc.setDrawColor(...borderColor);
        doc.roundedRect(margin, 58, pageWidth - margin * 2, 30, 3, 3, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...primaryColor);
        doc.text('Invoice No:', margin + 4, 67);
        doc.text('Issue Date:', margin + 4, 75);
        doc.text('Transaction ID:', margin + 4, 83);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textDark);
        doc.text(invoiceId, margin + 35, 67);
        doc.text(invoiceDate, margin + 35, 75);
        doc.text(booking.transactionId || 'N/A', margin + 35, 83);

        const rightCol = pageWidth / 2 + 10;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('Booking ID:', rightCol, 67);
        doc.text('Payment Method:', rightCol, 75);
        doc.text('Payment Status:', rightCol, 83);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textDark);
        doc.text(booking.bookingId || 'N/A', rightCol + 38, 67);
        doc.text(booking.payment?.paymentMethod || 'Credit Card', rightCol + 38, 75);

        // Coloured status badge
        const status = booking.paymentStatus || 'N/A';
        const statusColor: [number, number, number] = status === 'PAID' ? [22, 163, 74] : [220, 38, 38];
        doc.setTextColor(...statusColor);
        doc.setFont('helvetica', 'bold');
        doc.text(status, rightCol + 38, 83);

        // ─── BILL TO / STAY DETAILS ────────────────────────────────────
        const sectionY = 96;

        // Left: Bill To
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('BILLED TO', margin, sectionY);

        doc.setDrawColor(...accentColor);
        doc.setLineWidth(0.5);
        doc.line(margin, sectionY + 2, margin + 35, sectionY + 2);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...textDark);
        // Backend returns user nested in tenant for some endpoints
        const user = booking.user || booking.tenant?.user;
        const guestName = user?.name || 'Tenant';
        const guestEmail = user?.email || 'N/A';
        const guestPhone = user?.phone || 'N/A';
        doc.text(guestName, margin, sectionY + 9);
        doc.text(guestEmail, margin, sectionY + 16);
        doc.text(guestPhone, margin, sectionY + 23);

        // Right: Stay Details
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...primaryColor);
        doc.text('STAY DETAILS', rightCol, sectionY);
        doc.setDrawColor(...accentColor);
        doc.line(rightCol, sectionY + 2, rightCol + 38, sectionY + 2);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...textDark);
        const roomNo = booking.room?.roomNumber || 'N/A';
        const roomType = booking.room?.roomType || 'Standard';
        const moveIn = this.datePipe.transform(booking.moveInDate, 'dd MMM yyyy') ?? '';
        const rent = booking.room?.price || 0;

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...textGray);
        doc.text('Room No :', rightCol, sectionY + 9);
        doc.text('Room Type:', rightCol, sectionY + 16);
        doc.text('Move-In :', rightCol, sectionY + 23);
        doc.text('Monthly Rent:', rightCol, sectionY + 30);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textDark);
        doc.text(roomNo, rightCol + 30, sectionY + 9);
        doc.text(roomType, rightCol + 30, sectionY + 16);
        doc.text(moveIn, rightCol + 30, sectionY + 23);
        doc.text(`Rs. ${rent}`, rightCol + 30, sectionY + 30);

        // ─── CHARGES TABLE ─────────────────────────────────────────────

        autoTable(doc, {
            startY: sectionY + 38,
            head: [['#', 'Description', 'Details', 'Amount (Rs.)']],
            body: [
                ['1', 'Rent & Deposit', `Room ${roomNo} (${roomType})`, `Rs.${(booking.totalAmount ?? 0).toFixed(2)}`]
            ],
            foot: [
                [{ content: '', styles: { fillColor: white } }, { content: '', styles: { fillColor: white } }, { content: 'TOTAL PAYABLE', styles: { halign: 'right', fontStyle: 'bold', textColor: primaryColor, fillColor: white } }, { content: `Rs.${(booking.totalAmount ?? 0).toFixed(2)}`, styles: { fontStyle: 'bold', textColor: primaryColor, fillColor: white } }]
            ],
            theme: 'striped',
            headStyles: {
                fillColor: primaryColor,
                textColor: white,
                fontStyle: 'bold',
                fontSize: 9,
                cellPadding: 5
            },
            footStyles: {
                fontSize: 10,
                cellPadding: 6
            },
            styles: {
                fontSize: 9,
                cellPadding: 4,
                textColor: textDark
            },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                1: { cellWidth: 50 },
                2: { cellWidth: 80 },
                3: { cellWidth: 40, halign: 'right' }
            }
        });

        // ─── AMOUNT IN WORDS ───────────────────────────────────────────
        const finalY: number = (doc as any).lastAutoTable.finalY + 8;

        doc.setFillColor(...lightBg);
        doc.setDrawColor(...borderColor);
        doc.roundedRect(margin, finalY, pageWidth - margin * 2, 14, 3, 3, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(...primaryColor);
        doc.text('Amount in Words:', margin + 4, finalY + 5.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textDark);
        doc.text(this.numberToWords(booking.totalAmount ?? 0) + ' Only', margin + 43, finalY + 5.5);

        // ─── TERMS & FOOTER ────────────────────────────────────────────
        const termsY = finalY + 22;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(...primaryColor);
        doc.text('Terms & Conditions:', margin, termsY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textGray);
        const terms = [
            '1. This is a computer-generated invoice and does not require a physical signature.',
            '2. Monthly Rent must be paid before the 5th of every month.',
            '3. Refunds will be processed within 5–7 business days as per cancellation policy.',
        ];
        terms.forEach((t, i) => doc.text(t, margin, termsY + 6 + i * 5));

        // Footer bar
        doc.setFillColor(...primaryColor);
        doc.rect(0, pageHeight - 18, pageWidth, 18, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...white);
        doc.text('Thank you for choosing Silver PG — We look forward to welcoming you!', pageWidth / 2, pageHeight - 8, { align: 'center' });
        doc.text(`www.silverpg.com  |  support@silverpg.com  |  +91 98765 43210`, pageWidth / 2, pageHeight - 3, { align: 'center' });

        // Watermark if unpaid
        if (booking.paymentStatus !== 'PAID') {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(60);
            doc.setTextColor(220, 38, 38);
            (doc as any).setGState((doc as any).GState({ opacity: 0.07 }));
            doc.text('UNPAID', pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });
            (doc as any).setGState((doc as any).GState({ opacity: 1 }));
        }

        // ─── SAVE ───────────────────────────────────────────────────────
        doc.save(`SilverPG_Invoice_${invoiceId}.pdf`);
    }

    private numberToWords(amount: number): string {
        const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
            'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        const convert = (n: number): string => {
            if (n < 20) return units[n];
            if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + units[n % 10] : '');
            if (n < 1000) return units[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
            if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
            if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
            return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
        };

        const rupees = Math.floor(amount);
        const paise = Math.round((amount - rupees) * 100);
        let result = 'Rupees ' + (rupees > 0 ? convert(rupees) : 'Zero');
        if (paise > 0) result += ' and ' + convert(paise) + ' Paise';
        return result;
    }
}
