import { Component, signal, HostListener, ElementRef } from '@angular/core';
import { ComboboxComponent } from '../combobox/combobox.component';
import { genres } from 'app/utils/genres';

@Component({
  selector: 'app-filter-button',
  templateUrl: './filter-button.component.html',
  standalone: true,
  imports: [ComboboxComponent]
})
export class FilterButtonComponent {
  dropdownOpen = signal(false);
  genres = genres;

  constructor(private elementRef: ElementRef) {}

  toggleDropdown() {
    this.dropdownOpen.set(!this.dropdownOpen());
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.dropdownOpen.set(false);
    }
  }
}
