import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface DelegationDto {
  delegationId: number;
  delegatorUserName: string;
  delegateUserName: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  isActive: boolean;
}

@Component({
  selector: 'app-delegation-list',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './delegation-list.html',
  styleUrl: './delegation-list.scss'
})
export class DelegationList implements OnInit {
  private apiUrl = 'https://localhost:7000/api/delegations'; // match your actual API port

  delegations = signal<DelegationDto[]>([]);
  loading = signal(true);
  error = signal('');

  formOpen = signal(false);
  formError = signal('');
  delegateUserName = '';
  startDate = new Date().toISOString().substring(0, 10);
  endDate = '';
  reason = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.http.get<DelegationDto[]>(`${this.apiUrl}/mine`).subscribe({
      next: (data) => { this.delegations.set(data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load delegations.'); this.loading.set(false); }
    });
  }

  openCreate() {
    this.delegateUserName = '';
    this.startDate = new Date().toISOString().substring(0, 10);
    this.endDate = '';
    this.reason = '';
    this.formError.set('');
    this.formOpen.set(true);
  }

  closeForm() {
    this.formOpen.set(false);
  }

  save() {
    if (!this.delegateUserName.trim() || !this.endDate) {
      this.formError.set('Delegate username and end date are required.');
      return;
    }

    this.http.post(this.apiUrl, {
      delegateUserName: this.delegateUserName,
      startDate: this.startDate,
      endDate: this.endDate,
      reason: this.reason
    }).subscribe({
      next: () => { this.closeForm(); this.load(); },
      error: (err) => this.formError.set(err.error ?? 'Failed to create delegation.')
    });
  }

  revoke(delegation: DelegationDto) {
    this.http.patch(`${this.apiUrl}/${delegation.delegationId}/revoke`, {}).subscribe({
      next: () => this.load(),
      error: () => this.error.set('Failed to revoke delegation.')
    });
  }
}