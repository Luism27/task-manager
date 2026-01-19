import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login and set tokens', () => {
    const mockResponse = { access: 'access_token', refresh: 'refresh_token' };
    const credentials = { username: 'test', password: 'password' };

    service.login(credentials).subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(localStorage.getItem('access_token')).toBe('access_token');
      expect(localStorage.getItem('refresh_token')).toBe('refresh_token');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login/`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    // Should also call me()
    const meReq = httpMock.expectOne(`${environment.apiUrl}/auth/me/`);
    expect(meReq.request.method).toBe('GET');
    meReq.flush({ username: 'test' });
  });

  it('should logout and clear tokens', () => {
    localStorage.setItem('access_token', 'token');
    localStorage.setItem('refresh_token', 'refresh');
    
    service.logout();
    
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    service.user$.subscribe(user => {
      expect(user).toBeNull();
    });
  });

  it('should get current user info (me)', () => {
    const mockUser = { username: 'testuser', id: 1 };
    
    service.me().subscribe(user => {
      expect(user).toEqual(mockUser);
    });

    service.user$.subscribe(user => {
      if (user) {
        expect(user).toEqual(mockUser);
      }
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/me/`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });
});
