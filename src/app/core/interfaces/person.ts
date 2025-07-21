export interface PersonResponse {
  person: Person;
  loader: string;
  credits: PersonCredits;
  knownFor: PersonCredit[];
  total_credits_count: number;
}

export interface Person {
  name: string;
  description: string;
  poster: string;
  gender: string;
  birth_date: string;
  death_date: string | null;
  birth_place: string;
  imdb_id: string;
  tmdb_id: number;
  known_for: string;
  adult: boolean;
}

export interface PersonCredits {
  actors?: PersonCredit[];
  writing?: PersonCredit[];
  directing?: PersonCredit[];
  production?: PersonCredit[];
}

export interface PersonCredit {
  id: number;
  name: string;
  release_date: string;
  year: string;
  poster: string;
  rating: string;
  tmdb_id: number;
  imdb_id: string;
}