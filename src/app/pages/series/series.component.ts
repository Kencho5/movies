import { Component, signal } from "@angular/core";
import { MovieService } from "@core/services/movie.service";
import { SharedModule } from "@shared/shared.module";
import { InfiniteScrollDirective } from "ngx-infinite-scroll";
import { FilterButtonComponent } from "@shared/components/ui/filter-button/filter-button.component";
import { ImageComponent } from "@shared/components/ui/image/image.component";
import { LoadingDotsComponent } from "@shared/components/ui/loading-dots/loading-dots.component";
import { finalize } from "rxjs";
import { TranslocoModule } from "@jsverse/transloco";
import { ImageSizePipe } from "@core/pipes/image-size.pipe";
import { ActivatedRoute, Router } from "@angular/router";

interface Filter {
  key: string;
  value: any;
  operator: string;
  valueKey?: string;
}

@Component({
  selector: "app-series",
  imports: [
    SharedModule,
    InfiniteScrollDirective,
    FilterButtonComponent,
    ImageComponent,
    LoadingDotsComponent,
    TranslocoModule,
    ImageSizePipe,
  ],
  templateUrl: "./series.component.html",
})
export class SeriesComponent {
  series = signal<any>(null);
  loading = signal<boolean>(true);
  loadingMore = signal<boolean>(false);
  page = 1;
  currentFilters: Filter[] = [];

  constructor(
    private movieService: MovieService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFiltersFromUrl();
    this.loadSeries();
  }

  private loadFiltersFromUrl(): void {
    const filtersParam = this.route.snapshot.queryParams['filters'];
    if (filtersParam) {
      try {
        this.currentFilters = JSON.parse(atob(filtersParam));
      } catch (e) {
        console.error('Invalid filters parameter in URL');
        this.currentFilters = [];
      }
    }
  }

  private updateUrlParams(): void {
    const queryParams = this.currentFilters.length > 0
      ? { filters: btoa(JSON.stringify(this.currentFilters)) }
      : {};
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'replace'
    });
  }

  loadSeries(): void {
    this.loading.set(true);
    const filters =
      this.currentFilters.length > 0
        ? btoa(JSON.stringify(this.currentFilters))
        : undefined;

    this.movieService
      .getSeries(this.page, filters)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((res) => {
        this.series.set(res.channel.content);
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
      .getSeries(this.page, filters)
      .pipe(finalize(() => this.loadingMore.set(false)))
      .subscribe((res) => {
        this.series.update((prev) => {
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
    this.series.set(null);
    this.updateUrlParams();
    this.loadSeries();
  }
}
