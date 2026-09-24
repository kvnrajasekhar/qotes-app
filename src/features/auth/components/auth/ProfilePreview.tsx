import { Text, View } from 'react-native';

export function ProfilePreview({
    name,
    username,
    bio,
    initials,
    avatarUri,
}: {
    name: string;
    username: string;
    bio: string;
    initials: string;
    avatarUri?: string;
}) {
    return (
        <View className="gap-3 rounded-2xl bg-white/10 p-4">
            <View className="flex-row items-center gap-3">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-signal text-white dark:bg-signal-soft">
                    {avatarUri ? <Text>IMG</Text> : <Text>{initials || 'Q'}</Text>}
                </View>
                <View className="flex-1">
                    <Text className="text-[18px] font-semibold text-white">{name || 'Your name'}</Text>
                    <Text className="text-[14px] text-white/70">@{username || 'yourhandle'}</Text>
                </View>
            </View>
            <Text className="text-[14px] leading-5 text-white/80">{bio || 'Add a little intro...'}</Text>
        </View>
    );
}
