import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthMockService {
  constructor() {}

  getMockToken(): string {
    return 'mock-jwt-token-h1b2c3d4e5f6g7h8i9j0';
  }

  getApiUrl(): string {
    return 'https://api.empresa.fake.com.br/v1';
  }
}
