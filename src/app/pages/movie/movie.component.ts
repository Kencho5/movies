import { Component, signal, inject, input } from "@angular/core";
import { MovieService } from "@core/services/movie.service";
import { PlayerComponent } from "@shared/components/player/player.component";
import { SharedModule } from "@shared/shared.module";
import { PlayerData } from "@core/interfaces/player";
import { toObservable } from "@angular/core/rxjs-interop";
import { switchMap } from "rxjs";

@Component({
  selector: "app-movie",
  standalone: true,
  imports: [SharedModule, PlayerComponent],
  templateUrl: "./movie.component.html",
})
export class MovieComponent {
  readonly movieService = inject(MovieService);
  
  movieID = input.required<string>();
  movie = signal<any | null>(null);
  playerData = signal<PlayerData>({
    file: "",
    poster: "",
    autoplay: 0,
  });

  constructor() {
    toObservable(this.movieID)
      .pipe(
        switchMap((id) => this.movieService.getMovie(id))
      )
      .subscribe((res) => {
        this.movie.set(res);

        const movieTitle = this.movie()?.title;
        this.playerData.set({
          file: movieTitle?.videos?.[0]?.src || "",
          poster: movieTitle?.backdrop || "",
          autoplay: 0,
        });
      });
  }
}
