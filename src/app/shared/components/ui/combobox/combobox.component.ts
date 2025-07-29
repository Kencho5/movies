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

@Component({
  selector: "app-combobox",
  templateUrl: "./combobox.component.html",
  imports: [FormsModule],
  host: {
    "(document:click)": "onDocumentClick($event)",
    "(mousedown)": "onMouseDown($event)",
  },
})
export class ComboboxComponent {
  items = input<string[]>([]);
  selectedItemsInput = input<string[]>([]);
  selectedItemsChange = output<string[]>();

  dropdownOpen = signal(false);
  selectedItems = signal<string[]>([]);
  searchText = signal("");

  displayValue = computed(() => {
    if (this.selectedItems().length === 0) {
      return "";
    } else if (this.selectedItems().length === 1) {
      return this.selectedItems()[0];
    } else {
      return `${this.selectedItems()[0]} (+${this.selectedItems().length - 1})`;
    }
  });

  constructor(private elementRef: ElementRef) {
    effect(
      () => {
        this.selectedItems.set(this.selectedItemsInput());
      },
      { allowSignalWrites: true },
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

  selectItem(item: string) {
    if (this.selectedItems().includes(item)) {
      this.selectedItems.set(this.selectedItems().filter((i) => i !== item));
    } else {
      this.selectedItems.set([...this.selectedItems(), item]);
    }
    this.searchText.set("");
    this.selectedItemsChange.emit(this.selectedItems());
  }

  clear() {
    this.selectedItems.set([]);
    this.searchText.set("");
    this.selectedItemsChange.emit(this.selectedItems());
  }

  get filteredItems() {
    return this.items().filter((item) =>
      item.toLowerCase().includes(this.searchText().toLowerCase()),
    );
  }
}
