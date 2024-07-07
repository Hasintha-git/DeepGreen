import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { SimpleBase } from 'src/app/models/SimpleBase';
import { StorageService } from 'src/app/models/StorageService';
import { CommonResponse } from 'src/app/models/response/CommonResponse';
import { User } from 'src/app/models/user';
import { ToastServiceService } from 'src/app/services/toast-service.service';
import { UserService } from 'src/app/services/user/user.service';


@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  
  userAdd: FormGroup;
  userModelAdd = new User();
  public statusList: SimpleBase[];
  public userRoleList: SimpleBase[];
  maxDate = new Date();
  oldModel: string;
  id:any;

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    public toastService: ToastServiceService,
    private spinner: NgxSpinnerService,
    private sessionStorage: StorageService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.spinner.show();
    this._prepare();
  }

  _prepare() {
    this.initialValidator();

    this.findById();
  }


  findById() {
    this.userModelAdd.id = this.id;
    this.userService.get(this.userModelAdd).subscribe(
      (user: any) => {
        this.userModelAdd = user.data;
        
        const currentUser = this.sessionStorage.getItem("user");
        this.userModelAdd.activeUserName = currentUser.user.username;
        this.oldModel = JSON.stringify(this.userModelAdd);
        this.spinner.hide();
      }, error => {
        this.spinner.hide();
          this.toastService.errorMessage(error.error['errorDescription']);
      }
      
    );
  }


  initialValidator() {
    this.userAdd = this.formBuilder.group({
      first_name: this.formBuilder.control('', [
        Validators.required
      ]),
      last_name: this.formBuilder.control('', [
        Validators.required
      ]),
      email: this.formBuilder.control('', [
        Validators.required, Validators.email
      ])
    });
  }

  mandatoryValidation(formGroup: FormGroup) {
    for (const key in formGroup.controls) {
      if (formGroup.controls.hasOwnProperty(key)) {
        const control: FormControl = <FormControl>formGroup.controls[key];
        if (Object.keys(control).includes('controls')) {
          const formGroupChild: FormGroup = <FormGroup>formGroup.controls[key];
          this.mandatoryValidation(formGroupChild);
        }
        control.markAsTouched();
      }
    }
  }

  resetUserAdd() {
    this.userAdd.reset();
    this.findById();
  }

  onSubmit() {
    this.spinner.show();
    if (JSON.stringify(this.userModelAdd) === this.oldModel) {
      this.spinner.hide();
      this.toastService.errorMessage('No change(s) detected.');
    }else
    if (this.userAdd.valid) {
      this.userService.update(this.userModelAdd).subscribe(
        (response: CommonResponse) => {
          this.toastService.successMessage(response.responseDescription);
          this.spinner.hide();
        },
        error => {
          this.spinner.hide();
            this.toastService.errorMessage(error.error['errorDescription']);
        }
      );
    } else {
      this.spinner.hide();
      this.mandatoryValidation(this.userAdd)
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  get first_name() {
    return this.userAdd.get('first_name');
  }
  get last_name() {
    return this.userAdd.get('last_name');
  }
  get email() {
    return this.userAdd.get('email');
  }


}
