import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast {
    id: number;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private toastSubject = new Subject<Toast>();
    public toasts$ = this.toastSubject.asObservable();
    private toastId = 0;

    success(message: string, duration: number = 3000) {
        this.show('success', message, duration);
    }

    error(message: string, duration: number = 4000) {
        this.show('error', message, duration);
    }

    warning(message: string, duration: number = 3500) {
        this.show('warning', message, duration);
    }

    info(message: string, duration: number = 3000) {
        this.show('info', message, duration);
    }

    private show(type: Toast['type'], message: string, duration: number) {
        const toast: Toast = {
            id: ++this.toastId,
            type,
            message,
            duration
        };
        this.toastSubject.next(toast);
    }
}
