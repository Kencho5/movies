import { Routes } from "@angular/router";
import { LayoutComponent } from "@shared/components/layout/layout.component";
import { HomeComponent } from "./pages/home/home.component";
import { MovieComponent } from "./pages/movie/movie.component";
import { TvComponent } from "./pages/tv/tv.component";
import { PeopleComponent } from "./pages/people/people.component";

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
        path: "movie/:id",
        component: MovieComponent,
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
