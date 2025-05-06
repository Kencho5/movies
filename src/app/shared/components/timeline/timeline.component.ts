import { Component, Input, signal, OnInit } from "@angular/core";
import { Program } from "@core/interfaces/tv";
import { SharedModule } from "@shared/shared.module";

@Component({
  selector: "app-timeline",
  imports: [SharedModule],
  templateUrl: "./timeline.component.html",
})
export class TimelineComponent implements OnInit {
  @Input() programs!: Program[];

  tooltipX: number = 0;
  tooltipText: string = "";
  tooltipShown = signal<boolean>(false);
  progress: number = 0;
  currentTimeText: string = "00:00";
  hoveredProgram = signal<Program | null>(null);

  private readonly TOTAL_MINUTES_IN_TIMELINE = 24 * 60;
  private readonly HOURS_IN_TIMELINE = 24;

  ngOnInit(): void {
    this.updateCurrentTimeText();
  }

  hover(event: MouseEvent): void {
    if (this.hoveredProgram()) return;

    const { relativeX, percent } = this.calculatePositionFromEvent(event);
    const minutes = Math.floor(percent * this.TOTAL_MINUTES_IN_TIMELINE);
    const formattedTime = this.formatMinutesToTime(minutes);

    this.tooltipX = relativeX;
    this.tooltipText = formattedTime;
    this.tooltipShown.set(true);
  }

  setTime(event: MouseEvent): void {
    const { percent } = this.calculatePositionFromEvent(event);
    this.progress = percent * 100;
    this.updateCurrentTimeText();
  }

  getTimePosition(hourFraction: number): string {
    return `${(hourFraction / this.HOURS_IN_TIMELINE) * 100}%`;
  }

  getHourLabelStyle(hour: number): object {
    if (hour === 0) {
      return { left: "0%", transform: "none" };
    } else if (hour === this.HOURS_IN_TIMELINE) {
      return { left: "100%", transform: "translateX(-100%)" };
    } else {
      return {
        left: `${(hour / this.HOURS_IN_TIMELINE) * 100}%`,
        transform: "translateX(-50%)",
      };
    }
  }

  getProgramPosition(program: Program): string {
    const date = new Date(program.start * 1000);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    return `${(totalMinutes / this.TOTAL_MINUTES_IN_TIMELINE) * 100}%`;
  }

  onProgramHover(event: MouseEvent, program: Program): void {
    event.stopPropagation();

    const target = event.currentTarget as HTMLElement;
    const parentElement = target.parentElement as HTMLElement;
    const rect = target.getBoundingClientRect();

    this.tooltipX =
      rect.left +
      rect.width / 2 -
      (parentElement as HTMLElement).getBoundingClientRect().left;

    const startDate = new Date(program.start * 1000);
    const hours = startDate.getHours().toString().padStart(2, "0");
    const minutes = startDate.getMinutes().toString().padStart(2, "0");

    this.tooltipText = `${hours}:${minutes} - ${program.title.text}`;
    this.tooltipShown.set(true);
    this.hoveredProgram.set(program);
  }

  onProgramLeave(): void {
    this.hoveredProgram.set(null);
    this.tooltipShown.set(false);
  }

  private updateCurrentTimeText(): void {
    const minutes = Math.floor(
      (this.progress / 100) * this.TOTAL_MINUTES_IN_TIMELINE,
    );
    this.currentTimeText = this.formatMinutesToTime(minutes);
  }

  private calculatePositionFromEvent(event: MouseEvent): {
    relativeX: number;
    percent: number;
  } {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const relativeX = event.clientX - rect.left;
    const percent = relativeX / rect.width;

    return { relativeX, percent };
  }

  private formatMinutesToTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60)
      .toString()
      .padStart(2, "0");
    const minutes = (totalMinutes % 60).toString().padStart(2, "0");

    return `${hours}:${minutes}`;
  }
}
