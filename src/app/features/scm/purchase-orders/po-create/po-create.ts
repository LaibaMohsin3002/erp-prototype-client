import { Component, OnInit, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Toast } from '../../../../core/toast'; // adjust relative path if needed

interface SupplierDto {
  supplierId: number;
  supplierCode: string;
  supplierName: string;
  isActive: boolean;
}

interface ItemDto {
  itemId: number;
  itemCode: string;
  itemDescription: string;
  uom: string;
  defaultPurchasePrice: number;
  isActive: boolean;
}

interface LineRow {
  itemId: number | null;
  qty: number;
  unitPrice: number;
}

@Component({
  selector: 'app-po-create',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './po-create.html',
  styleUrl: './po-create.scss'
})
export class PoCreate implements OnInit {
  private apiUrl = 'https://localhost:7000/api'; // match your actual API port

  suppliers = signal<SupplierDto[]>([]);
  items = signal<ItemDto[]>([]);
  loading = signal(true);
  saving = signal(false);
  error = signal('');

  supplierId: number | null = null;
  poDate = new Date().toISOString().substring(0, 10); // yyyy-MM-dd for <input type="date">
  remarks = '';
  lines = signal<LineRow[]>([{ itemId: null, qty: 1, unitPrice: 0 }]);

  lineTotal = (line: LineRow) => Math.round((line.qty || 0) * (line.unitPrice || 0) * 100) / 100;

  grandTotal = computed(() =>
    this.lines().reduce((sum, l) => sum + this.lineTotal(l), 0)
  );

constructor(private http: HttpClient, private router: Router, private toast: Toast) {}

  ngOnInit() {
    this.http.get<SupplierDto[]>(`${this.apiUrl}/suppliers`).subscribe(data => {
      this.suppliers.set(data.filter(s => s.isActive));
      this.loading.set(false);
    });
    this.http.get<ItemDto[]>(`${this.apiUrl}/items`).subscribe(data => {
      this.items.set(data.filter(i => i.isActive));
    });
  }

  onItemSelected(index: number, itemId: number) {
    const item = this.items().find(i => i.itemId === itemId);
    const current = [...this.lines()];
    current[index] = { ...current[index], itemId, unitPrice: item?.defaultPurchasePrice ?? 0 };
    this.lines.set(current);
  }

  updateLine(index: number, field: 'qty' | 'unitPrice', value: number) {
    const current = [...this.lines()];
    current[index] = { ...current[index], [field]: value };
    this.lines.set(current);
  }

  addLine() {
    this.lines.set([...this.lines(), { itemId: null, qty: 1, unitPrice: 0 }]);
  }

  removeLine(index: number) {
    if (this.lines().length === 1) return; // always keep at least one row
    this.lines.set(this.lines().filter((_, i) => i !== index));
  }

  getItemUom(itemId: number | null): string {
    return this.items().find(i => i.itemId === itemId)?.uom ?? '';
  }

  save() {
    if (!this.supplierId) {
      this.error.set('Please select a supplier.');
      return;
    }
    const invalidLine = this.lines().some(l => !l.itemId || l.qty <= 0);
    if (invalidLine) {
      this.error.set('Every line needs an item selected and a quantity greater than zero.');
      return;
    }

    this.saving.set(true);
    this.error.set('');

    const payload = {
      supplierId: this.supplierId,
      poDate: this.poDate,
      remarks: this.remarks,
      lines: this.lines().map(l => ({ itemId: l.itemId, qty: l.qty, unitPrice: l.unitPrice }))
    };

   this.http.post(`${this.apiUrl}/purchaseorders`, payload).subscribe({
  next: () => {
    this.toast.show('Purchase order created successfully.');
    this.router.navigate(['/scm/purchase-orders']);
  },
  error: (err) => {
    this.error.set(err.error ?? 'Failed to create purchase order.');
    this.saving.set(false);
  }
  });
  }

  cancel() {
    this.router.navigate(['/scm/purchase-orders']);
  }
}