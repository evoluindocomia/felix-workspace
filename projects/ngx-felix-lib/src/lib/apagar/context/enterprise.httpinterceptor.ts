// projects/ngx-felix-lib/src/lib/repository/enterprise.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { EnterpriseContextService } from './enterprise.context.service';

export const enterpriseHttpInterceptor: HttpInterceptorFn = (req, next) => {
  const contextService = inject(EnterpriseContextService);
  const token = contextService.token;

  // Se o token existe no contexto dinâmico do MFE, injeta no Header
  if (token) {
    const clonedReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(clonedReq);
  }

  return next(req);
};
