import { Component, OnInit, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Toast } from '../../../../core/toast'; // adjust path
import { RouterLink } from '@angular/router';

interface SupplierDto {
  supplierId: number;
  supplierCode: string;
  supplierName: string;
  isActive: boolean;
}

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './supplier-list.html',
  styleUrl: './supplier-list.scss'
})
export class SupplierList implements OnInit {
  private apiUrl = 'https://localhost:7000/api/suppliers'; // match your actual API port

  suppliers = signal<SupplierDto[]>([]);
  loading = signal(true);
  error = signal('');

  formOpen = signal(false);
  formError = signal('');
  supplierCode = '';
  supplierName = '';
  editingId = signal<number | null>(null);
  searchTerm = signal('');

  constructor(private http: HttpClient, private toast: Toast) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.http.get<SupplierDto[]>(this.apiUrl).subscribe({
      next: (data) => { this.suppliers.set(data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load suppliers.'); this.loading.set(false); }
    });
  }
  
openCreate() {
  this.editingId.set(null);
  this.supplierCode = '';
  this.supplierName = '';
  this.formError.set('');
  this.formOpen.set(true);
}

openEdit(supplier: SupplierDto) {
  this.editingId.set(supplier.supplierId);
  this.supplierCode = supplier.supplierCode;
  this.supplierName = supplier.supplierName;
  this.formError.set('');
  this.formOpen.set(true);
}

save() {
  if (!this.supplierCode.trim() || !this.supplierName.trim()) {
    this.formError.set('Supplier code and name are required.');
    return;
  }

  const id = this.editingId();
  const payload = { supplierCode: this.supplierCode, supplierName: this.supplierName };

  const request = id === null
    ? this.http.post(this.apiUrl, payload)
    : this.http.put(`${this.apiUrl}/${id}`, payload);

  request.subscribe({
    next: () => {
      this.toast.show(id === null ? 'Supplier created successfully.' : 'Supplier updated successfully.');
      this.closeForm();
      this.load();
    },
    error: (err) => this.formError.set(err.error ?? `Failed to ${id === null ? 'create' : 'update'} supplier.`)
  });
}
  // openCreate() {
  //   this.supplierCode = '';
  //   this.supplierName = '';
  //   this.formError.set('');
  //   this.formOpen.set(true);
  // }

  closeForm() {
    this.formOpen.set(false);
  }

  // save() {
  //   if (!this.supplierCode.trim() || !this.supplierName.trim()) {
  //     this.formError.set('Supplier code and name are required.');
  //     return;
  //   }
  //   this.http.post(this.apiUrl, {
  //     supplierCode: this.supplierCode,
  //     supplierName: this.supplierName
  //   }).subscribe({
  //     next: () => {
  //       this.toast.show('Supplier created successfully.');
  //       this.closeForm();
  //       this.load();
  //     },
  //     error: (err) => this.formError.set(err.error ?? 'Failed to create supplier.')
  //   });
  // }
  
  setActive(supplier: SupplierDto, isActive: boolean) {
    const action = isActive ? 'activate' : 'deactivate';
    this.http.patch(`${this.apiUrl}/${supplier.supplierId}/${action}`, {}).subscribe({
      next: () => this.load(),
      error: () => this.error.set(`Failed to ${action} supplier.`)
    });
  }

  filteredSuppliers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.suppliers();
    return this.suppliers().filter(s =>
      s.supplierCode.toLowerCase().includes(term) ||
      s.supplierName.toLowerCase().includes(term)
    );
  });
}