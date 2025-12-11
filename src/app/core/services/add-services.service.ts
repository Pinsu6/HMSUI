import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ServiceDto {
  serviceId?: number;
  serviceName: string;
  description: string;
  rate: number;
  isActive: boolean;
  createdOn?: string;
  updatedOn?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AddServicesService {
  private apiUrl = `${environment.apiUrl}/AddServices`;

  constructor(private http: HttpClient) { }

  // Insert or Update Service
  async insertUpdateService(service: ServiceDto): Promise<any> {
    const payload = {
      serviceId: service.serviceId || 0,
      serviceName: service.serviceName,
      description: service.description || '',
      rate: service.rate,
      isActive: service.isActive,
      createdOn: service.createdOn || new Date().toISOString(),
      updatedOn: new Date().toISOString()
    };

    return await firstValueFrom(this.http.post(`${this.apiUrl}/InsertUpdateService`, payload));
  }

  // Get all services
  async getServices(): Promise<ServiceDto[]> {
    try {
      const response: any = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/GetServices`, {}));

      // Parse responseData if it exists (API returns data as JSON string)
      const data = response.responseData ? JSON.parse(response.responseData) : response;

      console.log('GetServices raw response:', response);
      console.log('GetServices parsed data:', data);

      // Map PascalCase API response to camelCase ServiceDto
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          serviceId: item.ServiceId || item.serviceId,
          serviceName: item.ServiceName || item.serviceName,
          description: item.Description || item.description || '',
          rate: item.Rate || item.rate || 0,
          isActive: item.IsActive !== undefined ? item.IsActive : (item.isActive !== undefined ? item.isActive : true),
          createdOn: item.CreatedOn || item.createdOn,
          updatedOn: item.UpdatedOn || item.updatedOn
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch services:', error);
      return [];
    }
  }

  // Delete service
  async deleteService(serviceId: number): Promise<any> {
    const payload = { serviceId: serviceId };
    return await firstValueFrom(this.http.post(`${this.apiUrl}/DeleteService`, payload));
  }
}

