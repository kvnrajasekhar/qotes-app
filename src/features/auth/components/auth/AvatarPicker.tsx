import type { ImagePickerAsset } from 'expo-image-picker';
import { Pressable, Text } from 'react-native';

export function AvatarPicker({
    asset,
    initials,
    onChange,
}: {
    asset: ImagePickerAsset | null;
    initials: string;
    onChange: (asset: ImagePickerAsset | null) => void;
}) {
    return (
        <Pressable
            onPress={() => onChange(null)}
            accessibilityRole="button"
            className="mx-auto h-24 w-24 items-center justify-center rounded-full border border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-900"
        >
            {asset ? (
                <Text className="text-[10px] text-ink dark:text-mist">Photo</Text>
            ) : (
                <Text className="text-[24px] font-semibold text-ink dark:text-mist">{initials || 'Q'}</Text>
            )}
        </Pressable>
    );
}
