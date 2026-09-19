import React, { useEffect } from "react";
import { View, Image } from "react-native";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1000); // 1-second display duration

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View className="flex-1 bg-black items-center justify-center px-6">
      <Image
        source={require("../assets/images/qotes-logo-main.png")}
        className="w-36 h-36 md:w-48 md:h-48"
        resizeMode="contain"
      />
    </View>
  );
}