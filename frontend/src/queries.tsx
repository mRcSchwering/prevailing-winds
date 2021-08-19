import { gql, useQuery, useLazyQuery, ApolloError } from "@apollo/client";
import { Meta, Query, WindsResult } from "./types";

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
