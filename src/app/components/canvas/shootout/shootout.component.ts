import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';

import { ShootoutsService } from '../../../services/shootouts.service';
import { DefaultService } from '../../../services/default.service';
import { TimelineService } from '../../../services/timeline.service';

@Component({
  selector: 'shootout-canvas',
  templateUrl: './shootout.component.html',
  styleUrls: ['./shootout.component.scss'],
  providers: [ShootoutsService,TimelineService],
})
export class ShootoutComponent implements OnInit {
  @Output() closeCanvas = new EventEmitter<any>();
  @ViewChild('scroller') private scroller: ElementRef;
  @Input() page_type: string;

  show_playground: boolean = false;
  editPage: boolean = false;

  shot_active: string = '';

  //rosters
  @Input() roster_home: any = [];
  @Input() roster_away: any = [];
  roster_all: any = [];
  goalkeepers_all: any = [];
  goalkeepers_home: any = [];
  goalkeepers_away: any = [];

  @Input() period: number;
  @Input() minute: number;
  @Input() second: number;
  @Input() editData: any;
  @Input() reversed_sides: boolean = false;

  @Output() toast = new EventEmitter<any>();
  @Output() changeCasomira = new EventEmitter<any>();

  @Output() reloadVideo = new EventEmitter<any>();
  @Output() reloadTrueVideo = new EventEmitter<any>();
  @Output() saveType = new EventEmitter<any>();

  player1: string = '';
  player1_name: string = '';
  player1_team: string = '';

  realDatetime: string = '';

  goalkeeper: string = '';
  goalkeeper_name: string = '';
  player1_active: boolean = false;
  goalkeeper_active: boolean = false;

  loading: boolean = false;

  matchId: number;
  shootoutId: number;

  score: boolean = false;
  finish: string = 'shot';
  stickSide: string = 'backhand';

  contextmenu = false;
  contextmenuX = 0;
  contextmenuY = 0;
  contextmenu_attribute: string = '';
  showhelp: boolean = false;
  help_title: string = '';
  help_desc: string = '';

  save_type: string = '';

  overtimeLength: number = 0;

  time: string = '';

  @Input() homeShortcut: string = '';
  @Input() awayShortcut: string = '';

  supervize: any = {
    shooterId: false,
    goalkeeperId: false,
    score: false,
    order: false,
    finish: false,
    stickSide: false,
    gateZone: false,
  };

  constructor(
    private route: ActivatedRoute,
    private _sanitizer: DomSanitizer,
    private shootoutsService: ShootoutsService,
    private defaultService: DefaultService,
    private timelineService: TimelineService
  ) {
    this.matchId = Number(this.route.snapshot.paramMap.get('id'));
    this.overtimeLength = Number(localStorage.getItem('overtimeLength'));
  }

  ngOnInit(): void {
    this.formatRosters();
    this.parseEditData(this.editData);
  }

  parseEditData(data: any) {
    if (Object.keys(data).length != 0) {
      this.editPage = true;

      if (data.supervision != null) {
        this.supervize = data.supervision;
      }

      this.shootoutId = data.shootoutId;

      this.player1 = data.shooterId;
      this.goalkeeper = data.goalkeeperId;

      setTimeout(() => {
        this.player1_name = this.getPlayerTemplate(Number(this.player1));
        this.goalkeeper_name = this.getPlayerTemplate(Number(this.goalkeeper));
        this.player1_team = this.getPlayerTeam(Number(this.player1));
      }, 200);

      if (this.player1 == undefined) {
        this.player1 = '';
      }
      if (this.goalkeeper == undefined) {
        this.goalkeeper = '';
      }

      this.score = data.score;
      this.finish = data.finish;
      this.stickSide = data.stickSide;
      this.shot_active = data.gateZone;
      let d = data.videoTime;
      var h = Math.floor(d / 3600).toString();
      var m = Math.floor(d % 3600 / 60).toString();
      var s = Math.floor(d % 3600 % 60).toString();
      this.realDatetime = h + ':' + m + ':'+ s;
      this.setVideo()
    }
  }

  close() {
    this.closeCanvas.emit();
  }

  /* setShootOutTime(){
    console.log("Period", this.period)

    let second =(this.minute * 60 + this.second) + (1200 * this.period - 1200);
    console.log("second", second);
      try{
        this.timelineService.getVideoTime(this.matchId, second).subscribe(
          (data: any) => {

            console.log("getVideoTime", data)
            let d = data.videoTime;
            var h = Math.floor(d / 3600).toString();
            var m = Math.floor(d % 3600 / 60).toString();
            var s = Math.floor(d % 3600 % 60).toString();
            this.realDatetime = h + ':' + m + ':'+ s;
          },
          (error) => {

          }
        );
      }catch{
        second = 0;
        second =this.minute * 60 + this.second;
        this.timelineService.getVideoTime(this.matchId, second).subscribe(
          (data: any) => {

            console.log("getVideoTime", data)
            let d = data.videoTime;
            var h = Math.floor(d / 3600).toString();
            var m = Math.floor(d % 3600 / 60).toString();
            var s = Math.floor(d % 3600 % 60).toString();
            this.realDatetime = h + ':' + m + ':'+ s;
          },
          (error) => {

          }
        );
      }

  } */


  sendTimeCasomira() {
    this.changeCasomira.emit({ time: this.time, period: this.period });
  }

  focusTime() {
    this.time =
      this.formatTimeNumber(this.minute) +
      ':' +
      this.formatTimeNumber(this.second);
  }

  formatTimeNumber(value: number) {
    if (value < 10) {
      return '0' + value;
    } else {
      return value;
    }
  }

  saveAndNext() {
    this.saveType.emit({
      save_type: this.save_type,
      id: this.shootoutId,
      type: 'shootout',
    });
  }

  getPlayerTeam(id: number) {
    let player_selected = '';

    this.roster_home.forEach((player) => {
      if (player.id == id) {
        player_selected = player.team;
      }
    });

    this.roster_away.forEach((player) => {
      if (player.id == id) {
        player_selected = player.team;
      }
    });

    return player_selected;
  }

  selectPlayerByClick(id: string) {
    if (this.player1_active) {
      this.player1 = id;
      this.player1_active = false;
    }
    if (this.goalkeeper_active) {
      this.goalkeeper = id;
      this.goalkeeper_active = false;
    }

    (document.activeElement as HTMLElement).blur();
  }

  sendToast(type: string, message: string, text: string) {
    this.toast.emit({ type, message, text });
  }

  getPlayerTemplate(id: number) {
    let player_selected = '';

    let team = this.getPlayerTeamShortcut(id);

    this.roster_home.forEach((player) => {
      if (player.id == id) {
        player_selected =
          '#' +
          player.jersey +
          ' ' +
          player.surname +
          ' ' +
          player.name +
          ' (' +
          team +
          ')';
      }
    });

    this.roster_away.forEach((player) => {
      if (player.id == id) {
        player_selected =
          '#' +
          player.jersey +
          ' ' +
          player.surname +
          ' ' +
          player.name +
          ' (' +
          team +
          ')';
      }
    });

    return String(player_selected);
  }

  replay(time_value: string) {
    let times = [];
    times = time_value.split(':');
    let time = Number(times[0]) * 60 + Number(times[1]);
    if (this.period == 1) {
      time = (time - 1200) * -1;
    } else if (this.period == 2) {
      time = (time - 1200) * -1 + 1200;
    } else if (this.period == 3) {
      time = (time - 2400) * -1 + 1200;
    } else if (this.period == 4) {
      time = (time - 3600) * -1 + this.overtimeLength;
    } else if (this.period == 5) {
      time = (time - 4800) * -1 + this.overtimeLength;
    }

    this.reloadVideo.emit(time);
  }

  setVideo(){
    console.log("real_date_time", this.realDatetime)
    //var regExp = /[a-zA-Z]/g;
    let times = [];
    times = this.realDatetime.split(':');
    console.log("Times",times)
    if(times.length == 3){
      let seconds = ((parseInt(times[0])  * 60) * 60 ) + (parseInt(times[1]) * 60) + parseInt(times[2]);
      console.log("seconds", seconds)
      this.reloadTrueVideo.emit(seconds);
    }


  }

  formatRosters() {
    this.roster_home.forEach((player) => {
      player.team = 'home';
      player.search = player.name + ' ' + player.surname + '' + player.jersey;

      this.roster_all.push(player);
    });
    this.roster_away.forEach((player) => {
      player.team = 'away';
      player.search = player.name + ' ' + player.surname + '' + player.jersey;

      this.roster_all.push(player);
    });

    this.roster_all.forEach((item) => {
      if (item.position == 'goalkeeper') {
        this.goalkeepers_all.push(item);
      }
    });
    this.roster_home.forEach((item) => {
      if (item.position == 'goalkeeper') {
        this.goalkeepers_home.push(item);
      }
    });
    this.roster_away.forEach((item) => {
      if (item.position == 'goalkeeper') {
        this.goalkeepers_away.push(item);
      }
    });
  }

  autocompleListFormatter = (data: any) => {
    let position = this.formatPosition(data.position);

    let team = this.getPlayerTeamShortcut(data.id);

    let html = `<img src="/assets/image/logos/${team}.png" onerror="this.src='/assets/image/logos/default.png';" onerror="this.src='/assets/image/logos/default.png';" onerror="this.src='/assets/image/logos/default.png';" width="18px" height="18px" style="vertical-align:top;margin-top:0px;margin-right:4px"><span style="color:#637680;width:29px;display:inline-block;padding-left:3px">#${data.jersey}</span>&nbsp;<span>${data.surname} ${data.name}</span><span style="float:right;border:1px solid #1c7cd6;color:#1c7cd6;text-align:center;border-radius:100%;font-size:8px;padding-top:1px;width:16px;height:16px;">${position}</span>`;
    return this._sanitizer.bypassSecurityTrustHtml(html);
  };

  autocompleValueFormatter = (data: any) => {
    let position = this.formatPosition(data.position);
    let team = this.getPlayerTeamShortcut(data.id);
    let text =
      '#' +
      data.jersey +
      ' ' +
      data.surname +
      ' ' +
      data.name +
      ' (' +
      team +
      ')';
    return text;
  };

  getPlayerTeamShortcut(id: number) {
    let player_selected = '';

    this.roster_home.forEach((player) => {
      if (player.id == id) {
        player_selected = player.team_shortcut;
      }
    });

    this.roster_away.forEach((player) => {
      if (player.id == id) {
        player_selected = player.team_shortcut;
      }
    });

    return player_selected;
  }

  formatPosition(position: string) {
    if (position == 'forward') {
      return 'Ú';
    } else if (position == 'backward') {
      return 'O';
    } else if (position == 'goalkeeper') {
      return 'B';
    }
  }

  showPlayground() {
    if (this.show_playground) {
      this.show_playground = false;
    } else {
      this.show_playground = true;
    }
    if (!this.show_playground) {
      this.scroller.nativeElement.scrollLeft = 0;
    } else {
      this.scroller.nativeElement.scrollLeft = this.scroller.nativeElement.scrollWidth;
    }
  }

  shotChange(shot_type: any) {
    this.shot_active = shot_type;
  }

  getOpponentGoalkeepers(player: string) {
    let type = this.getPlayerTeam(Number(player));

    let roster = [];

    if (type == 'home') {
      return this.goalkeepers_home;
    } else if (type == 'away') {
      return this.goalkeepers_away;
    } else {
      return this.goalkeepers_all;
    }
  }

  selectOpponentGoalie(opponentPlayerId: string) {
    let goalieId = '';

    let team = '';
    this.roster_all.forEach((player) => {
      if (player.id == opponentPlayerId) {
        team = player.team;
      }
    });

    if (team == 'home') {
      this.roster_away.forEach((player) => {
        if (player.position == 'goalkeeper') {
          goalieId = player.id;
        }
      });
    } else if (team == 'away') {
      this.roster_home.forEach((player) => {
        if (player.position == 'goalkeeper') {
          goalieId = player.id;
        }
      });
    }

    this.goalkeeper = goalieId;
    this.goalkeeper_name = this.getPlayerTemplate(Number(goalieId));
  }

  player1Changed(newVal) {
    this.player1 = newVal.id;
    this.player1_team = newVal.team;

    this.selectOpponentGoalie(this.player1);
  }

  player1ChangedDetectDeleted(value) {
    if (value == undefined || value == '') {
      this.player1 = '';
      this.player1_team = '';
    }
  }

  goalkeeperChanged(newVal) {
    this.goalkeeper = newVal.id;
  }

  goalkeeperChangedDetectDeleted(value) {
    if (value == undefined || value == '') {
      this.goalkeeper = '';
    }
  }

  checkUndefinedPlayer() {
    setTimeout(() => {
      if (this.player1 == undefined) {
        this.player1_name = '';
        this.player1_team = '';
      }
      if (this.goalkeeper == undefined) {
        this.goalkeeper_name = '';
      }
    }, 100);
  }

  toggleMenu(event, contextmenu_attribute: string) {
    this.contextmenuX = event.pageX;
    this.contextmenuY = event.pageY;
    this.contextmenu_attribute = contextmenu_attribute;
    this.contextmenu = true;
    this.showhelp = false;
  }

  disableContextMenu() {
    this.contextmenu = false;
  }

  toggleHelp() {
    if (this.contextmenu_attribute === 'winnerId') {
      this.help_title = '???';
      this.help_desc = '???';
    } else if (this.contextmenu_attribute === 'loserId') {
      this.help_title = '???';
      this.help_desc = '???';
    } else if (this.contextmenu_attribute === 'cleanWin') {
      this.help_title = '???';
      this.help_desc = '???';
    }
    this.showhelp = true;
  }

  toggleSupervize() {
    let attribute = this.contextmenu_attribute;
    if (this.supervize[attribute]) {
      this.supervize[attribute] = false;
    } else {
      this.supervize[attribute] = true;
    }
  }

  updateSupervize(id: number) {
    let data = this.supervize;
    this.shootoutsService.updateSupervize(this.matchId, id, data).subscribe(
      (data: any) => {
        this.loading = false;
        this.close();
        this.saveAndNext();
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  logError(data: any) {
    this.defaultService.error(data).subscribe((data: any) => {});
  }

  submit(type: string) {
    let videoTime: number = 0;

    let times = this.realDatetime.split(":");
      let h = parseInt(times[0]);
      let m = parseInt(times[1]);
      let s = parseInt(times[2]);
    videoTime = (60 * h * 60) + (m * 60) + s;

    console.log("Save videotime", videoTime);
    if (Object.keys(this.editData).length == 0) {
      if (this.validace()) {
        this.save_type = type;

        this.loading = true;
      }
    } else {
      if (this.validace()) {
        this.save_type = type;
        this.loading = true;
        this.updateHit();
      }
    }
  }

  validace() {
    let ok = true;

    //detekce prazdneho hrace
    if (this.player1 == '' || this.player1 == undefined) {
      ok = false;
      this.sendToast(
        'error',
        'Chyba!',
        'Pole najíždějící hráč nemůže být prázdné.'
      );
    }

    if(this.realDatetime == ""){
      ok = false;
      this.sendToast('error', 'Chyba!', 'Pole videočas nájezdu nemůže být prázdné.');
    }

    var regExp = /[a-zA-Z]/g;
    if(regExp.test(this.realDatetime)){
      ok = false;
      this.sendToast('error', 'Chyba!', 'Nesprávný formát pole pro videočas nájezdu');
    }

    if (this.goalkeeper == '' || this.goalkeeper == undefined) {
      ok = false;
      this.sendToast('error', 'Chyba!', 'Pole brankář nemůže být prázdné.');
    }

    if (this.score == undefined) {
      ok = false;
      this.sendToast(
        'error',
        'Chyba!',
        'Je nutné vyplnit, zda byl vstřelen gól.'
      );
    }

    return ok;
  }

  updateHit() {
    let time = this.minute * 60 + this.second;
    if (this.period == 1) {
      time = (time - 1200) * -1;
    } else if (this.period == 2) {
      time = (time - 1200) * -1 + 1200;
    } else if (this.period == 3) {
      time = (time - 2400) * -1 + 1200;
    } else if (this.period == 4) {
      time = (time - 3600) * -1 + this.overtimeLength;
    } else if (this.period == 5) {
      time = (time - 4800) * -1 + this.overtimeLength;
    } else if (this.period === 6) {
      time = (time - 6000) * -1 + this.overtimeLength;
    }

    let player1 = String(this.player1);
    if (player1 == '') {
      player1 = null;
    }

    let goalkeeper = String(this.goalkeeper);
    if (goalkeeper == '') {
      goalkeeper = null;
    }

    if (this.shot_active == '') {
      this.shot_active = null;
    }

    let app = 'tracking';
    if (this.page_type === 'supervize') {
      app = 'supervision';
    }

    let videoTime: number = 0;

    let times = this.realDatetime.split(":");
      let h = parseInt(times[0]);
      let m = parseInt(times[1]);
      let s = parseInt(times[2]);
    videoTime = (60 * h * 60) + (m * 60) + s;

    console.log("Save videotime", videoTime);

    let data = {
      shooterId: player1,
      goalkeeperId: goalkeeper,
      score: this.score,
      finish: this.finish,
      stickSide: this.stickSide,
      gateZone: this.shot_active,
      app: app,
      videoTime: videoTime,
    };

    this.shootoutsService
      .updateShootout(this.matchId, this.shootoutId, data)
      .subscribe(
        (data: any) => {
          this.updateSupervize(this.shootoutId);
          this.sendToast(
            'success',
            'Výborně!',
            'Vybraná událost byla upravena.'
          );
        },
        (error) => {
          this.logError({
            error: JSON.stringify(error),
            match: this.matchId,
            data: JSON.stringify(data),
          });

          console.log(JSON.stringify(error));
          this.loading = false;
          this.sendToast(
            'error',
            'Chyba!',
            'Během úpravy nájezdu došlo k chybě. Zkuste to znovu.'
          );
        }
      );
  }
}
