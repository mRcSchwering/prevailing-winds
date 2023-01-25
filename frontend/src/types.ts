// added using https://www.graphql-code-generator.com/
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Query = {
  __typename?: "Query";
  meta: Meta;
  weather: WeatherResult;
};

export type QueryWeatherArgs = {
  input: WeatherInput;
};

export type Meta = {
  __typename?: "Meta";
  ciPipelineId: Scalars["String"];
  buildDate: Scalars["String"];
  timeRanges: Array<Scalars["String"]>;
  months: Array<Scalars["String"]>;
  windDirections: Array<WindDirection>;
  windVelocities: Array<WindVelocity>;
  waveHeights: Array<WaveHeight>;
};

export type WindVelocity = {
  __typename?: "WindVelocity";
  idx: Scalars["Int"];
  beaufortName: Scalars["String"];
  beaufortNumber: Scalars["Int"];
  fromKt?: Maybe<Scalars["String"]>;
  toKt?: Maybe<Scalars["String"]>;
};

export type WaveHeight = {
  __typename?: "WaveHeight";
  idx: Scalars["Int"];
  douglasName: Scalars["String"];
  douglasDegree: Scalars["Int"];
  fromM?: Maybe<Scalars["String"]>;
  toM?: Maybe<Scalars["String"]>;
};

export type WindDirection = {
  __typename?: "WindDirection";
  idx: Scalars["Int"];
  name: Scalars["String"];
  angle: Scalars["Float"];
};

export type WeatherInput = {
  timeRange: Scalars["String"];
  month: Scalars["String"];
  fromLat: Scalars["Float"];
  toLat: Scalars["Float"];
  fromLng: Scalars["Float"];
  toLng: Scalars["Float"];
};

export type WeatherResult = {
  __typename?: "WeatherResult";
  windRecords: Array<WindRecord>;
  precRecords: Array<PrecRecord>;
  tmpRecords: Array<TmpRecord>;
  seatmpRecords: Array<SeatmpRecord>;
  waveRecords: Array<WaveRecord>;
};

export type WindRecord = {
  __typename?: "WindRecord";
  dir: Scalars["Int"];
  vel: Scalars["Int"];
  count: Scalars["Int"];
};

export type WaveRecord = {
  __typename?: "WaveRecord";
  height: Scalars["Int"];
  count: Scalars["Int"];
};

export type PrecRecord = {
  __typename?: "PrecRecord";
  dailyMean: Scalars["Float"];
  dailyStd: Scalars["Float"];
};

export type TmpRecord = {
  __typename?: "TmpRecord";
  highMean: Scalars["Float"];
  lowMean: Scalars["Float"];
  highStd: Scalars["Float"];
  lowStd: Scalars["Float"];
};

export type SeatmpRecord = {
  __typename?: "SeatmpRecord";
  highMean: Scalars["Float"];
  lowMean: Scalars["Float"];
  highStd: Scalars["Float"];
  lowStd: Scalars["Float"];
};
