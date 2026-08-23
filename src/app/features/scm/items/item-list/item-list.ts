import { Component, OnInit, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Toast } from '../../../../core/toast'; // adjust path
import { RouterLink } from '@angular/router';

interface ItemDto {
  itemId: number;
  itemCode: string;
  itemDescription: string;
  uom: string;
  defaultPurchasePrice: number;
  isActive: boolean;
}

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './item-list.html',
  styleUrl: './item-list.scss'
})
export class ItemList implements OnInit {
  private apiUrl = 'https://localhost:7000/api/items'; // match your actual API port

  items = signal<ItemDto[]>([]);
  loading = signal(true);
  error = signal('');

  formOpen = signal(false);
  formError = signal('');
  itemCode = '';
  itemDescription = '';
  uom = '';
  defaultPurchasePrice = 0;
  editingId = signal<number | null>(null);
  searchTerm = signal('');

  constructor(private http: HttpClient, private toast: Toast) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.http.get<ItemDto[]>(this.apiUrl).subscribe({
      next: (data) => { this.items.set(data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load items.'); this.loading.set(false); }
    });
  }

// replace openCreate() with this
openCreate() {
  this.editingId.set(null);
  this.itemCode = '';
  this.itemDescription = '';
  this.uom = '';
  this.defaultPurchasePrice = 0;
  this.formError.set('');
  this.formOpen.set(true);
}

// add this new method
openEdit(item: ItemDto) {
  this.editingId.set(item.itemId);
  this.itemCode = item.itemCode;
  this.itemDescription = item.itemDescription;
  this.uom = item.uom;
  this.defaultPurchasePrice = item.defaultPurchasePrice;
  this.formError.set('');
  this.formOpen.set(true);
}

// replace save() with this
save() {
  if (!this.itemCode.trim() || !this.itemDescription.trim() || !this.uom.trim()) {
    this.formError.set('Item code, description, and UOM are required.');
    return;
  }
  if (this.defaultPurchasePrice <= 0) {
    this.formError.set('Default purchase price must be greater than zero.');
    return;
  }

  const id = this.editingId();
  const payload = {
    itemCode: this.itemCode,
    itemDescription: this.itemDescription,
    uom: this.uom,
    defaultPurchasePrice: this.defaultPurchasePrice
  };

  const request = id === null
    ? this.http.post(this.apiUrl, payload)
    : this.http.put(`${this.apiUrl}/${id}`, payload);

  request.subscribe({
    next: () => {
      this.toast.show(id === null ? 'Item created successfully.' : 'Item updated successfully.');
      this.closeForm();
      this.load();
    },
    error: (err) => this.formError.set(err.error ?? `Failed to ${id === null ? 'create' : 'update'} item.`)
  });
}
  closeForm() {
    this.formOpen.set(false);
  }

  // save() {
  //   if (!this.itemCode.trim() || !this.itemDescription.trim() || !this.uom.trim()) {
  //   this.formError.set('Item code, description, and UOM are required.');
  //   return;
  // }
  //   this.http.post(this.apiUrl, {
  //     itemCode: this.itemCode,
  //     itemDescription: this.itemDescription,
  //     uom: this.uom,
  //     defaultPurchasePrice: this.defaultPurchasePrice
  //   }).subscribe({
  //     next: () => { this.closeForm(); this.load(); },
  //     error: (err) => this.formError.set(err.error ?? 'Failed to create item.')
  //   });
  // }
// save() {
//   if (!this.itemCode.trim() || !this.itemDescription.trim() || !this.uom.trim()) {
//     this.formError.set('Item code, description, and UOM are required.');
//     return;
//   }
//   this.http.post(this.apiUrl, {
//     itemCode: this.itemCode,
//     itemDescription: this.itemDescription,
//     uom: this.uom,
//     defaultPurchasePrice: this.defaultPurchasePrice
//   }).subscribe({
//     next: () => {
//       this.toast.show('Item created successfully.');
//       this.closeForm();
//       this.load();
//     },
//     error: (err) => this.formError.set(err.error ?? 'Failed to create item.')
//   });
// }
  setActive(item: ItemDto, isActive: boolean) {
    const action = isActive ? 'activate' : 'deactivate';
    this.http.patch(`${this.apiUrl}/${item.itemId}/${action}`, {}).subscribe({
      next: () => this.load(),
      error: () => this.error.set(`Failed to ${action} item.`)
    });
  }
  
  filteredItems = computed(() => {
  const term = this.searchTerm().toLowerCase().trim();
  if (!term) return this.items();
  return this.items().filter(i =>
    i.itemCode.toLowerCase().includes(term) ||
    i.itemDescription.toLowerCase().includes(term)
  );
});
}