import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IResource, IRepository, QueryParams } from './repository.interfaces';
import { QueryBuilder } from './query-builder';
import { API_CONFIG } from './api-config.token';
import { EnterpriseContextService } from '../context/enterprise-context.service';

export abstract class BaseRepository<T extends IResource> implements IRepository<T> {
  protected abstract resourceEndpoint: string; // Ex: 'produtos' ou 'usuarios'

  // Injeção moderna (evita construtores gigantes nas classes filhas)
  protected http = inject(HttpClient);
  protected config = inject(API_CONFIG);
  protected contextService = inject(EnterpriseContextService);

  // Lógica de descoberta da URL da API
  protected get url(): string {
    const dynamicUrl = this.contextService.dynamicApiUrl;
    const baseUrl = dynamicUrl || this.config.baseUrl;

    if (!baseUrl) {
       throw new Error('[ngx-felix-lib] URL da API não configurada.');
    }

    const base = baseUrl.replace(/\/$/, '');
    const endpoint = this.resourceEndpoint.replace(/^\//, '');
    return `${base}/${endpoint}`;
  }

  getById(id: string | number): Observable<T> {
    return this.http.get<T>(`${this.url}/${id}`);
  }

  getAll(query?: QueryParams): Observable<T[]> {
    const params = QueryBuilder.toHttpParams(query || {});
    return this.http.get<any>(this.url, { params }).pipe(
      map(res => Array.isArray(res) ? res : (res.data || res.items || res))
    );
  }

  create(item: T): Observable<T> {
    return this.http.post<T>(this.url, item);
  }

  update(id: string | number, item: T): Observable<T> {
    return this.http.put<T>(`${this.url}/${id}`, item);
  }

  delete(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
