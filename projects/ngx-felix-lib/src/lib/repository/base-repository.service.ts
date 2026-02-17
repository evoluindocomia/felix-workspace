import { HttpClient } from '@angular/common/http';
import { Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IResource, IRepository, QueryParams } from './repository.interfaces';
import { QueryBuilder } from './query-builder';
import { API_CONFIG, ApiConfig } from './api-config.token';

export abstract class BaseRepository<T extends IResource> implements IRepository<T> {
  protected abstract resourceEndpoint: string;

  constructor(
    protected http: HttpClient,
    @Inject(API_CONFIG) protected config: ApiConfig
  ) {}

  protected get url(): string {
    const base = this.config.baseUrl.replace(/\/$/, '');
    const endpoint = this.resourceEndpoint.replace(/^\//, '');
    return `${base}/${endpoint}`;
  }

  getById(id: string | number): Observable<T> {
    return this.http.get<T>(`${this.url}/${id}`).pipe(
      map(response => this.adapt(response))
    );
  }

  getAll(query?: QueryParams): Observable<T[]> {
    const params = QueryBuilder.toHttpParams(query || {});
    return this.http.get<T[]>(this.url, { params }).pipe(
      map(response => this.adaptList(response))
    );
  }

  search(query?: QueryParams): Observable<any> {
    const params = QueryBuilder.toHttpParams(query || {});
    return this.http.get<any>(this.url, { params });
  }

  create(item: T): Observable<T> {
    return this.http.post<T>(this.url, item).pipe(
       map(response => this.adapt(response))
    );
  }

  update(id: string | number, item: T): Observable<T> {
    return this.http.put<T>(`${this.url}/${id}`, item).pipe(
       map(response => this.adapt(response))
    );
  }

  delete(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  protected adapt(data: any): T {
    return this.config.responseAdapter ? this.config.responseAdapter(data) : data;
  }

  protected adaptList(data: any): T[] {
     if (Array.isArray(data)) return data;
     if (data.data && Array.isArray(data.data)) return data.data;
     if (data.items && Array.isArray(data.items)) return data.items;
     return data;
  }
}
