import React from "react";
import { Text, Box, Tip } from "grommet";
import { COLORS } from "./constants";
import { CircleQuestion } from "grommet-icons";

const spinning = (
  <svg
    version="1.1"
    viewBox="0 0 32 32"
    width="28px"
    height="28px"
    fill={COLORS.primary}
  >
    <path
      opacity=".25"
      d="M16 0 A16 16 0 0 0 16 32 A16 16 0 0 0 16 0 M16 4 A12 12 0 0 1 16 28 A12 12 0 0 1 16 4"
    />
    <path d="M16 0 A16 16 0 0 1 32 16 L28 16 A12 12 0 0 0 16 4z">
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 16 16"
        to="360 16 16"
        dur="0.8s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
);

export const Spinner = () => (
  <Box align="center" justify="center">
    {spinning}
  </Box>
);

export function Tooltip(props: {
  text: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <Tip
      plain
      content={
        <Box width="small" background="light-1" pad="xsmall" round="xsmall">
          <Text>{props.text}</Text>
        </Box>
      }
    >
      {props.children}
    </Tip>
  );
}

export function TooltipIcon(props: { text: string }): JSX.Element {
  return (
    <Tooltip text={props.text}>
      <Box>
        <CircleQuestion />
      </Box>
    </Tooltip>
  );
}
