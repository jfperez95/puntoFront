import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const autenticado = localStorage.getItem('token');

  return autenticado !== null;
};
