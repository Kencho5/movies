import {
  Component,
  ElementRef,
  OnInit,
  signal,
  ViewChild,
} from "@angular/core";
import { SharedModule } from "@shared/shared.module";

interface Day {
  key: string;
  dateNumber: string;
  month: string;
  weekDay: string;
}

@Component({
  selector: "app-days-selector",
  imports: [SharedModule],
  templateUrl: "./days-selector.component.html",
})
export class DaysSelectorComponent implements OnInit {
  @ViewChild("scrollContainer") scrollContainer!: ElementRef;

  buttonMinWidth = 120;
  days: Day[] = [];
  activeDay = signal<Day | null>(null);

  private readonly DAYS_TO_DISPLAY = 30;
  private readonly SCROLL_ITEMS = 3;

  ngOnInit(): void {
    this.days = this.generateDaysArray();
  }

  scroll(dir: "left" | "right"): void {
    this.scrollContainer.nativeElement.scrollBy({
      left:
        (dir == "left" ? -this.buttonMinWidth : this.buttonMinWidth) *
        this.SCROLL_ITEMS,
      behavior: "smooth",
    });
  }

  selectDay(day: Day): void {
    this.activeDay.set(day);
  }

  private generateDaysArray(): Day[] {
    const days: Day[] = [];
    const today = new Date();

    for (let i = this.DAYS_TO_DISPLAY - 1; i >= 0; i--) {
      const date = this.getDateWithOffset(today, -i);
      const dayObject = this.createDayObject(date);

      days.push(dayObject);
      if (date.toUTCString() == today.toUTCString())
        this.activeDay.set(dayObject);
    }

    return days.reverse();
  }

  private getDateWithOffset(referenceDate: Date, offsetDays: number): Date {
    const date = new Date(referenceDate);
    date.setDate(referenceDate.getDate() + offsetDays);
    return date;
  }

  private createDayObject(date: Date): Day {
    return {
      key: this.formatDateToISOString(date),
      dateNumber: this.formatDayOfMonth(date),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      weekDay: date.toLocaleDateString("en-US", { weekday: "short" }),
    };
  }

  private formatDateToISOString(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  private formatDayOfMonth(date: Date): string {
    return date.getDate().toString().padStart(2, "0");
  }
}
