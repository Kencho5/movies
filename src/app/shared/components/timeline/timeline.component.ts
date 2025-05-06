import { Component, Input } from "@angular/core";
import { Program } from "@core/interfaces/tv";
import { SharedModule } from "@shared/shared.module";

@Component({
  selector: "app-timeline",
  imports: [SharedModule],
  templateUrl: "./timeline.component.html",
})
export class TimelineComponent {
  @Input() programs!: Program[];

  // Constants
  private readonly DAY_MINUTES = 1440;
  private readonly TOTAL_HOURS = 24;

  // UI state
  tooltipX = 0;
  tooltipText = "";
  tooltipShown: boolean = false;
  progress = 0;
  currentTimeText = "";
  activeProgram: Program | null = null;
  hoveredProgram: Program | null = null;

  hover(event: MouseEvent): void {
    if (this.hoveredProgram) return;

    const { relativeX, percent } = this.getPositionData(event);
    const minutes = Math.floor(percent * this.DAY_MINUTES);

    this.tooltipX = relativeX;
    this.tooltipText = this.formatTooltipTime(minutes);
    this.tooltipShown = true;
  }

  setTime(event: MouseEvent): void {
    if (this.hoveredProgram) {
      this.setTimeToProgram();
      return;
    }

    const { percent } = this.getPositionData(event);
    this.progress = percent * 100;
    this.updateCurrentTimeText();
  }

  setTimeToProgram(): void {
    this.activeProgram = this.hoveredProgram;
    const totalMinutes = this.getProgramTotalMinutes(this.hoveredProgram!);

    this.progress = (totalMinutes / this.DAY_MINUTES) * 100;
    this.currentTimeText = this.formatTooltipTime(totalMinutes);
  }

  getTimePosition(hourFraction: number): string {
    return `${(hourFraction / this.TOTAL_HOURS) * 100}%`;
  }

  getHourLabelStyle(hour: number): object {
    switch (hour) {
      case 0:
        return { left: "0%", transform: "none" };
      case this.TOTAL_HOURS:
        return { left: "100%", transform: "translateX(-100%)" };
      default:
        return {
          left: `${(hour / this.TOTAL_HOURS) * 100}%`,
          transform: "translateX(-50%)",
        };
    }
  }

  getProgramPosition(program: Program): string {
    const totalMinutes = this.getProgramTotalMinutes(program);
    return `${(totalMinutes / this.DAY_MINUTES) * 100}%`;
  }

  onProgramHover(event: MouseEvent, program: Program): void {
    event.stopPropagation();

    const target = event.currentTarget as HTMLElement;
    const parentElement = target.parentElement as HTMLElement;
    const rect = target.getBoundingClientRect();
    const parentRect = parentElement.getBoundingClientRect();

    this.tooltipX = rect.left + rect.width / 2 - parentRect.left;

    const startDate = new Date(program.start * 1000);
    const timeString = this.formatTimeFromDate(startDate);
    this.tooltipText = `${timeString} - ${program.title.text}`;

    this.tooltipShown = true;
    this.hoveredProgram = program;
  }

  onProgramLeave(): void {
    this.hoveredProgram = null;
    this.tooltipShown = false;
  }

  private updateCurrentTimeText(): void {
    const minutes = Math.floor((this.progress / 100) * this.DAY_MINUTES);
    this.currentTimeText = this.formatTooltipTime(minutes);
  }

  private getPositionData(event: MouseEvent): {
    relativeX: number;
    percent: number;
  } {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const relativeX = event.clientX - rect.left;
    const percent = relativeX / rect.width;

    return { relativeX, percent };
  }

  private formatTooltipTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60)
      .toString()
      .padStart(2, "0");
    const minutes = (totalMinutes % 60).toString().padStart(2, "0");

    return `${hours}:${minutes}`;
  }

  private formatTimeFromDate(date: Date): string {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  private getProgramTotalMinutes(program: Program): number {
    const date = new Date(program.start * 1000);
    return date.getHours() * 60 + date.getMinutes();
  }
}
