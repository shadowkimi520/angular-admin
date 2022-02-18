import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'page-basic-tables',
  encapsulation: ViewEncapsulation.None,
  styles: [require('./basicTables.scss')],
  template: require('./basicTables.html')
})
export class BasicTablesComponent {

  constructor() {}
}
