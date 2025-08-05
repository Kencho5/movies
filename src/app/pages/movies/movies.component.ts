import { LoadingDotsComponent } from "@shared/components/ui/loading-dots/loading-dots.component";
import { ImageComponent } from "@shared/components/ui/image/image.component";
import { FilterButtonComponent } from "@shared/components/ui/filter-button/filter-button.component";
import { Component, signal } from "@angular/core";
import { MovieService } from "@core/services/movie.service";
import { SharedModule } from "@shared/shared.module";
import { InfiniteScrollDirective } from "ngx-infinite-scroll";
import { finalize } from "rxjs/operators";
import { TranslocoModule } from "@jsverse/transloco";

interface Filter {
  key: string;
  value: any;
  operator: string;
  valueKey?: string;
}

@Component({
  selector: "app-movies",
  imports: [
    SharedModule,
    InfiniteScrollDirective,
    FilterButtonComponent,
    ImageComponent,
    LoadingDotsComponent,
    TranslocoModule,
  ],
  templateUrl: "./movies.component.html",
})
export class MoviesComponent {
  movies = signal<any>(null);
  loading = signal<boolean>(true);
  loadingMore = signal<boolean>(false);
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
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((res) => {
        this.movies.set(res.channel.content);
      });
  }

  loadMore(): void {
    if (this.loadingMore() || this.loading()) return;
    this.loadingMore.set(true);

    this.page++;
    const filters =
      this.currentFilters.length > 0
        ? btoa(JSON.stringify(this.currentFilters))
        : undefined;

    this.movieService
      .getMovies(this.page, filters)
      .pipe(finalize(() => this.loadingMore.set(false)))
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