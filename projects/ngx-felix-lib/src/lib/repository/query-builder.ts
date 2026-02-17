import { HttpParams } from '@angular/common/http';
import { QueryParams } from './repository.interfaces';

export class QueryBuilder {
  public static toHttpParams(query: QueryParams): HttpParams {
    let params = new HttpParams();
    if (!query) return params;

    if (query.page) params = params.set('_page', query.page.toString());
    if (query.pageSize) params = params.set('_limit', query.pageSize.toString());
    if (query.sort) params = params.set('_sort', query.sort);
    if (query.order) params = params.set('_order', query.order);

    if (query.filter) {
      Object.keys(query.filter).forEach(key => {
        if (query.filter![key] !== undefined && query.filter![key] !== null) {
          params = params.set(key, query.filter![key].toString());
        }
      });
    }
    return params;
  }
}
