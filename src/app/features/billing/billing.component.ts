import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../core/services/invoice.service';
import { BookingService } from '../../core/services/booking.service';
import { SettingsService } from '../../core/services/settings.service';
import { Invoice } from '../../core/models/models';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.css'
})
export class BillingComponent implements OnInit {
  // Filters
  statusFilter = 'all';
  dateFilter = 'all';
  searchQuery = '';

  // Invoices
  invoices: Invoice[] = [];
  loading = false;

  constructor(
    private invoiceService: InvoiceService,
    private bookingService: BookingService,
    public settingsService: SettingsService
  ) { }

  ngOnInit() {
    this.loadInvoices();
  }

  async loadInvoices() {
    try {
      this.loading = true;
      const [invoices, bookings] = await Promise.all([
        this.invoiceService.getInvoices(),
        this.bookingService.getBookings()
      ]);

      const bookingMap = new Map(bookings.map(b => [b.bookingId, b]));

      // Merge booking info so UI can show guest/room/stay/amount even when invoice API only returns bookingId
      this.invoices = invoices.map(inv => {
        const booking = bookingMap.get(inv.bookingId);
        if (!booking) {
          return inv;
        }

        return {
          ...inv,
          guestId: inv.guestId ?? booking.guestId,
          roomId: inv.roomId ?? booking.roomId,
          guestName: inv.guestName || booking.guest?.fullName,
          roomNumber: inv.roomNumber || booking.room?.number,
          checkInDate: inv.checkInDate || booking.checkInTime,
          checkOutDate: inv.checkOutDate || booking.expectedCheckOutTime,
          adults: inv.adults ?? booking.adults,
          children: inv.children ?? booking.children,
          grandTotal: inv.grandTotal ?? booking.totalAmount
        };
      });
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      this.loading = false;
    }
  }

  // Stats
  get stats() {
    return {
      totalRevenue: this.invoices
        .filter(inv => (inv.paymentStatus || inv.status || 'Paid') === 'Paid')
        .reduce((sum, inv) => sum + (inv.grandTotal || inv.netAmount || 0), 0),
      pending: this.invoices
        .filter(inv => (inv.paymentStatus || inv.status) === 'Pending')
        .reduce((sum, inv) => sum + (inv.grandTotal || inv.netAmount || 0), 0),
      partial: this.invoices
        .filter(inv => (inv.paymentStatus || inv.status) === 'Partial')
        .reduce((sum, inv) => sum + (inv.grandTotal || inv.netAmount || 0), 0),
      invoiceCount: this.invoices.length
    };
  }

  // Filtered Invoices
  get filteredInvoices(): Invoice[] {
    return this.invoices.filter(invoice => {
      const status = invoice.paymentStatus || invoice.status || 'Paid';
      const matchesStatus = this.statusFilter === 'all' || status.toLowerCase() === this.statusFilter.toLowerCase();

      const matchesSearch = !this.searchQuery ||
        (invoice.invoiceNumber?.toLowerCase().includes(this.searchQuery.toLowerCase()) ?? false) ||
        (invoice.guestName?.toLowerCase().includes(this.searchQuery.toLowerCase()) ?? false) ||
        (invoice.roomNumber?.toString().includes(this.searchQuery) ?? false);

      return matchesStatus && matchesSearch;
    });
  }

  // Methods
  viewInvoice(invoice: Invoice) {
    if (invoice.pdfPath) {
      this.invoiceService.downloadInvoicePdf(invoice.pdfPath);
    } else {
      alert('PDF not available for this invoice.');
    }
  }

  downloadInvoice(invoice: Invoice) {
    if (invoice.pdfPath) {
      this.invoiceService.downloadInvoicePdf(invoice.pdfPath);
    } else {
      alert('PDF path is missing for this invoice.');
    }
  }

  sendInvoice(invoice: Invoice) {
    alert(`Sending Invoice ${invoice.invoiceNumber} functionality coming soon!`);
  }

  printInvoice(invoice: Invoice) {
    if (invoice.pdfPath) {
      this.invoiceService.downloadInvoicePdf(invoice.pdfPath);
    } else {
      alert('PDF not available for printing.');
    }
  }
}
