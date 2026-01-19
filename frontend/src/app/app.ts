import { RouterOutlet } from '@angular/router';
import { Component, signal, OnInit, inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('task-manager');
  private authService = inject(AuthService);
  private titleService = inject(Title);

  ngOnInit() {
    this.authService.initialCheck();
    this.titleService.setTitle(this.title());
  }
}
