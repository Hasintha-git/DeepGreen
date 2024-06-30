import { AfterViewInit, Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { SimpleBase } from 'src/app/models/SimpleBase';
import { User } from 'src/app/models/user';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserService } from 'src/app/services/user/user.service';
import { ToastServiceService } from 'src/app/services/toast-service.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonFunctionService } from 'src/app/services/common-functions/common-function.service';
import { LAST_UPDATED_TIME, PAGE_LENGTH, SORT_DIRECTION } from 'src/app/utility/constants/system-config';
import { merge, tap } from 'rxjs';
import { DeleteUserComponent } from './delete-user/delete-user.component';
import { ViewUserComponent } from './view-user/view-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { AddUserComponent } from './add-user/add-user.component';
import { Commondatasource } from '../../datasource/Commondatasource';
import { DataTable } from '../../models/data-table';
import { LockUserComponent } from './lock-user/lock-user.component';
import { UnlockUserComponent } from './unlock-user/unlock-user.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  public userSearch: FormGroup;
  public dataSourceUser: Commondatasource;
  public userList: User[];
  public searchModel: User;
  public statusList: SimpleBase[];
  public userRoleList: SimpleBase[];
  public searchReferenceData: Map<string, Object[]>;
  public isSearch: boolean;
  public access: any;

  displayedColumns: string[] = ['view', 'first_name', 'last_name', 'email', 'action'];

  constructor(
    public dialog: MatDialog,
    public toast: ToastServiceService,
    public router: Router,
    private spinner: NgxSpinnerService,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private commonFunctionService: CommonFunctionService
  ) {}

  ngOnInit() {
    this.spinner.show();
    this.searchModel = new User();
    this.prepareReferenceData();
    this.initialForm();
    this.initialDataLoader();
  }

  initialForm() {
    this.userSearch = this.formBuilder.group({
      email: new FormControl(''),
    });
  }

  prepareReferenceData(): void {
    this.userService.getSearchData(true)
      .subscribe((response: any) => {
        this.statusList = response.statusList;
        this.userRoleList = response.userRoleList;
      },
      error => {
        this.toast.errorMessage(error.error['message']);
      }
    );
  }

  ngAfterViewInit() {
    this.dataSourceUser.counter$
      .pipe(
        tap((count) => {
          this.paginator.length = count;
        })
      )
      .subscribe();
    merge(this.paginator.page, this.sort.sortChange)
      .pipe(
        tap(() => this.getList())
      )
      .subscribe();
  }

  initialDataLoader(): void {
    this.initialDataTable();
    this.dataSourceUser = new Commondatasource();
    this.dataSourceUser.counter$
      .pipe(
        tap((count) => {
          this.paginator.length = count;
        })
      )
      .subscribe();
    this.getList();
  }

  getList() {
    let searchParamMap = this.commonFunctionService.getDataTableParam(this.paginator, this.sort);
    if (this.isSearch) {
      searchParamMap = this.getSearchString(searchParamMap, this.searchModel);
    }
    this.userService.getList(searchParamMap)
      .subscribe((data: DataTable<User>) => {
        this.userList = data.records;
        console.log("---->",this.userList)
        this.dataSourceUser.datalist = this.userList;
        console.log(this.dataSourceUser)
        this.dataSourceUser.usersSubject.next(this.userList);
        this.dataSourceUser.countSubject.next(data.totalRecords);
        this.spinner.hide();
      },
      error => {
        this.spinner.hide();
        this.toast.errorMessage(error.error['errorDescription']);
      }
    );
  }

  getSearchString(searchParamMap: Map<string, any>, searchModel: User): Map<string, string> {
    if (searchModel.email) {
      searchParamMap.set(this.displayedColumns[5].toString(), searchModel.email);
    }
    return searchParamMap;
  }

  initialDataTable() {
    this.paginator.pageIndex = 0;
    this.paginator.pageSize = PAGE_LENGTH;
  }

  searchUser(search: boolean) {
    this.isSearch = search;
    this.initialDataLoader();
  }

  resetUserSearch() {
    this.userSearch.reset();
    this.initialDataLoader();
  }

  add() {
    const dialogRef = this.dialog.open(AddUserComponent);
    dialogRef.componentInstance.statusList = this.statusList;
    dialogRef.componentInstance.userRoleList = this.userRoleList;
    dialogRef.afterClosed().subscribe(result => {
      this.resetUserSearch();
    });
  }

  edit(id: any) {
    const dialogRef = this.dialog.open(EditUserComponent, { data: id });
    dialogRef.componentInstance.statusList = this.statusList;
    dialogRef.componentInstance.userRoleList = this.userRoleList;
    dialogRef.afterClosed().subscribe(result => {
      this.resetUserSearch();
    });
  }

  delete(id: any) {
    const dialogRef = this.dialog.open(DeleteUserComponent, { data: id, width: '350px', height: '180px' });

    dialogRef.afterClosed().subscribe(result => {
      this.resetUserSearch();
    });
  }

  view(id: any) {
    const dialogRef = this.dialog.open(ViewUserComponent, { data: id });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  forgetPassword(id: any) {
    const dialogRef = this.dialog.open(ForgetPasswordComponent, { data: id, width: '600px', height: '230px' });

    dialogRef.afterClosed().subscribe(result => {
      this.resetUserSearch();
    });
  }


  ngOnDestroy() {
    this.dialog.closeAll();
  }

  // Getters for form controls
  
  get email() {
    return this.userSearch.get('email');
  }

}
