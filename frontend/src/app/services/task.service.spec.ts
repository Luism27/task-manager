import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService, Task } from './task.service';
import { environment } from '../../environments/environment';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService]
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all tasks', () => {
    const mockTasks: Task[] = [
      { id: 1, title: 'Task 1', description: 'Desc 1' },
      { id: 2, title: 'Task 2', description: 'Desc 2' }
    ];

    service.getTasks().subscribe(tasks => {
      expect(tasks.length).toBe(2);
      expect(tasks).toEqual(mockTasks);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/tasks/`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTasks);
  });

  it('should create a task', () => {
    const newTask: Task = { title: 'New Task', description: 'New Desc' };
    const mockResponse: Task = { ...newTask, id: 3 };

    service.createTask(newTask).subscribe(task => {
      expect(task.id).toBe(3);
      expect(task.title).toBe(newTask.title);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/tasks/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newTask);
    req.flush(mockResponse);
  });

  it('should delete a task', () => {
    const taskId = 1;

    service.deleteTask(taskId).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/api/tasks/${taskId}/`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
