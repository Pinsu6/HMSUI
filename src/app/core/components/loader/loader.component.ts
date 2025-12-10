import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [NgIf],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css'
})
export class LoaderComponent {
  private readonly loadingService = inject(LoadingService);
  readonly isLoading = this.loadingService.isLoading;
}

