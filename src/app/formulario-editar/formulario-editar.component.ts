import { Component, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormularioService } from '../services/formulario.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-formulario-editar',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './formulario-editar.component.html',
  styleUrl: './formulario-editar.component.scss'
})
export class FormularioEditarComponent {

  form:FormGroup;
  tecnicos:any;
  minFecha:any;
  usuario:any;
  accion:any;
  nombre:any;
  cliente:any;
  errorFecha:any;
  tecnicoEncontrado:any;


  @Input() registroEditar: any;
  @Output() cancelar = new EventEmitter<boolean>()

  constructor(
    private formularioService:FormularioService,
    private fb: FormBuilder,
    private alert: MatSnackBar,
    private router:Router
  ){
    this.form = this.fb.group({
      accion:[''],
      user: [''],
      nombreCliente: [{ value: '', disabled: true }, Validators.required],
      fechaCita: ['', Validators.required],
      idTecnico: ['', Validators.required]
    })
  }

  async ngOnInit(){
    this.tecnicos = await firstValueFrom(this.formularioService.getTecnicos());
    const ahora = new Date();
    this.minFecha = ahora.toISOString().slice(0, 16);
    this.createForm();
    const tecnicoEncontrado = (this.tecnicos as Array<{ id: number; nombre: string; abreDomingo:boolean }>)
        .find(tecnico => tecnico.nombre === this.registroEditar.nombreTecnico);
  }

  onCancelar(){
    this.cancelar.emit(false);
  }

  valorAccion(event:any){
    this.accion = event.target.value;
  }

  createForm(){
    this.tecnicoEncontrado = (this.tecnicos as Array<{ id: number; nombre: string; abreDomingo:boolean }>)
        .find(tecnico => tecnico.nombre === this.registroEditar.nombreTecnico);
    this.form.patchValue({
      nombreCliente: this.registroEditar.nombreCliente,
      fechaCita: this.registroEditar.fechaCita,
      idTecnico: this.tecnicoEncontrado?.id
    })
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
      id: this.registroEditar.id,
      nombreCliente: this.form.get('nombreCliente')?.value,
      fechaCita: fechaCitaSQL,
      idTecnico: this.form.get('idTecnico')?.value
    }

    this.formularioService.editarCita(this.registroEditar.id, guardar).subscribe({
      next:(response) =>{
        if(response.status === 200 || response.status === 204){//Si se cumple la condicion significa que se guardo el registro
          this.alert.open('Registro actualizado exitosamente', 'Cerrar', {duration: 4000});
          this.cancelar.emit(false);
          this.router.navigate(['/main'])//Se redirecciona a la main
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

    // Convertir `fechaCitaRaw` correctamente al formato UTC
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

}
