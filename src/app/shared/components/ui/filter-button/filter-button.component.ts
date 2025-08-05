import {
  Component,
  signal,
  inject,
  ElementRef,
  ViewChildren,
  QueryList,
  output,
  OnInit,
} from "@angular/core";
import { ComboboxComponent } from "../combobox/combobox.component";
import { FormsModule } from "@angular/forms";
import { MovieService } from "@core/services/movie.service";
import { TranslocoModule } from "@jsverse/transloco";

interface Filter {
  key: string;
  value: any;
  operator: string;
  valueKey?: string;
}

@Component({
  selector: "app-filter-button",
  templateUrl: "./filter-button.component.html",
  imports: [ComboboxComponent, FormsModule, TranslocoModule],
  host: {
    "(document:click)": "onDocumentClick($event)",
  },
})
export class FilterButtonComponent implements OnInit {
  @ViewChildren(ComboboxComponent) comboboxes!: QueryList<ComboboxComponent>;
  applyFilters = output<Filter[]>();

  dropdownOpen = signal(false);
  genres = signal<any[]>([]);
  countries = signal<any[]>([]);
  languages = signal<any[]>([]);
  fromYear = signal<number | null>(null);
  toYear = signal<number | null>(null);

  selectedGenres = signal<any[]>([]);
  selectedCountries = signal<any[]>([]);
  selectedLanguages = signal<any[]>([]);

  private elementRef = inject(ElementRef);
  private movieService = inject(MovieService);

  ngOnInit(): void {
    this.movieService.getFilters().subscribe((filters) => {
      this.genres.set(filters.genres);
      this.countries.set(filters.productionCountries);
      this.languages.set(filters.titleFilterLanguages);
    });
  }

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

  onGenreChange(selected: any[]) {
    this.selectedGenres.set(selected);
  }

  onCountryChange(selected: any[]) {
    this.selectedCountries.set(selected);
  }

  onLanguageChange(selected: any[]) {
    this.selectedLanguages.set(selected);
  }

  onSubmit() {
    const filters: Filter[] = [];

    if (this.selectedGenres().length > 0) {
      filters.push({
        key: "genres",
        value: this.selectedGenres(),
        operator: "hasAll",
      });
    }

    if (this.selectedCountries().length > 0) {
      filters.push({
        key: "countries",
        value: this.selectedCountries(),
        operator: "hasAll",
      });
    }

    if (this.selectedLanguages().length > 0) {
      this.selectedLanguages().forEach((lang) => {
        filters.push({
          key: "language",
          value: lang,
          operator: "=",
          valueKey: lang,
        });
      });
    }

    const from = this.fromYear();
    const to = this.toYear();

    if (from && to) {
      filters.push({
        key: "release_date",
        value: {
          start: new Date(from, 0, 1).toISOString(),
          end: new Date(to, 11, 31, 23, 59, 59, 999).toISOString(),
        },
        operator: "between",
      });
    }

    this.applyFilters.emit(filters);
    this.dropdownOpen.set(false);
  }

  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.dropdownOpen.set(false);
    }
  }
}