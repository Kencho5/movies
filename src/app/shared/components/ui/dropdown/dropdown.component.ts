import { Component } from "@angular/core";
import { OutsideClickDirective } from "@core/directives/outside-click.directive";

@Component({
  selector: "app-dropdown",
  imports: [OutsideClickDirective],
  templateUrl: "./dropdown.component.html",
})
export class DropdownComponent {
  opened = false;

  toggle() {
    this.opened = !this.opened;
  }

  close() {
    this.opened = false;
  }
}
