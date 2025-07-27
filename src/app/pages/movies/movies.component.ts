import { Component, signal } from "@angular/core";
import { MovieService } from "@core/services/movie.service";
import { SharedModule } from "@shared/shared.module";
import { InfiniteScrollDirective } from "ngx-infinite-scroll";

@Component({
  selector: "app-movies",
  imports: [SharedModule, InfiniteScrollDirective],
  templateUrl: "./movies.component.html",
  standalone: true,
})
export class MoviesComponent {
  movies = signal<any>(null);
  loading = signal<boolean>(true);
  page = 1;

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    this.movieService.getMovies(this.page).subscribe((res) => {
      this.movies.set(res.channel.content);
      this.loading.set(false);
    });
  }

  loadMore(): void {
    this.page++;
    this.movieService.getMovies(this.page).subscribe((res) => {
      this.movies.update((prev) => {
        return {
          ...prev,
          data: [...prev.data, ...res.channel.content.data],
        };
      });
    });
  }
}