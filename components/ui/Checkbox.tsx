import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  size?: number;
}

export default function Checkbox({ checked, onChange, size = 24 }: CheckboxProps) {
  return (
    <TouchableOpacity
      onPress={onChange}
      className={`items-center justify-center rounded-full border-2 ${
        checked ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'
      }`}
      style={{ width: size, height: size }}>
      {checked && <Ionicons name="checkmark" size={size - 8} color="white" />}
    </TouchableOpacity>
  );
} 