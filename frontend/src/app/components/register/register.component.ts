import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div class="bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
          <div class="text-center mb-10">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl shadow-lg mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 class="text-3xl font-bold text-gray-900 tracking-tight">Crea tu cuenta</h2>
            <p class="mt-2 text-sm text-gray-500">Únete a nuestra plataforma de gestión de tareas</p>
          </div>
          
          <div *ngIf="error" class="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-md flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <span class="text-sm text-red-700 font-medium">{{ error }}</span>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" class="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                <input 
                  id="first_name" 
                  type="text" 
                  formControlName="first_name"
                  class="block w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                  placeholder="Juan"
                >
              </div>
              <div>
                <label htmlFor="last_name" class="block text-sm font-semibold text-gray-700 mb-1">Apellido</label>
                <input 
                  id="last_name" 
                  type="text" 
                  formControlName="last_name"
                  class="block w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                  placeholder="Pérez"
                >
              </div>
            </div>

            <div>
              <label htmlFor="username" class="block text-sm font-semibold text-gray-700 mb-1">Nombre de usuario</label>
              <input 
                id="username" 
                type="text" 
                formControlName="username"
                class="block w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                placeholder="juanperez123"
                [class.border-red-500]="isFieldInvalid('username')"
              >
              <p *ngIf="isFieldInvalid('username')" class="mt-1 text-xs text-red-500">El nombre de usuario es requerido</p>
            </div>

            <div>
              <label htmlFor="email" class="block text-sm font-semibold text-gray-700 mb-1">Correo electrónico</label>
              <input 
                id="email" 
                type="email" 
                formControlName="email"
                class="block w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                placeholder="juan@ejemplo.com"
                [class.border-red-500]="isFieldInvalid('email')"
              >
              <p *ngIf="isFieldInvalid('email')" class="mt-1 text-xs text-red-500">Correo electrónico inválido</p>
            </div>

            <div>
              <label htmlFor="password" class="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
              <input 
                id="password" 
                type="password" 
                formControlName="password"
                class="block w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                placeholder="••••••••"
                [class.border-red-500]="isFieldInvalid('password')"
              >
              <p *ngIf="isFieldInvalid('password')" class="mt-1 text-xs text-red-500">Mínimo 8 caracteres</p>
            </div>

            <div>
              <label htmlFor="password2" class="block text-sm font-semibold text-gray-700 mb-1">Confirmar contraseña</label>
              <input 
                id="password2" 
                type="password" 
                formControlName="password2"
                class="block w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                placeholder="••••••••"
                [class.border-red-500]="isFieldInvalid('password2') || (registerForm.errors?.['mismatch'] && registerForm.get('password2')?.touched)"
              >
              <p *ngIf="registerForm.errors?.['mismatch'] && registerForm.get('password2')?.touched" class="mt-1 text-xs text-red-500">
                Las contraseñas no coinciden
              </p>
            </div>

            <button 
              type="submit" 
              [disabled]="registerForm.invalid || isLoading()"
              class="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 shadow-lg shadow-blue-200 mt-6"
            >
              <span *ngIf="isLoading()" class="mr-2">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ isLoading() ? 'Creando cuenta...' : 'Crear cuenta' }}
            </button>
          </form>
        </div>
        <p class="text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta? 
          <a routerLink="/login" class="font-bold text-blue-600 hover:text-blue-500 transition-colors">Inicia sesión</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm = this.fb.group({
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password2: ['', [Validators.required]],
    first_name: [''],
    last_name: ['']
  }, { validators: this.passwordMatchValidator });

  isLoading = signal<boolean>(false);
  error = '';

  passwordMatchValidator(g: any) {
    return g.get('password').value === g.get('password2').value
      ? null : { 'mismatch': true };
  }

  isFieldInvalid(name: string): boolean {
    const field = this.registerForm.get(name);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.error = '';

      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          // Después del registro exitoso, podemos iniciar sesión automáticamente 
          // o redirigir al login. En este caso redirigimos al login por simplicidad 
          // o a la raíz si el backend devuelve tokens.
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al crear la cuenta. Intente con otro usuario.';
          this.isLoading.set(false);
          console.error(err);
        }
      });
    }
  }
}
