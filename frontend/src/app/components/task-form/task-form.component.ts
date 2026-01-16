import { Component, inject, OnInit, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TaskService, Task } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div id="modal-overlay" class="fixed bg-black/50 inset-0 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl overflow-hidden max-w-md w-full m-4">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 class="text-xl font-bold text-gray-800">{{ isEditMode ? 'Editar Tarea' : 'Crear Nueva Tarea' }}</h2>
          <button (click)="onClose()" class="text-gray-500 hover:text-gray-700">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="p-6">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Título</label>
            <input 
              type="text" 
              formControlName="title"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              [class.border-red-500]="isFieldInvalid('title')"
            >
            <p *ngIf="isFieldInvalid('title')" class="text-red-500 text-xs italic mt-1">El título es obligatorio</p>
          </div>

          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2">Descripción</label>
            <textarea 
              formControlName="description"
              rows="4"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              [class.border-red-500]="isFieldInvalid('description')"
            ></textarea>
            <p *ngIf="isFieldInvalid('description')" class="text-red-500 text-xs italic mt-1">La descripción es obligatoria</p>
          </div>

          <div class="flex items-center justify-end gap-3">
            <button type="button" (click)="onClose()" class="text-gray-600 hover:text-gray-800 font-medium">Cancelar</button>
            <button 
              type="submit" 
              [disabled]="taskForm.invalid || isLoading()"
              class="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {{ isLoading() ? 'Guardando...' : 'Guardar Tarea' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class TaskFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private authService = inject(AuthService);

  @Input() userId?: number;

  @Input() set task(value: Task | null) {
    if (value) {
      this.isEditMode = true;
      this.taskId = value.id!;
      this.taskForm.patchValue({
        title: value.title,
        description: value.description
      });
    } else {
      this.isEditMode = false;
      this.taskId = null;
      this.taskForm.reset();
    }
  }

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  taskForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required]
  });

  isEditMode = false;
  taskId: number | null = null;
  isLoading = signal<boolean>(false);
  currentUser: any;

  ngOnInit() {
    this.authService.user$.subscribe(user => this.currentUser = user);
  }

  isFieldInvalid(name: string): boolean {
    const field = this.taskForm.get(name);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onClose() {
    this.close.emit();
  }

  onSubmit() {
    if (this.taskForm.valid) {
      this.isLoading.update(() => true)
      const taskData = {
        ...this.taskForm.value,
        user: this.userId || this.currentUser?.id
      } as Task;

      const request = this.isEditMode && this.taskId
        ? this.taskService.updateTask(this.taskId, taskData)
        : this.taskService.createTask(taskData);

      request.subscribe({
        next: () => {
          this.isLoading.update(() => false)
          this.saved.emit();
        },
        error: (err) => {
          console.error('Error saving task', err);
          this.isLoading.update(() => false)
        }
      });
    }
  }
}
