import {
  Component,
  signal,
  inject,
  ElementRef,
  ViewChildren,
  QueryList,
  output,
} from "@angular/core";
import { ComboboxComponent } from "../combobox/combobox.component";
import { genres } from "app/utils/genres";
import { countries } from "app/utils/countries";
import { languages } from "app/utils/languages";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-filter-button",
  templateUrl: "./filter-button.component.html",
  imports: [ComboboxComponent, FormsModule],
  host: {
    "(document:click)": "onDocumentClick($event)",
  },
})
export class FilterButtonComponent {
  @ViewChildren(ComboboxComponent) comboboxes!: QueryList<ComboboxComponent>;
  applyFilters = output<any>();

  dropdownOpen = signal(false);
  genres = genres;
  countries = countries;
  languages = languages;
  fromYear = signal<number | null>(null);
  toYear = signal<number | null>(null);

  selectedGenres = signal<string[]>([]);
  selectedCountries = signal<string[]>([]);
  selectedLanguages = signal<string[]>([]);

  private elementRef = inject(ElementRef);

  toggleDropdown() {
    this.dropdownOpen.set(!this.dropdownOpen());
  }

  clearFilters() {
    this.fromYear.set(null);
    this.toYear.set(null);
    this.selectedGenres.set([]);
    this.selectedCountries.set([]);
    this.selectedLanguages.set([]);
    this.comboboxes.forEach((combobox) => combobox.clear());
  }

  onGenreChange(selected: string[]) {
    this.selectedGenres.set(selected);
  }

  onCountryChange(selected: string[]) {
    this.selectedCountries.set(selected);
  }

  onLanguageChange(selected: string[]) {
    this.selectedLanguages.set(selected);
  }

  onSubmit() {
    const filters = {
      genres: this.selectedGenres(),
      countries: this.selectedCountries(),
      languages: this.selectedLanguages(),
      fromYear: this.fromYear(),
      toYear: this.toYear(),
    };
    this.applyFilters.emit(filters);
    this.dropdownOpen.set(false);
  }

  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.dropdownOpen.set(false);
    }
  }
}
