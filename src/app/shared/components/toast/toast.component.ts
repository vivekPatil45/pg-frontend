import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fixed top-4 right-4 z-50 space-y-2">
      @for (toast of toasts; track toast.id) {
        <div 
          [class]="getToastClass(toast.type)"
          class="min-w-[300px] max-w-md p-4 rounded-lg shadow-lg flex items-start gap-3 animate-slide-in">
          <!-- Icon -->
          <div class="flex-shrink-0">
            @if (toast.type === 'success') {
              <svg class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            }
            @if (toast.type === 'error') {
              <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            }
            @if (toast.type === 'warning') {
              <svg class="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            @if (toast.type === 'info') {
              <svg class="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          </div>
          
          <!-- Message -->
          <p class="flex-1 text-sm font-medium text-white">{{ toast.message }}</p>
          
          <!-- Close button -->
          <button 
            (click)="removeToast(toast.id)"
            class="flex-shrink-0 text-white/70 hover:text-white transition-colors">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
    styles: [`
    @keyframes slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
    toasts: Toast[] = [];
    private subscription?: Subscription;

    constructor(private toastService: ToastService) { }

    ngOnInit() {
        this.subscription = this.toastService.toasts$.subscribe((toast: Toast) => {
            this.toasts.push(toast);

            // Auto-remove after duration
            setTimeout(() => {
                this.removeToast(toast.id);
            }, toast.duration || 3000);
        });
    }

    ngOnDestroy() {
        this.subscription?.unsubscribe();
    }

    removeToast(id: number) {
        this.toasts = this.toasts.filter(t => t.id !== id);
    }

    getToastClass(type: Toast['type']): string {
        const baseClass = 'backdrop-blur-sm border';
        const typeClasses: Record<Toast['type'], string> = {
            success: 'bg-green-500/90 border-green-400',
            error: 'bg-red-500/90 border-red-400',
            warning: 'bg-yellow-500/90 border-yellow-400',
            info: 'bg-blue-500/90 border-blue-400'
        };
        return `${baseClass} ${typeClasses[type]}`;
    }
}
