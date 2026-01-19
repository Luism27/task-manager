import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';
import { Title } from '@angular/platform-browser';
import { AuthService } from './services/auth.service';
import { of } from 'rxjs';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;
  let titleService: Title;
  let authServiceMock: any;

  beforeEach(async () => {
    authServiceMock = {
      initialCheck: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        Title,
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();
  });
  
  beforeEach(() => {
    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    titleService = TestBed.inject(Title);
    fixture.detectChanges();
  }) 

  it('should create the app', () => {
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const title = "task-manager";
    console.log('titleService.getTitle()', titleService.getTitle())
    expect(titleService.getTitle()).toContain(title);
  });
});
