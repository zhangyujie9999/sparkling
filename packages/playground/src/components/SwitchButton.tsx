import { useState } from '@lynx-js/react';
import './SwitchButton.css';

interface SwitchButtonProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

const SwitchButton = ({ checked = false, onChange }: SwitchButtonProps): JSX.Element => {
  const [isChecked, setIsChecked] = useState(checked);

  const toggleSwitch = () => {
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    onChange && onChange(newChecked);
  };

  return (
    <view
      className={`switch-container ${isChecked ? 'checked' : 'unchecked'}`}
      bindtap={toggleSwitch}
    >
      <view className="switch-toggle" />
    </view>
  );
};


export default SwitchButton;
