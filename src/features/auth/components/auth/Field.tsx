import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
    Text,
    TextInput,
    View,
    useColorScheme,
} from 'react-native';

export type InputHandle = { focus: () => void };

type Props = {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    onBlur?: () => void;
    error?: string;
    hint?: string;
    right?: React.ReactNode;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    autoCorrect?: boolean;
    autoComplete?: string;
    textContentType?: string;
    keyboardType?: 'default' | 'email-address';
    secureTextEntry?: boolean;
    returnKeyType?: 'done' | 'go' | 'next';
    onSubmitEditing?: () => void;
    multiline?: boolean;
    maxLength?: number;
    counter?: string;
};

export const Field = forwardRef<InputHandle, Props>(function Field(
    {
        label,
        value,
        onChangeText,
        onBlur,
        error,
        hint,
        right,
        autoCapitalize,
        autoCorrect,
        autoComplete,
        textContentType,
        keyboardType,
        secureTextEntry,
        returnKeyType,
        onSubmitEditing,
        multiline = false,
        maxLength,
        counter,
    },
    ref,
) {
    const inputRef = useRef<TextInput>(null);
    const [isFocused, setIsFocused] = useState(false);
    const isDark = useColorScheme() === 'dark';

    useImperativeHandle(ref, () => ({
        focus: () => inputRef.current?.focus(),
    }));

    const handleBlur = () => {
        setIsFocused(false);
        onBlur?.();
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    // Border color: Crisp pure white in dark mode, sky blue when focused in light mode, neutral slate when idle
    const borderColor = error
        ? '#F43F5E' // rose-500
        : isFocused
            ? isDark
                ? '#FFFFFF' // White highlight when focused in dark mode
                : '#0EA5E9' // sky-500 in light mode
            : isDark
                ? '#FFFFFF' // Pure white border in dark mode when idle
                : '#CBD5E1'; // slate-300 in light mode

    // Background and text resolution
    const backgroundColor = isDark ? '#000000' : '#FFFFFF';
    const textColor = isDark ? '#FFFFFF' : '#000000';

    return (
        <View className="w-full gap-1.5">
            {/* Label and Character Counter */}
            <View className="flex-row items-center justify-between px-0.5">
                <Text
                    className={`text-[13px] font-semibold tracking-normal ${error
                            ? 'text-rose-500 dark:text-rose-400'
                            : isFocused
                                ? 'text-sky-500 dark:text-white'
                                : 'text-slate-700 dark:text-white'
                        }`}
                >
                    {label}
                </Text>
                {counter && (
                    <Text className="text-[12px] font-medium text-slate-400 dark:text-neutral-400">
                        {counter}
                    </Text>
                )}
            </View>

            {/* Input Box Container */}
            <View
                style={{
                    backgroundColor,
                    borderColor,
                    borderWidth: isFocused || error ? 1.5 : 1,
                }}
                className={`flex-row items-center rounded-2xl px-3.5 ${multiline ? 'min-h-[96px] max-h-[140px] items-start py-2.5' : 'h-[50px]'
                    }`}
            >
                <TextInput
                    ref={inputRef}
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    autoCapitalize={autoCapitalize}
                    autoCorrect={autoCorrect}
                    autoComplete={autoComplete as never}
                    textContentType={textContentType as never}
                    keyboardType={keyboardType}
                    secureTextEntry={secureTextEntry}
                    returnKeyType={returnKeyType}
                    onSubmitEditing={onSubmitEditing}
                    multiline={multiline}
                    maxLength={maxLength}
                    textAlignVertical={multiline ? 'top' : 'center'}
                    style={{ color: textColor }}
                    className={`h-full flex-1 text-[15px] leading-5 ${multiline ? 'pt-1' : ''}`}
                    placeholderTextColor={isDark ? '#737373' : '#94A3B8'}
                />

                {/* Right Accessory (Password toggle / action icon) */}
                {right && (
                    <View className="ml-2.5 items-center justify-center">
                        {right}
                    </View>
                )}
            </View>

            {/* Helper text / Error message */}
            {error ? (
                <Text className="px-0.5 text-[12px] font-medium text-rose-500 dark:text-rose-400">
                    {error}
                </Text>
            ) : hint ? (
                <Text className="px-0.5 text-[12px] text-slate-500 dark:text-neutral-300">
                    {hint}
                </Text>
            ) : null}
        </View>
    );
});