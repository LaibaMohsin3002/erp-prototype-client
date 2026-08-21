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

interface ApprovalHistoryDto {
  stepNo: number;
  assignedRole: string;
  status: string;
  actionedBy: string | null;
  actionedDate: string | null;
  comments: string | null;
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
  history = signal<ApprovalHistoryDto[]>([]);
  submitting = signal(false);

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
    // call this in ngOnInit alongside the existing PO fetch
    this.http.get<ApprovalHistoryDto[]>(`${this.apiUrl}/${id}/approval-history`).subscribe(h => this.history.set(h));
  }

  statusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  // new method
submitForApproval() {
  const order = this.po();
  if (!order) return;
  this.submitting.set(true);
  this.http.post(`${this.apiUrl}/${order.poId}/submit`, {}).subscribe({
    next: () => {
      this.submitting.set(false);
      this.ngOnInit(); // refresh
    },
    error: (err) => {
      this.error.set(err.error ?? 'Failed to submit for approval.');
      this.submitting.set(false);
    }
  });
}
}