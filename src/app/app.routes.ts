import { Routes } from "@angular/router";
import { LayoutComponent } from "@shared/components/layout/layout.component";
import { HomeComponent } from "./pages/home/home.component";
import { WatchComponent } from "./pages/watch/watch.component";
import { TvComponent } from "./pages/tv/tv.component";
import { PeopleComponent } from "./pages/people/people.component";
import { SeriesComponent } from "./pages/series/series.component";
import { MoviesComponent } from "./pages/movies/movies.component";

export const routes: Routes = [
  {
    path: "",
    component: LayoutComponent,
    children: [
      {
        path: "",
        component: HomeComponent,
      },
      {
        path: "movies",
        component: MoviesComponent,
      },
      {
        path: "series",
        component: SeriesComponent,
      },
      {
        path: "watch/:id",
        component: WatchComponent,
      },
      {
        path: "tv",
        component: TvComponent,
      },
      {
        path: "people/:id",
        component: PeopleComponent,
      },
    ],
  },
];
