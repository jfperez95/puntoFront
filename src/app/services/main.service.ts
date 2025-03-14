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

  borrarCita(citaId:any){
    return this.http.delete<any>(`${this.apiURL}/citas/${citaId}`, {headers:(this.httpOptions as any).headers, observe: 'response'});
  }
}
