import { Component, inject, Input } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <nav class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex">
              <div class="flex-shrink-0 flex items-center">
                <h1 class="text-xl font-bold text-gray-800 mr-8">{{ title }}</h1>
              </div>
              <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                <!-- Dashboard Tab -->
                <a 
                  routerLink="/" 
                  routerLinkActive="border-indigo-500 text-gray-900" 
                  [routerLinkActiveOptions]="{exact: true}"
                  class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Mis Tareas
                </a>

                <!-- Admin Tab -->
                <a 
                  *ngIf="(user$ | async)?.is_staff"
                  routerLink="/admin" 
                  routerLinkActive="border-indigo-500 text-gray-900" 
                  class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Panel de Administración
                </a>
              </div>
            </div>
            
            <div class="flex items-center">
              <span class="mr-4 text-gray-600 text-sm" *ngIf="user$ | async as user">
                {{ user.username }}
              </span>
              <button 
                (click)="logout()"
                class="ml-4 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-md text-sm font-medium transition"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>`
})
export class NavComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  @Input() title: string = 'Task Manager';

  user$ = this.authService.user$;

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}