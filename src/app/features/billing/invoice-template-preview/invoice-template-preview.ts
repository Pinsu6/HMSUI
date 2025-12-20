import { Component } from '@angular/core';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-invoice-template-preview',
  imports: [],
  templateUrl: './invoice-template-preview.html',
  styleUrl: './invoice-template-preview.css',
})
export class InvoiceTemplatePreview {
  constructor(public settingsService: SettingsService) { }
}
