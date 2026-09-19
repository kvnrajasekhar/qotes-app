import React, { useState } from "react";
import { View, StatusBar } from "react-native";
import SplashScreen from "../../components/SplashScreen";
import AuthScreen from "../../components/AuthScreen";

export default function EntryRoute() {
  const [isReady, setIsReady] = useState(false);

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      {!isReady ? (
        <SplashScreen onFinish={() => setIsReady(true)} />
      ) : (
        <AuthScreen />
      )}
    </View>
  );
}