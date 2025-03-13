import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  loginForm:FormGroup;
  success:any;
  dataUser: any;
  formErrors = {
    username: '',
    password: ''
  }
  validationMsj = {
    'username': {
      'required': 'El nombre de usuario es obligatorio'
    },
    'password': {
      'required': 'Debe escribir la contraseña'
    }
  }

  constructor(
    private fb: FormBuilder,
    private alerts: MatSnackBar,
    private loginService:LoginService
  ){
    this.loginForm = this.fb.group({
      correo: ['', Validators.required],
      password: ['', Validators.required]
    })
  }

  async onSubmit(){
    const formData = new FormData();
    formData.append('accion', 'seguridad.iniciarSesion');
    formData.append('correo', this.loginForm.value.correo);
    formData.append('contrasena', this.loginForm.value.password);
    this.loginService.login(formData).subscribe({
      next: (response) => {
        this.success = response;
        console.log(this.success.mensaje[0])
        if(this.success.mensaje[0] === 'No hay usuario registrado con esa información')
        {
          this.alerts.open(this.success.mensaje, '', { verticalPosition: 'bottom', horizontalPosition: 'right', panelClass: ['snackbar'], duration: 5000 });
        }else{
          this.loginService.setItem('token', this.success.datos.token)
        }
      },
      error: (error) => {
        console.error('Error en el login:', error);
      }
    })
  }
}
