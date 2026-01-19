import { TestBed, ComponentFixture } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { provideRouter } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: any;
  let router: Router;

  beforeEach(async () => {
    authServiceMock = {
      login: vi.fn(),
      getToken: vi.fn().mockReturnValue(null)
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        LoginComponent
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('should validate username field', () => {
    const username = component.loginForm.controls['username'];
    expect(username.valid).toBeFalsy();
    username.setValue('testuser');
    expect(username.valid).toBeTruthy();
  });

  it('should call login on authService when form is valid', () => {
    const loginResponse = { access: 'token', refresh: 'refresh' };
    authServiceMock.login.mockReturnValue(of(loginResponse));
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.loginForm.setValue({
      username: 'testuser',
      password: 'password123'
    });

    component.onSubmit();

    expect(authServiceMock.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123'
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('should show error message on login failure', () => {
    authServiceMock.login.mockReturnValue(throwError(() => new Error('Login failed')));
    
    component.loginForm.setValue({
      username: 'testuser',
      password: 'wrongpassword'
    });

    component.onSubmit();

    expect(component.error).toBe('Credenciales inválidas o error del servidor');
    expect(component.isLoading()).toBeFalsy();
  });
});
