import { Component, Input } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-card rounded-xl border border-border p-6 card-hover">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-medium text-muted-foreground">{{ title }}</h3>
        @if (icon) {
          <div class="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <span class="text-primary flex items-center justify-center" [innerHTML]="icon"></span>
          </div>
        }
      </div>
      <div class="flex items-baseline gap-2">
        <p class="text-3xl font-bold text-foreground">{{ value }}</p>
        @if (change !== undefined) {
          <span [class]="getChangeClasses()">
            {{ change > 0 ? '+' : '' }}{{ change }}%
          </span>
        }
      </div>
      @if (description) {
        <p class="mt-2 text-xs text-muted-foreground">{{ description }}</p>
      }
    </div>
  `,
  styles: []
})
export class StatsCardComponent {
  @Input() title!: string;
  @Input() value!: string | number;
  @Input() icon?: string | SafeHtml;
  @Input() change?: number;
  @Input() description?: string;

  getChangeClasses(): string {
    const baseClasses = 'text-xs font-medium';
    if (this.change === undefined) return baseClasses;

    return this.change >= 0
      ? `${baseClasses} text-success`
      : `${baseClasses} text-destructive`;
  }
}
