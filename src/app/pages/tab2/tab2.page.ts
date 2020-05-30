import { Component } from '@angular/core';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';
import { AlertController, NavController } from '@ionic/angular';
import { GeneralService } from '../../services/general.service';
import { NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  constructor(
    private qrScanner: QRScanner,
    public alertController: AlertController,
    public navCtrl:NavController,
    public generalService:GeneralService) {}

  swiperOpts = {
    allowSlidePrev:false,
    allowSlideNext:false,
    allowTouchMove:false,
    pagination:{dynamicBullets:true}
  };
  statusScan:boolean=false;

  ionViewWillEnter(){
    this.statusScan=false;
  }

  takePhoto(){
    this.qrScanner.prepare()
    .then((status: QRScannerStatus) => {
      this.statusScan=status.scanning;
      if (status.authorized) {
        // camera permission was granted

        this.qrScanner.show().then((status: QRScannerStatus) => {
          console.log('Scanner show', status);
          this.statusScan=status.scanning;
        });
        // start scanning
        window.document.querySelector('ion-app').classList.add('cameraView');
        let scanSub = this.qrScanner.scan().subscribe((text: string) => {
          console.log('Scanned something', text);
          window.document.querySelector('ion-app').classList.remove('cameraView');

          this.qrScanner.hide().then((status: QRScannerStatus) => {
            console.log('Scanner hide', status);
            this.statusScan=status.scanning;
          }); // hide camera preview
          
          scanSub.unsubscribe(); // stop scanning
          this.qrScanner.destroy().then((status: QRScannerStatus) => {
            console.log('Scanner destroy', status);
            this.statusScan=status.scanning;
            this.statusScan=false;
          });
          try {
            let data:object = JSON.parse(text);
            console.log('DECODED', typeof data, data);
            if(data && data['id']){
              this.statusScan=false;
              this.generalService.setTurn(data['id']).subscribe(
                data=>{
                  if(data['success']){
                    let navigationExtras: NavigationExtras = {
                      queryParams: {data:data['turn']}
                    };
                    this.navCtrl.navigateForward('awaiting',navigationExtras);
                  }else{
                    this.presentAlert('No se reconoce el código QR. Intente de nuevo');
                  }
                },
                error=>{
                  this.presentAlert('No se reconoce el código QR. Intente de nuevo');
                }
              );
            }else{
              this.statusScan=false;
              this.presentAlert('No se reconoce el código QR. Intente de nuevo');
            }
          } catch (error) {
            console.error(error);
            this.statusScan=false;
            this.presentAlert('No se reconoce el código QR. Intente de nuevo');
          }

        });

      } else if (status.denied) {
        this.presentAlert('Necesitamos permisos para acceder a tu camara y leer el código QR.', 'Ajustes de permisos', 'Cambiar los ajustes de permisos');
        this.qrScanner.openSettings();
        // camera permission was permanently denied
        // you must use QRScanner.openSettings() method to guide the user to the settings page
        // then they can grant the permission from there
      } else {
        this.presentAlert('Necesitamos permisos para acceder a tu camara y leer el código QR.', 'Permisos', 'Aceptar permisos');
        // permission was denied, but not permanently. You can ask for permission again at a later time.
      }
    })
    .catch((e: any) => console.log('Error is', e));
  }

  async presentAlert(message:string,header:string='Aviso',subheader:string='') {
    const alert = await this.alertController.create({
      header: header,
      subHeader: subheader,
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

}
