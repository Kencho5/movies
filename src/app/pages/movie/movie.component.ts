import { Component, signal } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { TitleResponse } from "@core/interfaces/title";
import { HomeService } from "@core/services/home.service";
import { SharedModule } from "@shared/shared.module";

declare var Playerjs: any;

@Component({
  selector: "app-movie",
  imports: [SharedModule],
  templateUrl: "./movie.component.html",
})
export class MovieComponent {
  constructor(
    private route: ActivatedRoute,
    private homeService: HomeService,
  ) {}

  movieID: string = "";
  movie = signal<TitleResponse | null>(null);
  player: any;

  ngOnInit() {
    this.movieID = this.route.snapshot.paramMap.get("id")!;
    this.homeService.getMovie(this.movieID).subscribe((res) => {
      this.movie.set(res);
      this.initPlayer();
    });
  }

  initPlayer() {
    new Playerjs({
      id: "player",
      file: this.movie()?.title.videos[0].src,
      poster: this.movie()?.title.backdrop || "",
      //file: "https://s1.filmix.movie/trailers/13186482.mp4",
      //poster:
      //  "https://image.tmdb.org/t/p/w1280/oHPoF0Gzu8xwK4CtdXDaWdcuZxZ.jpg",
      autoplay: 0,
    });
  }
}
