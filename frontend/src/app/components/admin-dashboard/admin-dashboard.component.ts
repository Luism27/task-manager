import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../services/auth.service';
import { NavComponent } from "../navigator/nav.component";

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NavComponent],
  template: `
    <app-nav title="Admin Dashboard"></app-nav>
    @if (error()) {
      <div class="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-md flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <span class="text-sm text-red-700 font-medium">{{ error() }}</span>
      </div>
    }
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        
        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul role="list" class="divide-y divide-gray-200">
            <li *ngFor="let user of users()" class="px-4 py-4 sm:px-6 hover:bg-gray-50 transition">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="text-sm font-medium text-indigo-600 truncate mr-2">
                    {{ user.username }}
                  </div>
                  <span *ngIf="user.is_staff" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Admin
                  </span>
                </div>
                <div class="flex items-center space-x-4">
                  <a [routerLink]="['/admin/users', user.id, 'tasks']" class="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                    Ver Tareas
                  </a>
                  
                  <button *ngIf="!user.is_staff" (click)="promoteUser(user)" class="text-green-600 hover:text-green-900 text-sm font-medium">
                    Hacer Admin
                  </button>
                  <button *ngIf="user.is_staff" (click)="demoteUser(user)" class="text-orange-600 hover:text-orange-900 text-sm font-medium">
                    Quitar Admin
                  </button>
                  
                  <button (click)="deleteUser(user)" class="text-red-600 hover:text-red-900 text-sm font-medium">
                    Eliminar
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private userService = inject(UserService);
  users = signal<User[]>([]);
  error = signal<string>('');

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al obtener los usuarios');
      }
    });
  }

  promoteUser(user: User) {
    if (confirm(`Promote ${user.username} to admin?`)) {
      this.userService.makeAdmin(user.id!).subscribe(() => {
        this.loadUsers();
      });
    }
  }

  demoteUser(user: User) {
    if (confirm(`Remove admin rights from ${user.username}?`)) {
      this.userService.removeAdmin(user.id!).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (err) => {
          this.error.set(err.error?.error || 'Error al quitar los permisos de administrador');
          setTimeout(() => {
            this.error.set('');
          }, 3000);
        }
      });
    }
  }

  deleteUser(user: User) {
    if (confirm(`Permanently delete ${user.username}?`)) {
      this.userService.deleteUser(user.id!).subscribe(() => {
        this.users.update((users) => users.filter(u => u.id !== user.id));
      });
    }
  }
}
