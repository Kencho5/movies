import { Component } from "@angular/core";
import { SharedModule } from "@shared/shared.module";
import { TitlebarComponent } from "../titlebar/titlebar.component";
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: "app-layout",
  imports: [SharedModule, TitlebarComponent, FooterComponent],
  templateUrl: "./layout.component.html",
})
export class LayoutComponent {}
