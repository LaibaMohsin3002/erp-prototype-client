import { Component, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

interface StepRow {
  stepNo: number;
  requiredRole: string;
  parallelGroup: number;
  timeLimitHours: number;
  escalationRole: string;
}

interface RoleDto {
  roleId: number;
  roleName: string;
  isActive: boolean;
}

@Component({
  selector: 'app-quick-setup',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './quick-setup.html',
  styleUrl: './quick-setup.scss'
})

export class QuickSetup {
  private apiUrl = 'https://localhost:7000/api/workflow-definitions'; // match your actual API port

  name = '';
  documentType = 'PurchaseOrder';
  minAmount = 0;
  maxAmount = 0;
  steps = signal<StepRow[]>([{ stepNo: 1, requiredRole: '', parallelGroup: 0, timeLimitHours: 0, escalationRole: '' }]);

  error = signal('');
  saving = signal(false);
  private rolesUrl = 'https://localhost:7000/api/roles';
  roles = signal<RoleDto[]>([]);
  editingDefinitionId: number | null = null;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.http.get<RoleDto[]>(this.rolesUrl).subscribe(data => this.roles.set(data.filter(r => r.isActive)));

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editingDefinitionId = Number(idParam);
      this.loadExisting(this.editingDefinitionId);
    }
  }

  private loadExisting(id: number) {
    this.http.get<any>(`${this.apiUrl}/${id}`).subscribe(def => {
      this.name = def.name;
      this.documentType = def.documentType;
      this.minAmount = def.minAmount;
      this.maxAmount = def.maxAmount;
      this.steps.set(def.steps.map((s: any) => ({
        stepNo: s.stepNo,
        requiredRole: s.requiredRole,
        parallelGroup: s.parallelGroup,
        timeLimitHours: s.timeLimitHours || 0,
        escalationRole: s.escalationRole || ''
      })));
    });
  }

  addStep() {
    const next = this.steps().length + 1;
    this.steps.set([...this.steps(), { stepNo: next, requiredRole: '', parallelGroup: 0, timeLimitHours: 0, escalationRole: '' }]);
  }

  removeStep(index: number) {
    if (this.steps().length === 1) return;
    const updated = this.steps().filter((_, i) => i !== index).map((s, i) => ({ ...s, stepNo: i + 1 }));
    this.steps.set(updated);
  }

  updateStep(index: number, field: keyof StepRow, value: string | number) {
    const current = [...this.steps()];
    current[index] = { ...current[index], [field]: value };
    this.steps.set(current);
  }

  save() {
    if (!this.name.trim() || !this.documentType.trim()) {
      this.error.set('Name and document type are required.');
      return;
    }
    if (this.maxAmount <= this.minAmount) {
      this.error.set('Max amount must be greater than min amount.');
      return;
    }
    if (this.steps().some(s => !s.requiredRole.trim())) {
      this.error.set('Every step needs a required role.');
      return;
    }

    this.saving.set(true);
    const payload = { name: this.name, documentType: this.documentType, minAmount: this.minAmount, maxAmount: this.maxAmount, steps: this.steps() };

    const request = this.editingDefinitionId
      ? this.http.put(`${this.apiUrl}/${this.editingDefinitionId}`, payload)
      : this.http.post(this.apiUrl, payload);

    request.subscribe({
      next: () => this.router.navigate(['/workflow/definitions']),
      error: (err) => { this.error.set(err.error ?? 'Failed to save workflow definition.'); this.saving.set(false); }
    });
  }

  cancel() {
    this.router.navigate(['/workflow/definitions']);
  }
}