import { Component, OnInit, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Toast } from '../../../../core/toast'; // adjust path

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
  selector: 'app-pages-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './pages-list.html',
  styleUrl: './pages-list.scss'
})
export class PagesList implements OnInit {
  private apiUrl = 'https://localhost:7000/api/pages'; // match your actual API port

  pages = signal<PageDto[]>([]);
  loading = signal(true);
  error = signal('');

  formOpen = signal(false);
  formError = signal('');
  pageCode = '';
  pageName = '';
  moduleName = '';
  pageRoute = '';
  displaySequence = 1;
  searchTerm = signal('');

  constructor(private http: HttpClient, private toast: Toast) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.http.get<PageDto[]>(this.apiUrl).subscribe({
      next: (data) => { this.pages.set(data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load pages.'); this.loading.set(false); }
    });
  }

  openCreate() {
    this.pageCode = '';
    this.pageName = '';
    this.moduleName = '';
    this.pageRoute = '';
    this.displaySequence = this.pages().length + 1;
    this.formError.set('');
    this.formOpen.set(true);
  }

  closeForm() {
    this.formOpen.set(false);
  }

  // save() {
  //   this.http.post(this.apiUrl, {
  //     pageCode: this.pageCode,
  //     pageName: this.pageName,
  //     moduleName: this.moduleName,
  //     pageRoute: this.pageRoute,
  //     displaySequence: this.displaySequence
  //   }).subscribe({
  //     next: () => { this.closeForm(); this.load(); },
  //     error: (err) => this.formError.set(err.error ?? 'Failed to create page.')
  //   });
  // }

  save() {
   if (!this.pageCode.trim() || !this.pageName.trim() || !this.moduleName.trim() || !this.pageRoute.trim()) {
    this.formError.set('Page code, name, module, and route are required.');
    return;
  }
  
  this.http.post(this.apiUrl, {
    pageCode: this.pageCode,
    pageName: this.pageName,
    moduleName: this.moduleName,
    pageRoute: this.pageRoute,
    displaySequence: this.displaySequence
  }).subscribe({
    next: () => {
      this.toast.show('Page created successfully.');
      this.closeForm();
      this.load();
    },
    error: (err) => this.formError.set(err.error ?? 'Failed to create page.')
  });
  }

  setActive(page: PageDto, isActive: boolean) {
  const action = isActive ? 'activate' : 'deactivate';
  this.http.patch(`${this.apiUrl}/${page.pageId}/${action}`, {}).subscribe({
    next: () => this.load(),
    error: () => this.error.set(`Failed to ${action} page.`)
  });
  }

    filteredPages = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.pages();
    return this.pages().filter(p =>
      p.pageCode.toLowerCase().includes(term) ||
      p.pageName.toLowerCase().includes(term) ||
      p.moduleName.toLowerCase().includes(term)
    );
  });
}