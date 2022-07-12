import {Component, OnInit, ViewChild, HostListener, ChangeDetectorRef} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { DefaultService } from '../../services/default.service';
import { isNumber } from 'util';

import { ShotComponent } from '../../components/canvas/shot/shot.component';
import { ZoneEntryComponent } from '../../components/canvas/zoneEntry/zoneEntry.component';
import { DumpInComponent } from '../../components/canvas/dumpIn/dumpIn.component';
import { OffensiveZoneLossComponent } from '../../components/canvas/offensiveZoneLoss/offensiveZoneLoss.component';
import { HitComponent } from '../../components/canvas/hit/hit.component';
import { PenaltyComponent } from '../../components/canvas/penalty/penalty.component';
import { ZoneExitComponent } from '../../components/canvas/zoneExit/zoneExit.component';
import { FaceOffComponent } from '../../components/canvas/faceOff/faceOff.component';
import { DumpOutComponent } from '../../components/canvas/dumpOut/dumpOut.component';
import { ShootoutComponent } from '../../components/canvas/shootout/shootout.component';

import { EventFlowService } from '../../services/eventflow.service';
import { FaceOffService } from '../../services/faceOff.service';
import { DumpInService } from '../../services/dumpIn.service';
import { DumpOutService } from '../../services/dumpOut.service';
import { HitService } from '../../services/hit.service';
import { OffensiveZoneLossService } from '../../services/offensiveZoneLoss.service';
import { ShotService } from '../../services/shot.service';
import { ZoneEntryService } from '../../services/zoneEntry.service';
import { ZoneExitService } from '../../services/zoneExit.service';
import { TimelineService } from '../../services/timeline.service';

import { AppComponent } from '../../app.component';

import { DomSanitizer } from '@angular/platform-browser';

import { ToastrService } from 'ngx-toastr';
import {errorsText} from '../../../errors_text';
import * as data from '../../../lang.json';
import {UtilService} from '../../services/util.service';
import {forkJoin} from 'rxjs';
import {PassService} from '../../services/pass.service';
import {PuckWonService} from '../../services/puckWon.service';
import {MatchTypes} from '../../enums/match-type.enum';

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.scss'],
  providers: [
    DefaultService,
    EventFlowService,
    FaceOffService,
    DumpInService,
    DumpOutService,
    HitService,
    OffensiveZoneLossService,
    ShotService,
    ZoneEntryService,
    ZoneExitService,
    TimelineService,
    UtilService,
    PassService,
    PuckWonService
  ],
  host: {
    '(document:keypress)': 'handleKeyboardEvent($event)',
  },
})
export class TrackingComponent implements OnInit {

  constructor(
    private dom: DomSanitizer,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private defaultService: DefaultService,
    private eventFlowService: EventFlowService,
    private faceOffService: FaceOffService,
    private dumpInService: DumpInService,
    private dumpOutService: DumpOutService,
    private hitService: HitService,
    private offensiveZoneLossService: OffensiveZoneLossService,
    private shotService: ShotService,
    private zoneEntryService: ZoneEntryService,
    private zoneExitService: ZoneExitService,
    private timelineService: TimelineService,
    private utilService: UtilService,
    private ref: ChangeDetectorRef,
    private passService: PassService,
    private puckWonService: PuckWonService
  ) {}
  filterErrorTypes = 'noErrors';
  id: number;

  show_faceOff = false;
  show_shot = false;
  show_zoneEntry = false;
  show_hit = false;
  show_dumpIn = false;
  show_zoneExit = false;
  show_dumpOut = false;
  show_offensiveZoneLoss = false;
  show_shootout = false;
  show_penalty = false;

  overtimeLength = 0;
  page_type = 'tracking';

  disabledWatch = false;

  period = 1;
  minute = 20;
  second = 0;

  game: any = [];
  eventflow: any = [];
  render_eventflow: any = [];

  filter_supervize = false;
  filter_period = 1;
  filter_team = 'all';
  filter_post = 'all';
  filter_events = 'all';

  enabled_camera = 1;
  toggle_adding_nav = false;

  event_list: any = [];
  // event_list: any = ['penalty'];

  roster_home: any = [];
  roster_away: any = [];

  x: number;
  y: number;
  x_temp: number;
  y_temp: number;
  show_coordinates = false;
  clickChangedSides = false;

  editData: any = {};

  loaded = false;
  loading = true;
  eventflow_loading = false;
  reload: any;

  casomira: number;

  reversed_sides = false;

  videoId = '';

  test_x: number;
  test_y: number;

  activeFormation: any = [];

  enter_time = 0;
  timer: any;

  videoUrl: any = '';

  dragula_1: any;
  dragula_2: any;
  dragula_3: any;
  dragula_11: any;
  dragula_21: any;
  dragula_31: any;
  dragula_22: any;
  dragula_33: any;

  title = '';
  langData: any;
  invalidCasomira: boolean;
  passIdForDeletion: number;
  puckwonIdForDeletion: number;

  @ViewChild(ShotComponent) shotComponent: ShotComponent;
  @ViewChild(ZoneEntryComponent) zoneEntryComponent: ZoneEntryComponent;
  @ViewChild(DumpInComponent) dumpInComponent: DumpInComponent;
  @ViewChild(OffensiveZoneLossComponent)
  offensiveZoneLossComponent: OffensiveZoneLossComponent;
  @ViewChild(HitComponent) hitComponent: HitComponent;
  @ViewChild(PenaltyComponent) penaltyComponent: PenaltyComponent;
  @ViewChild(ZoneExitComponent) zoneExitComponent: ZoneExitComponent;
  @ViewChild(FaceOffComponent) faceOffComponent: FaceOffComponent;
  @ViewChild(DumpOutComponent) dumpOutComponent: DumpOutComponent;
  @ViewChild(ShootoutComponent) shootoutComponent: ShootoutComponent;
  @ViewChild(AppComponent) appComponent: AppComponent;
  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler(event) {
    this.disabledWatch = true;
    this.defaultService.removeWatch(this.id).subscribe(
      (data: any) => {
        this.toastr.success(
          'Sběr dat byl ukončen a zápas uzamčen.',
          'Výborně!',
          {
            progressBar: true,
          }
        );
      },
      (error) => {
        this.toastr.error('Během zamykání zápasu došlo k chybě.', 'Chyba!', {
          progressBar: true,
        });
      }
    );

    return false;
    // I have used return false but you can your other functions or any query or condition
  }

  ngOnInit(): void {
    this.langData = (data as any).default;
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (this.router.url.includes('supervize')) {
      this.page_type = 'supervize';
      this.event_list = [
        'faceOff',
        'shot',
        'saved',
        'missed',
        'goal',
        'deflected',
        'zoneEntry',
        'dumpIn',
        'zoneExit',
        'dumpOut',
        'shootout',
        'penalty',
      ];
    } else {
      this.event_list = [
        'faceOff',
        'shot',
        'saved',
        'missed',
        'goal',
        'deflected',
        'zoneEntry',
        'dumpIn',
        'zoneExit',
        'dumpOut',
        'shootout',
        'penalty',
      ];
    }

    this.loadGame();

    this.relogCheck();

    this.timer = setInterval(() => {
      this.relogCheck();
    }, 10000);
  }

  loadGame() {
    this.loaded = false;
    this.defaultService.getMatch(this.id).subscribe(
      (data: any) => {
        this.game = data;
        this.videoId = data.videoId;
        this.videoUrl = this.dom.bypassSecurityTrustResourceUrl(
          'https://php.laura.esports.cz/tracking-app/video.php?starttime=0&id=' +
            this.videoId
        );

        this.fillRosters(data);
        this.loadEventFlow(this.id);

        this.loadPlayersOnIce(true);

        this.overtimeLength = data.gameData.game.overtimeLength;
        localStorage.setItem(
          'overtimeLength',
          data.gameData.game.overtimeLength
        );
        this.loaded = true;
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        if (error.status == 401) {
          this.defaultService.logout();
        } else if (error.status == 404) {
          this.disabledWatch = true;
        }
      }
    );
  }

  lol() {
    // alert(JSON.stringify(this.dragula_1));
  }

  openVideoTime(second: number) {
    console.log('Open video time', second);
    // console.log('Second ' + second);

    this.loading = false;

    this.timelineService.getVideoTime(this.id, second).subscribe(
      (data: any) => {
        this.videoUrl = this.dom.bypassSecurityTrustResourceUrl(
          'https://php.laura.esports.cz/tracking-app/video.php?starttime=' +
            data.videoTime +
            '&id=' +
            this.videoId
        );

        this.loading = false;
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  openVideoTrueTime(second: number) {
    console.log('seconds', second);
    this.loading = true;
    this.videoUrl = this.dom.bypassSecurityTrustResourceUrl(
      'https://php.laura.esports.cz/tracking-app/video.php?starttime=' +
        second +
        '&id=' +
        this.videoId
    );

    this.loading = false;
  }

  stringy(ddd: any) {
    return '';
  }

  saveType(data: any) {
    console.log('DATA 2', data);
    const data_list = [];
    let selected_index = 0;
    if (data.save_type === 'save_next') {
      if (
        this.filter_events != 'segment1' &&
        this.filter_events != 'segment2'
      ) {
        // faceOff
        if (data.type === 'faceOff') {
          this.render_eventflow.forEach((item) => {
            if (item.event === data.type) {
              data_list.push(item);
            }
          });
          data_list.forEach((item, index) => {
            if (item.faceOffId === data.id) {
              selected_index = index;
            }
          });

          setTimeout(() => {
            if (data_list[selected_index - 1] != undefined) {
              this.editEvent(data_list[selected_index - 1]);
            } else {
              // alert("konec seznamu")
            }
          }, 400);
        }

        // dumpIn
        if (data.type === 'dumpIn') {
          this.render_eventflow.forEach((item) => {
            if (item.event === data.type) {
              data_list.push(item);
            }
          });
          data_list.forEach((item, index) => {
            if (item.dumpInId === data.id) {
              selected_index = index;
            }
          });

          setTimeout(() => {
            if (data_list[selected_index - 1] != undefined) {
              this.editEvent(data_list[selected_index - 1]);
            } else {
              // alert("konec seznamu")
            }
          }, 400);
        }

        // dumpOut
        if (data.type === 'dumpOut') {
          this.render_eventflow.forEach((item) => {
            if (item.event === data.type) {
              data_list.push(item);
            }
          });
          data_list.forEach((item, index) => {
            if (item.dumpOutId === data.id) {
              selected_index = index;
            }
          });

          setTimeout(() => {
            if (data_list[selected_index - 1] != undefined) {
              this.editEvent(data_list[selected_index - 1]);
            } else {
              // alert("konec seznamu")
            }
          }, 400);
        }

        // hit
        if (data.type === 'hit') {
          this.render_eventflow.forEach((item) => {
            if (item.event === data.type) {
              data_list.push(item);
            }
          });
          data_list.forEach((item, index) => {
            if (item.hitId === data.id) {
              selected_index = index;
            }
          });

          setTimeout(() => {
            if (data_list[selected_index - 1] != undefined) {
              this.editEvent(data_list[selected_index - 1]);
            } else {
              // alert("konec seznamu")
            }
          }, 400);
        }

        // offensiveZoneLoss
        if (data.type === 'offensiveZoneLoss') {
          this.render_eventflow.forEach((item) => {
            if (item.event === data.type) {
              data_list.push(item);
            }
          });
          data_list.forEach((item, index) => {
            if (item.offensiveZoneLossId === data.id) {
              selected_index = index;
            }
          });

          setTimeout(() => {
            if (data_list[selected_index - 1] != undefined) {
              this.editEvent(data_list[selected_index - 1]);
            } else {
              // alert("konec seznamu")
            }
          }, 400);
        }

        // penalty
        if (data.type === 'penalty') {
          this.render_eventflow.forEach((item) => {
            if (item.event === data.type) {
              data_list.push(item);
            }
          });
          data_list.forEach((item, index) => {
            if (item.penaltyId === data.id) {
              selected_index = index;
            }
          });

          setTimeout(() => {
            if (data_list[selected_index - 1] != undefined) {
              this.editEvent(data_list[selected_index - 1]);
            } else {
              // alert("konec seznamu")
            }
          }, 400);
        }

        // shootout
        console.log('data-type', data);
        if (data.type === 'shootout') {
          this.render_eventflow.forEach((item) => {
            if (item.event === data.type) {
              data_list.push(item);
            }
          });
          data_list.sort((a, b) => {
            return a.eventTime - b.eventTime;
          });
          data_list.forEach((item, index) => {
            if (item.shootoutId === data.id) {
              selected_index = index;
            }
          });
          console.clear();
          console.log('Data List', data_list);
          console.log('selected index', selected_index);
          console.log('data-type', data);
          console.log('__________');

          setTimeout(() => {
            if (data_list[selected_index + 1] != undefined) {
              this.editEvent(data_list[selected_index + 1]);
            } else {
              // alert("konec seznamu")
            }
          }, 400);
        }

        if (data.type === 'shot') {
          this.render_eventflow.forEach((item) => {
            if (item.event === data.type) {
              data_list.push(item);
            }
          });
          data_list.forEach((item, index) => {
            if (item.shotId === data.id) {
              selected_index = index;
            }
          });

          setTimeout(() => {
            if (data_list[selected_index - 1] != undefined) {
              this.editEvent(data_list[selected_index - 1]);
            } else {
              // alert("konec seznamu")
            }
          }, 400);
        }

        // zoneEntry
        if (data.type === 'zoneEntry') {
          this.render_eventflow.forEach((item) => {
            if (item.event === data.type) {
              data_list.push(item);
            }
          });
          data_list.forEach((item, index) => {
            if (item.zoneEntryId === data.id) {
              selected_index = index;
            }
          });

          setTimeout(() => {
            if (data_list[selected_index - 1] != undefined) {
              this.editEvent(data_list[selected_index - 1]);
            } else {
              // alert("konec seznamu")
            }
          }, 400);
        }

        // zoneEntry
        if (data.type === 'zoneExit') {
          this.render_eventflow.forEach((item) => {
            if (item.event === data.type) {
              data_list.push(item);
            }
          });
          data_list.forEach((item, index) => {
            if (item.zoneExitId === data.id) {
              selected_index = index;
            }
          });

          setTimeout(() => {
            if (data_list[selected_index - 1] != undefined) {
              this.editEvent(data_list[selected_index - 1]);
            } else {
              // alert("konec seznamu")
            }
          }, 400);
        }
      }

      if (this.filter_events == 'segment1') {
        this.render_eventflow.forEach((item) => {
          data_list.push(item);
        });
        data_list.forEach((item, index) => {
          if (item.shotId === data.id || item.faceOffId === data.id) {
            selected_index = index;
          }
        });

        setTimeout(() => {
          if (data_list[selected_index - 1] != undefined) {
            this.editEvent(data_list[selected_index - 1]);
          } else {
            // alert("konec seznamu")
          }
        }, 400);
      }

      if (this.filter_events == 'segment2') {
        this.render_eventflow.forEach((item) => {
          data_list.push(item);
        });
        data_list.forEach((item, index) => {
          if (
            item.zoneExitId === data.id ||
            item.zoneEntryId === data.id ||
            item.dumpInId === data.id ||
            item.dumpOutId === data.id
          ) {
            selected_index = index;
          }
        });

        setTimeout(() => {
          if (data_list[selected_index - 1] != undefined) {
            this.editEvent(data_list[selected_index - 1]);
          } else {
            // alert("konec seznamu")
          }
        }, 400);
      }
    }
  }

  relogCheck2() {
    // this.appComponent.relogCheck();
  }

  loadPlayersOnIce(open_video: boolean) {
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

    console.log('Time!', time);
    this.activeFormation = [];
    if (time >= 0) {
      this.defaultService.getPlayersOnIce(this.id, time).subscribe(
        (data: any) => {
          this.activeFormation = data;
        },
        (error) => {}
      );
    }

    if (time == 2400) { time = time - 1; }

    if (open_video) { this.openVideoTime(time); }

    // kotva
  }

  checkPlayerOnIce(id: number) {
    let isOnIce = false;

    if (this.activeFormation.includes(id)) {
      isOnIce = true;
    }
    return isOnIce;
  }

  fillRosters(data: any) {
    data.roster.home.forEach((player) => {
      player.team_shortcut = data.gameData.homeTeam.shortcut;
      player.team_id = data.gameData.homeTeam.id;
      this.roster_home.push(player);
    });

    data.roster.away.forEach((player) => {
      player.team_shortcut = data.gameData.awayTeam.shortcut;
      player.team_id = data.gameData.awayTeam.id;
      this.roster_away.push(player);
    });
  }

  selectPlayer(id: string) {
    if (this.show_shot) {
      this.shotComponent.selectPlayerByClick(id);
    } else if (this.show_faceOff) {
      this.faceOffComponent.selectPlayerByClick(id);
    } else if (this.show_dumpIn) {
      this.dumpInComponent.selectPlayerByClick(id);
    } else if (this.show_dumpOut) {
      this.dumpOutComponent.selectPlayerByClick(id);
    } else if (this.show_hit) {
      this.hitComponent.selectPlayerByClick(id);
    } else if (this.show_offensiveZoneLoss) {
      this.offensiveZoneLossComponent.selectPlayerByClick(id);
    } else if (this.show_shootout) {
      this.shootoutComponent.selectPlayerByClick(id);
    } else if (this.show_zoneEntry) {
      this.zoneEntryComponent.selectPlayerByClick(id);
    } else if (this.show_zoneExit) {
      this.zoneExitComponent.selectPlayerByClick(id);
    } else if (this.show_penalty) {
      this.penaltyComponent.selectPlayerByClick(id);
    }
  }

  loadEventFlow(matchId: number) {
    this.eventflow = [];
    this.eventflow_loading = true;
    this.eventFlowService.getEventflow(matchId).subscribe(
      (data: any) => {
        console.log('Loaded Data EW', data);
        this.eventflow = data;
        const mapShotIdsFromPassPuckWon = new Map<number, any>();
        // Mapa pro naparovani shotId s error type a rule
        this.eventflow.forEach(item => {
            if (['pass', 'puckWon'].includes(item.event) && item.error !== null) {
              const shotId = item.shotId;
              const value = {
                rule: item.error.rule,
                errorType: item.error.type,
                prev_time: item.error.prev_time,
                time: item.time
              };
              mapShotIdsFromPassPuckWon.set(shotId, value);
            }
          }
        );

        // premapovat za pomoci mapy
        this.eventflow.forEach(item => {
          if (item.event === 'shot' && mapShotIdsFromPassPuckWon.has(item.shotId)) {
            const isObjectPresent = mapShotIdsFromPassPuckWon.get(item.shotId);
            item.error = {type: isObjectPresent.errorType, rule: isObjectPresent.rule, prev_time: isObjectPresent.prev_time};
            item.time = isObjectPresent.time;
          }
        });

        this.eventflow.forEach((item, index) => {
          if (typeof item.time != 'undefined') {
            if (isNumber(item.time)) {
              item.eventTime = item.time;
            } else {
              item.eventTime = item.time.start;
            }
          } else {
            item.eventTime = 10000;
          }
          item.filter_player_post = this.getPlayerInfo(item, 'position');
          item.filter_player_team = this.getPlayerTeam2(
            this.getPlayerInfo(item, 'id')
          );
        });

        this.eventflow.sort((a, b) => {
          return a.eventTime - b.eventTime;
        });

        this.filterEventflow();
        this.eventflow_loading = false;
      },
      (error) => {
        // alert(JSON.stringify(error));
        this.eventflow_loading = false;
      }
    );
    this.ref.detectChanges();
  }

  filterEventflow() {
    this.render_eventflow = [];
    const render_eventflow_1 = [];
    const render_eventflow_2 = [];
    const render_eventflow_3 = [];
    const render_eventflow_4 = [];
    const render_eventflow_5 = [];
    const render_eventflow_6 = [];
    const render_eventflow_7 = [];
    // filter period

    console.log('EW Flow', this.eventflow);
    if (this.filter_period == 1) {
      this.setPeriod(1);
      this.eventflow.forEach((item) => {
        if (item.event == 'penalty') {
          if (item.created > -1 && item.created < 1200) {
            render_eventflow_1.push(item);
          }
        } else {
          if (item.eventTime > -1 && item.eventTime < 1200) {
            render_eventflow_1.push(item);
          }
        }
      });
    } else if (this.filter_period == 2) {
      this.setPeriod(2);
      this.eventflow.forEach((item) => {
        if (item.event == 'penalty') {
          if (item.created >= 1200 && item.created < 2400) {
            render_eventflow_1.push(item);
          }
        } else {
          if (item.eventTime >= 1200 && item.eventTime < 2400) {
            render_eventflow_1.push(item);
          }
        }
      });
    } else if (this.filter_period == 3) {
      this.setPeriod(3);
      this.eventflow.forEach((item) => {
        if (item.event == 'penalty') {
          if (item.created >= 2400 && item.created < 3600) {
            render_eventflow_1.push(item);
          }
        } else {
          if (item.eventTime >= 2400 && item.eventTime < 3600) {
            render_eventflow_1.push(item);
          }
        }
      });
    } else if (this.filter_period == 4) {
      this.setPeriod(4);
      this.eventflow.forEach((item) => {
        if (item.event == 'penalty') {
          if (item.created >= 3600 && item.created < 4800) {
            render_eventflow_1.push(item);
          }
        } else {
          if (item.eventTime >= 3600 && item.eventTime < 4800) {
            render_eventflow_1.push(item);
          }
        }
      });

      this.loadPlayersOnIce(false);
    } else if (this.filter_period == 5) {
      this.setPeriod(5);
      this.eventflow.forEach((item) => {
        if (item.event == 'penalty') {
          if (item.created >= 4800 && item.created < 6000) {
            render_eventflow_1.push(item);
          }
        } else {
          if (item.eventTime >= 4800 && item.eventTime < 6000) {
            render_eventflow_1.push(item);
          }
        }
      });
      this.loadPlayersOnIce(false);
    } else if (Number(this.filter_period) === 6) {
      this.setPeriod(6);
      this.eventflow.forEach((item) => {
        if (item.event === 'penalty') {
          if (item.created >= 6000) {
            render_eventflow_1.push(item);
          }
        } else {
          if (item.eventTime >= 6000) {
            render_eventflow_1.push(item);
          }
        }
      });
      this.loadPlayersOnIce(false);
    } else if (this.filter_period == 0) {
      this.eventflow.forEach((item) => {
        if (item.event == 'shootout') {
          console.log('event', item);
          item.eventTime = item.videoTime;
          render_eventflow_1.push(item);
        }
      });
      this.loadPlayersOnIce(false);
    }

    // filter types
    render_eventflow_1.forEach((item) => {
      if (this.event_list.includes(item.event)) {
        render_eventflow_2.push(item);
      }
    });

    if (this.filter_post == 'all') {
      render_eventflow_2.forEach((item) => {
        render_eventflow_3.push(item);
      });
    } else if (this.filter_post == 'forwards') {
      render_eventflow_2.forEach((item) => {
        if (item.filter_player_post == 'forward') {
          render_eventflow_3.push(item);
        }
      });
    } else if (this.filter_post == 'backwards') {
      render_eventflow_2.forEach((item) => {
        if (item.filter_player_post == 'backward') {
          render_eventflow_3.push(item);
        }
      });
    }
    if (this.filter_events == 'all') {
      render_eventflow_3.forEach((item) => {
        render_eventflow_4.push(item);
      });
    } else if (this.filter_events == 'segment1') {
      render_eventflow_3.forEach((item) => {
        if (
          item.event == 'faceOff' ||
          item.event == 'shot' ||
          item.event == 'penalty'
        ) {
          console.log('EVENT');
          render_eventflow_4.push(item);
        }
      });
    } else if (this.filter_events == 'segment2') {
      render_eventflow_3.forEach((item) => {
        if (
          item.event == 'zoneExit' ||
          item.event == 'zoneEntry' ||
          item.event == 'dumpIn' ||
          item.event == 'dumpOut'
        ) {
          render_eventflow_4.push(item);
        }
      });
    } else {
      render_eventflow_3.forEach((item) => {
        if (this.filter_events == item.event) {
          render_eventflow_4.push(item);
        } else if (this.filter_events == item.result) {
          render_eventflow_4.push(item);
        }
      });
    }

    if (this.filter_team == 'all') {
      render_eventflow_4.forEach((item) => {
        render_eventflow_5.push(item);
      });
    } else {
      render_eventflow_4.forEach((item) => {
        if (this.filter_team == 'home') {
          if (item.filter_player_team == 'home') {
            render_eventflow_5.push(item);
          }
        } else if (this.filter_team == 'away') {
          if (item.filter_player_team == 'away') {
            render_eventflow_5.push(item);
          }
        }
      });
    }

    if (this.filter_supervize) {
      render_eventflow_5.forEach((item) => {
        if (item.supervision != null) {
          render_eventflow_6.push(item);
        }
      });
    } else {
      render_eventflow_5.forEach((item) => {
        render_eventflow_6.push(item);
      });
    }

    if (this.filterErrorTypes === 'noErrors') {
      // do nothing
      render_eventflow_6.forEach((item) => {
        render_eventflow_7.push(item);
      });
    } else {
      render_eventflow_6.forEach((item) => {
        if (item.error !== null) {
          switch (this.filterErrorTypes) {
            case 'all':
              if (['error', 'warning'].includes(item.error.type)) {
                render_eventflow_7.push(item);
              }
              break;
            case 'errors':
              if ('error' === item.error.type) {
                render_eventflow_7.push(item);
              }
              break;
            case 'warnings':
              if ('warning' === item.error.type) {
                render_eventflow_7.push(item);
              }
              break;
            default:
            // do nothing
          }
        }
      });
    }

    console.log('render_eventflow_7', render_eventflow_7);
    if (this.filter_period == 0) {
      render_eventflow_7.sort((a, b) => {
        return a.eventTime - b.eventTime;
      });
    } else {
      render_eventflow_7.sort((a, b) => {
        return b.eventTime - a.eventTime;
      });
    }

    console.log('render_eventflow_6 after', render_eventflow_7);

    this.render_eventflow = render_eventflow_7;
    console.log(this.render_eventflow);
  }

  getPeriod(time: number) {
    if (time > -1 && time < 1200) {
      return '1.';
    } else if (time >= 1200 && time < 2400) {
      return '2.';
    } else if (time >= 2400 && time < 3600) {
      return '3.';
    } else if (time >= 3600 && time < 4800) {
      return 'prod.';
    } else if (time >= 4800 && time < 6000) {
      return 'prod.2';
    } else if (time >= 6000) {
      return 'prod.3';
    }
  }

  getPeriodNumber(seconds: number) {
    if (seconds > -1 && seconds < 1200) {
      return 1;
    } else if (seconds >= 1200 && seconds < 2400) {
      return 2;
    } else if (seconds >= 2400 && seconds < 3600) {
      return 3;
    } else if (seconds >= 3600 && seconds < 4800) {
      return 4;
    } else if (seconds >= 4800 && seconds < 6000) {
      return 5;
    } else if (seconds >= 6000) {
      return 6;
    }
  }

  toggleCanvas(type: string, edit: boolean) {
    // window.scrollTo(0, document.body.scrollHeight);

    this.close(undefined);
    if (edit == false) {
      this.editData = {};
      this.minute = undefined;
      this.second = undefined;
    }

    if (type == 'faceOff') {
      if (this.show_faceOff) {
        this.show_faceOff = false;
      } else {
        this.show_faceOff = true;
      }
    } else if (type == 'shot') {
      if (this.show_shot) {
        this.show_shot = false;
      } else {
        this.show_shot = true;
      }
    } else if (type == 'zoneEntry') {
      if (this.show_zoneEntry) {
        this.show_zoneEntry = false;
      } else {
        this.show_zoneEntry = true;
      }
    } else if (type == 'dumpIn') {
      if (this.show_dumpIn) {
        this.show_dumpIn = false;
      } else {
        this.show_dumpIn = true;
      }
    } else if (type == 'zoneExit') {
      if (this.show_zoneExit) {
        this.show_zoneExit = false;
      } else {
        this.show_zoneExit = true;
      }
    } else if (type == 'dumpOut') {
      if (this.show_dumpOut) {
        this.show_dumpOut = false;
      } else {
        this.show_dumpOut = true;
      }
    } else if (type == 'offensiveZoneLoss') {
      if (this.show_offensiveZoneLoss) {
        this.show_offensiveZoneLoss = false;
      } else {
        this.show_offensiveZoneLoss = true;
      }
    } else if (type == 'hit') {
      if (this.show_hit) {
        this.show_hit = false;
      } else {
        this.show_hit = true;
      }
    } else if (type == 'shootout') {
      if (this.show_shootout) {
        this.show_shootout = false;
      } else {
        if (edit) {
          this.show_shootout = true;
        } else {
          this.toastr.info('Nový nájezd není možné vytvořit.', 'Info', {
            progressBar: true,
          });
        }
      }
    } else if (type == 'penalty') {
      if (this.show_penalty) {
        this.show_penalty = false;
      } else {
        if (edit) {
          this.show_penalty = true;
        } else {
          this.toastr.info('Nové vyloučení není možné vytvořit.', 'Info', {
            progressBar: true,
          });
        }
      }
    }
  }

  close(after_zone_exit: string) {
    this.show_faceOff = false;
    this.show_shot = false;
    this.show_zoneEntry = false;
    this.show_dumpIn = false;
    this.show_zoneExit = false;
    this.show_dumpOut = false;
    this.show_offensiveZoneLoss = false;
    this.show_hit = false;
    this.show_shootout = false;
    this.show_penalty = false;

    // hide coordinates
    this.show_coordinates = false;
    this.x_temp = null;
    this.y_temp = null;
    this.x = null;
    this.y = null;
    this.test_x = null;
    this.test_y = null;

    if (after_zone_exit == 'dumpIn') {
      this.toggleCanvas('dumpIn', true);
    } else if (after_zone_exit == 'zoneEntry') {
      this.toggleCanvas('zoneEntry', true);
    }

    this.loadEventFlow(this.id);
  }

  plusPeriod() {
    const tempPeriod = this.period;
    if (this.period < 6) {
      this.period = this.period + 1;

      this.filter_period = this.period;

      if (tempPeriod < 3) {
        // this.changeSides();
      }
    }
    this.loadPlayersOnIce(false);
    this.filterEventflow();
  }

  setPeriod(period: number) {
    this.period = period;
    console.log('setPeriod..', this.period);
    this.loadPlayersOnIce(false);
  }

  minusPeriod() {
    const tempPeriod = this.period;

    if (this.period > 1) {
      this.period = this.period - 1;

      this.filter_period = this.period;

      if (tempPeriod != 4) {
        // this.changeSides();
      }
    }
    this.loadPlayersOnIce(false);
    this.filterEventflow();
  }

  plusMinute() {
    if (this.minute < 20) {
      this.minute = this.minute + 1;
    } else {
      this.minute = 0;
    }
    this.loadPlayersOnIce(false);
  }

  minusMinute() {
    if (this.minute > 0) {
      this.minute = this.minute - 1;
    } else {
      this.minute = 19;
    }
    this.loadPlayersOnIce(false);
  }

  plusSecond() {
    if (this.second < 59) {
      this.second = this.second + 1;
    } else {
      this.second = 0;
    }
    this.loadPlayersOnIce(false);
  }

  minusSecond() {
    if (this.second > 0) {
      this.second = this.second - 1;
    } else {
      this.second = 59;
    }
    this.loadPlayersOnIce(false);
  }

  formatPeriod(period: number) {
    console.log('period..', period);
    if (period == 1) {
      return 'I.';
    } else if (period == 2) {
      return 'II.';
    } else if (period == 3) {
      return 'III.';
    } else if (period == 4) {
      return 'prod.';
    } else if (period == 5) {
      return 'prod.2';
    } else if (period === 6) {
      return 'prod.3';
    }
  }

  getRoster(type: string, post: string) {
    const roster = [];
    if (type == 'home') {
      this.game.roster.home.forEach((player) => {
        if (post == 'forward') {
          if (player.position == 'forward') {
            roster.push(player);
          }
        } else if (post == 'backward') {
          if (player.position == 'backward') {
            roster.push(player);
          }
        } else if (post == 'goalkeeper') {
          if (player.position == 'goalkeeper') {
            roster.push(player);
          }
        }
      });
    } else if (type == 'away') {
      this.game.roster.away.forEach((player) => {
        if (post == 'forward') {
          if (player.position == 'forward') {
            roster.push(player);
          }
        } else if (post == 'backward') {
          if (player.position == 'backward') {
            roster.push(player);
          }
        } else if (post == 'goalkeeper') {
          if (player.position == 'goalkeeper') {
            roster.push(player);
          }
        }
      });
    }

    roster.forEach((item) => {
      if (item.lineUp != undefined && item.lineUp != null) {
        item.lajna = item.lineUp.line;
      } else {
        item.lajna = 1000;
      }
    });

    roster.sort((p1, p2) => {
      return p1.lajna - p2.lajna;
    });

    return roster;
  }

  toLog(toLog: any) {
    console.log('Logged', toLog);
  }

  getEventType(type: string) {
    if (type == 'faceOff') {
      return 'Vhazování';
    } else if (type == 'shot') {
      return 'Střela';
    } else if (type == 'saved') {
      return 'Střela - chycená';
    } else if (type == 'missed') {
      return 'Střela - mimo';
    } else if (type == 'goal') {
      return 'Střela - gól';
    } else if (type == 'deflected') {
      return 'Střela - zablokovaná';
    } else if (type == 'zoneEntry') {
      return 'Vstup do pásma';
    } else if (type == 'dumpIn') {
      return 'Nahození';
    } else if (type == 'zoneExit') {
      return 'Výstup z pásma';
    } else if (type == 'dumpOut') {
      return 'Vyhození';
    } else if (type == 'offensiveZoneLoss') {
      return 'Ztráta út. pásma';
    } else if (type == 'hit') {
      return 'Hit';
    } else if (type == 'shootout') {
      return 'Nájezd';
    } else if (type == 'penalty') {
      return 'Vyloučení';
    }
  }

  editEvent(event: any) {
    console.log('Event', event);
    this.editData = event;

    this.relogCheck2();

    this.toggle_adding_nav = true;

    if (event.event === 'faceOff') {
      if (event.time != 3599) {
        this.setCasomiraByEvent(event.time + 1, true);
      } else {
        this.setCasomiraByEvent(event.time, true);
      }
      this.toggleCanvas('faceOff', true);
    } else if (event.event === 'shot') {
      this.setCasomiraByEvent(event.time, true);
      this.toggleCanvas('shot', true);
    } else if (event.event === 'zoneEntry') {
      this.setCasomiraByEvent(event.time, true);
      this.toggleCanvas('zoneEntry', true);
    } else if (event.event === 'dumpIn') {
      this.setCasomiraByEvent(event.time, true);
      this.toggleCanvas('dumpIn', true);
    } else if (event.event === 'zoneExit') {
      this.setCasomiraByEvent(event.time, true);
      this.toggleCanvas('zoneExit', true);
    } else if (event.event === 'dumpOut') {
      this.setCasomiraByEvent(event.time, true);
      this.toggleCanvas('dumpOut', true);
    } else if (event.event === 'offensiveZoneLoss') {
      this.setCasomiraByEvent(event.time, true);
      this.toggleCanvas('offensiveZoneLoss', true);
    } else if (event.event === 'hit') {
      this.setCasomiraByEvent(event.time, true);
      this.toggleCanvas('hit', true);
    } else if (event.event === 'shootout') {
      this.toggleCanvas('shootout', true);
    } else if (event.event === 'penalty') {
      this.toggleCanvas('penalty', true);
      this.setCasomiraByEvent(event.created, true);
    }
  }
  /* kotva 2 */
  setCasomiraByEvent(time: number, open_video: boolean) {
    const time2: any[] = this.getCasomira(time).split(':');
    // casomira for plus minus whitegreen input
    this.minute = Number(time2[0]);
    this.second = Number(time2[1]);
    this.period = this.getPeriodNumber(time);

    this.loadPlayersOnIce(false);

    if (this.page_type == 'supervize' && open_video) {
      this.openVideoTime(time);
    }
  }

  checkMinuteChange(value: number) {
    this.minute = Number(this.minute);
    if (value != null) {
      setTimeout(() => {
        if (value > 19) {
          this.minute = 0;
        } else if (value < 0) {
          this.minute = 0;
        }
      }, 100);
    }
  }

  checkSecondChange(value: number) {
    this.second = Number(this.minute);
    if (value != null) {
      setTimeout(() => {
        if (value > 59) {
          this.second = 0;
        } else if (value < 0) {
          this.second = 0;
        }
      }, 100);
    }
  }

  formatTime(seconds: number) {
    const minutes = (seconds - seconds % 60) / 60;
    const secondsNoFormat = seconds % 60;
    return minutes.toString().concat(':').concat(secondsNoFormat > 9 ? secondsNoFormat.toString() : '0'.concat(secondsNoFormat.toString()));

    // return (
    //   (seconds - (seconds %= 60)) / 60 + (9 < seconds ? ':' : ':0') + seconds
    // );
  }

  formatTime2(seconds: number) {
    return (
      (seconds - (seconds %= 60)) / 60 + (9 < seconds ? ':' : ':0') + seconds
    );
  }

  getCasomira(seconds: number) {
    const period = this.getPeriodNumber(seconds);
    if (period <= 3) {
      return this.formatTime(1200 * period - seconds);
    } else {
      return this.formatTime(3600 + ((period - 3) * this.overtimeLength) - seconds);
    }
  }

  getPlayerInfo(event: any, type: string) {
    if (event.event === 'faceOff') {
      return this.findPlayer(event.winnerId)[type];
    } else if (event.event === 'shot') {
      return this.findPlayer(event.playerId)[type];
    } else if (event.event === 'zoneEntry') {
      return this.findPlayer(event.playerId)[type];
    } else if (event.event === 'dumpIn') {
      return this.findPlayer(event.playerId)[type];
    } else if (event.event === 'zoneExit') {
      return this.findPlayer(event.playerId)[type];
    } else if (event.event === 'dumpOut') {
      return this.findPlayer(event.playerId)[type];
    } else if (event.event === 'offensiveZoneLoss') {
      return this.findPlayer(event.playerId)[type];
    } else if (event.event === 'hit') {
      return this.findPlayer(event.hitter)[type];
    } else if (event.event === 'penalty') {
      return this.findPlayer(event.disciplinedPlayerId)[type];
    } else if (event.event === 'shootout') {
      return this.findPlayer(event.shooterId)[type];
    }
  }

  getPlayerTeam(player_id: number) {
    let team = '';
    this.roster_home.forEach((player) => {
      if (player.id == player_id) {
        team = 'home';
      }
    });
    this.roster_away.forEach((player) => {
      if (player.id == player_id) {
        team = 'away';
      }
    });
    if (team == 'home') {
      return this.game.gameData.homeTeam.name;
    } else if (team == 'away') {
      return this.game.gameData.awayTeam.name;
    } else {
      return '???';
    }
  }

  getPlayerTeam2(player_id: number) {
    let team = '';
    this.roster_home.forEach((player) => {
      if (player.id == player_id) {
        team = 'home';
      }
    });
    this.roster_away.forEach((player) => {
      if (player.id == player_id) {
        team = 'away';
      }
    });
    return team;
  }

  findPlayer(id: number) {
    let player_selected = [];

    this.roster_home.forEach((player) => {
      if (player.id == id) {
        player_selected = player;
      }
    });

    this.roster_away.forEach((player) => {
      if (player.id == id) {
        player_selected = player;
      }
    });

    return player_selected;
  }

  toggleFilterSupervize() {
    if (this.filter_supervize) {
      this.filter_supervize = false;
    } else {
      this.filter_supervize = true;
    }
    this.filterEventflow();
  }

  onMapClick(event): void {
    const rect = event.target.getBoundingClientRect();
    console.log('Event1', event);
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.show_coordinates = true;

    this.x = x;
    this.y = y;

    if (this.show_shot) {
      this.shotComponent.sendCoordinates(
        this.recountCoordinates(x, y, 'x'),
        this.recountCoordinates(x, y, 'y')
      );
    } else if (this.show_zoneEntry) {
      this.zoneEntryComponent.sendCoordinates(
        this.recountCoordinates(x, y, 'x'),
        this.recountCoordinates(x, y, 'y')
      );
    } else if (this.show_dumpIn) {
      this.dumpInComponent.sendCoordinates(
        this.recountCoordinates(x, y, 'x'),
        this.recountCoordinates(x, y, 'y')
      );
    } else if (this.show_offensiveZoneLoss) {
      this.offensiveZoneLossComponent.sendCoordinates(
        this.recountCoordinates(x, y, 'x'),
        this.recountCoordinates(x, y, 'y')
      );
    } else if (this.show_hit) {
      this.hitComponent.sendCoordinates(
        this.recountCoordinates(x, y, 'x'),
        this.recountCoordinates(x, y, 'y')
      );
    } else if (this.show_penalty) {
      this.penaltyComponent.sendCoordinates(
        this.recountCoordinates(x, y, 'x'),
        this.recountCoordinates(x, y, 'y')
      );
    } else if (this.show_zoneExit) {
      this.zoneExitComponent.sendCoordinates(
        this.recountCoordinates(x, y, 'x'),
        this.recountCoordinates(x, y, 'y')
      );
    } else if (this.show_dumpOut) {
      this.dumpOutComponent.sendCoordinates(
        this.recountCoordinates(x, y, 'x'),
        this.recountCoordinates(x, y, 'y')
      );
    }

    this.test_x = this.recountCoordinates(x, y, 'x');
    this.test_y = this.recountCoordinates(x, y, 'y');
  }

  recountCoordinates(x: number, y: number, coordinate: string) {
    let xx = x - 380;

    let yy = y - 380 / 2;

    if (!this.reversed_sides) {
      xx = this.remap(xx, 380, -380, 100, -100);
      yy = this.remap(yy, 190, -190, 100, -100) * -1;
      if (
        this.show_dumpIn ||
        this.show_zoneEntry ||
        this.show_zoneExit ||
        this.show_dumpOut
      ) {
        if (xx < 1) {
          xx = -24;
          this.x = 286;
        } else {
          xx = 24;
          this.x = 470;
        }
      }
      if (coordinate == 'x') {
        return xx;
      } else if (coordinate == 'y') {
        return yy;
      }
    } else {
      xx = this.remap(xx, 380, -380, 100, -100) * -1;
      if (
        this.show_dumpIn ||
        this.show_zoneEntry ||
        this.show_zoneExit ||
        this.show_dumpOut
      ) {
        if (xx < 1) {
          xx = -24;
          this.x = 470;
        } else {
          xx = 24;
          this.x = 286;
        }
      }
      yy = this.remap(yy, 190, -190, 100, -100);
      if (coordinate == 'x') {
        return xx;
      } else if (coordinate == 'y') {
        return yy;
      }
    }
  }

  toggleNewEvent() {
    if (this.toggle_adding_nav) {
      this.toggle_adding_nav = false;
      this.close(undefined);
    } else {
      this.toggle_adding_nav = true;
    }
  }

  changeSides() {
    this.x = null;
    this.y = null;
    this.test_x = null;
    this.test_y = null;

    if (this.reversed_sides) {
      this.reversed_sides = false;
    } else {
      this.reversed_sides = true;
    }

    this.changeRecount();
  }

  changeRecount() {
    // this.test_x = this.recountCoordinates(this.x_temp, this.y_temp, 'x');
    // this.test_y = this.recountCoordinates(this.x_temp, this.y_temp, 'y');
  }

  remap(
    value: number,
    in_min: number,
    in_max: number,
    out_min: number,
    out_max: number
  ) {
    return Math.ceil(
      ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
    );
  }

  toast(toastData: any) {
    if (toastData.type === 'success') {
      this.toastr.success(toastData.text, toastData.message, {
        progressBar: true,
      });
    } else if (toastData.type === 'error') {
      this.toastr.error(toastData.text, toastData.message, {
        progressBar: true,
      });
    } else if (toastData.type === 'warning') {
      this.toastr.warning(toastData.text, toastData.message, {
        progressBar: true,
      });
    } else if (toastData.type === 'info') {
      this.toastr.info(toastData.text, toastData.message, {
        progressBar: true,
      });
    }
  }

  /* Kotva */
  changeCasomira(data: any) {
    const time = data.time;
    const period = data.period;

    const times = time.split(':');

    let time2 = Number(times[0]) * 60 + Number(times[1]);
    if (time2 > 1200) {
      this.toast({type: 'error', text: 'Chybná hodnota', message: this.langData.invalidCasomira});
      this.invalidCasomira = true;
    } else {
      this.invalidCasomira = false;

      if (period <= 3) {
        time2 = (1200 * period) - time2;
      } else {
        time2 = 3600 + ((period - 3) * this.overtimeLength) - time2;
      }
      this.setCasomiraByEvent(time2, false);
    }
  }

  formatStick(player: any) {
    if (player.position == 'goalkeeper') {
      return 'G';
    } else {
      if (player.stick === 'left') {
        return 'L';
      } else if (player.stick === 'right') {
        return 'P';
      }
    }
  }

  canDeactivate() {
    if (confirm('Přejete si opustit zápas a uzamknout ho?')) {
      this.defaultService.removeWatch(this.id).subscribe(
        (data: any) => {
          this.toastr.success(
            'Sběr dat byl ukončen a zápas uzamčen.',
            'Výborně!',
            {
              progressBar: true,
            }
          );
          /* clearInterval(this.reload); */
        },
        (error) => {
          this.toastr.error('Během zamykání zápasu došlo k chybě.', 'Chyba!', {
            progressBar: true,
          });
        }
      );

      return true;
    } else {
      return false;
    }
  }

  sync() {
    this.defaultService.matchSynchronize(String(this.id)).subscribe(
      (data: any) => {
        this.toastr.success('Synchronizace proběhla úspěšně.', 'Výborně!', {
          progressBar: true,
        });
        this.close(undefined);
      },
      (error) => {
        this.close(undefined);
        this.toastr.error('Během synchronizace došlo k chybě.', 'Chyba!', {
          progressBar: true,
        });
      }
    );
  }

  detectEdit(edit: any) {
    if (this.page_type === 'tracking') {
      if (edit.tracking != null) {
        return false;
      } else {
        return true;
      }
    } else if (this.page_type === 'supervize') {
      if (edit.supervision != null) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  detectSupervision(supervision: any) {
    if (supervision == null) {
      return true;
    } else {
      let count = 0;

      for (const prop in supervision) {
        if (Object.prototype.hasOwnProperty.call(supervision, prop)) {
          if (supervision[prop]) {
            count = count + 1;
          }
        }
      }

      if (count == 0) {
        return true;
      } else {
        return false;
      }
    }
  }

  getInfoMessage(event: any): string {
    this.title = '';
    const errorsPlaceholders = ['XXX1', 'XXX2'];
    const errors = ['warning', 'error'];
    const errorTypes = new Map<string, string>([['warning', 'Upozornění'], ['error', 'Chyba']]);
    errorsText.forEach(obj => {
        if (event.error !== null && obj.type === event.error?.type && obj.rule === event.error?.rule) {
          const titlePrefix = obj.type.concat(' ').concat('#').concat(obj.rule.toString()).concat(' ');
          this.title = titlePrefix + obj.text;
          if (this.title.includes(errorsPlaceholders[0])) {
            this.title = this.title.replace(errorsPlaceholders[0], event.error.prev_time !== 0 ?
              this.utilService.formatTime(event.error.prev_time) : '0');
            this.title = this.title.replace(errorsPlaceholders[1], event.time !== 0 ?
              this.utilService.formatTime(event.time) : '0');
          }
          if (this.title.includes(errors[0])) {
            this.title = this.title.replace(errors[0], errorTypes.get(errors[0]));
          } else {
            this.title = this.title.replace(errors[1], errorTypes.get(errors[1]));
          }
          return;
        }
      }
    );
    return this.title;
  }

  getInfoButtonClass(event: any): string {
    if (event.error?.type === 'warning' && this.page_type === 'supervize') {
      return 'warning-btn';
    } else if (event.error?.type === 'error' && this.page_type === 'supervize') {
      return 'error-btn';
    }
    return 'info-btn';
  }

  logout() {
    localStorage.setItem('access_token', '');
    localStorage.setItem('logged_user', '');
    this.router.navigate(['/login']);
  }

  goToSelect() {
    this.router.navigate(['/select']);
  }

  getCasomiraSeconds() {
    let cas = 0;
    if (this.period == 1) {
      cas = (this.minute * 60 + this.second - 1200) * -1;
    } else if (this.period == 2) {
      cas = (this.minute * 60 + this.second - 2400) * -1;
    } else if (this.period == 3) {
      cas = (this.minute * 60 + this.second - 3600) * -1;
    } else if (this.period == 4) {
      cas = (this.minute * 60 + this.second - 3600 + this.overtimeLength) * -1;
    } else if (this.period == 5) {
      cas = (this.minute * 60 + this.second - 4800 + this.overtimeLength) * -1;
    } else if (this.period === 6) {
      cas = (this.minute * 60 + this.second - 6000 + this.overtimeLength) * -1;
    }

    if (cas < 0) {
      cas = 0;
    }
    return cas;
  }

  handleKeyboardEvent(event: KeyboardEvent) {
    const key = event.keyCode;
    if (
      this.show_faceOff == false &&
      this.show_shot == false &&
      this.show_zoneEntry == false &&
      this.show_hit == false &&
      this.show_dumpIn == false &&
      this.show_zoneExit == false &&
      this.show_dumpOut == false &&
      this.show_offensiveZoneLoss == false &&
      this.show_shootout == false &&
      this.show_penalty == false
    ) {
      if (key == 66 || key == 98) {
        this.toggleCanvas('faceOff', false);
      } else if (key == 115 || key == 83) {
        this.toggleCanvas('shot', false);
      } else if (key == 100 || key == 68) {
        this.toggleCanvas('zoneEntry', false);
      } else if (key == 110 || key == 78) {
        this.toggleCanvas('dumpIn', false);
      } else if (key == 122 || key == 90) {
        this.toggleCanvas('zoneExit', false);
      } else if (key == 118 || key == 86) {
        this.toggleCanvas('dumpOut', false);
      } else if (key == 117 || key == 85) {
        this.toggleCanvas('offensiveZoneLoss', false);
      } else if (key == 104 || key == 72) {
        this.toggleCanvas('hit', false);
      } else if (key == 116 || key == 84) {
        this.toggleCanvas('shootout', false);
      } else if (key == 112 || key == 80) {
        this.toggleCanvas('penalty', false);
      }
    }
  }

  checkPassOrPuckWonContainsShotId(shotId: string) {
    this.eventflow.forEach(item => {
        if (MatchTypes.PASS === item.event && shotId === item.shotId && item.error !== null) {
          this.passIdForDeletion = item.passId;
        } else if (MatchTypes.PUCKWON === item.event && item.shotId && item.error !== null) {
          this.puckwonIdForDeletion = item.puckWonId;
        }
      }
    );
  }

  removeEvent(event: any) {
    let remove_id;

    if (confirm('Opravdu si přejete vybranou událost smazat?')) {
      if (event.event == 'faceOff') {
        remove_id = event.faceOffId;
        this.faceOffService.removeFaceOff(this.id, remove_id).subscribe(
          (data: any) => {
            this.toastr.success(
              'Událost ID:' + this.id + ' byla úspěšně smazána.',
              'Výborně!',
              {
                progressBar: true,
              }
            );
            this.close(undefined);
          },
          (error) => {
            this.toastr.warning(
              'Během mazání události ID:' + this.id + ' došlo k chybě.',
              'Chyba!',
              {
                progressBar: true,
              }
            );
            this.close(undefined);
          }
        );
      } else if (event.event == 'shot') {
        remove_id = event.shotId;
        this.checkPassOrPuckWonContainsShotId(remove_id);
        if (this.passIdForDeletion || this.puckwonIdForDeletion){
          forkJoin([this.shotService.removeShot(this.id, remove_id),
            this.passIdForDeletion ? this.passService.removePass(this.id, this.passIdForDeletion) :
              this.puckWonService.removePuckWon(this.id, this.puckwonIdForDeletion),
            ]).subscribe(res => {
            this.toastr.success(
              'Událost ID:' + this.id + ' byla úspěšně smazána.',
              'Výborně!',
              {
                progressBar: true,
              }
            );
            this.close(undefined);
          },
          (error) => {
            this.toastr.warning(
              'Během mazání události ID:' + this.id + ' došlo k chybě.',
              'Chyba!',
              {
                progressBar: true,
              }
            );
            this.close(undefined);
          });
        } else {
          this.shotService.removeShot(this.id, remove_id).subscribe(
            (data: any) => {
              this.toastr.success(
                'Událost ID:' + this.id + ' byla úspěšně smazána.',
                'Výborně!',
                {
                  progressBar: true,
                }
              );
              this.close(undefined);
            },
            (error) => {
              this.toastr.warning(
                'Během mazání události ID:' + this.id + ' došlo k chybě.',
                'Chyba!',
                {
                  progressBar: true,
                }
              );
              this.close(undefined);
            }
          );
        }
      } else if (event.event == 'zoneEntry') {
        remove_id = event.zoneEntryId;
        this.zoneEntryService.removeZoneEntry(this.id, remove_id).subscribe(
          (data: any) => {
            this.toastr.success(
              'Událost ID:' + this.id + ' byla úspěšně smazána.',
              'Výborně!',
              {
                progressBar: true,
              }
            );
            this.close(undefined);
          },
          (error) => {
            this.toastr.warning(
              'Během mazání události ID:' + this.id + ' došlo k chybě.',
              'Chyba!',
              {
                progressBar: true,
              }
            );
            this.close(undefined);
          }
        );
      } else if (event.event == 'dumpIn') {
        remove_id = event.dumpInId;
        this.dumpInService.removeDumpIn(this.id, remove_id).subscribe(
          (data: any) => {
            this.toastr.success(
              'Událost ID:' + this.id + ' byla úspěšně smazána.',
              'Výborně!',
              {
                progressBar: true,
              }
            );
            this.close(undefined);
          },
          (error) => {
            this.toastr.warning(
              'Během mazání události ID:' + this.id + ' došlo k chybě.',
              'Chyba!',
              {
                progressBar: true,
              }
            );
            this.close(undefined);
          }
        );
      } else if (event.event == 'zoneExit') {
        remove_id = event.zoneExitId;
        this.zoneExitService.removeZoneExit(this.id, remove_id).subscribe(
          (data: any) => {
            this.toastr.success(
              'Událost ID:' + this.id + ' byla úspěšně smazána.',
              'Výborně!',
              {
                progressBar: true,
              }
            );
            this.close(undefined);
          },
          (error) => {
            this.toastr.warning(
              'Během mazání události ID:' + this.id + ' došlo k chybě.',
              'Chyba!',
              {
                progressBar: true,
              }
            );
            this.close(undefined);
          }
        );
      } else if (event.event == 'dumpOut') {
        remove_id = event.dumpOutId;
        this.dumpOutService.removeDumpOut(this.id, remove_id).subscribe(
          (data: any) => {
            this.toastr.success(
              'Událost ID:' + this.id + ' byla úspěšně smazána.',
              'Výborně!',
              {
                progressBar: true,
              }
            );
            this.close(undefined);
          },
          (error) => {
            this.toastr.warning(
              'Během mazání události ID:' + this.id + ' došlo k chybě.',
              'Chyba!',
              {
                progressBar: true,
              }
            );
            this.close(undefined);
          }
        );
      } else if (event.event == 'offensiveZoneLoss') {
        remove_id = event.offensiveZoneLossId;
        this.offensiveZoneLossService
          .removeOffensiveZoneLoss(this.id, remove_id)
          .subscribe(
            (data: any) => {
              this.toastr.success(
                'Událost ID:' + this.id + ' byla úspěšně smazána.',
                'Výborně!',
                {
                  progressBar: true,
                }
              );
              this.close(undefined);
            },
            (error) => {
              this.toastr.warning(
                'Během mazání události ID:' + this.id + ' došlo k chybě.',
                'Chyba!',
                {
                  progressBar: true,
                }
              );
              this.close(undefined);
            }
          );
      } else if (event.event == 'hit') {
        remove_id = event.hitId;
        this.hitService.removeHit(this.id, remove_id).subscribe(
          (data: any) => {
            this.toastr.success(
              'Událost ID:' + this.id + ' byla úspěšně smazána.',
              'Výborně!',
              {
                progressBar: true,
              }
            );
            this.close(undefined);
          },
          (error) => {
            this.toastr.warning(
              'Během mazání události ID:' + this.id + ' došlo k chybě.',
              'Chyba!',
              {
                progressBar: true,
              }
            );
            this.close(undefined);
          }
        );
      }
    }
  }

  relogCheck() {
    // this.enter_time = this.enter_time + 1;
    /* this.enter_time == 240 */
    if (false) {
      clearInterval(this.timer);
      this.disabledWatch = true;
      this.defaultService.removeWatch(this.id).subscribe(
        (data: any) => {
          this.toastr.success(
            'Sběr dat byl ukončen a zápas uzamčen.',
            'Výborně!',
            {
              progressBar: true,
            }
          );
        },
        (error) => {
          this.toastr.error('Během zamykání zápasu došlo k chybě.', 'Chyba!', {
            progressBar: true,
          });
        }
      );
    }
  }
}
