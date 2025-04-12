export interface TitleResponse {
  status: string;
  title: Title;
}

interface Title {
  id: number;
  name: string;
  release_date: string;
  year: string;
  tagline: string;
  poster: string;
  backdrop: string;
  runtime: number;
  budget: number;
  revenue: number;
  popularity: number;
  tmdb_id: number;
  imdb_id: string;
  is_series: boolean;
  adult: boolean;
  season_count: number;
  episode_count: number;
  series_ended: boolean;
  language: string;
  original_title: string;
  certification: string;
  rating: string;
  vote_count: number;
  images: Image[];
  genres: Genre[];
  keywords: Keyword[];
  credits: Credit[];
  seasons: Season[];
  season: Season[];
  videos: Video[];
  description: string;
}

interface Image {
  url: string;
  type: string;
  source: string;
}

interface Genre {
  name: string;
  display_name: string;
}

interface Keyword {
  name: string;
  display_name: string;
}

interface Credit {
  name: string;
  poster: string;
  pivot: Pivot;
}

interface Pivot {
  job: string;
  department: string;
  character: string;
}

interface Season {
  number: number;
  release_date: string;
  episode_count: number;
  poster: string;
  episodes: Episode[];
}

interface Episode {
  name: string;
  descrption: string;
  poster: string;
  release_date: string;
  season_number: number;
  episode_number: number;
  year: number;
  popularity: number;
  rating: string;
  vote_count: number;
  credits: Credit[];
}

interface Video {
  approved: boolean;
  category: string;
  created_at: string;
  downvotes: number;
  episode_id: number | null;
  episode_num: number | null;
  id: number;
  language: string;
  model_type: string;
  name: string;
  order: number;
  origin: string;
  quality: string;
  score: number | null;
  season_num: number | null;
  src: string;
  thumbnail: string | null;
  title_id: number;
  type: string;
  updated_at: string;
  upvotes: number;
  user_id: number;
}
