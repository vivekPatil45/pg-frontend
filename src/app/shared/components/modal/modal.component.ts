import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../utils/cn.util';

@Component({
    selector: 'app-modal',
    standalone: true,
    imports: [CommonModule],
    template: `
    @if (isOpen) {
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-foreground/50 z-50 animate-fade-in"
        (click)="handleClose()"
      ></div>
      
      <!-- Modal -->
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          [class]="getModalClasses()"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          @if (title) {
            <div class="flex items-center justify-between mb-4 pb-4 border-b border-border">
              <h2 class="text-xl font-semibold text-foreground">{{ title }}</h2>
              <button
                type="button"
                class="text-muted-foreground hover:text-foreground transition-colors"
                (click)="handleClose()"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          }
          
          <!-- Content -->
          <div class="modal-content">
            <ng-content></ng-content>
          </div>
          
          <!-- Footer -->
          @if (showFooter) {
            <div class="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
              <ng-content select="[footer]"></ng-content>
            </div>
          }
        </div>
      </div>
    }
  `,
    styles: []
})
export class ModalComponent {
    @Input() isOpen = false;
    @Input() title?: string;
    @Input() showFooter = true;
    @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
    @Input() className = '';
    @Output() close = new EventEmitter<void>();

    handleClose() {
        this.close.emit();
    }

    getModalClasses(): string {
        const baseClasses = 'bg-card rounded-xl border border-border shadow-lg animate-slide-up max-h-[90vh] overflow-y-auto';

        const sizeClasses = {
            sm: 'w-full max-w-md p-6',
            md: 'w-full max-w-lg p-6',
            lg: 'w-full max-w-2xl p-8',
            xl: 'w-full max-w-4xl p-8'
        };

        return cn(
            baseClasses,
            sizeClasses[this.size],
            this.className
        );
    }
}
