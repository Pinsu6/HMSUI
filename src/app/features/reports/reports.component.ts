import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reports',
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent {
  // Date Range
  dateFrom = '';
  dateTo = '';

  // Active Report Tab
  activeTab = 'revenue';

  // Revenue Data
  revenueData = {
    totalRevenue: 0,
    roomRevenue: 0,
    foodRevenue: 0,
    otherRevenue: 0,
    dailyAverage: 0,
    growth: 0
  };

  // Occupancy Data
  occupancyData = {
    averageOccupancy: 0,
    peakOccupancy: 0,
    lowOccupancy: 0,
    totalRoomNights: 0,
    occupiedNights: 0
  };

  // Payment Summary
  paymentSummary: any[] = [];

  // Recent Transactions
  recentTransactions: any[] = [];

  // GST Summary
  gstSummary = {
    totalTaxable: 0,
    cgst: 0,
    sgst: 0,
    totalGst: 0,
    totalWithGst: 0
  };

  // Export Report
  exportReport(format: string) {
    alert(`Exporting ${this.activeTab} report as ${format.toUpperCase()}`);
  }

  // Print Report
  printReport() {
    alert(`Printing ${this.activeTab} report`);
  }
}
