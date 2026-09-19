import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

// Set base URL dynamically based on platform
const BASE_URL =
  Platform.OS === "android" ? "http://10.0.2.2:3030" : "http://localhost:3030";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Pick Image for Avatar
  const pickAvatar = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (isLogin) {
      // Basic login submission handler
      if (!username || !password) {
        Alert.alert("Error", "Please fill in username and password.");
        return;
      }
      // Submit login payload...
      return;
    }

    // Client validation for signup
    if (!username || !email || !password || !firstName || !lastName) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", username.trim());
      formData.append("email", email.trim().toLowerCase());
      formData.append("password", password);
      formData.append("firstName", firstName.trim());
      formData.append("lastName", lastName.trim());
      formData.append("bio", bio.trim());

      // ONLY append 'avatar' if a file was selected by the user!
      if (avatarUri) {
        const filename = avatarUri.split("/").pop() || "avatar.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        if (Platform.OS === "web") {
          const res = await fetch(avatarUri);
          const blob = await res.blob();
          formData.append("avatar", blob, filename);
        } else {
          formData.append("avatar", {
            uri: avatarUri,
            name: filename,
            type,
          } as any);
        }
      }

      const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          // Do NOT set Content-Type manually; fetch will add multipart/form-data with proper boundary
        },
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Registration failed");
      }

      Alert.alert("Success", resData.message || "User registered successfully");
      setIsLogin(true); // Switch to sign-in view
    } catch (err: any) {
      Alert.alert("Registration Error", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-black"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center items-center px-6 py-12">
          <View className="w-full max-w-md">
            {/* Header */}
            <View className="mb-6">
              <Text className="text-white text-3xl font-bold tracking-tight">
                {isLogin ? "Welcome back." : "Create account."}
              </Text>
              <Text className="text-neutral-400 mt-2 text-base">
                {isLogin
                  ? "Sign in to continue to Qotes."
                  : "Join the minimalist thoughts network."}
              </Text>
            </View>

            {/* Signup: Avatar Upload Preview */}
            {!isLogin && (
              <View className="items-center mb-6">
                <TouchableOpacity
                  onPress={pickAvatar}
                  className="w-20 h-20 rounded-full bg-neutral-900 border border-neutral-700 items-center justify-center overflow-hidden"
                >
                  {avatarUri ? (
                    <Image
                      source={{ uri: avatarUri }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text className="text-neutral-400 text-xs text-center px-2">
                      + Add Avatar
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Form Fields */}
            <View className="gap-y-3">
              {!isLogin && (
                <View className="flex-row gap-x-2">
                  <TextInput
                    placeholder="First Name *"
                    placeholderTextColor="#737373"
                    value={firstName}
                    onChangeText={setFirstName}
                    className="flex-1 h-12 bg-neutral-950 text-white rounded-lg px-4 border border-neutral-800"
                  />
                  <TextInput
                    placeholder="Last Name *"
                    placeholderTextColor="#737373"
                    value={lastName}
                    onChangeText={setLastName}
                    className="flex-1 h-12 bg-neutral-950 text-white rounded-lg px-4 border border-neutral-800"
                  />
                </View>
              )}

              <TextInput
                placeholder="Username *"
                placeholderTextColor="#737373"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                className="w-full h-12 bg-neutral-950 text-white rounded-lg px-4 border border-neutral-800"
              />

              {!isLogin && (
                <TextInput
                  placeholder="Email *"
                  placeholderTextColor="#737373"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="w-full h-12 bg-neutral-950 text-white rounded-lg px-4 border border-neutral-800"
                />
              )}

              <TextInput
                placeholder="Password *"
                placeholderTextColor="#737373"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className="w-full h-12 bg-neutral-950 text-white rounded-lg px-4 border border-neutral-800"
              />

              {!isLogin && (
                <TextInput
                  placeholder="Bio (optional)"
                  placeholderTextColor="#737373"
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  numberOfLines={2}
                  className="w-full h-16 bg-neutral-950 text-white rounded-lg px-4 py-2 border border-neutral-800"
                />
              )}

              {/* Submit Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSubmit}
                disabled={loading}
                className="w-full h-12 bg-white rounded-lg items-center justify-center mt-3"
              >
                {loading ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <Text className="text-black font-semibold text-base">
                    {isLogin ? "Sign In" : "Sign Up"}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Toggle Login/Signup */}
              <TouchableOpacity
                onPress={() => setIsLogin(!isLogin)}
                className="items-center py-3"
              >
                <Text className="text-neutral-400 text-sm">
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}