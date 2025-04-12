export interface Channel {
  id: number;
  slug: string;
  name: {
    ru: string;
    en: string;
  };
  logo: string;
  cover: string;
  archiveDays: number;
  live: boolean;
  stream: string;
  thumbnail: string;
  vast: {
    place: string;
    enabled: boolean;
    url: string;
  };
}
