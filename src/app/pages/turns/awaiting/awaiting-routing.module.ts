import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AwaitingPage } from './awaiting.page';

const routes: Routes = [
  {
    path: '',
    component: AwaitingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AwaitingPageRoutingModule {}
