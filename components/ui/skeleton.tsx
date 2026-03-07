import * as React from 'react';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { cn } from '@/lib/utils';

function Skeleton({
    className,
    ...props
}: Omit<React.ComponentPropsWithoutRef<typeof Animated.View>, 'style'> & { className?: string }) {
    const opacity = useSharedValue(0.5);

    React.useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1000 }),
                withTiming(0.5, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={animatedStyle}
            className={cn('rounded-md bg-muted', className)}
            {...props}
        />
    );
}

export { Skeleton };
