import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private activeRequests = 0;
  readonly isLoading = signal(false);

  startRequest(): void {
    this.activeRequests += 1;
    setTimeout(() => {
      this.isLoading.set(true);
    });
  }

  endRequest(): void {
    this.activeRequests = Math.max(this.activeRequests - 1, 0);
    if (this.activeRequests === 0) {
      setTimeout(() => {
        this.isLoading.set(false);
      });
    }
  }
}

