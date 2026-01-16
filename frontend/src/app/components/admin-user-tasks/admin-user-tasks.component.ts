import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TaskListComponent } from '../task-list/task-list.component';
import { UserService } from '../../services/user.service';
import { NavComponent } from "../navigator/nav.component";

@Component({
  selector: 'app-admin-user-tasks',
  standalone: true,
  imports: [CommonModule, TaskListComponent, RouterModule, NavComponent],
  template: `
    <app-nav title="Admin Dashboard"></app-nav>
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-800">
            Tareas del Usuario: <span class="text-indigo-600">{{ username() }}</span>
          </h2>
          <a routerLink="/admin" class="text-gray-600 hover:text-gray-900 font-medium">
            &larr; Volver a Usuarios
          </a>
        </div>
        
        <app-task-list [userId]="userId"></app-task-list>
      </div>
    </div>
  `
})
export class AdminUserTasksComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService); // To get username if needed, but maybe just ID is enough

  userId!: number;
  username = signal<string>('...loading');

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.userId = +id;
        // Optionally fetch user details to show name
        this.userService.getUser(this.userId).subscribe(user => {
          this.username.set(user.username);
        });
      }
    });
  }
}
