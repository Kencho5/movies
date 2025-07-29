import { FilterButtonComponent } from "@shared/components/ui/filter-button/filter-button.component";
import { Component, signal } from "@angular/core";
import { MovieService } from "@core/services/movie.service";
import { SharedModule } from "@shared/shared.module";
import { InfiniteScrollDirective } from "ngx-infinite-scroll";

@Component({
  selector: "app-movies",
  imports: [SharedModule, InfiniteScrollDirective, FilterButtonComponent],
  templateUrl: "./movies.component.html",
})
export class MoviesComponent {
  movies = signal<any>(null);
  loading = signal<boolean>(true);
  page = 1;
  currentFilters: any = {};

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    this.loading.set(true);
    this.movieService
      .getMovies(
        this.page,
        this.currentFilters.genres,
        this.currentFilters.fromYear,
        this.currentFilters.toYear,
        this.currentFilters.countries,
        this.currentFilters.languages,
      )
      .subscribe((res) => {
        console.log("API Response:", res);
        this.movies.set(res.channel.content);
        this.loading.set(false);
      });
  }

  loadMore(): void {
    this.page++;
    this.movieService
      .getMovies(
        this.page,
        this.currentFilters.genres,
        this.currentFilters.fromYear,
        this.currentFilters.toYear,
        this.currentFilters.countries,
        this.currentFilters.languages,
      )
      .subscribe((res) => {
        this.movies.update((prev) => {
          return {
            ...prev,
            data: [...prev.data, ...res.channel.content.data],
          };
        });
      });
  }

  onApplyFilters(filters: any) {
    this.currentFilters = {
      genres: filters.genres
        ? filters.genres.map((g: string) => g.toLowerCase())
        : [],
      countries: filters.countries
        ? filters.countries.map((c: string) => c.toLowerCase())
        : [],
      languages: filters.languages
        ? filters.languages.map((l: string) => l.toLowerCase())
        : [],
      fromYear: filters.fromYear,
      toYear: filters.toYear,
    };
    this.page = 1;
    this.movies.set([]);
    this.loadMovies();
  }
}
