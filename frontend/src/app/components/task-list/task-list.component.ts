import { Component, inject, OnInit, Input, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskService, Task } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TaskFormComponent],
  template: `
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      <div class="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200 bg-gray-50">
        <h3 class="text-lg leading-6 font-medium text-gray-900">Mis Tareas</h3>
        <button (click)="openTaskModal(null)" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition text-sm">
          + Nueva Tarea
        </button>
      </div>
      <div *ngIf="isLoading()" class="px-4 py-12 text-center text-gray-500">
        <p>Cargando tareas...</p>
      </div>

      <ul role="list" class="divide-y divide-gray-200" *ngIf="!isLoading() && tasks.length > 0; else noTasks">
        <li *ngFor="let task of tasks">
          <div class="px-4 py-4 sm:px-6 hover:bg-gray-50 transition">
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0 pr-4 flex items-start">
                <div class="flex-shrink-0 mr-4 pt-1">
                  <input 
                    type="checkbox" 
                    [checked]="task.completed" 
                    (change)="toggleCompletion(task)"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  >
                </div>
                <div>
                  <p 
                    class="text-sm font-medium truncate" 
                    [ngClass]="{'text-gray-500 line-through': task.completed, 'text-indigo-600': !task.completed}"
                  >
                    {{ task.title }}
                  </p>
                  <div class="mt-2 text-sm text-gray-500">
                    <p class="truncate" [ngClass]="{'line-through': task.completed}">{{ task.description }}</p>
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <button (click)="openTaskModal(task)" class="text-gray-400 hover:text-blue-500">
                  <span class="sr-only">Edit</span>
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button (click)="deleteTask(task)" class="text-gray-400 hover:text-red-500">
                  <span class="sr-only">Delete</span>
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </li>
      </ul>
      <ng-template #noTasks>
        <div class="px-4 py-12 text-center text-gray-500" *ngIf="!isLoading()">
          <p>Tarea no encontrada, por favor crea una!</p>
        </div>
      </ng-template>

      <app-task-form 
        *ngIf="showModal" 
        [userId]="userId"
        [task]="currentTask" 
        (close)="closeTaskModal()" 
        (saved)="handleSaved()"
      ></app-task-form>
    </div>
  `
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  @Input() userId?: number;
  tasks: Task[] = [];

  showModal = false;
  currentTask: Task | null = null;
  isLoading = signal<boolean>(false);

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.isLoading.update(() => true)
    const request = this.userId
      ? this.taskService.getTasksByUser(this.userId)
      : this.taskService.getMyTasks();

    request.subscribe({
      next: (data) => {
        this.tasks = data;
      },
      error: (err) => {
        console.error(err);
      },
      complete: () => {
        this.isLoading.update(() => false)
      }
    });
  }

  toggleCompletion(task: Task) {
    const updatedTask = { ...task, completed: !task.completed };

    // Optimistic update
    const originalStatus = task.completed;
    task.completed = updatedTask.completed;

    this.taskService.updateTask(task.id!, updatedTask).subscribe({
      next: (res) => {
        // Confirm update
        task.completed = res.completed;
      },
      error: (err) => {
        console.error('Error updating task', err);
        // Revert on error
        task.completed = originalStatus;
        alert('Error al actualizar el estado de la tarea');
      }
    });
  }

  deleteTask(task: Task) {
    if (confirm(`¿Estás seguro de que quieres eliminar "${task.title}"?`)) {
      this.taskService.deleteTask(task.id!).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(t => t.id !== task.id);
        },
        error: (err) => alert('Error al eliminar la tarea')
      });
    }
  }

  openTaskModal(task: Task | null) {
    this.currentTask = task;
    this.showModal = true;
  }

  closeTaskModal() {
    this.showModal = false;
    this.currentTask = null;
  }

  handleSaved() {
    this.closeTaskModal();
    this.loadTasks();
  }
}
