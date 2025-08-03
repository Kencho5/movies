import { Person } from "./person";

export interface Title {
  id: number;
  name: string;
  type: string;
  release_date: string;
  description: string;
  genre: string | null;
  tagline: string;
  poster: string;
  backdrop: string;
  runtime: number;
  trailer: string | null;
  budget: number;
  revenue: number;
  views: number;
  popularity: number;
  imdb_id: string;
  tmdb_id: number;
  is_series: boolean;
  seasons_count: number;
  rating: number;
  vote_count: number;
  year: number;
  images: Image[];
  genres: Genre[];
  keywords: Keyword[];
  videos: Video[];
  seasons?: Season[];
  credits?: {
    directing: Person[];
    writing: Person[];
    actors: Person[];
  };
  production_countries: Country[];
  status: string;
  certification: string;
  language: string;
}

export interface TitleResponse {
  title: Title;
  episodes: {
    data: Episode[];
  };
  seasons: {
    data: Season[];
  };
}

export interface SeasonResponse {
  title: Title;
  season: Season;
  episodes: {
    data: Episode[];
  };
}

export interface Image {
  id: number;
  url: string;
  type: string;
  source: string;
}

export interface Genre {
  id: number;
  name: string;
  display_name: string;
}

export interface Keyword {
  id: number;
  name: string;
  display_name: string;
}

export interface Video {
  id: number;
  name: string;
  thumbnail: string | null;
  src: string;
  type: string;
  quality: string;
  title_id: number;
  season_num: number | null;
  episode_num: number | null;
  origin: string;
  language: string;
  category: string;
  episode_id: number | null;
}

export interface Season {
  id: number;
  release_date: string;
  poster: string | null;
  number: number;
  title_id: number;
  episodes_count: number;
  episodes?: Episode[];
}

export interface Episode {
  id: number;
  name: string;
  description: string;
  poster: string | null;
  release_date: string;
  title_id: number;
  season_id: number;
  season_number: number;
  episode_number: number;
  runtime: number | null;
  year: number;
}

export interface Country {
  id: number;
  name: string;
  display_name: string;
}