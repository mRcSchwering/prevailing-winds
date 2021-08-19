// added using https://www.graphql-code-generator.com/
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]: Maybe<T[SubKey]> };
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
  winds: WindsResult;
  weather: WeatherResult;
};

export type QueryWindsArgs = {
  input: WindsInput;
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
  precIntensities: Array<PrecIntensity>;
};

export type WindDirection = {
  __typename?: "WindDirection";
  idx: Scalars["Int"];
  name: Scalars["String"];
  angle: Scalars["Float"];
};

export type WindVelocity = {
  __typename?: "WindVelocity";
  idx: Scalars["Int"];
  beaufortName: Scalars["String"];
  beaufortNumber: Scalars["Int"];
  fromKt?: Maybe<Scalars["String"]>;
  toKt?: Maybe<Scalars["String"]>;
};

export type PrecIntensity = {
  __typename?: "PrecIntensity";
  idx: Scalars["Int"];
  name: Scalars["String"];
  fromMm?: Maybe<Scalars["String"]>;
  toMm?: Maybe<Scalars["String"]>;
};

export type WindsInput = {
  timeRange: Scalars["String"];
  month: Scalars["String"];
  fromLat: Scalars["Float"];
  toLat: Scalars["Float"];
  fromLng: Scalars["Float"];
  toLng: Scalars["Float"];
};

export type WindsResult = {
  __typename?: "WindsResult";
  records: Array<WindRecord>;
};

export type WindRecord = {
  __typename?: "WindRecord";
  dir: Scalars["Int"];
  vel: Scalars["Int"];
  count: Scalars["Int"];
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
};

export type PrecRecord = {
  __typename?: "PrecRecord";
  amt: Scalars["Int"];
  count: Scalars["Int"];
};

export type TmpRecord = {
  __typename?: "TmpRecord";
  highMean: Scalars["Float"];
  lowMean: Scalars["Float"];
  highStd: Scalars["Float"];
  lowStd: Scalars["Float"];
};
