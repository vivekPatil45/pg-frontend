import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './modal.component';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, ButtonComponent],
  template: `
    <app-modal
      [isOpen]="isOpen"
      [title]="title"
      size="sm"
      (close)="onCancel()"
    >
      <div class="py-2">
        <p class="text-foreground/80 leading-relaxed">{{ message }}</p>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <app-button
          variant="ghost"
          (click)="onCancel()"
          [disabled]="isLoading"
        >
          {{ cancelText }}
        </app-button>
        <app-button
          [variant]="confirmVariant"
          (click)="onConfirm()"
          [disabled]="isLoading"
        >
          @if (isLoading) {
            <span class="flex items-center gap-2">
              <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          } @else {
            {{ confirmText }}
          }
        </app-button>
      </div>
    </app-modal>
  `
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() confirmVariant: 'default' | 'destructive' | 'outline' | 'ghost' = 'default';
  @Input() isLoading = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
