import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginService } from './login.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormularioService {

  httpOptions:object
  apiURL = 'https://localhost:7028/api'
  apikey:any;
  clientesURL = 'http://107.22.135.175:8084/Client'

  constructor(private http: HttpClient, loginService:LoginService){
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':'application/json'
      })
    }
    this.apikey = loginService.getItem('token');
  }

  getClientes(user:object):Observable<any>{
    const headers = new HttpHeaders().set('api-key-hunter', this.apikey);
    return this.http.post<any>(this.clientesURL, user, {headers})
  }

  getTecnicos(){
    return this.http.get<any>(`${this.apiURL}/tecnico`)
  }

  getPuntoServicio(){
    return this.http.get<any>(`${this.apiURL}/puntoservicio`)
  }

  postCitas(cita:object){
    return this.http.post<any>(`${this.apiURL}/citas`, cita, this.httpOptions);
  }

  editarCita(citaId:any, cita:object){
    return this.http.put<any>(`${this.apiURL}/citas/${citaId}`, cita, {headers:(this.httpOptions as any).headers, observe: 'response'})
  }

}
