import {
  Component,
  signal,
  HostListener,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { RouterModule } from "@angular/router";
import { SharedModule } from "@shared/shared.module";
import { SearchService } from "@core/services/search.service";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";
import { FormsModule } from "@angular/forms";
import { LanguageSelectorComponent } from "../ui/language-selector/language-selector.component";

@Component({
  selector: "app-titlebar",
  imports: [SharedModule, RouterModule, FormsModule, LanguageSelectorComponent],
  templateUrl: "./titlebar.component.html",
})
export class TitlebarComponent {
  @ViewChild("searchInput") searchInput!: ElementRef<HTMLInputElement>;

  menuOpen = signal(false);
  searchOpen = signal(false);
  searchQuery = "";
  searchResults = signal<any[] | null>(null);
  loading = signal(false);
  private searchTerms = new Subject<string>();

  constructor(
    private searchService: SearchService,
    private elementRef: ElementRef,
  ) {
    this.searchTerms
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((term: string) => {
          if (term.trim()) {
            this.loading.set(true);
            this.searchResults.set(null);
            return this.searchService.searchAutocomplete(term);
          } else {
            this.loading.set(false);
            this.searchResults.set(null);
            return [];
          }
        }),
      )
      .subscribe((response) => {
        this.loading.set(false);
        this.searchResults.set(response.results || []);
      });
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: MouseEvent): void {
    if (
      this.searchOpen() &&
      !this.elementRef.nativeElement.contains(event.target)
    ) {
      this.closeSearch();
    }
  }

  toggleMenu(): void {
    this.menuOpen.update((current) => !current);
  }

  openSearch(event: MouseEvent): void {
    event.stopPropagation();
    this.searchOpen.set(true);
    setTimeout(() => this.searchInput.nativeElement.focus(), 0);
  }

  closeSearch(): void {
    this.searchOpen.set(false);
    this.searchQuery = "";
    this.searchResults.set(null);
  }

  onSearchTermChange(term: string): void {
    this.searchTerms.next(term);
  }
}
