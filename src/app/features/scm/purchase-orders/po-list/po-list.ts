import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface POListDto {
  poId: number;
  poNumber: string;
  poDate: string;
  supplierName: string;
  status: string;
  totalAmount: number;
}

@Component({
  selector: 'app-po-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './po-list.html',
  styleUrl: './po-list.scss'
})
export class PoList implements OnInit {
  private apiUrl = 'https://localhost:7000/api/purchaseorders'; // match your actual API port

  orders = signal<POListDto[]>([]);
  loading = signal(true);
  error = signal('');

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.http.get<POListDto[]>(this.apiUrl).subscribe({
      next: (data) => { this.orders.set(data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load purchase orders.'); this.loading.set(false); }
    });
  }

  goToCreate() {
    this.router.navigate(['/scm/purchase-orders/new']);
  }

  goToDetail(poId: number) {
    this.router.navigate(['/scm/purchase-orders', poId]);
  }

  statusClass(status: string): string {
  return `status-${status.toLowerCase()}`;
}
}