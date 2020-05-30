import { Component, Renderer2, ElementRef, Inject, Input, ViewChild, OnChanges, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Plugins } from '@capacitor/core';
import { google } from "google-maps";
import { NavController, ModalController } from '@ionic/angular';
import { environment } from '../../../environments/environment';
import { DetailPage } from '../ape/detail/detail.page';
import { GeneralService } from '../../services/general.service';

const { Geolocation, Network } = Plugins;
declare var google : google;

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  @ViewChild('Map') mapElement: ElementRef;

  private apiKey:string = environment.apiKey;
  public map: any;
  public mapStatus:boolean=false;
  public markers: any[] = [];
  public infoMarkers: any[] = [];
  private mapsLoaded: boolean = false;
  private networkHandler = null;
  private modal:HTMLIonModalElement;

  constructor(
    private generalService:GeneralService,
    private modalController:ModalController,
    private navCtrl:NavController,
    private renderer: Renderer2,
    private element: ElementRef, 
    @Inject(DOCUMENT) private _document) {}

  ngOnInit(){
      this.init().then((res) => {
          console.log("Google Maps ready.");
          this.mapStatus=true;
          this.loadMarkers();
      }, (err) => {    
          console.log(err);
      });

  }

  ngOnChanges() {
    this.loadMarkers();
  }

  ionViewWillEnter(){
    if(this.mapStatus){
        this.loadMarkers();
    }
  }



  private init(): Promise<any> {

    return new Promise((resolve, reject) => {

        this.loadSDK().then((res) => {

            this.initMap().then((res) => {
                resolve(true);
            }, (err) => {
                reject(err);
            });

        }, (err) => {

            reject(err);

        });

    });
  }

  private loadSDK(): Promise<any> {

      console.log("Loading Google Maps SDK");

      return new Promise((resolve, reject) => {

          if(!this.mapsLoaded){

              Network.getStatus().then((status) => {

                  if(status.connected){
                    resolve(true);
                      /*this.injectSDK().then((res) => {
                          resolve(true);
                      }, (err) => {
                          reject(err);
                      });*/

                  } else {

                      if(this.networkHandler == null){

                          this.networkHandler = Network.addListener('networkStatusChange', (status) => {

                              if(status.connected){

                                  this.networkHandler.remove();

                                  this.init().then((res) => {
                                      console.log("Google Maps ready.");
                                  }, (err) => {    
                                      console.log(err);
                                  });

                              }

                          });

                      }

                      reject('Not online');
                  }

              }, (err) => {

                  // NOTE: navigator.onLine temporarily required until Network plugin has web implementation
                  if(navigator.onLine){
                      resolve(true);
                      /*this.injectSDK().then((res) => {
                          resolve(true);
                      }, (err) => {
                          reject(err);
                      });*/

                  } else {
                      reject('Not online');
                  }

              });

          } else {
              reject('SDK already loaded');
          }

      });


  }

  private injectSDK(): Promise<any> {

      return new Promise((resolve, reject) => {

          window['mapInit'] = () => {
              this.mapsLoaded = true;
              resolve(true);
          }

          let script = this.renderer.createElement('script');
          script.id = 'googleMaps';

          if(this.apiKey){
              script.src = 'https://maps.googleapis.com/maps/api/js?key=' + this.apiKey + '&callback=mapInit';
          } else {
              script.src = 'https://maps.googleapis.com/maps/api/js?callback=mapInit';       
          }

          this.renderer.appendChild(this._document.body, script);

      });

  }

  private initMap(): Promise<any> {

    return new Promise((resolve, reject) => {

      let markerMyLocation;

        Geolocation.getCurrentPosition().then((position) => {

            console.log(position);

            let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            let mapOptions = {
                center: latLng,
                streetViewControl: false,
                fullscreenControl: false,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                zoom: 15,
                zoomControlOptions:{
                  position: google.maps.ControlPosition.LEFT_CENTER
                }
            };

            this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
            this.loadMarkers();
            markerMyLocation = this.addMarker(position.coords.latitude, position.coords.longitude, null, false);
            resolve(true);

        }, (err) => {

            reject('Could not initialise map');

        });

    });

  }

  public addMarker(lat: number, lng: number, icon:string=null, callback=true) {

      let latLng = new google.maps.LatLng(lat, lng);

      let marker = new google.maps.Marker({
          map: this.map,
          position: latLng,
          icon:icon
      });
      if(callback){
        marker.addListener('click', (item)=>{
            this.infoMarkers.forEach(marker=>{
                if(item.latLng.lat() == marker.latitude && item.latLng.lng() == marker.longitude){
                    this.navigateMarker(marker);
                }
            })
        });
      }

      this.markers.push(marker);

      return marker;

  }

  async navigateMarker(marker){
        if(this.modal){
            this.modal.dismiss();
        }
        this.modal = await this.modalController.create({
            component: DetailPage,
            componentProps:{
                ape:marker
            }
        });
        return await this.modal.present();
  }

  loadMarkers(intents = 1){
      this.generalService.getVenues().subscribe(
          (data:any)=>{
            data.forEach(ape=>{
                let added:boolean=false;
                this.infoMarkers.forEach(marker=>{
                    if(ape.latitude == marker.latitude && ape.longitude == marker.longitude){
                        added=true;
                    }
                });
                if(!added){
                    console.log(ape['latitude'], ape['longitude']);
                    let icon = 'assets/marker-ape.png';
                    this.addMarker(ape['latitude'], ape['longitude'], icon);
                    this.infoMarkers.push(ape);
                }
            });
          },
          error=>{
              if(intents>3){
                this.navCtrl.back();
              }else{
                this.loadMarkers(intents+1);
              }
          }
      );
    /*let markersExamples = [
      {
        id:1,
        name:'Manizales',
        latitude:5.0669229,
        longitude:-75.5174522,
        phone:'8845691 -8845697',
        address:'Carrera 23 No. 25 - 32, Edificio Esponsión, Piso 3',
        email:'dagiraldob@sena.edu.co',
        text:'Horario: Lunes a viernes de 8:00 a.m. a 12:30 p.m. y 2:00 p.m. a 6:00 p.m.',
        image: 'https://lh5.googleusercontent.com/p/AF1QipPx7WPhduoO-IouiXhodMPpwnS4LVj0I37ac7lZ=w503-h314-k-no'
      }
    ];*/
  }

}
