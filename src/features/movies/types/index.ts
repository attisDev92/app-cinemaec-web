// Movie Types
export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  director: string;
  year: number;
  duration: number;
  genre: string[];
  country: string;
  language: string;
  subtitles?: string[];
  synopsis: string;
  posterUrl?: string;
  trailerUrl?: string;
  rating?: string;
  format: 'DCP' | 'BluRay' | 'DVD' | 'Digital' | 'Film';
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMovieData {
  title: string;
  originalTitle?: string;
  director: string;
  year: number;
  duration: number;
  genre: string[];
  country: string;
  language: string;
  subtitles?: string[];
  synopsis: string;
  posterUrl?: string;
  trailerUrl?: string;
  rating?: string;
  format: 'DCP' | 'BluRay' | 'DVD' | 'Digital' | 'Film';
  isAvailable: boolean;
}

export type UpdateMovieData = Partial<CreateMovieData>;
