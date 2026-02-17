import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

export interface IResource {
  id?: string | number;
}

export interface PageData<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
}

export interface QueryParams {
  filter?: { [key: string]: string | number | boolean };
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  [key: string]: any;
}

export interface IRepository<T extends IResource> {
  getById(id: string | number): Observable<T>;
  getAll(query?: QueryParams): Observable<T[] | PageData<T>>;
  create(item: T): Observable<T>;
  update(id: string | number, item: T): Observable<T>;
  delete(id: string | number): Observable<void>;
}
