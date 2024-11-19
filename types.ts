export type Article = {
  slug: string;
  title: string;
  date: string;
  content: string;
};
export type Metadata = { [key: string]: any } | null;
export type ParseResult = { metadata: Metadata; html: string };
