import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';

import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AdminUserTasksComponent } from './components/admin-user-tasks/admin-user-tasks.component';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: DashboardComponent, canActivate: [authGuard] },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'admin/users/:id/tasks',
    component: AdminUserTasksComponent,
    canActivate: [authGuard, adminGuard]
  },
  { path: '**', redirectTo: '' }
];
