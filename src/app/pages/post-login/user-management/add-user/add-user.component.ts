import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup,Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { SimpleBase } from 'src/app/models/SimpleBase';
import { StorageService } from 'src/app/models/StorageService';
import { CommonResponse } from 'src/app/models/response/CommonResponse';
import { User } from 'src/app/models/user';
import { ToastServiceService } from 'src/app/services/toast-service.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {

  userAdd: FormGroup;
  userModelAdd = new User();
  public statusList: SimpleBase[];
  public userRoleList: SimpleBase[];
  maxDate = new Date();

  constructor(
    private userService: UserService,
    public dialogRef: MatDialogRef<AddUserComponent>,
    private formBuilder: FormBuilder,
    public toastService: ToastServiceService,
    private spinner: NgxSpinnerService,
    private sessionStorage: StorageService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this._prepare();
  }

  _prepare() {
    this.initialValidator();
    const user=this.sessionStorage.getItem("user");
    this.userModelAdd.activeUserName = user.user.username;
  }

  initialValidator() {
    this.userAdd = this.formBuilder.group({
      first_name: this.formBuilder.control('', [
        Validators.required
      ]),
      last_name: this.formBuilder.control('', [
        Validators.required
      ]),
      password: this.formBuilder.control('', [
        Validators.required
      ]),
      confirmPassword: this.formBuilder.control('', [
        Validators.required
      ]),
      email: this.formBuilder.control('', [
        Validators.required, Validators.email
      ]),
    }, { validator: this.passwordMatchValidator });

    this.userAdd.get('email').setValidators(Validators.email);
  }

  passwordMatchValidator(control: AbstractControl) {
    const password: string = control.get('password').value; // get password from our password form control
    const confirmPassword: string = control.get('confirmPassword').value; // get password from our confirmPassword form control
    // compare is the password math
    if (password !== confirmPassword) {
      // if they don't match, set an error in our confirmPassword form control
      control.get('confirmPassword').setErrors({ NoPassswordMatch: true });
    }
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
  }

  onSubmit() {
    this.spinner.show();
    if (this.userAdd.valid) {
      this.userService.add(this.userModelAdd).subscribe(
        (response: CommonResponse) => {
          this.toastService.successMessage(response.responseDescription);
          this.dialogRef.close();
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
  get password() {
    return this.userAdd.get('password');
  }
  get confirmPassword() {
    return this.userAdd.get('confirmPassword');
  }
  closeDialog() {
    this.dialogRef.close();
  }

}
