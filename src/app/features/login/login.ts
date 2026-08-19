// features/login/login.component.ts
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'  
})
export class LoginComponent {
  userName = '';
  password = '';
  errorMessage = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.auth.login(this.userName, this.password).subscribe({
      // next: () => this.router.navigate(['/security-admin/users']),
      next: () => this.router.navigate(['/']),
      error: () => this.errorMessage.set('Invalid username or password.')
    });
  }
}