import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

interface POLineDto {
  poLineId: number;
  lineNo: number;
  itemId: number;
  itemCode: string;
  itemDescription: string;
  uom: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

interface PODetailDto {
  poId: number;
  poNumber: string;
  poDate: string;
  supplierId: number;
  supplierName: string;
  remarks: string | null;
  status: string;
  totalQty: number;
  totalAmount: number;
  lines: POLineDto[];
}

@Component({
  selector: 'app-po-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './po-detail.html',
  styleUrl: './po-detail.scss'
})
export class PoDetail implements OnInit {
  private apiUrl = 'https://localhost:7000/api/purchaseorders'; // match your actual API port

  po = signal<PODetailDto | null>(null);
  loading = signal(true);
  error = signal('');

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Invalid purchase order.');
      this.loading.set(false);
      return;
    }

    this.http.get<PODetailDto>(`${this.apiUrl}/${id}`).subscribe({
      next: (data) => { this.po.set(data); this.loading.set(false); },
      error: () => { this.error.set('Purchase order not found.'); this.loading.set(false); }
    });
  }

  statusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }
}