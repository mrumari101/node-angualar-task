import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class HelloService {
    private baseUrl = 'http://localhost:3000';

    constructor(private http: HttpClient) { }

    // Generate PDF
    generatePdf(): Observable<any> {
        return this.http.get(`${this.baseUrl}/generate-pdf`);
    }

    // Download PDF
    downloadPdf(): Observable<Blob> {
        return this.http.get(`${this.baseUrl}/download-pdf`, {
            responseType: 'blob'
        });
    }

    // Fetch latest email
    getLatestEmail(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/latest-mail`);
    }
}