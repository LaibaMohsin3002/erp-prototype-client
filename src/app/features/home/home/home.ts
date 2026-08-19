// home.ts
import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface NavPageDto {
  pageId: number;
  pageCode: string;
  pageName: string;
  pageRoute: string;
  moduleName: string;
}

interface NavRoleDto {
  roleId: number;
  roleName: string;
  pages: NavPageDto[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  private apiUrl = 'https://localhost:7000/api/navigation/me'; // match your actual API port

  roles = signal<NavRoleDto[]>([]);
  selectedRole = signal<NavRoleDto | null>(null);
  loading = signal(true);

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.http.get<NavRoleDto[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.roles.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  selectRole(role: NavRoleDto) {
    this.selectedRole.set(role);
  }

  backToRoles() {
    this.selectedRole.set(null);
  }

  goToPage(page: NavPageDto) {
    this.router.navigateByUrl(page.pageRoute);
  }
}