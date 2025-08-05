import {
  Component,
  input,
  signal,
  ElementRef,
  computed,
  output,
  effect,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TranslocoModule } from "@jsverse/transloco";

interface ComboboxItem {
  name: string;
  value: any;
}

@Component({
  selector: "app-combobox",
  templateUrl: "./combobox.component.html",
  imports: [FormsModule, TranslocoModule],
  host: {
    "(document:click)": "onDocumentClick($event)",
    "(mousedown)": "onMouseDown($event)",
  },
})
export class ComboboxComponent {
  items = input<ComboboxItem[]>([]);
  selectedItemsInput = input<any[]>([]);
  selectedItemsChange = output<any[]>();

  dropdownOpen = signal(false);
  selectedItems = signal<any[]>([]);
  searchText = signal("");

  displayValue = computed(() => {
    if (this.selectedItems().length === 0) {
      return "";
    }
    const firstItem = this.items().find(
      (item) => item.value === this.selectedItems()[0]
    );
    if (!firstItem) return "";

    if (this.selectedItems().length === 1) {
      return firstItem.name;
    } else {
      return `${firstItem.name} (+${this.selectedItems().length - 1})`;
    }
  });

  constructor(private elementRef: ElementRef) {
    effect(
      () => {
        this.selectedItems.set(this.selectedItemsInput());
      },
      { allowSignalWrites: true }
    );

    effect(() => {
      if (!this.dropdownOpen()) {
        this.searchText.set("");
      }
    });
  }

  toggleDropdown() {
    this.dropdownOpen.set(!this.dropdownOpen());
  }

  onMouseDown(event: MouseEvent) {
    event.stopPropagation();
  }

  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.dropdownOpen.set(false);
      this.searchText.set("");
    }
  }

  selectItem(item: ComboboxItem) {
    if (this.selectedItems().includes(item.value)) {
      this.selectedItems.set(
        this.selectedItems().filter((i) => i !== item.value)
      );
    } else {
      this.selectedItems.set([...this.selectedItems(), item.value]);
    }
    this.searchText.set("");
    this.selectedItemsChange.emit(this.selectedItems());
  }

  clear() {
    this.selectedItems.set([]);
    this.searchText.set("");
    this.selectedItemsChange.emit(this.selectedItems());
  }

  get filteredItems(): ComboboxItem[] {
    if (!this.items()) return [];
    return this.items().filter((item) =>
      item.name.toLowerCase().includes(this.searchText().toLowerCase())
    );
  }

  isSelected(item: ComboboxItem): boolean {
    return this.selectedItems().includes(item.value);
  }
}
