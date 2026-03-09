import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { AdminRoomService } from '../../../core/services/admin-room.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-admin-room-bulk-import',
    standalone: true,
    imports: [
        CommonModule,
        ButtonComponent,
        LoadingSpinnerComponent
    ],
    template: `
    <div class="bg-card rounded-xl border border-border p-6 shadow-sm">
      <h2 class="text-xl font-bold text-foreground mb-4">Bulk Import Rooms</h2>
      
      <div class="space-y-4">
        <div class="p-8 bg-muted/30 rounded-lg border-2 border-border border-dashed transition-colors hover:bg-muted/50">
          <div class="flex flex-col items-center justify-center text-center">
            <div class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg class="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p class="text-sm font-medium text-foreground mb-1">
              Upload a CSV file to import rooms in bulk.
            </p>
            <p class="text-xs text-muted-foreground mb-6 max-w-xs">
              Ensure your CSV follows the template format: RoomNumber, RoomType, Price, Amenities, Floor, RoomSize, Description.
            </p>
            
            <input 
              type="file" 
              accept=".csv"
              class="hidden" 
              #fileInput
              (change)="onFileSelected($event)"
            >
            
            <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <app-button variant="outline" size="sm" (click)="downloadTemplate()" class="w-full sm:w-auto">
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Template
              </app-button>
              <app-button size="sm" (click)="fileInput.click()" class="w-full sm:w-auto">
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Select CSV File
              </app-button>
            </div>
          </div>
        </div>

        @if (selectedFile) {
          <div class="flex items-center justify-between p-4 bg-background border border-border rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded bg-muted flex items-center justify-center">
                <svg class="h-6 w-6 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-foreground truncate max-w-[200px]">
                  {{ selectedFile.name }}
                </p>
                <p class="text-xs text-muted-foreground">
                  {{ (selectedFile.size / 1024) | number:'1.0-2' }} KB
                </p>
              </div>
            </div>
            <button 
              class="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              (click)="clearFile()"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <app-button 
            class="w-full shadow-lg shadow-primary/20" 
            [disabled]="isUploading"
            (click)="uploadFile()"
          >
            @if (isUploading) {
              <app-loading-spinner size="sm" class="mr-2"></app-loading-spinner>
              Importing Data...
            } @else {
              Start Bulk Import
            }
          </app-button>
        }

        @if (importResult) {
          <div class="mt-4 p-5 rounded-lg border animate-in zoom-in-95 duration-300" [ngClass]="{
            'bg-green-50/50 border-green-200': importResult.failure === 0,
            'bg-amber-50/50 border-amber-200': importResult.failure > 0
          }">
            <h3 class="font-bold flex items-center gap-2 mb-3" [ngClass]="{
              'text-green-700': importResult.failure === 0,
              'text-amber-700': importResult.failure > 0
            }">
              @if (importResult.failure === 0) {
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              } @else {
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
              Import Summary
            </h3>
            
            <div class="grid grid-cols-3 gap-4 mb-4">
              <div class="text-center p-2 rounded bg-white/50 border border-black/5">
                <p class="text-xs text-muted-foreground uppercase font-semibold">Total</p>
                <p class="text-lg font-bold text-foreground">{{ importResult.processed }}</p>
              </div>
              <div class="text-center p-2 rounded bg-green-50 border border-green-100">
                <p class="text-xs text-green-600 uppercase font-semibold">Success</p>
                <p class="text-lg font-bold text-green-700">{{ importResult.success }}</p>
              </div>
              <div class="text-center p-2 rounded bg-red-50 border border-red-100">
                <p class="text-xs text-red-600 uppercase font-semibold">Failed</p>
                <p class="text-lg font-bold text-red-700">{{ importResult.failure }}</p>
              </div>
            </div>

            @if (importResult.failure > 0) {
              <div class="mt-2 pt-3 border-t border-amber-200">
                <p class="font-semibold text-xs text-amber-800 mb-2">Error Details:</p>
                <div class="scrollbar-thin scrollbar-thumb-amber-200 overflow-y-auto max-h-40 pr-2">
                  <ul class="space-y-1">
                    @for (error of importResult.errors; track error) {
                      <li class="text-xs text-red-600 bg-red-50/50 p-2 rounded border border-red-100">
                        {{ error }}
                      </li>
                    }
                  </ul>
                </div>
              </div>
            } @else if (importResult.processed > 0) {
              <div class="text-sm text-green-700 font-medium text-center py-2">
                All rooms were imported successfully!
              </div>
            }
          </div>
        }

        @if (errorMessage) {
          <div class="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm flex items-start gap-3 animate-in shake-10 duration-300">
            <svg class="h-5 w-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ errorMessage }}
          </div>
        }
      </div>
    </div>
  `,
    styles: []
})
export class AdminRoomBulkImportComponent {
    selectedFile: File | null = null;
    isUploading = false;
    importResult: any = null;
    errorMessage = '';

    constructor(
        private adminRoomService: AdminRoomService,
        private toastService: ToastService
    ) { }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            if (!file.name.toLowerCase().endsWith('.csv')) {
                this.errorMessage = 'Please upload a valid CSV file.';
                this.selectedFile = null;
                return;
            }
            this.selectedFile = file;
            this.errorMessage = '';
            this.importResult = null;
        }
    }

    clearFile() {
        this.selectedFile = null;
        this.errorMessage = '';
        this.importResult = null;
    }

    downloadTemplate() {
        this.adminRoomService.downloadTemplate().subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'pg_rooms_template.csv';
                link.click();
                window.URL.revokeObjectURL(url);
                this.toastService.success('Template downloaded successfully');
            },
            error: () => {
                this.errorMessage = 'Failed to download template.';
                this.toastService.error('Template download failed');
            }
        });
    }

    uploadFile() {
        if (!this.selectedFile) return;

        this.isUploading = true;
        this.errorMessage = '';
        this.importResult = null;

        this.adminRoomService.bulkImportRooms(this.selectedFile).subscribe({
            next: (response) => {
                this.isUploading = false;
                if (response.success) {
                    this.importResult = response.data;
                    if (this.importResult.failure === 0) {
                        this.selectedFile = null;
                        this.toastService.success('Bulk import successful!');
                    } else if (this.importResult.success > 0) {
                        this.toastService.warning(`Imported ${this.importResult.success} rooms with ${this.importResult.failure} failures.`);
                    } else {
                        this.toastService.error('Bulk import failed for all rooms.');
                    }
                }
            },
            error: (error) => {
                this.isUploading = false;
                this.errorMessage = error.error?.message || 'Failed to import rooms. Please check your file format.';
                this.toastService.error('Bulk import failed');
            }
        });
    }
}
