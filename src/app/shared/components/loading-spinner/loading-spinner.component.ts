import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../utils/cn.util';

type SpinnerSize = 'sm' | 'md' | 'lg';

@Component({
    selector: 'app-loading-spinner',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div [class]="getContainerClasses()">
      <div [class]="getSpinnerClasses()"></div>
      @if (text) {
        <p class="mt-2 text-sm text-muted-foreground">{{ text }}</p>
      }
    </div>
  `,
    styles: [`
    .spinner {
      border: 3px solid hsl(var(--muted));
      border-top-color: hsl(var(--primary));
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoadingSpinnerComponent {
    @Input() size: SpinnerSize = 'md';
    @Input() text?: string;
    @Input() fullScreen = false;

    getContainerClasses(): string {
        if (this.fullScreen) {
            return 'flex flex-col items-center justify-center min-h-screen';
        }
        return 'flex flex-col items-center justify-center';
    }

    getSpinnerClasses(): string {
        const sizeClasses = {
            sm: 'w-6 h-6',
            md: 'w-10 h-10',
            lg: 'w-16 h-16'
        };

        return cn('spinner', sizeClasses[this.size]);
    }
}
