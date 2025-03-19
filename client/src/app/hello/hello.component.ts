import { Component } from '@angular/core';
import { HelloService } from './hello.service';

@Component({
  selector: 'app-hello',
  template: `
    <style>
      h1 {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 90vh;
        margin: 0;
      }
      .loader {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 24px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 20px;
        border-radius: 5px;
        z-index: 1000;
      }
    </style>

    <h1>Hello World</h1>
    <div>
      <button (click)="generatePdf()">Download PDF</button> 
      <button (click)="getLatestEmail()">Get Latest Email</button>
    </div>

    <!-- Loader displayed when isLoading is true -->
    <div *ngIf="isLoading" class="loader">Loading...</div>
  `,
})
export class HelloComponent {
  isLoading: boolean = false; // Tracks the loading state

  constructor(private apiService: HelloService) {}

  generatePdf() {
    this.isLoading = true;
    this.apiService.generatePdf().subscribe(blob => {
      console.log(blob);
      // Perform any further processing with blob here...
      this.isLoading = false;
    });
  }

  downloadPdf() {
    this.isLoading = true;
    this.apiService.downloadPdf().subscribe(blob => {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'hello.pdf';
      link.click();
      this.isLoading = false;
    });
  }

  getLatestEmail() {
    this.isLoading = true;

    this.apiService.getLatestEmail().subscribe(email => {
      const emailJson = JSON.stringify(email, null, 2);
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Latest Email</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1, h2 { color: #333; }
            .section { margin-bottom: 20px; }
            pre { background: #f4f4f4; padding: 10px; border: 1px solid #ccc; }
          </style>
        </head>
        <body>
          <h1>Latest Email</h1>
          <div class="section">
            <h2>Subject: ${email.subject || 'No Subject'}</h2>
            <p><strong>From:</strong> ${email.from && email.from.text ? email.from.text : 'N/A'}</p>
            <p><strong>To:</strong> ${email.to && email.to.text ? email.to.text : 'N/A'}</p>
            <p><strong>Date:</strong> ${email.date || 'N/A'}</p>
          </div>
          <div class="section">
            <hr/>
            <h3>Text Content</h3>
            <hr/>
            <p>${email.text || 'No text content available.'}</p>
          </div>
          <div class="section">
            <hr/>
            <h3>HTML Content</h3>
            <hr/>
            ${ email.html ? email.html : '<p>No HTML content available.</p>' }
          </div>
          <hr/>
          <div class="section">
            <h3>Raw JSON</h3>
            <pre>${emailJson}</pre>
          </div>
        </body>
        </html>
      `;

      const emailWindow = window.open('', '_blank');
      if (emailWindow) {
        emailWindow.document.write(htmlContent);
        emailWindow.document.close();
      }
      this.isLoading = false;
    });
  }
}
