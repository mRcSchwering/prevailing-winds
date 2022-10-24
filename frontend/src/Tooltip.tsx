import { Text, Box, Tip } from "grommet";
import { CircleQuestion } from "grommet-icons";

export default function Tooltip(props: {
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
