import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WiFiLogService } from '../../core/services/wifi-log.service';
import { WiFiLog } from '../../core/models/models';

@Component({
  selector: 'app-wifi-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wifi-logs.component.html',
  styleUrl: './wifi-logs.component.css'
})
export class WiFiLogsComponent implements OnInit {
  logs: WiFiLog[] = [];
  isLoading = true;

  constructor(
    private wifiLogService: WiFiLogService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadLogs();
  }

  async loadLogs() {
    try {
      this.isLoading = true;
      const data = await this.wifiLogService.getLogs();
      this.logs = data;
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges(); // Force change detection to update view
    }
  }
}
