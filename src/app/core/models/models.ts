// Room Types
export interface RoomType {
  typeId: number;
  name: string;
  baseRate: number;
  maxGuests: number;
  description?: string;
}

// Rooms
export interface Room {
  roomId: number;
  number: string;
  floor: number;
  typeId: number;
  status: 'Vacant' | 'Occupied' | 'Dirty' | 'Maintenance';
  roomType?: RoomType;
}

// Guests
export interface Guest {
  guestId: number;
  fullName: string;
  mobile: string;
  email?: string;
  idType?: string;
  idNumber?: string;
  address?: string;
  city?: string;
  country?: string;
}

// Bookings
export interface Booking {
  bookingId: number;
  guestId: number;
  roomId: number;
  checkInTime: Date;
  expectedCheckOutTime: Date;
  actualCheckOutTime?: Date;
  adults: number;
  children: number;
  status: 'Active' | 'Completed' | 'Cancelled';
  totalAmount: number;
  taxAmount: number;
  room?: Room;
  guest?: Guest;
}

// Charges
export interface Charge {
  chargeId: number;
  bookingId: number;
  description: string;
  category: string;
  amount: number;
  date: Date;
}

// Payments
export interface Payment {
  paymentId: number;
  bookingId: number;
  amount: number;
  mode: string;
  date: Date;
}

// Dashboard Stats
export interface DashboardStats {
  totalRooms: number;
  vacantRooms: number;
  occupiedRooms: number;
  dirtyRooms: number;
  maintenanceRooms: number;
  todaysCheckIns: number;
  todaysCheckOuts: number;
  totalGuestsInHouse: number;
}

// DTOs for Check-in
export interface GuestDto {
  fullName: string;
  mobile: string;
  email?: string;
  idType?: string;
  idNumber?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface CheckInDto {
  roomId: number;
  guest: GuestDto;
  checkInTime: Date;
  expectedCheckOutTime: Date;
  adults: number;
  children: number;
  advancePayment: number;
  paymentMode: string;
}


// DTO for Check-out
export interface CheckOutDto {
  discountAmount: number;
  paymentAmount: number;
  paymentMode: string;
}

// WiFi Logs
export interface WiFiLog {
  logId: number;
  bookingId: number;
  roomNumber: string;
  apiAction: string;
  status: string;
  timestamp: Date;
}

// Invoice
export interface Invoice {
  invoiceId: number;
  bookingId: number;
  roomId?: number;
  guestId?: number;
  invoiceNumber?: string;
  pdfPath?: string;
  createdOn?: Date;
  guestName?: string;
  guestMobile?: string;
  guestEmail?: string;
  idProofType?: string;
  idProofNumber?: string;
  roomNumber?: string;
  roomType?: string;
  checkInDate?: Date;
  checkOutDate?: Date;
  adults?: number;
  children?: number;
  totalNights?: number;
  roomRate?: number;
  subTotal?: number;
  taxPercentage?: number;
  taxAmount?: number;
  discount?: number;
  grandTotal?: number;
  paymentStatus?: string;
  paymentMethod?: string;
  additionalCharges?: AdditionalChargeDto[];
  // Legacy fields for backward compatibility
  invoiceDate?: Date;
  totalAmount?: number;
  discountAmount?: number;
  netAmount?: number;
  status?: string;
  createdAt?: Date;
}

// Get Invoice Request DTO
export interface GetInvoiceDto {
  page: number;
  pageSize: number;
  invoiceId: number;
  bookingId: number;
  invoiceNumber: string;
  pdfPath: string;
  createdOn: string;
  guestName: string;
  guestMobile: string;
  guestEmail: string;
  idProofType: string;
  idProofNumber: string;
  roomNumber: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  totalNights: number;
  roomRate: number;
  subTotal: number;
  taxPercentage: number;
  taxAmount: number;
  discount: number;
  grandTotal: number;
  paymentStatus: string;
  paymentMethod: string;
  additionalCharges: AdditionalChargeDto[];
}

// Additional Charge for Invoice
export interface AdditionalChargeDto {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

// Invoice Create DTO
export interface CreateInvoiceDto {
  bookingId: number;
  invoiceNumber: string;
  pdfPath: string;
  createdOn: string;
  guestName: string;
  guestMobile: string;
  guestEmail: string;
  idProofType: string;
  idProofNumber: string;
  roomNumber: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  totalNights: number;
  roomRate: number;
  subTotal: number;
  taxPercentage: number;
  taxAmount: number;
  discount: number;
  grandTotal: number;
  paymentStatus: string;
  paymentMethod: string;
  additionalCharges: AdditionalChargeDto[];
}
