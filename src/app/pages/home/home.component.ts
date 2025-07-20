import { Component, OnInit, signal } from "@angular/core";
import { HomeService } from "@core/services/home.service";
import { SharedModule } from "@shared/shared.module";
import { Movie } from "@core/interfaces/movies";
import { LoadingDotsComponent } from "@shared/components/ui/loading-dots/loading-dots.component";
import { catchError, finalize } from "rxjs/operators";
import { of } from "rxjs";

@Component({
  selector: "app-home",
  imports: [SharedModule, LoadingDotsComponent],
  templateUrl: "./home.component.html",
})
export class HomeComponent implements OnInit {
  movies = signal<Movie[]>([]);
  loading = signal<boolean>(true);

  constructor(private homeService: HomeService) {}

  ngOnInit(): void {
    this.homeService
      .getMovies()
      .pipe(
        catchError((error) => {
          console.error("Error fetching movies:", error);
          return of({ pagination: { data: [] } });
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((res) => {
        this.movies.set(
          res.pagination.data.map((movie) => ({
            ...movie,
            rating: this.randomRating,
            year: this.randomYear,
          })),
        );
      });
  }

  get randomRating(): string {
    const random1 = Math.floor(Math.random() * 10);
    const random2 = Math.floor(Math.random() * 10);
    return `${random1}.${random2}`;
  }

  get randomYear(): string {
    return (Math.floor(Math.random() * (2024 - 2000 + 1)) + 2000).toString();
  }

  scrollCarousel(carouselId: string, direction: "left" | "right"): void {
    const carousel = document.getElementById(carouselId);
    if (carousel) {
      const scrollAmount = 500;
      const currentScroll = carousel.scrollLeft;
      const targetScroll =
        direction === "left"
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount;

      carousel.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
    }
  }
}
