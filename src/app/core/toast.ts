import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Toast {
  message = signal<string | null>(null);
  type = signal<'success' | 'error'>('success');

  show(text: string, type: 'success' | 'error' = 'success') {
    this.message.set(text);
    this.type.set(type);
    setTimeout(() => this.message.set(null), type === 'error' ? 5000 : 3000);
  }
}