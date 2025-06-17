import LineIcon from '../assets/tether/tether.svg?react';
import CloseIcon from '../assets/tether/tether_close.svg?react';
import FarIcon from '../assets/tether/tether_far.svg?react';
import MinusMinusIcon from '../assets/tether/tether_minus_minus.svg?react';
import PlusMinusIcon from '../assets/tether/tether_plus_minus.svg?react';
import PlusPlusIcon from '../assets/tether/tether_plus_plus.svg?react';
import { TetherType } from '../scene';

type IconProps = React.ComponentProps<'svg'> & { title?: string; titleId?: string; desc?: string; descId?: string };

const ICONS: Record<TetherType, React.FC<IconProps>> = {
    [TetherType.Line]: LineIcon,
    [TetherType.Close]: CloseIcon,
    [TetherType.Far]: FarIcon,
    [TetherType.MinusMinus]: MinusMinusIcon,
    [TetherType.PlusMinus]: PlusMinusIcon,
    [TetherType.PlusPlus]: PlusPlusIcon,
};

export interface TetherIconProps extends IconProps {
    tetherType: TetherType;
}

export const TetherIcon: React.FC<TetherIconProps> = ({ tetherType, ...props }) => {
    const Icon = ICONS[tetherType];

    return <Icon {...props} />;
};
