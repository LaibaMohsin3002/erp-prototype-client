import { Component, OnInit, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

interface WorkflowStepDto {
  workflowStepId: number;
  stepNo: number;
  requiredRole: string;
  parallelGroup: number;
  timeLimitHours: number;
  escalationRole: string | null;
}

interface WorkflowDefinitionDetailDto {
  workflowDefinitionId: number;
  name: string;
  documentType: string;
  minAmount: number;
  maxAmount: number;
  isActive: boolean;
  version: number;
  isLatestVersion: boolean;
  previousVersionId: number | null;
  steps: WorkflowStepDto[];
}

@Component({
  selector: 'app-definition-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './definition-detail.html',
  styleUrl: './definition-detail.scss'
})
export class DefinitionDetail implements OnInit {
  private apiUrl = 'https://localhost:7000/api/workflow-definitions'; // match your actual API port

  definition = signal<WorkflowDefinitionDetailDto | null>(null);
  loading = signal(true);
  error = signal('');

  // Groups steps into ordered stages: sequential steps are solo stages,
  // steps sharing a non-zero ParallelGroup become one stage together.
  stages = computed(() => {
    const def = this.definition();
    if (!def) return [];

    const seen = new Set<number>();
    const result: WorkflowStepDto[][] = [];

    for (const step of [...def.steps].sort((a, b) => a.stepNo - b.stepNo)) {
      if (step.parallelGroup !== 0) {
        if (seen.has(step.parallelGroup)) continue;
        seen.add(step.parallelGroup);
        result.push(def.steps.filter(s => s.parallelGroup === step.parallelGroup));
      } else {
        result.push([step]);
      }
    }

    return result.sort((a, b) => Math.min(...a.map(s => s.stepNo)) - Math.min(...b.map(s => s.stepNo)));
  });

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.error.set('Invalid workflow definition.'); this.loading.set(false); return; }

    this.http.get<WorkflowDefinitionDetailDto>(`${this.apiUrl}/${id}`).subscribe({
      next: (data) => { this.definition.set(data); this.loading.set(false); },
      error: () => { this.error.set('Workflow definition not found.'); this.loading.set(false); }
    });
  }
}