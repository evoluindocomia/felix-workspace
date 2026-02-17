import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { EnterpriseContextService } from './enterprise-context.service';

export const enterpriseHttpInterceptor: HttpInterceptorFn = (req, next) => {
  const contextService = inject(EnterpriseContextService);
  const token = contextService.token; // Lê o Signal do contexto

  if (token) {
    const clonedReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(clonedReq);
  }

  return next(req);
};
