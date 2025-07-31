import { FilterButtonComponent } from "@shared/components/ui/filter-button/filter-button.component";
import { Component, signal } from "@angular/core";
import { MovieService } from "@core/services/movie.service";
import { SharedModule } from "@shared/shared.module";
import { InfiniteScrollDirective } from "ngx-infinite-scroll";

interface Filter {
  key: string;
  value: any;
  operator: string;
  valueKey?: string;
}

@Component({
  selector: "app-movies",
  imports: [SharedModule, InfiniteScrollDirective, FilterButtonComponent],
  templateUrl: "./movies.component.html",
})
export class MoviesComponent {
  movies = signal<any>(null);
  loading = signal<boolean>(true);
  page = 1;
  currentFilters: Filter[] = [];

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    this.loading.set(true);
    const filters =
      this.currentFilters.length > 0
        ? btoa(JSON.stringify(this.currentFilters))
        : undefined;

    this.movieService
      .getMovies(this.page, filters)
      .subscribe((res) => {
        console.log("API Response:", res);
        this.movies.set(res.channel.content);
        this.loading.set(false);
      });
  }

  loadMore(): void {
    this.page++;
    const filters =
      this.currentFilters.length > 0
        ? btoa(JSON.stringify(this.currentFilters))
        : undefined;

    this.movieService
      .getMovies(this.page, filters)
      .subscribe((res) => {
        this.movies.update((prev) => {
          if (!prev || !prev.data) {
            return res.channel.content;
          }
          return {
            ...prev,
            data: [...prev.data, ...res.channel.content.data],
          };
        });
      });
  }

  onApplyFilters(filters: Filter[]) {
    this.currentFilters = filters;
    this.page = 1;
    this.movies.set(null);
    this.loadMovies();
  }
}