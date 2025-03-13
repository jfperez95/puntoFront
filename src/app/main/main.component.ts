import { Component, OnInit, ViewChild } from '@angular/core';
import { MainService } from '../services/main.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatInputModule } from '@angular/material/input';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginator
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {

  citas:any;
  dataSource:MatTableDataSource<any> = new MatTableDataSource<any, MatPaginator>([]);
  columnas = ['id', 'nombreCliente', 'fechaCita', 'nombreTecnico', 'nombrePuntoServicio']

  constructor(private mainService:MainService){

  }

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(){
    this.getData();
  }

  async getData(){
    this.citas = await firstValueFrom(this.mainService.getCitas());
    if(this.citas !== null){
      this.dataSource = new MatTableDataSource(this.citas);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }
    console.log(this.citas);
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

}
