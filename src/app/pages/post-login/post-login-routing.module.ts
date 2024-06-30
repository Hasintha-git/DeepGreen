import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PostLoginComponent } from './post-login.component';
import { UserManagementComponent } from './user-management/user-management.component';

const routes: Routes = [
  {path:'',component:PostLoginComponent, children:[
    {path:'',redirectTo:'pending-order',pathMatch:'full'},
    {path:'dashboard',component:DashboardComponent},
    {path:'user-management',component:UserManagementComponent},
    // {
    //   path: 'bite-section',
    //   loadChildren: () => import('./bite-section/bite-section.module').then(m => m.BiteSectionModule),
    // },
  ]},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PostLoginRoutingModule { }
