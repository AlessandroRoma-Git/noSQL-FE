import { environment } from 'src/environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private readonly apiUrl = environment.apiUrl + '/email';
  private http = inject(HttpClient);

  sendTestEmail(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, payload);
  }

  sendEmail(payload: any): Observable<any> {
    return this.sendTestEmail(payload);
  }
}
