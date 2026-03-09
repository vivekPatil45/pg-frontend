import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ConfirmModalComponent } from '../../../shared/components/modal/confirm-modal.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { AdminRoomService } from '../../../core/services/admin-room.service';
import { ToastService } from '../../../core/services/toast.service';
import { Room, CreateRoomData, UpdateRoomData } from '../../../models/room.model';
import { AdminBedsComponent } from './admin-beds.component';

@Component({
  selector: 'app-admin-rooms',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonComponent,
    StatusBadgeComponent,
    ModalComponent,
    ConfirmModalComponent,
    LoadingSpinnerComponent,
    AdminBedsComponent
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold text-foreground">Room Management</h1>
          <p class="text-muted-foreground mt-1">Manage PG rooms, bed counts, pricing, and amenities</p>
        </div>
        <div class="flex flex-wrap gap-2 w-full sm:w-auto">
          <div class="relative w-full sm:w-[200px]">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (keyup.enter)="loadRooms(0)"
              placeholder="Search room..."
              class="h-10 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
          </div>
          <select [(ngModel)]="filterRoomType" (change)="loadRooms(0)" class="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto">
            <option value="">All Types</option>
            <option value="SINGLE_SHARING">Single Sharing</option>
            <option value="DOUBLE_SHARING">Double Sharing</option>
            <option value="TRIPLE_SHARING">Triple Sharing</option>
          </select>
          <select [(ngModel)]="filterAvailability" (change)="loadRooms(0)" class="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto">
            <option value="">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="UNAVAILABLE">Full</option>
          </select>
          <app-button (click)="openAddModal()">+ Add Room</app-button>
        </div>
      </div>

      @if (isLoading) {
        <div class="flex justify-center py-12">
          <app-loading-spinner size="lg"></app-loading-spinner>
        </div>
      } @else if (errorMessage) {
        <div class="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
          {{ errorMessage }}
        </div>
      } @else {
        <div class="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-muted/50 border-b border-border select-none">
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">
                    Room #
                  </th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">
                    Type
                  </th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm cursor-pointer hover:bg-muted/70 transition-colors" (click)="toggleSort('price')">
                    <div class="flex items-center gap-1">Price/Month <span class="text-xs text-muted-foreground/70">{{getSortIcon('price')}}</span></div>
                  </th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm cursor-pointer hover:bg-muted/70 transition-colors" (click)="toggleSort('totalBeds')">
                    <div class="flex items-center gap-1">Total Beds <span class="text-xs text-muted-foreground/70">{{getSortIcon('totalBeds')}}</span></div>
                  </th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm cursor-pointer hover:bg-muted/70 transition-colors" (click)="toggleSort('availableBeds')">
                    <div class="flex items-center gap-1">Available <span class="text-xs text-muted-foreground/70">{{getSortIcon('availableBeds')}}</span></div>
                  </th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">
                    Status
                  </th>
                  <th class="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Amenities</th>
                  <th class="text-right py-3 px-4 font-medium text-muted-foreground text-sm">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                @for (room of rooms; track room.roomId) {
                  <tr class="hover:bg-muted/40 transition-colors">
                    <td class="py-3 px-4 font-semibold text-foreground">{{ room.roomNumber }}</td>
                    <td class="py-3 px-4 text-sm text-foreground">
                      <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {{ room.roomType === 'SINGLE_SHARING' ? 'Single' : room.roomType === 'DOUBLE_SHARING' ? 'Double' : 'Triple' }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-sm font-medium text-foreground">₹{{ room.price | number }}</td>
                    <td class="py-3 px-4 text-sm text-foreground text-center">{{ room.totalBeds }}</td>
                    <td class="py-3 px-4 text-sm text-center">
                      <span [class]="room.availableBeds > 0 ? 'text-success font-medium' : 'text-destructive font-medium'">
                        {{ room.availableBeds }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-sm">
                      <span [class]="getRoomStatusClass(room.currentStatus)">
                        {{ room.currentStatus ?? 'N/A' }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-sm text-muted-foreground truncate max-w-[160px]" [title]="room.amenities.join(', ') || 'None'">
                      {{ room.amenities.join(', ') || 'None' }}
                    </td>
                    <td class="py-3 px-4 text-right">
                      <div class="flex justify-end gap-1">
                        <app-button variant="ghost" size="sm" (click)="openManageBeds(room)" title="Manage Beds">
                          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </app-button>
                        <app-button variant="ghost" size="sm" (click)="openEditModal(room)">Edit</app-button>
                        <app-button variant="ghost" size="sm" class="text-destructive hover:bg-destructive/10" (click)="deleteRoom(room)">Delete</app-button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="8" class="py-12 text-center text-muted-foreground">
                      <svg class="h-10 w-10 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      No rooms found. Click "Add Room" to create one.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        @if (totalPages > 1) {
          <div class="flex justify-center gap-2 mt-4">
            <app-button variant="outline" size="sm" [disabled]="currentPage === 0" (click)="loadRooms(currentPage - 1)">Previous</app-button>
            <span class="px-4 py-2 text-sm text-muted-foreground flex items-center">Page {{ currentPage + 1 }} of {{ totalPages }}</span>
            <app-button variant="outline" size="sm" [disabled]="currentPage === totalPages - 1" (click)="loadRooms(currentPage + 1)">Next</app-button>
          </div>
        }
      }
    </div>

    <!-- Add/Edit Room Modal -->
    <app-modal
      [isOpen]="isModalOpen"
      [title]="isEditMode ? 'Edit Room' : 'Add New Room'"
      size="lg"
      (close)="closeModal()"
    >
      <form [formGroup]="roomForm" (ngSubmit)="onSubmit()">
        <div class="grid grid-cols-2 gap-4 p-1">
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Room Number *</label>
            <input
              type="text"
              formControlName="roomNumber"
              [disabled]="isEditMode"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-60"
              placeholder="e.g. 101"
            />
            @if (roomForm.get('roomNumber')?.invalid && roomForm.get('roomNumber')?.touched) {
              <span class="text-xs text-destructive">Room number is required.</span>
            }
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Room Type *</label>
            <select formControlName="roomType" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="" disabled>Select type</option>
              <option value="SINGLE_SHARING">Single Sharing</option>
              <option value="DOUBLE_SHARING">Double Sharing</option>
              <option value="TRIPLE_SHARING">Triple Sharing</option>
            </select>
            @if (roomForm.get('roomType')?.invalid && roomForm.get('roomType')?.touched) {
              <span class="text-xs text-destructive">Room type is required.</span>
            }
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Price per Month (₹) *</label>
            <input
              type="number"
              formControlName="price"
              min="100"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            @if (roomForm.get('price')?.invalid && roomForm.get('price')?.touched) {
              <span class="text-xs text-destructive">Valid price is required.</span>
            }
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Total Beds *</label>
            <input
              type="number"
              formControlName="totalBeds"
              min="1" max="10"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            @if (roomForm.get('totalBeds')?.invalid && roomForm.get('totalBeds')?.touched) {
              <span class="text-xs text-destructive">Total beds is required.</span>
            }
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Floor *</label>
            <input
              type="number"
              formControlName="floor"
              min="1" max="50"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            @if (roomForm.get('floor')?.invalid && roomForm.get('floor')?.touched) {
              <span class="text-xs text-destructive">Floor is required.</span>
            }
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Room Size (sq ft) *</label>
            <input
              type="number"
              formControlName="roomSize"
              min="1"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            @if (roomForm.get('roomSize')?.invalid && roomForm.get('roomSize')?.touched) {
              <span class="text-xs text-destructive">Room size is required.</span>
            }
          </div>

          <div class="space-y-2 col-span-2">
            <label class="text-sm font-medium text-foreground">Amenities</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
              @for (amenity of predefinedAmenities; track amenity) {
                <label class="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    class="rounded border-input text-primary"
                    [checked]="selectedAmenities.has(amenity)"
                    (change)="toggleAmenity(amenity)"
                  >
                  <span>{{ amenity }}</span>
                </label>
              }
            </div>
          </div>

          <div class="space-y-2 col-span-2">
            <label class="text-sm font-medium text-foreground">Description</label>
            <textarea
              formControlName="description"
              rows="3"
              class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
              placeholder="Brief description of the room..."
            ></textarea>
          </div>
        </div>

        @if (submitError) {
          <div class="mt-3 bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
            {{ submitError }}
          </div>
        }

        <div class="mt-6 flex justify-end gap-3">
          <app-button variant="ghost" type="button" (click)="closeModal()" [disabled]="isSubmitting">Cancel</app-button>
          <app-button type="submit" [disabled]="isSubmitting">
            @if (isSubmitting) { <span>Saving...</span> } @else { <span>{{ isEditMode ? 'Update Room' : 'Add Room' }}</span> }
          </app-button>
        </div>
      </form>
    </app-modal>

    <!-- Manage Beds Modal -->
    <app-modal
      [isOpen]="isBedsModalOpen"
      [title]="'Manage Beds - Room ' + (selectedRoom?.roomNumber || '')"
      size="xl"
      (close)="closeBedsModal()"
    >
      @if (selectedRoom) {
        <app-admin-beds [room]="selectedRoom"></app-admin-beds>
      }
      <div class="mt-6 flex justify-end">
        <app-button variant="outline" (click)="closeBedsModal()">Close</app-button>
      </div>
    </app-modal>

    <!-- Confirm Delete Room Modal -->
    <app-confirm-modal
      [isOpen]="isConfirmDeleteOpen"
      title="Delete Room"
      [message]="'Are you sure you want to delete room ' + (selectedRoomForAction?.roomNumber || '') + '? This cannot be undone.'"
      confirmText="Delete Room"
      confirmVariant="destructive"
      (confirm)="onConfirmDeleteRoom()"
      (cancel)="closeConfirmModal()"
    ></app-confirm-modal>
  `,
  styles: []
})
export class AdminRoomsComponent implements OnInit {
  rooms: Room[] = [];
  isLoading = false;
  errorMessage = '';
  isModalOpen = false;
  isBedsModalOpen = false;
  isConfirmDeleteOpen = false;
  isEditMode = false;
  isSubmitting = false;
  submitError = '';
  selectedRoom: Room | null = null;
  selectedRoomForAction: Room | null = null;
  searchQuery = '';
  filterRoomType = '';
  filterAvailability = '';
  sortBy = 'roomNumber';
  sortOrder = 'asc';

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;

  roomForm: FormGroup;

  predefinedAmenities = ['Wi-Fi', 'Air Conditioning', 'TV', 'Attached Bathroom', 'Wardrobe', 'Geyser', 'Desk', 'Balcony'];
  selectedAmenities: Set<string> = new Set();

  constructor(
    private fb: FormBuilder,
    private adminRoomService: AdminRoomService,
    private toastService: ToastService
  ) {
    this.roomForm = this.fb.group({
      roomNumber: ['', Validators.required],
      roomType: ['', Validators.required],
      price: [5000, [Validators.required, Validators.min(100)]],
      totalBeds: [1, [Validators.required, Validators.min(1)]],
      floor: [1, [Validators.required, Validators.min(1), Validators.max(50)]],
      roomSize: [100, [Validators.required, Validators.min(1)]],
      description: ['']
    });

    // Handle roomType change to auto-set totalBeds
    this.roomForm.get('roomType')?.valueChanges.subscribe(type => {
      const beds = type === 'SINGLE_SHARING' ? 1 : type === 'DOUBLE_SHARING' ? 2 : type === 'TRIPLE_SHARING' ? 3 : 1;
      this.roomForm.patchValue({ totalBeds: beds });
    });
  }

  ngOnInit() {
    this.loadRooms();
  }

  loadRooms(page: number = 0) {
    this.isLoading = true;
    this.errorMessage = '';
    this.currentPage = page;

    const filters: any = { sortBy: this.sortBy, sortOrder: this.sortOrder };
    if (this.searchQuery) filters.searchQuery = this.searchQuery;
    if (this.filterRoomType) filters.roomType = this.filterRoomType;
    if (this.filterAvailability === 'AVAILABLE') filters.availability = true;
    if (this.filterAvailability === 'UNAVAILABLE') filters.availability = false;

    this.adminRoomService.getRooms(filters, page, this.pageSize).subscribe({
      next: (response) => {
        console.log("API RESPONSE:", response);
        if (response.success && response.data) {
          this.rooms = response.data.content;
          console.log("ROOMS:", this.rooms);
          this.totalPages = response.data.totalPages;
          this.currentPage = response.data.page;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load rooms.';
        this.isLoading = false;
      }
    });
  }

  openAddModal() {
    this.isEditMode = false;
    this.selectedRoom = null;
    this.selectedAmenities.clear();
    this.submitError = '';
    this.roomForm.reset({ roomNumber: '', roomType: '', price: 5000, totalBeds: 1, floor: 1, roomSize: 100, description: '' });
    this.roomForm.get('roomNumber')?.enable();
    this.isModalOpen = true;
  }

  openEditModal(room: Room) {
    this.isEditMode = true;
    this.selectedRoom = room;
    this.selectedAmenities = new Set(room.amenities ?? []);
    this.submitError = '';
    this.roomForm.patchValue({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      price: room.price,
      totalBeds: room.totalBeds,
      floor: room.floor || 1,
      roomSize: room.roomSize || 100,
      description: room.description
    });
    this.roomForm.get('roomNumber')?.disable();
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.roomForm.reset();
    this.submitError = '';
  }

  toggleAmenity(amenity: string) {
    if (this.selectedAmenities.has(amenity)) {
      this.selectedAmenities.delete(amenity);
    } else {
      this.selectedAmenities.add(amenity);
    }
  }

  toggleSort(column: string) {
    if (this.sortBy === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortOrder = 'asc';
    }
    this.loadRooms(0);
  }

  getSortIcon(column: string): string {
    if (this.sortBy !== column) return '↕';
    return this.sortOrder === 'asc' ? '↑' : '↓';
  }

  getRoomStatusClass(status?: string): string {
    const base = 'px-2 py-0.5 rounded-full text-xs font-medium ';
    switch (status) {
      case 'AVAILABLE': return base + 'bg-green-100 text-green-700';
      case 'OCCUPIED': return base + 'bg-red-100 text-red-700';
      case 'MAINTENANCE': return base + 'bg-yellow-100 text-yellow-700';
      default: return base + 'bg-muted text-muted-foreground';
    }
  }

  onSubmit() {
    if (this.roomForm.invalid) {
      this.roomForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    const formVal = this.roomForm.getRawValue();
    const data = { ...formVal, amenities: Array.from(this.selectedAmenities), images: [] };

    const request$ = this.isEditMode && this.selectedRoom?.roomId
      ? this.adminRoomService.updateRoom(this.selectedRoom.roomId, data as UpdateRoomData)
      : this.adminRoomService.createRoom(data as CreateRoomData);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toastService.success(this.isEditMode ? 'Room updated successfully.' : 'Room added successfully.');
        this.closeModal();
        this.loadRooms(this.currentPage);
      },
      error: (err) => {
        let errorMsg = err.error?.message || `Failed to ${this.isEditMode ? 'update' : 'create'} room.`;
        if (err.error?.errors && Array.isArray(err.error.errors)) {
          errorMsg = err.error.errors.map((e: any) => e.message).join(', ');
        }
        this.submitError = errorMsg;
        this.isSubmitting = false;
      }
    });
  }

  deleteRoom(room: Room) {
    if (!room.roomId) {
      this.toastService.error('Room ID is missing.');
      return;
    }
    this.selectedRoomForAction = room;
    this.isConfirmDeleteOpen = true;
  }

  onConfirmDeleteRoom() {
    if (!this.selectedRoomForAction?.roomId) return;

    const roomNum = this.selectedRoomForAction.roomNumber;
    this.adminRoomService.deleteRoom(this.selectedRoomForAction.roomId).subscribe({
      next: () => {
        this.toastService.success(`Room ${roomNum} deleted successfully.`);
        this.closeConfirmModal();
        this.loadRooms(this.currentPage);
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to delete room.');
        this.closeConfirmModal();
      }
    });
  }

  closeConfirmModal() {
    this.isConfirmDeleteOpen = false;
    this.selectedRoomForAction = null;
  }

  openManageBeds(room: Room) {
    this.selectedRoom = room;
    this.isBedsModalOpen = true;
  }

  closeBedsModal() {
    this.isBedsModalOpen = false;
    this.selectedRoom = null;
    this.loadRooms(this.currentPage); // Refresh room status/counts
  }
}
