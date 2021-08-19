import { gql, useQuery, useLazyQuery, ApolloError } from "@apollo/client";
import { Meta, Query, WindsResult, WeatherResult } from "./types";

const META_QUERY = gql`
  query Meta {
    meta {
      timeRanges
      months
      windDirections {
        idx
        name
        angle
      }
      windVelocities {
        idx
        beaufortName
        beaufortNumber
        fromKt
        toKt
      }
      precIntensities {
        idx
        name
        fromMm
        toMm
      }
    }
  }
`;

export type MetaRespType = {
  loading: boolean;
  data?: Meta;
  error?: ApolloError;
};

export function useMeta(): MetaRespType {
  const { data, loading, error } = useQuery<Query>(META_QUERY);
  return { data: data?.meta, loading, error };
}

const WINDS_QUERY = gql`
  query Winds(
    $timeRange: String!
    $month: String!
    $fromLat: Float!
    $toLat: Float!
    $fromLng: Float!
    $toLng: Float!
  ) {
    winds(
      input: {
        timeRange: $timeRange
        month: $month
        fromLat: $fromLat
        toLat: $toLat
        fromLng: $fromLng
        toLng: $toLng
      }
    ) {
      records {
        dir
        vel
        count
      }
    }
  }
`;

export type WindsRespType = {
  loading: boolean;
  data?: WindsResult;
  error?: ApolloError;
};

export type useWindsVars = {
  timeRange: string;
  month: string;
  fromLat: number;
  toLat: number;
  fromLng: number;
  toLng: number;
};

export type loadWindsType = ({
  variables,
}: {
  variables: useWindsVars;
}) => void;

export function useWinds(): [loadWindsType, WindsRespType] {
  const [loadWinds, { data, loading, error }] =
    useLazyQuery<Query>(WINDS_QUERY);
  return [loadWinds, { data: data?.winds, loading, error }];
}

const WEATHER_QUERY = gql`
  query Weather(
    $timeRange: String!
    $month: String!
    $fromLat: Float!
    $toLat: Float!
    $fromLng: Float!
    $toLng: Float!
  ) {
    weather(
      input: {
        timeRange: $timeRange
        month: $month
        fromLat: $fromLat
        toLat: $toLat
        fromLng: $fromLng
        toLng: $toLng
      }
    ) {
      windRecords {
        dir
        vel
        count
      }
      precRecords {
        amt
        count
      }
      tmpRecords {
        highMean
        lowMean
        highStd
        lowStd
      }
    }
  }
`;

export type WeatherRespType = {
  loading: boolean;
  data?: WeatherResult;
  error?: ApolloError;
};

export type useWeatherVars = {
  timeRange: string;
  month: string;
  fromLat: number;
  toLat: number;
  fromLng: number;
  toLng: number;
};

export type loadWeatherType = ({
  variables,
}: {
  variables: useWeatherVars;
}) => void;

export function useWeather(): [loadWeatherType, WeatherRespType] {
  const [loadWeather, { data, loading, error }] =
    useLazyQuery<Query>(WEATHER_QUERY);
  return [loadWeather, { data: data?.weather, loading, error }];
}
