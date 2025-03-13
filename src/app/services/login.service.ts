import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private readonly httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    responseType: 'json' as const
  };
  secretKey = 'nsodcndond23indo23inddosnd23'
  private readonly authURL = 'http://107.22.135.175:8084/Auth';


  constructor(private http: HttpClient) {
   }

   login(user:FormData):Observable<any>{
    return this.http.post<any>(this.authURL, user);
   }

   setItem(key: string, value: string): void {
    const encryptedValue = CryptoJS.AES.encrypt(value, this.secretKey).toString();
    localStorage.setItem(key, encryptedValue);
  }

  getItem(key: string): string | null {
    const encryptedValue = localStorage.getItem(key);
    if (encryptedValue) {
      const bytes = CryptoJS.AES.decrypt(encryptedValue, this.secretKey);
      const originalValue = bytes.toString(CryptoJS.enc.Utf8);
      return originalValue || null;
    }
    return null;
  }
}
