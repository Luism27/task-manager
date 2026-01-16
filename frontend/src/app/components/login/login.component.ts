import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Bienvenido</h2>
        </div>
        
        <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span class="block sm:inline">{{ error }}</span>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          <div class="rounded-md shadow-sm -space-y-px">
            <div class="mb-4">
              <label htmlFor="username" class="sr-only">Usuario</label>
              <input 
                id="username" 
                type="text" 
                formControlName="username"
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                placeholder="Usuario"
                [class.border-red-500]="isFieldInvalid('username')"
              >
              <p *ngIf="isFieldInvalid('username')" class="text-red-500 text-xs italic mt-1">El usuario es obligatorio</p>
            </div>
            <div>
              <label htmlFor="password" class="sr-only">Contraseña</label>
              <input 
                id="password" 
                type="password" 
                formControlName="password"
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                placeholder="Contraseña"
                [class.border-red-500]="isFieldInvalid('password')"
              >
              <p *ngIf="isFieldInvalid('password')" class="text-red-500 text-xs italic mt-1">La contraseña es obligatoria</p>
            </div>
          </div>

          <button 
            type="submit" 
            [disabled]="loginForm.invalid || isLoading()"
            class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {{ isLoading() ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </button>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  isLoading = signal<boolean>(false);
  error = '';

  isFieldInvalid(name: string): boolean {
    const field = this.loginForm.get(name);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  ngOnInit() {
    if (this.authService.getToken()) {
      this.router.navigate(['/']);
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.error = '';

      this.authService.login(this.loginForm.value as any).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.error = 'Credenciales inválidas o error del servidor';
          this.isLoading.set(false);
          console.error(err);
        }
      });
    }
  }
}
