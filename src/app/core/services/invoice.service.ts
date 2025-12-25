import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Invoice, CreateInvoiceDto } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Create a new invoice for a booking
   * POST /api/Invoice/AddInvoice
   */
  async createInvoice(dto: CreateInvoiceDto): Promise<any> {
    return await firstValueFrom(this.http.post<any>(`${this.apiUrl}/Invoice/AddInvoice`, dto));
  }

  /**
   * Get invoice(s) - can filter by various parameters
   * POST /api/Invoice/getInvoice
   */
  async getInvoices(bookingId?: number, invoiceId?: number): Promise<Invoice[]> {
    const payload: any = {
      page: 0,
      pageSize: 0,
      invoiceId: invoiceId || 0,
      bookingId: bookingId || 0,
      invoiceNumber: '',
      pdfPath: '',
      createdOn: null,
      guestName: '',
      guestMobile: '',
      guestEmail: '',
      idProofType: '',
      idProofNumber: '',
      roomNumber: '',
      roomType: '',
      checkInDate: null,
      checkOutDate: null,
      adults: 0,
      children: 0,
      totalNights: 0,
      roomRate: 0,
      subTotal: 0,
      taxPercentage: 0,
      taxAmount: 0,
      discount: 0,
      grandTotal: 0,
      paymentStatus: '',
      paymentMethod: '',
      additionalCharges: []
    };

    const response: any = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/Invoice/getInvoice`, payload));
    const data = response.responseData ? JSON.parse(response.responseData) : response;

    // Map PascalCase API response to camelCase model
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        invoiceId: item.InvoiceId || item.invoiceId,
        bookingId: item.InvoiceBookingId || item.BookingId || item.bookingId,
        invoiceNumber: item.InvoiceNumber || item.invoiceNumber,
        pdfPath: item.PdfPath || item.pdfPath,
        createdOn: item.InvoiceCreatedOn
          ? new Date(item.InvoiceCreatedOn)
          : (item.CreatedOn ? new Date(item.CreatedOn) : (item.createdOn ? new Date(item.createdOn) : undefined)),
        // Map Room and Guest for later lookup
        roomId: item.RoomId || item.roomId,
        guestId: item.GuestId || item.guestId,
        guestName: item.GuestName || item.guestName,
        guestMobile: item.GuestMobile || item.guestMobile,
        guestEmail: item.GuestEmail || item.guestEmail,
        idProofType: item.IdProofType || item.idProofType,
        idProofNumber: item.IdProofNumber || item.idProofNumber,
        roomNumber: item.RoomNumber || item.roomNumber,
        roomType: item.RoomType || item.roomType,
        roomRate: item.BaseRate || item.RoomRate || item.roomRate || 0,
        // Use CheckInTime/ExpectedCheckOutTime if CheckInDate/CheckOutDate not available
        checkInDate: item.CheckInDate ? new Date(item.CheckInDate) : (item.CheckInTime ? new Date(item.CheckInTime) : undefined),
        checkOutDate: item.CheckOutDate ? new Date(item.CheckOutDate) : (item.ExpectedCheckOutTime ? new Date(item.ExpectedCheckOutTime) : undefined),
        adults: item.Adults || item.adults || 0,
        children: item.Children || item.children || 0,
        totalNights: item.TotalNights || item.totalNights || 0,
        subTotal: item.SubTotal || item.subTotal || 0,
        taxPercentage: item.TaxPercentage || item.taxPercentage || 18,
        taxAmount: item.TaxAmount || item.taxAmount || 0,
        discount: item.Discount || item.discount || 0,
        grandTotal: item.TotalAmount || item.GrandTotal || item.grandTotal || 0,
        paymentStatus: item.PaymentStatus || item.paymentStatus || 'Paid',
        paymentMethod: item.PaymentMethod || item.paymentMethod,
        additionalCharges: (item.AdditionalCharges || item.additionalCharges || []).map((charge: any) => ({
          description: charge.Description || charge.description,
          quantity: charge.Quantity || charge.quantity || 0,
          rate: charge.Rate || charge.rate || 0,
          amount: charge.Amount || charge.amount || 0
        })),
        // Legacy field mappings for backward compatibility
        invoiceDate: item.CreatedOn ? new Date(item.CreatedOn) : undefined,
        totalAmount: item.GrandTotal || item.grandTotal || 0,
        discountAmount: item.Discount || item.discount || 0,
        netAmount: item.GrandTotal || item.grandTotal || 0,
        status: item.PaymentStatus || item.paymentStatus || 'Paid',
        createdAt: item.CreatedOn ? new Date(item.CreatedOn) : undefined
      }));
    }
    return [];
  }

  /**
   * Get single invoice by bookingId
   */
  async getInvoiceByBookingId(bookingId: number): Promise<Invoice | null> {
    const invoices = await this.getInvoices(bookingId);
    return invoices.length > 0 ? invoices[0] : null;
  }

  /**
   * Download PDF from the pdfPath
   * Opens PDF in a new tab or triggers download
   */
  downloadInvoicePdf(pdfPath: string): void {
    if (pdfPath) {
      // If pdfPath is a relative path, prepend the base URL
      const fullUrl = pdfPath.startsWith('http') ? pdfPath : `${environment.apiUrl}/${pdfPath}`;
      window.open(fullUrl, '_blank');
    }
  }

  /**
   * Download PDF as blob for saving
   */
  async downloadInvoicePdfAsBlob(pdfPath: string): Promise<Blob> {
    const fullUrl = pdfPath.startsWith('http') ? pdfPath : `${environment.apiUrl}/${pdfPath}`;
    return await firstValueFrom(this.http.get(fullUrl, { responseType: 'blob' }));
  }
}
