import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
}

@Component({
    selector: 'app-data-table',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="bg-card rounded-xl border border-border overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-muted/50 border-b border-border">
              @for (column of columns; track column.key) {
                <th 
                  class="text-left py-3 px-4 font-medium text-muted-foreground text-sm"
                  [style.width]="column.width"
                  [class.cursor-pointer]="column.sortable"
                  (click)="column.sortable && onSort(column.key)"
                >
                  <div class="flex items-center gap-2">
                    {{ column.label }}
                    @if (column.sortable) {
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    }
                  </div>
                </th>
              }
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            @if (data.length > 0) {
              @for (row of data; track trackBy(row)) {
                <tr class="hover:bg-muted/50 transition-colors">
                  <ng-content [ngTemplateOutlet]="rowTemplate" [ngTemplateOutletContext]="{ $implicit: row }"></ng-content>
                </tr>
              }
            } @else {
              <tr>
                <td [attr.colspan]="columns.length" class="py-8 text-center text-muted-foreground">
                  <div class="flex flex-col items-center gap-2">
                    <svg class="h-12 w-12 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p>{{ emptyMessage }}</p>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (showPagination && totalPages > 1) {
        <div class="border-t border-border px-4 py-3 flex items-center justify-between">
          <div class="text-sm text-muted-foreground">
            Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, totalItems) }} of {{ totalItems }} results
          </div>
          <div class="flex gap-2">
            <button
              (click)="onPageChange(currentPage - 1)"
              [disabled]="currentPage === 1"
              class="px-3 py-1 rounded border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            >
              Previous
            </button>
            <button
              (click)="onPageChange(currentPage + 1)"
              [disabled]="currentPage === totalPages"
              class="px-3 py-1 rounded border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      }
    </div>
  `,
    styles: []
})
export class DataTableComponent {
    @Input() columns: TableColumn[] = [];
    @Input() data: any[] = [];
    @Input() emptyMessage = 'No data available';
    @Input() showPagination = false;
    @Input() currentPage = 1;
    @Input() pageSize = 10;
    @Input() totalItems = 0;
    @Input() trackBy: (item: any) => any = (item) => item.id;

    Math = Math;

    get totalPages(): number {
        return Math.ceil(this.totalItems / this.pageSize);
    }

    onSort(key: string): void {
        // Emit sort event - parent component should handle sorting
        console.log('Sort by:', key);
    }

    onPageChange(page: number): void {
        // Emit page change event - parent component should handle pagination
        console.log('Page change:', page);
    }

    get rowTemplate(): any {
        // This will be provided by ng-content
        return null;
    }
}
