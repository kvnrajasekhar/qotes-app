// app/index.tsx
import React from "react";
import { View, ActivityIndicator, Image } from "react-native";
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Disables strict mode warnings like reading .value during render
});
export default function Index() {
  return ( 
    <View className="flex-1 bg-black items-center justify-center">
      <Image
        source={require("../src/assets/images/qotes-logo-main.png")}
        className="w-32 h-32"
        resizeMode="contain"
      />
    </View>
  );
}