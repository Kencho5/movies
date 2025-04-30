import { Component, Input, signal } from "@angular/core";
import { Program } from "@core/interfaces/tv";
import { SharedModule } from "@shared/shared.module";

@Component({
  selector: "app-timeline",
  imports: [SharedModule],
  templateUrl: "./timeline.component.html",
})
export class TimelineComponent {
  @Input() programs!: Program[];

  tooltipX = 0;
  tooltipText = "";
  tooltipShown = signal(false);

  hover(event: MouseEvent) {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const relativeX = event.clientX - rect.left;
    const percent = relativeX / rect.width;

    const totalMinutes = 23 * 60;
    const minutes = Math.floor(percent * totalMinutes);
    const hours = Math.floor(minutes / 60)
      .toString()
      .padStart(2, "0");

    const mins = (minutes % 60).toString().padStart(2, "0");

    this.tooltipX = relativeX;
    this.tooltipText = `${hours}:${mins}`;
    this.tooltipShown.set(true);
  }
}
