import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
} from "@angular/core";

@Component({
  selector: "app-days-selector",
  imports: [],
  templateUrl: "./days-selector.component.html",
})
export class DaysSelectorComponent implements AfterViewInit {
  @ViewChild("container", { static: true }) containerRef!: ElementRef;
  days: { dateNumber: string; month: string; weekDay: string }[] = [];
  buttonMinWidth = 120; // px, must match min-width in template

  ngAfterViewInit(): void {
    this.calculateDays();
  }

  @HostListener("window:resize")
  onResize() {
    this.calculateDays();
  }

  calculateDays() {
    // Get container width
    const containerWidth =
      this.containerRef.nativeElement.offsetWidth || window.innerWidth; // fallback

    // Calculate how many buttons fit
    const count = Math.floor(containerWidth / this.buttonMinWidth);

    // Generate days
    this.days = [];
    const today = new Date();
    for (let i = 0; i < count; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateNumber = date.getDate().toString().padStart(2, "0");
      const month = date.toLocaleDateString("en-US", { month: "short" });
      const weekDay = date.toLocaleDateString("en-US", { weekday: "short" });
      this.days.push({ dateNumber, month, weekDay });
    }
    this.days.reverse();
  }
}
