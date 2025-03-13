import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormularioService } from '../services/formulario.service';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { response } from 'express';
import { error } from 'console';

@Component({
  selector: 'app-formulario',
  standalone:true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './formulario.component.html',
  styleUrl: './formulario.component.scss'
})
export class FormularioComponent {

  cliente:any
  tecnicos:any
  puntoServicio:any
  usuario:any
  accion:any
  nombre:any
  form:FormGroup;

  constructor(private formularioService:FormularioService,
    private fb:FormBuilder,
    private Router:Router,
    private alert:MatSnackBar
  ){
    this.form = this.fb.group({
      accion:['', Validators.required],
      user: ['', Validators.required],
      nombreCliente: ['', Validators.required],
      fechaCita: ['', Validators.required],
      idTecnico: ['', Validators.required]
    })
  }

  async ngOnInit(){
    this.tecnicos = await firstValueFrom(this.formularioService.getTecnicos())
    this.puntoServicio = await firstValueFrom(this.formularioService.getPuntoServicio())
    console.log(this.tecnicos)
    console.log(this.puntoServicio)
  }

  valorAccion(event:any){
    this.accion = event.target.value;
    console.log(this.accion);
  }

  async verificarUsuario(event:any){
    this.usuario = event.target.value;
    if(this.accion != null && this.usuario != null){
      const clienteUser = {
        accion: this.accion,
        correo: this.usuario
      }
      console.log(clienteUser);
      this.cliente = await firstValueFrom(this.formularioService.getClientes(clienteUser))
      this.nombre = this.cliente.datos.usuario[0].nombre

      if (this.cliente && this.cliente.datos && this.cliente.datos.usuario && this.cliente.datos.usuario.length > 0) {
        this.nombre = this.cliente.datos.usuario[0].nombre;
        console.log("Nombre del usuario encontrado:", this.nombre);

        // ✅ Actualizar el campo `nombreCliente` en el formulario
        this.form.patchValue({ nombreCliente: this.nombre });
      } else {
        console.error("Cliente no encontrado o sin datos");
        this.alert.open("No se encontraron datos para el usuario ingresado", "Cerrar", { duration: 4000 });

        // ✅ Si no hay nombre, limpiar el campo
        this.form.patchValue({ nombreCliente: '' });
      }
      console.log(this.nombre)
    }

  }

  async onSubmit(){

    const fechaCitaRaw = this.form.get('fechaCita')?.value;
    const fechaCita = new Date(fechaCitaRaw);
    const fechaCitaSQL = fechaCita.toISOString();
    const guardar = {
      nombreCliente: this.nombre,
      fechaCita: fechaCitaSQL,
      idTecnico: this.form.get('idTecnico')?.value
    }

    console.log(guardar);

    this.formularioService.postCitas(guardar).subscribe({
      next:(response) =>{
        const respuesta = response;
        if(respuesta.status != '201'){
          this.alert.open('Registro guardado exitosamente', 'Cerrar', {duration: 4000});
          this.Router.navigate(['/main'])
        }else{
          this.alert.open('Ocurrio un error verifique nuevamente', 'Cerrar', {duration: 4000});
        }
      },
      error: (error) => {
        this.alert.open('Ocurrio un error verifique nuevamente', 'Cerrar', {duration: 4000});
      }
    })
  }

  onCancelar(){
    this.Router.navigate(['/main'])
  }
}
