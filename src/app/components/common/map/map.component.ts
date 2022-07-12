import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  @Input() shot_active: string;
  @Input() goal = false;

  active_bl: boolean = false;
  active_br: boolean = false;
  active_ce: boolean = false;
  active_fh: boolean = false;
  active_ur: boolean = false;
  active_ul: boolean = false;

  disable_ce: boolean = false;

  @Output() shotChange_ = new EventEmitter<any>();

  constructor() {}

  ngOnInit(): void {
    this.toggle(this.shot_active);
    console.log('goal map', this.goal);
  }

  toggle(value: string) {
    if (value == 'bl') {
      if (this.active_bl) {
        this.active_ce = false;
        this.active_br = false;
        this.active_bl = false;
        this.active_fh = false;
        this.active_ur = false;
        this.active_ul = false;
      } else {
        this.active_bl = true;
        this.active_br = false;
        this.active_ce = false;
        this.active_fh = false;
        this.active_ur = false;
        this.active_ul = false;
      }
    } else if (value == 'br') {
      if (this.active_br) {
        this.active_ce = false;
        this.active_br = false;
        this.active_bl = false;
        this.active_fh = false;
        this.active_ur = false;
        this.active_ul = false;
      } else {
        this.active_bl = false;
        this.active_br = true;
        this.active_ce = false;
        this.active_fh = false;
        this.active_ur = false;
        this.active_ul = false;
      }
    } else if (value == 'ce') {
      if (this.active_ce) {
        this.active_ce = false;
        this.active_br = false;
        this.active_bl = false;
        this.active_fh = false;
        this.active_ur = false;
        this.active_ul = false;
      } else {
        this.active_bl = false;
        this.active_br = false;
        this.active_ce = true;
        this.active_fh = false;
        this.active_ur = false;
        this.active_ul = false;
      }
    } else if (value == 'fh') {
      if (this.active_fh) {
        this.active_ce = false;
        this.active_br = false;
        this.active_bl = false;
        this.active_fh = false;
        this.active_ur = false;
        this.active_ul = false;
      } else {
        this.active_bl = false;
        this.active_br = false;
        this.active_ce = false;
        this.active_fh = true;
        this.active_ur = false;
        this.active_ul = false;
      }
    } else if (value == 'ur') {
      if (this.active_ur) {
        this.active_ce = false;
        this.active_br = false;
        this.active_bl = false;
        this.active_fh = false;
        this.active_ur = false;
        this.active_ul = false;
      } else {
        this.active_bl = false;
        this.active_br = false;
        this.active_ce = false;
        this.active_fh = false;
        this.active_ur = true;
        this.active_ul = false;
      }
    } else if (value == 'ul') {
      if (this.active_ul) {
        this.active_ce = false;
        this.active_br = false;
        this.active_bl = false;
        this.active_fh = false;
        this.active_ur = false;
        this.active_ul = false;
      } else {
        this.active_bl = false;
        this.active_br = false;
        this.active_ce = false;
        this.active_fh = false;
        this.active_ur = false;
        this.active_ul = true;
      }
    } else if (value == '') {
      if (this.active_ul) {
        this.active_ce = false;
        this.active_br = false;
        this.active_bl = false;
        this.active_fh = false;
        this.active_ur = false;
        this.active_ul = false;
      } else {
        this.active_bl = false;
        this.active_br = false;
        this.active_ce = false;
        this.active_fh = false;
        this.active_ur = false;
        this.active_ul = false;
      }
    }
    this.shotChange();
  }

  disableCeInit() {
    this.disable_ce = false;
  }

  disableCe() {
    this.disable_ce = true;
    this.active_ce = false;
  }

  getActive() {
    let value = '';
    if (this.active_ce) {
      value = 'ce';
    } else if (this.active_br) {
      value = 'br';
    } else if (this.active_bl) {
      value = 'bl';
    } else if (this.active_fh) {
      value = 'fh';
    } else if (this.active_ur) {
      value = 'ur';
    } else if (this.active_ul) {
      value = 'ul';
    }
    return value;
  }

  shotChange() {
    this.shotChange_.emit(this.getActive());
  }
}
