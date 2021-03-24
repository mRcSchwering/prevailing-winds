import { gql, useQuery, useLazyQuery, ApolloError } from "@apollo/client";

// added using https://www.graphql-code-generator.com/
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]: Maybe<T[SubKey]> };

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
};

export type QueryWindsArgs = {
  input?: Maybe<WindsInput>;
};

export type Meta = {
  __typename?: "Meta";
  ciPipelineId: Scalars["String"];
  buildDate: Scalars["String"];
  timeRanges: Array<Scalars["String"]>;
  windDirections: Array<WindDirection>;
  windVelocities: Array<WindVelocity>;
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

export type WindsInput = {
  timeRange: Scalars["String"];
  month: Scalars["Int"];
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

const META_QUERY = gql`
  query Meta {
    meta {
      timeRanges
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

export type useMetaResp = {
  loading: boolean;
  data?: Meta;
  error?: ApolloError;
};

export function useMeta(): useMetaResp {
  const { data, loading, error } = useQuery<Query>(META_QUERY);
  return { data: data?.meta, loading, error };
}

const WINDS_QUERY = gql`
  query Winds(
    $timeRange: String!
    $month: Int!
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

export type useWindResp = {
  loading: boolean;
  data?: WindsResult;
  error?: ApolloError;
};

export type useWindsVars = {
  timeRange: string;
  month: number;
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

export function useWinds(): [loadWindsType, useWindResp] {
  const [loadWinds, { data, loading, error }] = useLazyQuery<Query>(
    WINDS_QUERY
  );
  return [loadWinds, { data: data?.winds, loading, error }];
}

/*
const QUERY = gql`
  query TestPkl {
    testPkl {
      dir
      vel
      velName
      count
    }
  }
`;

export function useTestPkl(): [
  () => void,
  {
    data?: TestPklData;
    loading: boolean;
    error?: ApolloError;
  }
] {
  const [loadTestPkl, { data, loading, error }] = useLazyQuery<Query>(QUERY);

  return [loadTestPkl, { data: data?.testPkl, loading, error }];
}
*/
