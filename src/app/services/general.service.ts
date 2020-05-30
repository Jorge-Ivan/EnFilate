import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

const URL = environment.url;

@Injectable({
  providedIn: 'root'
})
export class GeneralService {

  constructor(
    private http:HttpClient
  ) { }

  public _addStandardHeaders(header:HttpHeaders)
  {
    header = header.append('X-Requested-With','XMLHttpRequest');
    
    return header;
  }

  getVenues(){
    let reqOpts = {
      headers: this._addStandardHeaders(new HttpHeaders()),
    };

    return this.http.get(`${ URL }/api/venues`,reqOpts);
  }

  getTurn(id:number){
    let reqOpts = {
      headers: this._addStandardHeaders(new HttpHeaders()),
    };

    return this.http.get(`${ URL }/api/status-turn/${id}`,reqOpts);
  }

  setTurn(id:number){
    let reqOpts = {
      headers: this._addStandardHeaders(new HttpHeaders()),
    };

    return this.http.post(`${ URL }/api/get-turn`,{venue_id:id},reqOpts);
  }
}
