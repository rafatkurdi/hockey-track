import { Component, OnInit, Input } from '@angular/core';
import { IDayCalendarConfig, DatePickerComponent } from 'ng2-date-picker';
import { Router } from '@angular/router';

import { DefaultService } from '../../services/default.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  providers: [DefaultService],
})
export class SelectComponent implements OnInit {
  calendar_settings = <IDayCalendarConfig>{
    locale: 'cs',
    firstDayOfWeek: 'mo',
    format: 'DD.MM.YYYY',
  };

  selected_month: string;
  selected_year: number;

  selectedDate: any;

  loading: boolean = false;

  games: any = [];
  opened_games: any = [];
  leagues: any = [];

  selectedLeague: string = '';

  league_name: string = 'Všechny soutěže';

  tracking: boolean = false;
  supervision: boolean = false;

  modal: boolean = false;

  constructor(
    private router: Router,
    private toastr: ToastrService,
    public defaultService: DefaultService
  ) {
    this.selected_month = this.getMonthName(new Date());
    this.selected_year = this.getYear(new Date());

    this.selectedDate = new Date();

    this.supervision = JSON.parse(localStorage.getItem('user_identity'))[
      'supervision'
    ];
    this.tracking = JSON.parse(localStorage.getItem('user_identity'))[
      'tracking'
    ];
  }

  ngOnInit(): void {
    this.leagues = [];

    this.defaultService.getLeague().subscribe(
      (data: any) => {
        this.leagues = data;
      },
      (error) => {
        //alert(JSON.stringify(error));
        this.loading = false;
      }
    );

    this.loadSchedule(
      this.selectedDate.toISOString().slice(0, 10).replace('T', ' ')
    );
  }

  reloadGames() {
    if (this.selectedLeague === '') {
      this.league_name = 'Všechny soutěže';
    } else {
      let league_ = '';
      this.leagues.forEach((league) => {
        if (String(league.id) === this.selectedLeague) {
          league_ = league.name;
        }
      });

      this.league_name = league_;
    }
  }

  filterGames() {
    let games = [];
    if (this.selectedLeague == '') {
      this.games.forEach((item, index) => {
        games.push(item);
      });
    } else {
      this.games.forEach((item, index) => {
        console.log(item.competition.id + '  ' + this.selectedLeague);
        if (item.competition.id == this.selectedLeague) {
          games.push(item);
        }
      });
    }

    return games;
  }

  loadSchedule(date: string) {
    this.opened_games = [];
    this.games = [];

    this.loading = true;
    this.defaultService.getSchedule(date, this.selectedLeague).subscribe(
      (data: any) => {
        this.games = data;

        this.defaultService.getMatches().subscribe(
          (data: any) => {
            this.opened_games = data;
            this.loading = false;
          },
          (error) => {
            this.loading = false;
            if (error.status == 401) {
              this.defaultService.logout();
            }
          }
        );
      },
      (error) => {
        //alert(JSON.stringify(error));
        this.loading = false;
        if (error.status == 401) {
          this.defaultService.logout();
        }
      }
    );
  }

  isActiveWatch(matchId: number) {
    let found = false;
    this.opened_games.forEach((game) => {
      if (game.id == matchId && game.watch) {
        found = true;
      }
    });
    return found;
  }

  selectDate(event) {
    let date = new Date(event.date);
    date.setDate(date.getDate());
    this.loadSchedule(
      new Date(date).toISOString().slice(0, 10).replace('T', ' ')
    );
  }

  onChangeMonth(event) {
    this.getMonthName(event.to);
    this.selected_month = this.getMonthName(event.to);
    this.selected_year = this.getYear(event.to);
  }

  getMonthName(date: any) {
    const monthNames = [
      'Leden',
      'Únor',
      'Březen',
      'Duben',
      'Květen',
      'Červen',
      'Červenec',
      'Srpen',
      'Září',
      'Říjen',
      'Listopad',
      'Prosinec',
    ];
    return monthNames[new Date(date).getMonth()];
  }

  getYear(date: any) {
    return new Date(date).getFullYear();
  }

  stringy(data: any) {
    return JSON.stringify(data);
  }

  checkOpenedGame(id: string, route: string) {
    let opened = false;
    /*
    this.opened_games.forEach(item => {
      if (item.id == id) {
        opened = true;
      }
    });
    */
    if (opened) {
      this.router.navigate(['/' + route, id]);
    } else {
      this.toastr.info('Zápas se zakládá.', 'Info', {
        progressBar: true,
      });

      this.defaultService.createMatch(id).subscribe(
        (data: any) => {
          this.defaultService.createWatch(id).subscribe(
            (data: any) => {
              this.toastr.success('Zápas byl úspěšně odemčený.', 'Výborně!', {
                progressBar: true,
              });
              this.router.navigate(['/' + route, id]);
            },
            (error) => {
              this.toastr.warning(
                'Během odemykání zápasu došlo k chybě. Zkuste to prosím znovu',
                'Chyba!',
                {
                  progressBar: true,
                }
              );
            }
          );
        },
        (error) => {
          this.toastr.warning(
            'Během zakládání zápasu došlo k chybě. Zkuste to prosím znovu',
            'Chyba!',
            {
              progressBar: true,
            }
          );
        }
      );
    }
  }

  checkOpenedGame2(id: string) {
    let opened = false;
    this.opened_games.forEach((item) => {
      if (item.id == id) {
        opened = true;
      }
    });
    return opened;
  }

  lock(id: number) {
    if (confirm('Přejete ukončit zápas?')) {
      this.defaultService.removeMatch(String(id)).subscribe(
        (data: any) => {
          this.toastr.success('Sběr dat byl ukončen.', 'Výborně!', {
            progressBar: true,
          });
          this.loadSchedule(
            this.selectedDate.toISOString().slice(0, 10).replace('T', ' ')
          );
        },
        (error) => {
          this.toastr.error('Během rušení zápasu došlo k chybě.', 'Chyba!', {
            progressBar: true,
          });
          this.loadSchedule(
            this.selectedDate.toISOString().slice(0, 10).replace('T', ' ')
          );
        }
      );
    }
  }

  removeWatch(id: number) {
    this.defaultService.removeWatch(id).subscribe(
      (data: any) => {
        this.defaultService.getMatches().subscribe(
          (data: any) => {
            this.opened_games = data;
            this.loading = false;

            this.toastr.success('Sběr dat byl ukončen.', 'Výborně!', {
              progressBar: true,
            });
          },
          (error) => {
            this.loading = false;
          }
        );
      },
      (error) => {
        this.defaultService.getMatches().subscribe(
          (data: any) => {
            this.opened_games = data;
            this.loading = false;
          },
          (error) => {
            this.loading = false;
          }
        );
      }
    );
  }
}
