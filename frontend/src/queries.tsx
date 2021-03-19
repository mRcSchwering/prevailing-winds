import { gql, useLazyQuery, ApolloError } from "@apollo/client";

/* below from https://www.graphql-code-generator.com/ */
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

export type TestPklData = Maybe<Array<Maybe<AvgWinds>>>;

export type Query = {
  __typename?: "Query";
  meta: Meta;
  testJson: Scalars["Int"];
  testPkl?: Maybe<Array<Maybe<AvgWinds>>>;
};

export type Meta = {
  __typename?: "Meta";
  ciPipelineId: Scalars["String"];
  buildDate: Scalars["String"];
};

export type AvgWinds = {
  __typename?: "AvgWinds";
  dir: Scalars["String"];
  vel: Scalars["Int"];
  velName: Scalars["String"];
  count: Scalars["Int"];
};
/* above from https://www.graphql-code-generator.com/ */

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
