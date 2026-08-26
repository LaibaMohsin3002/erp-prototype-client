import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface InboxTaskDto {
  workflowTaskId: number;
  workflowInstanceId: number;
  documentType: string;
  documentId: number;
  documentNumber: string;
  requester: string;
  submittedDate: string;
  stepNo: number;
  amount: number | null;
  priority: string;
  dueDate: string | null;
  workflowStatus: string;
  createdDate: string;
}

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './inbox.html',
  styleUrl: './inbox.scss'
})
export class Inbox implements OnInit {
  private apiUrl = 'https://localhost:7000/api/workflow-tasks'; // match your actual API port

  tasks = signal<InboxTaskDto[]>([]);
  loading = signal(true);
  error = signal('');

  actioningTaskId = signal<number | null>(null);
  comments = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.http.get<InboxTaskDto[]>(`${this.apiUrl}/my-inbox`).subscribe({
      next: (data) => { this.tasks.set(data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load inbox.'); this.loading.set(false); }
    });
  }

  openAction(taskId: number) {
    this.actioningTaskId.set(taskId);
    this.comments = '';
  }

  cancelAction() {
    this.actioningTaskId.set(null);
  }

  takeAction(action: 'Approve' | 'Reject' | 'Return' | 'RequestInfo') {
    const taskId = this.actioningTaskId();
    if (taskId === null) return;

    this.http.post(`${this.apiUrl}/${taskId}/action`, { action, comments: this.comments }).subscribe({
      next: () => {
        this.actioningTaskId.set(null);
        this.load();
      },
      error: (err) => this.error.set(err.error ?? `Failed to ${action.toLowerCase()} task.`)
    });
  }

  documentLink(task: InboxTaskDto): string[] {
    if (task.documentType === 'PurchaseOrder') return ['/scm/purchase-orders', String(task.documentId)];
    return ['/'];
  }

  priorityClass(priority: string): string {
    return `priority-${priority.toLowerCase()}`;
  }

  isOverdue(dueDate: string | null): boolean {
    return !!dueDate && new Date(dueDate) < new Date();
  }
}