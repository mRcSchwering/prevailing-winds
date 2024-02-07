import { gql, useQuery, useLazyQuery, ApolloError } from "@apollo/client";
import { Meta, Query, WeatherResult } from "./types";

const META_QUERY = gql`
  query Meta {
    meta {
      timeRanges
      months
      directions {
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
      waveHeights {
        idx
        douglasName
        douglasDegree
        fromM
        toM
      }
      currentVelocities {
        idx
        fromKt
        toKt
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
      currentRecords {
        dir
        vel
        count
      }
      rainRecords {
        dailyMean
        dailyStd
      }
      tempRecords {
        highMean
        lowMean
        highStd
        lowStd
      }
      seatempRecords {
        highMean
        lowMean
        highStd
        lowStd
      }
      waveRecords {
        height
        count
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
