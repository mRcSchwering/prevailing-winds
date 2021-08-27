import { Text, Box, Tip } from "grommet";
import { CircleQuestion } from "grommet-icons";

export default function Tooltip(props: { text: string }): JSX.Element {
  return (
    <Tip
      content={
        <Box width="small" background="light-1" pad="small" round="small">
          <Text>{props.text}</Text>
        </Box>
      }
      plain
    >
      <Box>
        <CircleQuestion />
      </Box>
    </Tip>
  );
}
