import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Toast } from '../../../../core/toast'; // adjust path
import { Component, OnInit, signal, computed } from '@angular/core'; // add `computed` to the import

interface UserListDto {
  userId: number;
  userName: string;
  fullName: string;
  email: string;
  isActive: boolean;
}

interface UserDetailDto extends UserListDto {
  roleIds: number[];
}

interface RoleListDto {
  roleId: number;
  roleName: string;
  description: string | null;
  isActive: boolean;
}

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './users-list.html',
  styleUrl: './users-list.scss'
})
export class UsersList implements OnInit {
  private apiUrl = 'https://localhost:7000/api/users'; // match your actual API port
  private rolesUrl = 'https://localhost:7000/api/roles';

  users = signal<UserListDto[]>([]);
  allRoles = signal<RoleListDto[]>([]);
  loading = signal(true);
  error = signal('');

  // form state
  formOpen = signal(false);
  editingId = signal<number | null>(null);
  userName = '';
  fullName = '';
  email = '';
  password = '';
  selectedRoleIds = signal<Set<number>>(new Set());
  formError = signal('');
  searchTerm = signal('');
  
constructor(private http: HttpClient, private toast: Toast) {}

  ngOnInit() {
    this.loadUsers();
    this.http.get<RoleListDto[]>(this.rolesUrl).subscribe(roles => this.allRoles.set(roles));
  }

  loadUsers() {
    this.loading.set(true);
    this.http.get<UserListDto[]>(this.apiUrl).subscribe({
      next: (data) => { this.users.set(data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load users.'); this.loading.set(false); }
    });
  }

  openCreate() {
    this.editingId.set(null);
    this.userName = '';
    this.fullName = '';
    this.email = '';
    this.password = '';
    this.selectedRoleIds.set(new Set());
    this.formError.set('');
    this.formOpen.set(true);
  }

  openEdit(user: UserListDto) {
    this.http.get<UserDetailDto>(`${this.apiUrl}/${user.userId}`).subscribe(detail => {
      this.editingId.set(user.userId);
      this.userName = detail.userName;
      this.fullName = detail.fullName;
      this.email = detail.email;
      this.password = '';
      this.selectedRoleIds.set(new Set(detail.roleIds));
      this.formError.set('');
      this.formOpen.set(true);
    });
  }

  closeForm() {
    this.formOpen.set(false);
  }

  toggleRole(roleId: number, checked: boolean) {
    const current = new Set(this.selectedRoleIds());
    checked ? current.add(roleId) : current.delete(roleId);
    this.selectedRoleIds.set(current);
  }

  isRoleSelected(roleId: number): boolean {
    return this.selectedRoleIds().has(roleId);
  }

  // save() {
  //   const roleIds = Array.from(this.selectedRoleIds());
  //   const id = this.editingId();

  //   if (id === null) {
  //     this.http.post(this.apiUrl, {
  //       userName: this.userName,
  //       fullName: this.fullName,
  //       password: this.password,
  //       email: this.email,
  //       roleIds
  //     }).subscribe({
  //       next: () => { this.closeForm(); this.loadUsers(); },
  //       error: (err) => this.formError.set(err.error ?? 'Failed to create user.')
  //     });
  //   } else {
  //     this.http.put(`${this.apiUrl}/${id}`, {
  //       fullName: this.fullName,
  //       email: this.email,
  //       roleIds
  //     }).subscribe({
  //       next: () => { this.closeForm(); this.loadUsers(); },
  //       error: (err) => this.formError.set(err.error ?? 'Failed to update user.')
  //     });
  //   }
  // }

  save() {
    if (!this.userName.trim() || !this.fullName.trim() || !this.email.trim()) {
    this.formError.set('Username, full name, and email are required.');
    return;
  }
  if (this.editingId() === null && !this.password.trim()) {
    this.formError.set('Password is required for new users.');
    return;
  }
  
  const roleIds = Array.from(this.selectedRoleIds());
  const id = this.editingId();

  if (id === null) {
    this.http.post(this.apiUrl, { userName: this.userName, fullName: this.fullName, password: this.password, email: this.email, roleIds })
      .subscribe({
        next: () => {
          this.toast.show('User created successfully.');
          this.closeForm();
          this.loadUsers();
        },
        error: (err) => this.formError.set(err.error ?? 'Failed to create user.')
      });
  } else {
    this.http.put(`${this.apiUrl}/${id}`, { fullName: this.fullName, email: this.email, roleIds })
      .subscribe({
        next: () => {
          this.toast.show('User updated successfully.');
          this.closeForm();
          this.loadUsers();
        },
        error: (err) => this.formError.set(err.error ?? 'Failed to update user.')
      });
    }
  }

  setActive(user: UserListDto, isActive: boolean) {
    const action = isActive ? 'activate' : 'deactivate';
    this.http.patch(`${this.apiUrl}/${user.userId}/${action}`, {}).subscribe({
      next: () => this.loadUsers(),
      error: () => this.error.set(`Failed to ${action} user.`)
    });
  }


filteredUsers = computed(() => {
  const term = this.searchTerm().toLowerCase().trim();
  if (!term) return this.users();
  return this.users().filter(u =>
    u.userName.toLowerCase().includes(term) ||
    u.fullName.toLowerCase().includes(term) ||
    u.email.toLowerCase().includes(term)
  );
});
}