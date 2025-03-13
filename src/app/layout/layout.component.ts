import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [
    CommonModule,
    MatSidenav,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatDividerModule,
    RouterModule
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {

  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;

  constructor(private observer: BreakpointObserver, private router:Router){

  }

  ngOnInit(){
    this.observer.observe(["(max-width: 800px)"]).subscribe((res) => {
      if (res.matches) {
        this.sidenav.mode = "over";
        this.sidenav.close();
      } else {
        this.sidenav.mode = "side";
        this.sidenav.open();
      }
    });
  }

  navigateTo(route:string){
    if(route === '/login'){
      localStorage.clear();
    }
    if(route === '/main'){
      this.router.navigate([route])
      this.sidenav.mode = "over";
      this.sidenav.close();
      return
    }
    this.router.navigate([route]);
    this.sidenav.mode = "over";
    this.sidenav.close();
  }

}
