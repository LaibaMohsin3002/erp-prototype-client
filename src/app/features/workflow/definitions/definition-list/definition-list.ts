import { Component, OnInit, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { Toast } from '../../../../core/toast'; // path depends on actual folder depth

interface WorkflowDefinitionListDto {
  workflowDefinitionId: number;
  name: string;
  documentType: string;
  minAmount: number;
  maxAmount: number;
  isActive: boolean;
  stepCount: number;
  version: number;
}

@Component({
  selector: 'app-definition-list',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './definition-list.html',
  styleUrl: './definition-list.scss'
})
export class DefinitionList implements OnInit {
  private apiUrl = 'https://localhost:7000/api/workflow-definitions'; // match your actual API port

  definitions = signal<WorkflowDefinitionListDto[]>([]);
  loading = signal(true);
  error = signal('');
  searchTerm = signal('');

  filteredDefinitions = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.definitions();
    return this.definitions().filter(d =>
      d.name.toLowerCase().includes(term) || d.documentType.toLowerCase().includes(term)
    );
  });

  constructor(private http: HttpClient, private router: Router, private toast: Toast) {}

  ngOnInit() {
    this.load();
  }


  load() {
    this.loading.set(true);
    this.http.get<WorkflowDefinitionListDto[]>(this.apiUrl).subscribe({
      next: (data) => { this.definitions.set(data); this.loading.set(false); },
      error: () => { this.toast.show('Failed to load workflow definitions.', 'error'); this.loading.set(false); }
    });
  }

  confirmDelete() {
    const def = this.pendingDeleteDef();
    if (!def) return;
    this.http.delete(`${this.apiUrl}/${def.workflowDefinitionId}`).subscribe({
      next: () => { this.pendingDeleteDef.set(null); this.load(); this.toast.show('Workflow deleted.'); },
      error: (err) => { this.pendingDeleteDef.set(null); this.toast.show(err.error ?? 'Failed to delete workflow definition.', 'error'); }
    });
  }

  setActive(def: WorkflowDefinitionListDto, isActive: boolean) {
    const action = isActive ? 'activate' : 'deactivate';
    this.http.patch(`${this.apiUrl}/${def.workflowDefinitionId}/${action}`, {}).subscribe({
      next: () => this.load(),
      error: () => this.toast.show(`Failed to ${action} definition.`, 'error')
    });
  }

  openCreate() {
    this.router.navigate(['/workflow/definitions/new']);
  }

  viewDetail(id: number) {
    this.router.navigate(['/workflow/definitions', id]);
  }

  openManualCreate() {
  this.router.navigate(['/workflow/definitions/quick-setup']);
  }

  edit(def: WorkflowDefinitionListDto) {
    this.router.navigate(['/workflow/definitions', def.workflowDefinitionId, 'edit']);
  }

  pendingDeleteDef = signal<WorkflowDefinitionListDto | null>(null);

  remove(def: WorkflowDefinitionListDto) {
    this.pendingDeleteDef.set(def);
  }

  cancelDelete() {
    this.pendingDeleteDef.set(null);
  }

  editManual(def: WorkflowDefinitionListDto) {
  this.router.navigate(['/workflow/definitions', def.workflowDefinitionId, 'edit-manual']);
  }
  
}
