import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MainService } from '../services/main.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormularioEditarComponent } from "../formulario-editar/formulario-editar.component";
import { response } from 'express';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-main',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginator,
    MatIconModule,
    FormularioEditarComponent
],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {

  citas:any;
  editarCita:any
  editar:boolean
  main:boolean
  dataSource:MatTableDataSource<any> = new MatTableDataSource<any, MatPaginator>([]);
  columnas = ['id', 'nombreCliente', 'fechaCita', 'nombreTecnico', 'nombrePuntoServicio', 'editar', 'borrar']

  constructor(private mainService:MainService, private alert: MatSnackBar){
    this.main = true;
    this.editar = false;

  }

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(){
    this.getData();
  }

  ngAfterViewInit(){
    this.getData();
  }

  async getData(){
    this.citas = await firstValueFrom(this.mainService.getCitas());
    if(this.citas !== null){
      this.dataSource = new MatTableDataSource(this.citas);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }
  }

  applyFilter(event: Event){
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;

    // Configurar la lógica del filtro personalizada
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const filterValue = filter.trim().toLowerCase();

      // Iterar por cada propiedad de la fila de datos
      return Object.keys(data).some((key) => {
        const value = data[key];

        // Si el valor es un número, comparamos directamente con el filtro sin cambiar a minúsculas
        if (typeof value === 'number') {
          return value.toString().includes(filter);
        }

        // Si es texto, lo convertimos a minúsculas para comparación
        if (typeof value === 'string') {
          return value.toLowerCase().includes(filterValue);
        }

        return false; // Si no es ni número ni string, ignorar
      });
    };
  }

  onEdit(element:any){
    this.editarCita = element;
    this.editar = true;
    this.main = false;
  }

  cancelarEdicion(e: boolean){
    this.ngAfterViewInit();
    this.main = true;
    this.editar = false;
  }

  onDelete(event:any){
    this.mainService.borrarCita(event.id).subscribe({
      next:(response)=>{
        if(response.status == 204){
          this.alert.open("El registro se borro exitosamente", "Cerrar", { duration: 4000 });
          this.ngOnInit();
        }else{
          this.alert.open("Hubo un error", "Cerrar", { duration: 4000 });
        }
      },
      error: (error) => {
        this.alert.open('Ocurrio un error verifique nuevamente', 'Cerrar', {duration: 4000});
      }
    });

  }

}
