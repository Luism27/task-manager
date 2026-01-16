import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';
import { TaskListComponent } from '../task-list/task-list.component';
import { NavComponent } from "../navigator/nav.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TaskListComponent, NavComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-nav></app-nav>

      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <app-task-list></app-task-list>
        </div>
      </main>
    </div>
  `
})
export class DashboardComponent {
  private authService = inject(AuthService);

  user$ = this.authService.user$;
}
