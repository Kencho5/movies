import { NgModule } from "@angular/core";
import { RouterLink, RouterOutlet } from "@angular/router";
import { CommonModule } from "@angular/common";

@NgModule({
  imports: [RouterOutlet, RouterLink, CommonModule],
  exports: [RouterOutlet, RouterLink, CommonModule],
})
export class SharedModule {}
