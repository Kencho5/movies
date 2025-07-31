import { Component, computed, inject, signal, effect } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { MovieService } from "@core/services/movie.service";
import { PlayerData } from "@core/interfaces/player";
import { PlayerComponent } from "@shared/components/player/player.component";
import { SharedModule } from "@shared/shared.module";
import { ImageComponent } from "@shared/components/ui/image/image.component";

@Component({
  selector: "app-movie",
  imports: [SharedModule, PlayerComponent, ImageComponent],
  templateUrl: "./movie.component.html",
})
export class MovieComponent {
  private readonly movieService = inject(MovieService);
  private readonly route = inject(ActivatedRoute);

  readonly movie = signal<any>(null);

  constructor() {
    effect(() => {
      const movieId = this.route.snapshot.paramMap.get("id");
      if (movieId) {
        this.movieService.getMovie(movieId).subscribe((movie) => {
          this.movie.set(movie);
        });
      }
    });
  }

  readonly playerData = computed<PlayerData>(() => {
    const movie = this.movie();
    if (!movie?.title) {
      return {
        file: "",
        poster: "",
        autoplay: 0,
      };
    }

    return {
      file: movie.title.videos?.[0]?.src ?? "",
      poster: movie.title.backdrop ?? "",
      autoplay: 0,
    };
  });
}