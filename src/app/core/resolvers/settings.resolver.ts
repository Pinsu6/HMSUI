import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { CurrencyService, CurrencyDto } from '../services/currency.service';
import { AddServicesService, ServiceDto } from '../services/add-services.service';
import { RoomTypeService, RoomTypeDto } from '../services/room-type.service';
import { HotelService, HotelInformationDto } from '../services/hotel.service';

export type SettingsResolvedData = {
  currencies: CurrencyDto[];
  services: ServiceDto[];
  roomTypes: RoomTypeDto[];
  hotelInfo: HotelInformationDto;
};

export const settingsResolver: ResolveFn<SettingsResolvedData> = async () => {
  const currencyService = inject(CurrencyService);
  const addServicesService = inject(AddServicesService);
  const roomTypeService = inject(RoomTypeService);
  const hotelService = inject(HotelService);

  // Fetch all data in parallel for faster loading
  const [currencies, services, roomTypes, hotelInfo] = await Promise.all([
    currencyService.getCurrencies(),
    addServicesService.getServices(),
    roomTypeService.getRoomTypes(),
    hotelService.getHotelInformation()
  ]);

  return { currencies, services, roomTypes, hotelInfo };
};
