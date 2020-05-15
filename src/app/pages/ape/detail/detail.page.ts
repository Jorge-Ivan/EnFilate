import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Plugins } from '@capacitor/core';

const { Browser } = Plugins;

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnInit {

  @Input() ape:any;

  constructor(
    private modalCtrl:ModalController
  ) { }

  ngOnInit() {
  }

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

  async openMap(){
    let url = 'https://www.google.com/maps/search/?api=1&query='+this.ape.latitude+','+this.ape.longitude;
    await Browser.open({ url: url });
  }

}
