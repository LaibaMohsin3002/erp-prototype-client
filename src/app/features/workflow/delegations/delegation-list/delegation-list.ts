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
  documentType: string | null;
  minAmount: number | null;
  maxAmount: number | null;
  orgUnit: string | null;
}

interface CreateDelegationResponse {
  delegationId: number;
  warning: string | null;
}

@Component({
  selector: 'app-delegation-list',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './delegation-list.html',
  styleUrl: './delegation-list.scss'
})
export class DelegationList implements OnInit {
  private apiUrl = 'https://localhost:7000/api/delegations';

  delegations = signal<DelegationDto[]>([]);
  loading = signal(true);
  error = signal('');
  warning = signal('');

  formOpen = signal(false);
  formError = signal('');
  delegateUserName = '';
  startDate = new Date().toISOString().substring(0, 10);
  endDate = '';
  reason = '';
  documentType = '';
  minAmount: number | null = null;
  maxAmount: number | null = null;
  orgUnit = '';

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
    this.documentType = '';
    this.minAmount = null;
    this.maxAmount = null;
    this.orgUnit = '';
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
    if (this.minAmount !== null && this.maxAmount !== null && this.maxAmount <= this.minAmount) {
      this.formError.set('Max amount must be greater than min amount.');
      return;
    }

    this.http.post<CreateDelegationResponse>(this.apiUrl, {
      delegateUserName: this.delegateUserName,
      startDate: this.startDate,
      endDate: this.endDate,
      reason: this.reason,
      documentType: this.documentType.trim() || null,
      minAmount: this.minAmount,
      maxAmount: this.maxAmount,
      orgUnit: this.orgUnit.trim() || null
    }).subscribe({
      next: (res) => {
        this.closeForm();
        this.load();
        if (res.warning) {
          this.warning.set(res.warning);
          setTimeout(() => this.warning.set(''), 6000);
        }
      },
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

// import { Component, OnInit, signal } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { RouterLink } from '@angular/router';

// interface DelegationDto {
//   delegationId: number;
//   delegatorUserName: string;
//   delegateUserName: string;
//   startDate: string;
//   endDate: string;
//   reason: string | null;
//   isActive: boolean;
//   documentType: string | null;
//   minAmount: number | null;
//   maxAmount: number | null;
//   orgUnit: string | null;
// }

// @Component({
//   selector: 'app-delegation-list',
//   standalone: true,
//   imports: [FormsModule, CommonModule, RouterLink],
//   templateUrl: './delegation-list.html',
//   styleUrl: './delegation-list.scss'
// })
// export class DelegationList implements OnInit {
//   private apiUrl = 'https://localhost:7000/api/delegations'; // match your actual API port

//   delegations = signal<DelegationDto[]>([]);
//   loading = signal(true);
//   error = signal('');

//   formOpen = signal(false);
//   formError = signal('');
//   delegateUserName = '';
//   startDate = new Date().toISOString().substring(0, 10);
//   endDate = '';
//   reason = '';
//   documentType = '';
//   minAmount: number | null = null;
//   maxAmount: number | null = null;
//   orgUnit = '';

//   constructor(private http: HttpClient) {}

//   ngOnInit() {
//     this.load();
//   }

//   load() {
//     this.loading.set(true);
//     this.http.get<DelegationDto[]>(`${this.apiUrl}/mine`).subscribe({
//       next: (data) => { this.delegations.set(data); this.loading.set(false); },
//       error: () => { this.error.set('Failed to load delegations.'); this.loading.set(false); }
//     });
//   }

//   openCreate() {
//     this.delegateUserName = '';
//     this.startDate = new Date().toISOString().substring(0, 10);
//     this.endDate = '';
//     this.reason = '';
//     this.documentType = '';
//     this.minAmount = null;
//     this.maxAmount = null;
//     this.orgUnit = '';
//     this.formError.set('');
//     this.formOpen.set(true);
//   }

//   closeForm() {
//     this.formOpen.set(false);
//   }

//   save() {
//     if (!this.delegateUserName.trim() || !this.endDate) {
//       this.formError.set('Delegate username and end date are required.');
//       return;
//     }
//     if (this.minAmount !== null && this.maxAmount !== null && this.maxAmount <= this.minAmount) {
//       this.formError.set('Max amount must be greater than min amount.');
//       return;
//     }

//     this.http.post(this.apiUrl, {
//       delegateUserName: this.delegateUserName,
//       startDate: this.startDate,
//       endDate: this.endDate,
//       reason: this.reason,
//       documentType: this.documentType.trim() || null,
//       minAmount: this.minAmount,
//       maxAmount: this.maxAmount,
//       orgUnit: this.orgUnit.trim() || null
//     }).subscribe({
//       next: () => { this.closeForm(); this.load(); },
//       error: (err) => this.formError.set(err.error ?? 'Failed to create delegation.')
//     });
//   }

//   revoke(delegation: DelegationDto) {
//     this.http.patch(`${this.apiUrl}/${delegation.delegationId}/revoke`, {}).subscribe({
//       next: () => this.load(),
//       error: () => this.error.set('Failed to revoke delegation.')
//     });
//   }
// }