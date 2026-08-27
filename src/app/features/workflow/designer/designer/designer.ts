// import { Component, OnInit, signal, computed } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { FFlowModule, FCreateConnectionEvent } from '@foblex/flow';
// import { ActivatedRoute } from '@angular/router';

// interface DesignerNode {
//   id: string;
//   type: 'start' | 'step' | 'end';
//   x: number;
//   y: number;
//   label: string;
//   timeLimitHours: number;
//   escalationRole: string;
// }

// interface DesignerConnection {
//   id: string;
//   sourceId: string;
//   targetId: string;
// }

// interface RoleDto {
//   roleId: number;
//   roleName: string;
//   isActive: boolean;
// }

// @Component({
//   selector: 'app-designer',
//   standalone: true,
//   imports: [FormsModule, CommonModule, FFlowModule],
//   templateUrl: './designer.html',
//   styleUrl: './designer.scss'
// })

// export class Designer implements OnInit {
//   private apiUrl = 'https://localhost:7000/api/workflow-definitions'; // match your actual API port
//   private rolesUrl = 'https://localhost:7000/api/roles';

//   name = '';
//   documentType = 'PurchaseOrder';
//   minAmount = 0;
//   maxAmount = 0;

//   roles = signal<RoleDto[]>([]);

//   nodes = signal<DesignerNode[]>([
//     { id: 'start', type: 'start', x: 40, y: 200, label: 'Start', timeLimitHours: 0, escalationRole: '' },
//     { id: 'end', type: 'end', x: 700, y: 200, label: 'Approved', timeLimitHours: 0, escalationRole: '' }
//   ]);

//   connections = signal<DesignerConnection[]>([]);

//   editingNodeId = signal<string | null>(null);
//   editingRole = '';
//   editingTimeLimitHours = 0;
//   editingEscalationRole = '';

//   error = signal('');
//   saving = signal(false);

//   selectedConnectionId = signal<string | null>(null);

//   editingDefinitionId: number | null = null;

//   constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

//   ngOnInit() {
//     this.http.get<RoleDto[]>(this.rolesUrl).subscribe(data => this.roles.set(data.filter(r => r.isActive)));

//     const idParam = this.route.snapshot.paramMap.get('id');
//     if (idParam) {
//       this.editingDefinitionId = Number(idParam);
//       this.loadExistingDefinition(this.editingDefinitionId);
//     }
//   }

// private loadExistingDefinition(id: number) {
//   this.http.get<any>(`${this.apiUrl}/${id}`).subscribe(def => {
//     this.name = def.name;
//     this.documentType = def.documentType;
//     this.minAmount = def.minAmount;
//     this.maxAmount = def.maxAmount;

//     // Reconstruct a left-to-right layout from step order + parallel grouping
//     const stageMap = new Map<number, any[]>();
//     for (const step of def.steps) {
//       const key = step.parallelGroup !== 0 ? step.parallelGroup : step.stepNo * 1000; // unique key per sequential step
//       if (!stageMap.has(key)) stageMap.set(key, []);
//       stageMap.get(key)!.push(step);
//     }
//     const stages = Array.from(stageMap.values()).sort((a, b) => a[0].stepNo - b[0].stepNo);

//     const newNodes: DesignerNode[] = [
//       { id: 'start', type: 'start', x: 40, y: 200, label: 'Start', timeLimitHours: 0, escalationRole: '' }
//     ];
//     const newConnections: DesignerConnection[] = [];
//     let prevStageNodeIds = ['start'];

//     stages.forEach((stage, stageIndex) => {
//       const x = 300 + stageIndex * 280;
//       const stageNodeIds: string[] = [];

//       stage.forEach((step: any, stepIndexInStage: number) => {
//         const nodeId = `step-${step.workflowStepId}`;
//         newNodes.push({
//           id: nodeId,
//           type: 'step',
//           x,
//           y: 100 + stepIndexInStage * 130,
//           label: step.requiredRole,
//           timeLimitHours: step.timeLimitHours || 0,
//           escalationRole: step.escalationRole || ''
//         });
//         stageNodeIds.push(nodeId);

//         for (const prevId of prevStageNodeIds) {
//           newConnections.push({ id: `conn-${prevId}-${nodeId}`, sourceId: `${prevId}-out`, targetId: `${nodeId}-in` });
//         }
//       });

//       prevStageNodeIds = stageNodeIds;
//     });

//     const endX = 300 + stages.length * 280;
//     newNodes.push({ id: 'end', type: 'end', x: endX, y: 200, label: 'Approved', timeLimitHours: 0, escalationRole: '' });
//     for (const prevId of prevStageNodeIds) {
//       newConnections.push({ id: `conn-${prevId}-end`, sourceId: `${prevId}-out`, targetId: 'end-in' });
//     }

//     this.nodes.set(newNodes);
//     this.connections.set(newConnections);
//   });
// }

// addStep() {
//   const stepCount = this.nodes().filter(n => n.type === 'step').length;
//   const newNode: DesignerNode = {
//     id: `step-${Date.now()}`,
//     type: 'step',
//     x: 350,
//     y: 150 + stepCount * 130,
//     label: '',
//     timeLimitHours: 0,
//     escalationRole: ''
//   };
//   this.nodes.set([...this.nodes(), newNode]);
//   this.openStepModal(newNode.id);
// }

//   openStepModal(id: string) {
//     const node = this.nodes().find(n => n.id === id);
//     if (!node) return;
//     this.editingNodeId.set(id);
//     this.editingRole = node.label;
//     this.editingTimeLimitHours = node.timeLimitHours;
//     this.editingEscalationRole = node.escalationRole;
//   }

//   closeStepModal() {
//     const id = this.editingNodeId();
//     if (id) {
//       const node = this.nodes().find(n => n.id === id);
//       if (node && !node.label.trim()) {
//         this.nodes.set(this.nodes().filter(n => n.id !== id));
//         this.connections.set(this.connections().filter(c =>
//           this.connectorToNodeId(c.sourceId) !== id && this.connectorToNodeId(c.targetId) !== id
//         ));
//       }
//     }
//     this.editingNodeId.set(null);
//   }

//   confirmStepRole() {
//     const id = this.editingNodeId();
//     if (!id || !this.editingRole.trim()) return;
//     this.nodes.set(this.nodes().map(n => n.id === id
//       ? { ...n, label: this.editingRole, timeLimitHours: this.editingTimeLimitHours, escalationRole: this.editingEscalationRole }
//       : n
//     ));
//     this.editingNodeId.set(null);
//   }

//   deleteStep() {
//     const id = this.editingNodeId();
//     if (!id || id === 'start' || id === 'end') return;
//     this.nodes.set(this.nodes().filter(n => n.id !== id));
//     this.connections.set(this.connections().filter(c =>
//       this.connectorToNodeId(c.sourceId) !== id && this.connectorToNodeId(c.targetId) !== id
//     ));
//     this.editingNodeId.set(null);
//   }

//   onMoveNodes(event: any) {
//     const ids: string[] = event.fNodeIds ?? [event.fNodeId];
//     const pos = event.fPosition ?? event.position;
//     if (!pos) return;
//     this.nodes.set(this.nodes().map(n => ids.includes(n.id) ? { ...n, x: pos.x, y: pos.y } : n));
//   }

//   onCreateConnection(event: FCreateConnectionEvent) {
//     const sourceId = String(event.sourceId);
//     const targetId = String(event.targetId);
//     if (!sourceId || !targetId || sourceId === targetId) return;

//     const exists = this.connections().some(c => c.sourceId === sourceId && c.targetId === targetId);
//     if (exists) return;

//     this.connections.set([...this.connections(), { id: `conn-${Date.now()}`, sourceId, targetId }]);
//   }

//   deleteConnection(id: string) {
//     this.connections.set(this.connections().filter(c => c.id !== id));
//   }

//   save() {
//     if (!this.name.trim() || !this.documentType.trim()) {
//       this.error.set('Name and document type are required.');
//       return;
//     }
//     if (this.maxAmount <= this.minAmount) {
//       this.error.set('Max amount must be greater than min amount.');
//       return;
//     }

//     const steps = this.buildStepsFromGraph();
//     if (steps === null) {
//       this.error.set('Every step must have a role assigned and be connected in a path from Start to End.');
//       return;
//     }

//     this.saving.set(true);
//     const payload = { name: this.name, documentType: this.documentType, minAmount: this.minAmount, maxAmount: this.maxAmount, steps };

//     const request = this.editingDefinitionId
//       ? this.http.put(`${this.apiUrl}/${this.editingDefinitionId}`, payload)
//       : this.http.post(this.apiUrl, payload);

//     request.subscribe({
//       next: () => this.router.navigate(['/workflow/definitions']),
//       error: (err) => { this.error.set(err.error ?? 'Failed to save workflow definition.'); this.saving.set(false); }
//     });
//   }

//   cancel() {
//     this.router.navigate(['/workflow/definitions']);
//   }

//   private connectorToNodeId(connectorId: string): string {
//   return connectorId.replace(/-out$|-in$/, '');
// }

// private buildStepsFromGraph(): { stepNo: number; requiredRole: string; parallelGroup: number; timeLimitHours: number; escalationRole: string | null }[] | null {
//   const nodes = this.nodes();
//   const conns = this.connections();
//   const stepNodes = nodes.filter(n => n.type === 'step');

//   if (stepNodes.length === 0) return null;
//   if (stepNodes.some(n => !n.label.trim())) return null;

//   const layer = new Map<string, number>();
//   layer.set('start', 0);
//   let frontier = ['start'];
//   let currentLayer = 0;
//   const visited = new Set(['start']);

//   while (frontier.length > 0) {
//     currentLayer++;
//     const next: string[] = [];
//     for (const nodeId of frontier) {
//       const outgoing = conns.filter(c => this.connectorToNodeId(c.sourceId) === nodeId);
//       for (const c of outgoing) {
//         const targetNodeId = this.connectorToNodeId(c.targetId);
//         if (!visited.has(targetNodeId)) {
//           visited.add(targetNodeId);
//           layer.set(targetNodeId, currentLayer);
//           next.push(targetNodeId);
//         }
//       }
//     }
//     frontier = next;
//   }

//   if (stepNodes.some(n => !layer.has(n.id))) return null;

//   const layerGroups = new Map<number, DesignerNode[]>();
//   for (const node of stepNodes) {
//     const l = layer.get(node.id)!;
//     if (!layerGroups.has(l)) layerGroups.set(l, []);
//     layerGroups.get(l)!.push(node);
//   }

//   const sortedLayers = Array.from(layerGroups.keys()).sort((a, b) => a - b);
//   const steps: { stepNo: number; requiredRole: string; parallelGroup: number; timeLimitHours: number; escalationRole: string | null }[] = [];
//   let stepNoCounter = 1;

//   for (const l of sortedLayers) {
//     const nodesInLayer = layerGroups.get(l)!;
//     const isParallel = nodesInLayer.length > 1;
//     for (const node of nodesInLayer) {
//       steps.push({
//         stepNo: stepNoCounter++,
//         requiredRole: node.label.trim(),
//         parallelGroup: isParallel ? l : 0,
//         timeLimitHours: node.timeLimitHours || 0,
//         escalationRole: node.escalationRole?.trim() || null
//       });
//     }
//   }

//   return steps;
// }

// selectConnection(id: string) {
//   this.selectedConnectionId.set(id);
// }

// deleteSelectedConnection() {
//   const id = this.selectedConnectionId();
//   if (!id) return;
//   this.connections.set(this.connections().filter(c => c.id !== id));
//   this.selectedConnectionId.set(null);
// }
// }

import { Component, OnInit, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FFlowModule, FCreateConnectionEvent } from '@foblex/flow';
import { ActivatedRoute } from '@angular/router';

interface DesignerNode {
  id: string;
  type: 'start' | 'step' | 'end';
  x: number;
  y: number;
  label: string;
  timeLimitHours: number;
  escalationRole: string;
  reassignOnTimeout: boolean;
  priority: string;
}

interface DesignerConnection {
  id: string;
  sourceId: string;
  targetId: string;
}

interface RoleDto {
  roleId: number;
  roleName: string;
  isActive: boolean;
}

@Component({
  selector: 'app-designer',
  standalone: true,
  imports: [FormsModule, CommonModule, FFlowModule],
  templateUrl: './designer.html',
  styleUrl: './designer.scss'
})

export class Designer implements OnInit {
  private apiUrl = 'https://localhost:7000/api/workflow-definitions';
  private rolesUrl = 'https://localhost:7000/api/roles';

  name = '';
  documentType = 'PurchaseOrder';
  minAmount = 0;
  maxAmount = 0;

  roles = signal<RoleDto[]>([]);

nodes = signal<DesignerNode[]>([
  { id: 'start', type: 'start', x: 40, y: 200, label: 'Start', timeLimitHours: 0, escalationRole: '', reassignOnTimeout: false, priority: 'Normal' },
  { id: 'end', type: 'end', x: 700, y: 200, label: 'Approved', timeLimitHours: 0, escalationRole: '', reassignOnTimeout: false, priority: 'Normal' }
]);

  connections = signal<DesignerConnection[]>([]);

  editingNodeId = signal<string | null>(null);
  editingRole = '';
  editingTimeLimitHours = 0;
  editingEscalationRole = '';
  editingReassignOnTimeout = false;
  editingPriority = 'Normal';

  error = signal('');
  saving = signal(false);

  selectedConnectionId = signal<string | null>(null);

  editingDefinitionId: number | null = null;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.http.get<RoleDto[]>(this.rolesUrl).subscribe(data => this.roles.set(data.filter(r => r.isActive)));

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editingDefinitionId = Number(idParam);
      this.loadExistingDefinition(this.editingDefinitionId);
    }
  }

  private loadExistingDefinition(id: number) {
    this.http.get<any>(`${this.apiUrl}/${id}`).subscribe(def => {
      this.name = def.name;
      this.documentType = def.documentType;
      this.minAmount = def.minAmount;
      this.maxAmount = def.maxAmount;

      const stageMap = new Map<number, any[]>();
      for (const step of def.steps) {
        const key = step.parallelGroup !== 0 ? step.parallelGroup : step.stepNo * 1000;
        if (!stageMap.has(key)) stageMap.set(key, []);
        stageMap.get(key)!.push(step);
      }
      const stages = Array.from(stageMap.values()).sort((a, b) => a[0].stepNo - b[0].stepNo);

      const newNodes: DesignerNode[] = [
      { id: 'start', type: 'start', x: 40, y: 200, label: 'Start', timeLimitHours: 0, escalationRole: '', reassignOnTimeout: false, priority: 'Normal' }
      ];
      const newConnections: DesignerConnection[] = [];
      let prevStageNodeIds = ['start'];

      stages.forEach((stage, stageIndex) => {
        const x = 300 + stageIndex * 280;
        const stageNodeIds: string[] = [];

        stage.forEach((step: any, stepIndexInStage: number) => {
          const nodeId = `step-${step.workflowStepId}`;
            newNodes.push({
            id: nodeId,
            type: 'step',
            x,
            y: 100 + stepIndexInStage * 130,
            label: step.requiredRole,
            timeLimitHours: step.timeLimitHours || 0,
            escalationRole: step.escalationRole || '',
            reassignOnTimeout: step.reassignOnTimeout || false,
            priority: step.priority || 'Normal'
          });
          stageNodeIds.push(nodeId);

          for (const prevId of prevStageNodeIds) {
            newConnections.push({ id: `conn-${prevId}-${nodeId}`, sourceId: `${prevId}-out`, targetId: `${nodeId}-in` });
          }
        });

        prevStageNodeIds = stageNodeIds;
      });

        const endX = 300 + stages.length * 280;
        newNodes.push({ id: 'end', type: 'end', x: endX, y: 200, label: 'Approved', timeLimitHours: 0, escalationRole: '', reassignOnTimeout: false, priority: 'Normal' });      for (const prevId of prevStageNodeIds) {
        newConnections.push({ id: `conn-${prevId}-end`, sourceId: `${prevId}-out`, targetId: 'end-in' });
      }

      this.nodes.set(newNodes);
      this.connections.set(newConnections);
    });
  }

  addStep() {
    const stepCount = this.nodes().filter(n => n.type === 'step').length;
    const newNode: DesignerNode = {
      id: `step-${Date.now()}`,
      type: 'step',
      x: 350,
      y: 150 + stepCount * 130,
      label: '',
      timeLimitHours: 0,
      escalationRole: '',
      reassignOnTimeout: false,
      priority: 'Normal'
    };
    this.nodes.set([...this.nodes(), newNode]);
    this.openStepModal(newNode.id);
  }

    openStepModal(id: string) {
      const node = this.nodes().find(n => n.id === id);
      if (!node) return;
      this.editingNodeId.set(id);
      this.editingRole = node.label;
      this.editingTimeLimitHours = node.timeLimitHours;
      this.editingEscalationRole = node.escalationRole;
      this.editingReassignOnTimeout = node.reassignOnTimeout;
      this.editingPriority = node.priority;
    }

  closeStepModal() {
    const id = this.editingNodeId();
    if (id) {
      const node = this.nodes().find(n => n.id === id);
      if (node && !node.label.trim()) {
        this.nodes.set(this.nodes().filter(n => n.id !== id));
        this.connections.set(this.connections().filter(c =>
          this.connectorToNodeId(c.sourceId) !== id && this.connectorToNodeId(c.targetId) !== id
        ));
      }
    }
    this.editingNodeId.set(null);
  }

  confirmStepRole() {
    const id = this.editingNodeId();
    if (!id || !this.editingRole.trim()) return;
    this.nodes.set(this.nodes().map(n => n.id === id
      ? { ...n, label: this.editingRole, timeLimitHours: this.editingTimeLimitHours, escalationRole: this.editingEscalationRole, reassignOnTimeout: this.editingReassignOnTimeout, priority: this.editingPriority }
      : n
    ));
    this.editingNodeId.set(null);
  }

  deleteStep() {
    const id = this.editingNodeId();
    if (!id || id === 'start' || id === 'end') return;
    this.nodes.set(this.nodes().filter(n => n.id !== id));
    this.connections.set(this.connections().filter(c =>
      this.connectorToNodeId(c.sourceId) !== id && this.connectorToNodeId(c.targetId) !== id
    ));
    this.editingNodeId.set(null);
  }

  onMoveNodes(event: any) {
    const ids: string[] = event.fNodeIds ?? [event.fNodeId];
    const pos = event.fPosition ?? event.position;
    if (!pos) return;
    this.nodes.set(this.nodes().map(n => ids.includes(n.id) ? { ...n, x: pos.x, y: pos.y } : n));
  }

  onCreateConnection(event: FCreateConnectionEvent) {
    const sourceId = String(event.sourceId);
    const targetId = String(event.targetId);
    if (!sourceId || !targetId || sourceId === targetId) return;

    const exists = this.connections().some(c => c.sourceId === sourceId && c.targetId === targetId);
    if (exists) return;

    this.connections.set([...this.connections(), { id: `conn-${Date.now()}`, sourceId, targetId }]);
  }

  deleteConnection(id: string) {
    this.connections.set(this.connections().filter(c => c.id !== id));
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

    const steps = this.buildStepsFromGraph();
    if (steps === null) {
      this.error.set('Every step must have a role assigned and be connected in a path from Start to End.');
      return;
    }

    this.saving.set(true);
    const payload = { name: this.name, documentType: this.documentType, minAmount: this.minAmount, maxAmount: this.maxAmount, steps };

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

  private connectorToNodeId(connectorId: string): string {
    return connectorId.replace(/-out$|-in$/, '');
  }

  private buildStepsFromGraph(): { stepNo: number; requiredRole: string; parallelGroup: number; timeLimitHours: number; escalationRole: string | null; reassignOnTimeout: boolean; priority: string }[] | null {    
    const nodes = this.nodes();
    const conns = this.connections();
    const stepNodes = nodes.filter(n => n.type === 'step');

    if (stepNodes.length === 0) return null;
    if (stepNodes.some(n => !n.label.trim())) return null;

    const layer = new Map<string, number>();
    layer.set('start', 0);
    let frontier = ['start'];
    let currentLayer = 0;
    const visited = new Set(['start']);

    while (frontier.length > 0) {
      currentLayer++;
      const next: string[] = [];
      for (const nodeId of frontier) {
        const outgoing = conns.filter(c => this.connectorToNodeId(c.sourceId) === nodeId);
        for (const c of outgoing) {
          const targetNodeId = this.connectorToNodeId(c.targetId);
          if (!visited.has(targetNodeId)) {
            visited.add(targetNodeId);
            layer.set(targetNodeId, currentLayer);
            next.push(targetNodeId);
          }
        }
      }
      frontier = next;
    }

    if (stepNodes.some(n => !layer.has(n.id))) return null;

    const layerGroups = new Map<number, DesignerNode[]>();
    for (const node of stepNodes) {
      const l = layer.get(node.id)!;
      if (!layerGroups.has(l)) layerGroups.set(l, []);
      layerGroups.get(l)!.push(node);
    }

    const sortedLayers = Array.from(layerGroups.keys()).sort((a, b) => a - b);
    const steps: { stepNo: number; requiredRole: string; parallelGroup: number; timeLimitHours: number; escalationRole: string | null; reassignOnTimeout: boolean; priority: string }[] = [];    let stepNoCounter = 1;

    for (const l of sortedLayers) {
      const nodesInLayer = layerGroups.get(l)!;
      const isParallel = nodesInLayer.length > 1;
      for (const node of nodesInLayer) {
      steps.push({
        stepNo: stepNoCounter++,
        requiredRole: node.label.trim(),
        parallelGroup: isParallel ? l : 0,
        timeLimitHours: node.timeLimitHours || 0,
        escalationRole: node.escalationRole?.trim() || null,
        reassignOnTimeout: node.reassignOnTimeout || false,
        priority: node.priority || 'Normal'
      });
      }
    }
    return steps;
  }

  selectConnection(id: string) {
    this.selectedConnectionId.set(id);
  }

  deleteSelectedConnection() {
    const id = this.selectedConnectionId();
    if (!id) return;
    this.connections.set(this.connections().filter(c => c.id !== id));
    this.selectedConnectionId.set(null);
  }
}