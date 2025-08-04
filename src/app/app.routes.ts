import { Routes } from "@angular/router";
import { LayoutComponent } from "@shared/components/layout/layout.component";

export const routes: Routes = [
  {
    path: "",
    component: LayoutComponent,
    children: [
      {
        path: "",
        loadComponent: () =>
          import("./pages/home/home.component").then((m) => m.HomeComponent),
      },
      {
        path: "movies",
        loadComponent: () =>
          import("./pages/movies/movies.component").then(
            (m) => m.MoviesComponent,
          ),
      },
      {
        path: "series",
        loadComponent: () =>
          import("./pages/series/series.component").then(
            (m) => m.SeriesComponent,
          ),
      },
      {
        path: "watch/:id",
        loadComponent: () =>
          import("./pages/watch/watch.component").then(
            (m) => m.WatchComponent,
          ),
      },
      {
        path: "tv",
        loadComponent: () =>
          import("./pages/tv/tv.component").then((m) => m.TvComponent),
      },
      {
        path: "people/:id",
        loadComponent: () =>
          import("./pages/people/people.component").then(
            (m) => m.PeopleComponent,
          ),
      },
    ],
  },
];