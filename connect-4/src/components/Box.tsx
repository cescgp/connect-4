import { animated, useSpring } from "@react-spring/web";
import { GridBoxDto } from "../model/GridDto";

interface BoxProps {
    boxProperties: GridBoxDto
}

export default function Box(props: BoxProps) {
    const [springs, api] = useSpring(() => ({
        from: { x: props.boxProperties.column, y: 0 },
    }));

    const handleClick = () => {
        api.start({
          from: {
            x: props.boxProperties.column,
            y: 0
          },
          to: {
            x: props.boxProperties.column,
            y: props.boxProperties.row
          },
        })
      }
    
      return (
        <animated.div
          onClick={handleClick}
          style={{
            width: 80,
            height: 80,
            background: '#ff6d6d',
            borderRadius: 8,
            ...springs,
          }}
        />);
}