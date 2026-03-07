import { cn } from '@/lib/utils';
import * as React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

type AlertDialogAction = {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
};

type AlertDialogProps = {
    visible: boolean;
    onClose: () => void;
    title: string;
    message?: string;
    actions?: AlertDialogAction[];
};

export function AlertDialog({ visible, onClose, title, message, actions }: AlertDialogProps) {
    const sortedActions = React.useMemo(() => {
        if (!actions || actions.length === 0) {
            return [{ text: 'OK', onPress: onClose, style: 'default' as const }];
        }
        // Place cancel buttons first (left side), like Apple
        return [...actions].sort((a, b) => {
            if (a.style === 'cancel') return -1;
            if (b.style === 'cancel') return 1;
            return 0;
        });
    }, [actions, onClose]);

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <Animated.View
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(150)}
                className="flex-1 items-center justify-center bg-black/40"
            >
                <Pressable
                    className="absolute inset-0"
                    onPress={onClose}
                />
                <View className="bg-card rounded-2xl w-[280px] overflow-hidden shadow-xl border border-border/30">
                    {/* Content */}
                    <View className="px-6 pt-6 pb-4 items-center">
                        <Text className="text-foreground font-semibold text-[17px] font-sans text-center">
                            {title}
                        </Text>
                        {message && (
                            <Text className="text-muted-foreground text-[13px] font-sans text-center mt-1.5 leading-[18px]">
                                {message}
                            </Text>
                        )}
                    </View>

                    {/* Divider */}
                    <View className="h-px bg-border/50" />

                    {/* Actions */}
                    <View className={cn('flex-row', sortedActions.length === 1 && 'justify-center')}>
                        {sortedActions.map((action, index) => (
                            <React.Fragment key={index}>
                                {index > 0 && <View className="w-px bg-border/50" />}
                                <Pressable
                                    onPress={() => {
                                        action.onPress?.();
                                        onClose();
                                    }}
                                    className="flex-1 py-3.5 items-center justify-center active:bg-muted/50"
                                >
                                    <Text
                                        className={cn(
                                            'text-[17px] font-sans text-center',
                                            action.style === 'cancel' && 'text-foreground font-semibold',
                                            action.style === 'destructive' && 'text-destructive font-normal',
                                            action.style !== 'cancel' && action.style !== 'destructive' && 'text-primary font-semibold',
                                        )}
                                    >
                                        {action.text}
                                    </Text>
                                </Pressable>
                            </React.Fragment>
                        ))}
                    </View>
                </View>
            </Animated.View>
        </Modal>
    );
}
