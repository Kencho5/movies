import { Component, Input, signal, HostListener, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-combobox',
  templateUrl: './combobox.component.html',
  standalone: true,
  imports: [FormsModule]
})
export class ComboboxComponent {
  @Input() items: string[] = [];
  
  dropdownOpen = signal(false);
  selectedItems = signal<string[]>([]);
  searchText = signal('');

  constructor(private elementRef: ElementRef) {}

  toggleDropdown() {
    this.dropdownOpen.set(!this.dropdownOpen());
  }

  selectItem(item: string) {
    if (this.selectedItems().includes(item)) {
      this.selectedItems.set(this.selectedItems().filter((i) => i !== item));
    } else {
      this.selectedItems.set([...this.selectedItems(), item]);
    }
  }

  get filteredItems() {
    return this.items.filter((item) =>
      item.toLowerCase().includes(this.searchText().toLowerCase())
    );
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.dropdownOpen.set(false);
    }
  }
}

