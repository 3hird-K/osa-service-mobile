import * as React from 'react';
import { View, TextInput, type TextInputProps, Platform, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { cn } from '@/lib/utils';

interface FloatingLabelInputProps extends TextInputProps {
  label: string;
  containerClassName?: string;
  labelClassName?: string;
  rightElement?: React.ReactNode;
}

const FloatingLabelInput = React.forwardRef<TextInput, FloatingLabelInputProps>(
  ({ label, value, onChangeText, onFocus, onBlur, className, containerClassName, labelClassName, rightElement, ...props }, ref) => {
    const isFocused = useSharedValue(0);
    const hasValue = useSharedValue(value || props.defaultValue ? 1 : 0);

    React.useEffect(() => {
      hasValue.value = value || props.defaultValue ? 1 : 0;
    }, [value, props.defaultValue]);

    const handleFocus = (e: any) => {
      isFocused.value = withTiming(1, { duration: 150 });
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      isFocused.value = withTiming(0, { duration: 150 });
      onBlur?.(e);
    };

    const animatedLabelStyle = useAnimatedStyle(() => {
      const active = isFocused.value > 0 || hasValue.value > 0 ? 1 : 0;
      return {
        transform: [
          {
            translateY: withTiming(interpolate(active, [0, 1], [0, -8], Extrapolate.CLAMP), { duration: 150 }),
          },
          {
            scale: withTiming(interpolate(active, [0, 1], [1, 0.75], Extrapolate.CLAMP), { duration: 150 }),
          },
        ],
        left: withTiming(interpolate(active, [0, 1], [0, -4], Extrapolate.CLAMP), { duration: 150 }),
      };
    });

    return (
      <View className={cn('w-full h-[54px]', containerClassName)}>
        <View
          className={cn(
            'w-full h-full flex-row items-center rounded-xl border border-border bg-muted/20 px-4',
            className
          )}
        >
          <View className="flex-1 h-full relative justify-end pb-1.5">
            <Animated.View 
              pointerEvents="none"
              style={[
                { position: 'absolute', left: 0, bottom: 16 },
                animatedLabelStyle
              ]}
            >
              <Text className={cn('font-sans text-muted-foreground/60 text-[15px]', labelClassName)}>
                {label}
              </Text>
            </Animated.View>
            <TextInput
              ref={ref}
              value={value}
              onChangeText={onChangeText}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className={cn(
                'p-0 font-sans text-foreground text-[16px] h-8 mt-2.5',
                Platform.select({ web: 'outline-none' })
              )}
              placeholder=""
              {...props}
            />
          </View>
          {rightElement && (
            <View className="ml-2 h-full justify-center">
              {rightElement}
            </View>
          )}
        </View>
      </View>
    );
  }
);

FloatingLabelInput.displayName = 'FloatingLabelInput';

export { FloatingLabelInput };
