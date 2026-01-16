import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  let request = req;

  if (token) {
    request = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // Check if 401 and NOT on the login/refresh endpoints to avoid infinite loops
      // Also ignore if we are intentionally checking 'me' and it fails (though typically we want to refresh then too)
      if (error.status === 401 && !req.url.includes('/auth/login') && !req.url.includes('/token/refresh/')) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Token should be updated in local storage by the service
            const newToken = authService.getToken();
            if (newToken) {
              return next(req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`
                }
              }));
            }
            return throwError(() => error);
          }),
          catchError((refreshErr) => {
            // Refresh failed, the service handles logout
            return throwError(() => refreshErr);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
