import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonFunctionService } from '../common-functions/common-function.service';
import { getEndpoint, SECURE } from 'src/app/utility/constants/end-point';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  requestUrl: string;
  requestUrlPreLogin: string;

  constructor(
    public httpClient: HttpClient,
    public commonFunctionService: CommonFunctionService
  ) {
    this.requestUrl = `${getEndpoint(SECURE)}/auth`;
  }

  register(object: any) {
    return this.httpClient
      .post(this.requestUrlPreLogin + `/register`, object, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Accept: '*/*',
          'Referrer-Policy': 'no-referrer',
        }),
        responseType: 'json',
      })
      .pipe(catchError(this.handleError));
  }

  login(object: any) {
    let httpHeaders = new HttpHeaders().set('Content-Type', 'application/json');
    return this.httpClient
      .post(this.requestUrlPreLogin + `/login`, object, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Accept: '*/*',
          'Referrer-Policy': 'no-referrer',
        }),
        responseType: 'json',
      })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.log(error);
    let errorMessage = 'An unknown error occurred.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else if (error.status === 401 || error.status === 400) {
      errorMessage = error.error.msg || 'Authentication failure.';
    } else if (error.status === 500) {
      errorMessage = 'Application Error. Please Contact System Administrator.';
    } else if (error.status === 404) {
      errorMessage = 'User Not Found';
    } else {
      errorMessage = error.error.msg || 'Unknown error occurred.';
    }
    console.error(errorMessage);
    return throwError(errorMessage); // Ensure the error message is returned
  }
}
