import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { interval } from 'rxjs';
import { GeneralService } from '../../../services/general.service';
import { Plugins } from '@capacitor/core';

const { LocalNotifications, Modals } = Plugins;

@Component({
  selector: 'app-awaiting',
  templateUrl: './awaiting.page.html',
  styleUrls: ['./awaiting.page.scss'],
})
export class AwaitingPage implements OnInit {

  data:any;
  checkConsult:any;

  constructor(
    private route: ActivatedRoute,
    public navCtrl:NavController,
    public generalService:GeneralService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      console.log(params);
      if(params && params["data"]){
        this.data = params["data"];

        if(!this.checkConsult && this.data.status==0){
          this.checkConsult = interval(5000);
          this.checkConsult.subscribe(n =>{
            if(this.data.status==0){
              this.generalService.getTurn(this.data['id'])
              .subscribe((data:any) => {
                if(data){
                  this.data = data;
                  if(this.data.status>0){
                    this.notify(data);
                    delete this.checkConsult;
                  }
                }
              },
              error=>{
                console.error(error);
              });
            }
          });
        }
      }else{
        this.navCtrl.back();
      }
    });
  }

  async notify(data){
    const notifs = await LocalNotifications.schedule({
      notifications: [
        {
          title: "Tu turno esta siendo llamado",
          body: "Pasa ahora con el asesor: "+((data.user)?data.user.name:''),
          id: 1,
          schedule: { at: new Date(Date.now()) },
          sound: 'assets/notify.mp3',
          attachments: null,
          actionTypeId: "",
          extra: null
        }
      ]
    });
    console.log('scheduled notifications', notifs);
    
    let confirmRet = await Modals.confirm({
      title: 'Tu turno esta siendo llamado',
      message:  "Pasa ahora con el asesor: "+((data.user)?data.user.name:'')
    }).then(data=>{
      this.navCtrl.back();
    });
    console.log('Confirm ret', confirmRet);
  }

}
