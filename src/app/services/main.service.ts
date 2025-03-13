import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MainService {

  private readonly httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    responseType: 'json' as const
  };
  apiURL = 'https://localhost:7028/api'

  constructor(private http: HttpClient) { }

  getCitas(){
    return this.http.get<any>(`${this.apiURL}/citas`)
  }
}
