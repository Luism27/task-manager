import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map, filter, take, switchMap } from 'rxjs';
import { of } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.getToken()) {
    return router.createUrlTree(['/login']);
  }

  return authService.user$.pipe(
    filter(user => user !== null),
    take(1),
    map(user => {
      // Check for is_superuser or is_staff depending on what API returns and what interface says.
      // Interface says is_staff. Let's use that.
      if (user && (user.is_staff || user.is_superuser)) {
        return true;
      }
      return router.createUrlTree(['/']);
    })
  );
};
