export type FortuneRequest = {
  name: string;
  birthplace: string;
  birthDate: string;
};

export type FortuneCommentary = {
  disposition: string;
  turningPoint: string;
  advice: string;
};

export type FortuneResponse = {
  fortuneId: string;
  poem: [string, string, string, string];
  commentary: FortuneCommentary;
  motifs: string[];
  interpretation: FortuneCommentary;
  tags: [string, string, string];
  disclaimer: string;
};

export type FortuneFeatures = {
  seasonImage: string;
  regionImage: string;
  destinyKeyword: string;
  temperament: string;
  turningPointHint: string;
};

export type FortuneLibraryEntry = {
  id: string;
  poem: [string, string, string, string];
  motifs: string[];
  commentary: FortuneCommentary;
  rhymeGroup: string;
  endings: [string, string, string, string];
};

export type FortuneLibrary = {
  meta: {
    generatedAt: string;
    count: number;
    source: string;
  };
  fortunes: FortuneLibraryEntry[];
};
