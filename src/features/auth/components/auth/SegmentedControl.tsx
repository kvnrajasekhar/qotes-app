import { Pressable, Text, View, useColorScheme } from 'react-native';

type Option<T extends string> = { value: T; label: string };

export function SegmentedControl<T extends string>({
    value,
    onChange,
    options,
}: {
    value: T;
    onChange: (value: T) => void;
    options: Option<T>[];
}) {
    const isDark = useColorScheme() === 'dark';

    return (
        <View
            style={{
                backgroundColor: isDark ? '#121212' : '#E2E8F0', // Deep charcoal in dark mode, neutral slate in light mode
                borderColor: isDark ? '#262626' : 'transparent',
                borderWidth: isDark ? 1 : 0,
            }}
            className="flex-row rounded-2xl p-1"
        >
            {options.map((option) => {
                const active = option.value === value;

                // Background color resolution
                const pillBg = active
                    ? isDark
                        ? '#000000' // Active pill: solid black in dark mode
                        : '#FFFFFF' // Active pill: solid white in light mode
                    : 'transparent';

                // Text color resolution
                const textColor = active
                    ? isDark
                        ? '#FFFFFF' // Pure white when selected
                        : '#0F172A' // Dark slate when selected
                    : isDark
                        ? '#A3A3A3' // Muted neutral when unselected
                        : '#64748B'; // Muted slate when unselected

                return (
                    <Pressable
                        key={option.value}
                        onPress={() => onChange(option.value)}
                        style={{
                            backgroundColor: pillBg,
                            borderColor: active && isDark ? '#333333' : 'transparent',
                            borderWidth: active && isDark ? 1 : 0,
                        }}
                        className="flex-1 rounded-xl px-3 py-2.5 transition-all"
                    >
                        <Text
                            style={{ color: textColor }}
                            className={`text-center text-[14px] ${active ? 'font-bold' : 'font-medium'
                                }`}
                        >
                            {option.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}