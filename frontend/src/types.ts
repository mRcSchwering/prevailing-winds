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
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

export type Query = {
  __typename?: "Query";
  meta: Meta;
  weather: WeatherResult;
};

export type QueryWeatherArgs = {
  input: WeatherInput;
};

/** Some metadata */
export type Meta = {
  __typename?: "Meta";
  ciPipelineId: Scalars["String"]["output"];
  buildDate: Scalars["String"]["output"];
  timeRanges: Array<Scalars["String"]["output"]>;
  months: Array<Scalars["String"]["output"]>;
  directions: Array<Direction>;
  windVelocities: Array<WindVelocity>;
  currentVelocities: Array<CurrentVelocity>;
  waveHeights: Array<WaveHeight>;
};

/**
 * Wind velocity with Beaufort name and number.
 * From/to knots are half closed intervals.
 */
export type WindVelocity = {
  __typename?: "WindVelocity";
  idx: Scalars["Int"]["output"];
  beaufortName: Scalars["String"]["output"];
  beaufortNumber: Scalars["Int"]["output"];
  fromKt?: Maybe<Scalars["String"]["output"]>;
  toKt?: Maybe<Scalars["String"]["output"]>;
};

/**
 * Wave height in Douglas scale of sea state with name and degree.
 * From/to m are half closed intervals.
 */
export type WaveHeight = {
  __typename?: "WaveHeight";
  idx: Scalars["Int"]["output"];
  douglasName: Scalars["String"]["output"];
  douglasDegree: Scalars["Int"]["output"];
  fromM?: Maybe<Scalars["String"]["output"]>;
  toM?: Maybe<Scalars["String"]["output"]>;
};

/**
 * Current velocity of ocean currents averaged over months.
 * From/to knots are half closed intervals.
 */
export type CurrentVelocity = {
  __typename?: "CurrentVelocity";
  idx: Scalars["Int"]["output"];
  fromKt?: Maybe<Scalars["String"]["output"]>;
  toKt?: Maybe<Scalars["String"]["output"]>;
};

/** Direction with name and bearing. */
export type Direction = {
  __typename?: "Direction";
  idx: Scalars["Int"]["output"];
  name: Scalars["String"]["output"];
  angle: Scalars["Float"]["output"];
};

/**
 * **timeRange** one of ("2022", "2018-2022")
 * **month** in 3 letters (_e.g._ "Jan")
 * **from/to lat/lng** considering only lats [-70;70)
 */
export type WeatherInput = {
  timeRange: Scalars["String"]["input"];
  month: Scalars["String"]["input"];
  fromLat: Scalars["Float"]["input"];
  toLat: Scalars["Float"]["input"];
  fromLng: Scalars["Float"]["input"];
  toLng: Scalars["Float"]["input"];
};

/**
 * Historic weather data for a particular
 * time and place/area.
 */
export type WeatherResult = {
  __typename?: "WeatherResult";
  windRecords: Array<WindRecord>;
  currentRecords: Array<CurrentRecord>;
  rainRecords: Array<RainRecord>;
  tempRecords: Array<TempRecord>;
  seatempRecords: Array<SeatempRecord>;
  waveRecords: Array<WaveRecord>;
};

/**
 * Describes how many times a certain wind direction
 * and wind strength was counted.
 * See **Meta** for indexes.
 */
export type WindRecord = {
  __typename?: "WindRecord";
  dir: Scalars["Int"]["output"];
  vel: Scalars["Int"]["output"];
  count: Scalars["Int"]["output"];
};

/**
 * Describes how many times a certain current direction
 * and current velocity was counted.
 * See **Meta** for indexes.
 */
export type CurrentRecord = {
  __typename?: "CurrentRecord";
  dir: Scalars["Int"]["output"];
  vel: Scalars["Int"]["output"];
  count: Scalars["Int"]["output"];
};

/**
 * Describes how many times a certain wave height was counted.
 * See **Meta** for indexes.
 */
export type WaveRecord = {
  __typename?: "WaveRecord";
  height: Scalars["Int"]["output"];
  count: Scalars["Int"]["output"];
};

/** Describes total daily rain in mm. */
export type RainRecord = {
  __typename?: "RainRecord";
  dailyMean: Scalars["Float"]["output"];
  dailyStd: Scalars["Float"]["output"];
};

/**
 * Describes the days' high and low
 * temperatures in C.
 */
export type TempRecord = {
  __typename?: "TempRecord";
  highMean: Scalars["Float"]["output"];
  lowMean: Scalars["Float"]["output"];
  highStd: Scalars["Float"]["output"];
  lowStd: Scalars["Float"]["output"];
};

/**
 * Describes the days' high and low sea surface
 * temperatures in C.
 */
export type SeatempRecord = {
  __typename?: "SeatempRecord";
  highMean: Scalars["Float"]["output"];
  lowMean: Scalars["Float"]["output"];
  highStd: Scalars["Float"]["output"];
  lowStd: Scalars["Float"]["output"];
};
