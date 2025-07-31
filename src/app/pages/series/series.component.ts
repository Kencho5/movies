import { Component, signal } from "@angular/core";
import { MovieService } from "@core/services/movie.service";
import { SharedModule } from "@shared/shared.module";
import { InfiniteScrollDirective } from "ngx-infinite-scroll";
import { FilterButtonComponent } from "@shared/components/ui/filter-button/filter-button.component";
import { ImageComponent } from "@shared/components/ui/image/image.component";

@Component({
  selector: "app-series",
  imports: [
    SharedModule,
    InfiniteScrollDirective,
    FilterButtonComponent,
    ImageComponent,
  ],
  templateUrl: "./series.component.html",
})
export class SeriesComponent {
  series = signal<any>(null);
  loading = signal<boolean>(true);
  page = 1;

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.loadSeries();
  }

  loadSeries(): void {
    this.movieService.getSeries(this.page).subscribe((res) => {
      this.series.set(res.channel.content);
      this.loading.set(false);
    });
  }

  loadMore(): void {
    this.page++;
    this.movieService.getSeries(this.page).subscribe((res) => {
      this.series.update((prev) => {
        return {
          ...prev,
          data: [...prev.data, ...res.channel.content.data],
        };
      });
    });
  }
}