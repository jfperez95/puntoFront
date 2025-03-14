import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormularioService } from '../services/formulario.service';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { response } from 'express';
import { error } from 'console';
import { FormularioEditarComponent } from "../formulario-editar/formulario-editar.component";

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
  errorFecha:any
  minFecha:any
  form:FormGroup;

  constructor(private formularioService:FormularioService,
    private fb:FormBuilder,
    private Router:Router,
    private alert:MatSnackBar
  ){
    this.form = this.fb.group({
      accion:['', Validators.required],
      user: ['', Validators.required],
      nombreCliente: [{ value: '', disabled: true }, Validators.required],
      fechaCita: ['', Validators.required],
      idTecnico: ['', Validators.required]
    })
  }

  async ngOnInit(){
    this.tecnicos = await firstValueFrom(this.formularioService.getTecnicos());
    this.puntoServicio = await firstValueFrom(this.formularioService.getPuntoServicio());
    const ahora = new Date();
    this.minFecha = ahora.toISOString().slice(0, 16);
  }

  valorAccion(event:any){
    this.accion = event.target.value;
  }

  async verificarUsuario(event:any){
    this.usuario = event.target.value;

    let clienteUser = {}

    if(this.accion != null && this.usuario != null){
      if(this.accion === 'usuario.buscarClienteIdentificacionIntegracion'){
        clienteUser = {
          accion: this.accion,
          identificacion: this.usuario
        }
      }else{
        clienteUser = {
          accion: this.accion,
          correo: this.usuario
        }
      }
      this.cliente = await firstValueFrom(this.formularioService.getClientes(clienteUser))

      if (this.cliente && this.cliente.datos && this.cliente.datos.usuario && this.cliente.datos.usuario.length > 0) {
        this.nombre = this.cliente.datos.usuario[0].nombre;

        // Actualizar el campo nombreCliente en el formulario
        this.form.patchValue({ nombreCliente: this.nombre });
      } else {
        console.error("Cliente no encontrado o sin datos");
        this.alert.open("No se encontraron datos para el usuario ingresado", "Cerrar", { duration: 4000 });

        // Si no hay nombre, limpiar el campo
        this.form.patchValue({ nombreCliente: '' });
      }
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

  validarFecha() {
    const fechaCitaRaw = this.form.get('fechaCita')?.value;
    if (!fechaCitaRaw) return;

    const idTecnicoSeleccionado = this.form.get('idTecnico')?.value;

    const tecnicoEncontrado = (this.tecnicos as Array<{ id: number; nombre: string; abreDomingo:boolean }>)
        .find(tecnico => tecnico.id === Number(idTecnicoSeleccionado));

    // Convertir fechaCitaRaw correctamente al formato UTC
    const fechaCita = new Date(`${fechaCitaRaw}:00.000Z`);
    const ahora = new Date(); // Fecha y hora actual
    const diaSemana = fechaCita.getUTCDay(); // 0 = Domingo, 6 = Sábado
    const hora = fechaCita.getUTCHours();
    const minutos = fechaCita.getUTCMinutes();

    // Bloquear fechas y horas pasadas
    if (fechaCita < ahora) {
      this.errorFecha = "No puedes seleccionar una fecha y hora anterior a la actual.";
      this.form.get('fechaCita')?.setValue(null);
      return;
    }

    // Bloquear domingos (0)
    if (diaSemana === 0 && tecnicoEncontrado?.abreDomingo == false) {
      this.errorFecha = "No se pueden agendar citas los domingos.";
      this.form.get('fechaCita')?.setValue(null);
      return;
    }

    // Bloquear fuera de 08:00 AM - 05:00 PM
    if (hora < 8 || hora >= 17) {
      this.errorFecha = "El horario permitido es de 08:00 AM a 05:00 PM.";
      this.form.get('fechaCita')?.setValue(null);
      return;
    }

    //Bloquear 12:00 PM - 02:00 PM
    if (hora === 12 || hora === 13) {
      this.errorFecha = "No se pueden agendar citas entre 12:00 PM y 02:00 PM.";
      this.form.get('fechaCita')?.setValue(null);
      return;
    }

    // Si la fecha es válida, borrar mensaje de error
    this.errorFecha = "";
  }

  onCancelar(){
    this.Router.navigate(['/main'])
  }
}
