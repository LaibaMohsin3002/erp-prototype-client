import { Component, OnInit, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Toast } from '../../../../core/toast'; // adjust path

interface RoleListDto {
  roleId: number;
  roleName: string;
  description: string | null;
  isActive: boolean;
}

interface RoleDetailDto extends RoleListDto {
  pageIds: number[];
}

interface PageDto {
  pageId: number;
  pageCode: string;
  pageName: string;
  moduleName: string;
  pageRoute: string;
  displaySequence: number;
  isActive: boolean;
}

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './roles-list.html',
  styleUrl: './roles-list.scss'
})
export class RolesList implements OnInit {
  private apiUrl = 'https://localhost:7000/api'; // match your actual API port

  roles = signal<RoleListDto[]>([]);
  allPages = signal<PageDto[]>([]);
  loading = signal(true);
  error = signal('');

  // form state
  formOpen = signal(false);
  editingId = signal<number | null>(null);
  roleName = '';
  description = '';
  selectedPageIds = signal<Set<number>>(new Set());
  formError = signal('');
  searchTerm = signal('');

  constructor(private http: HttpClient, private toast: Toast) {}

  ngOnInit() {
    this.loadRoles();
    this.http.get<PageDto[]>(`${this.apiUrl}/pages`).subscribe(pages => this.allPages.set(pages));
  }

  loadRoles() {
    this.loading.set(true);
    this.http.get<RoleListDto[]>(`${this.apiUrl}/roles`).subscribe({
      next: (data) => { this.roles.set(data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load roles.'); this.loading.set(false); }
    });
  }

  openCreate() {
    this.editingId.set(null);
    this.roleName = '';
    this.description = '';
    this.selectedPageIds.set(new Set());
    this.formError.set('');
    this.formOpen.set(true);
  }

  openEdit(role: RoleListDto) {
    this.http.get<RoleDetailDto>(`${this.apiUrl}/roles/${role.roleId}`).subscribe(detail => {
      this.editingId.set(role.roleId);
      this.roleName = detail.roleName;
      this.description = detail.description ?? '';
      this.selectedPageIds.set(new Set(detail.pageIds));
      this.formError.set('');
      this.formOpen.set(true);
    });
  }

  closeForm() {
    this.formOpen.set(false);
  }

  togglePage(pageId: number, checked: boolean) {
    const current = new Set(this.selectedPageIds());
    checked ? current.add(pageId) : current.delete(pageId);
    this.selectedPageIds.set(current);
  }

  isPageSelected(pageId: number): boolean {
    return this.selectedPageIds().has(pageId);
  }

  // save() {
  //   const pageIds = Array.from(this.selectedPageIds());
  //   const id = this.editingId();

  //   if (id === null) {
  //     this.http.post(`${this.apiUrl}/roles`, { roleName: this.roleName, description: this.description, pageIds })
  //       .subscribe({
  //         next: () => { this.closeForm(); this.loadRoles(); },
  //         error: (err) => this.formError.set(err.error ?? 'Failed to create role.')
  //       });
  //   } else {
  //     this.http.put(`${this.apiUrl}/roles/${id}`, { description: this.description, isActive: true, pageIds })
  //       .subscribe({
  //         next: () => { this.closeForm(); this.loadRoles(); },
  //         error: (err) => this.formError.set(err.error ?? 'Failed to update role.')
  //       });
  //   }
  // }

  save() {
  const pageIds = Array.from(this.selectedPageIds());
  const id = this.editingId();

  if (id === null) {
    this.http.post(`${this.apiUrl}/roles`, { roleName: this.roleName, description: this.description, pageIds })
      .subscribe({
        next: () => {
          this.toast.show('Role created successfully.');
          this.closeForm();
          this.loadRoles();
        },
        error: (err) => this.formError.set(err.error ?? 'Failed to create role.')
      });
  } else {
    this.http.put(`${this.apiUrl}/roles/${id}`, { description: this.description, isActive: true, pageIds })
      .subscribe({
        next: () => {
          this.toast.show('Role updated successfully.');
          this.closeForm();
          this.loadRoles();
        },
        error: (err) => this.formError.set(err.error ?? 'Failed to update role.')
      });
  }
}
  setActive(role: RoleListDto, isActive: boolean) {
  const action = isActive ? 'activate' : 'deactivate';
  this.http.patch(`${this.apiUrl}/roles/${role.roleId}/${action}`, {}).subscribe({
    next: () => this.loadRoles(),
    error: () => this.error.set(`Failed to ${action} role.`)
  });
  }

  filteredRoles = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.roles();
    return this.roles().filter(r =>
      r.roleName.toLowerCase().includes(term) ||
      (r.description ?? '').toLowerCase().includes(term)
    );
  });
}