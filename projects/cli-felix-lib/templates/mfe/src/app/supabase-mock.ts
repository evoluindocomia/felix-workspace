import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SupabaseMockService {
  constructor(private http: HttpClient) {}

  getUserData(): Observable<any> {
    // Faremos uma requisição real que será interceptada pela lib.
    // Usamos um endpoint genérico JSONPlaceholder só para simular o roundtrip HTTP real
    return this.http.get<any>('https://jsonplaceholder.typicode.com/users/1');
  }
}
