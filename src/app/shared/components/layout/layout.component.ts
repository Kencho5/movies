import { Component } from "@angular/core";
import { SharedModule } from "@shared/shared.module";
import { TitlebarComponent } from "../titlebar/titlebar.component";

@Component({
  selector: "app-layout",
  imports: [SharedModule, TitlebarComponent],
  templateUrl: "./layout.component.html",
})
export class LayoutComponent {}
