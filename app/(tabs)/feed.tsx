// import React, { useMemo } from "react";
// import { View, FlatList, Text, RefreshControl, ActivityIndicator } from "react-native";
// import { useInfiniteQuery } from "@tanstack/react-query";
// import { feedStorage, authStorage } from "../../src/shared/lib/storage";
// import axios from "axios";

// const API_URL = "http://localhost:3030/v1/feed"; // or 10.0.2.2 on Android[cite: 12]

// export default function FeedScreen() {
//   // Read previous session feed directly from MMKV for instant paint
//   const cachedFeed = useMemo(() => {
//     const raw = feedStorage.getString("last_feed_snapshot");
//     return raw ? JSON.parse(raw) : [];
//   }, []);

//   const {
//     data,
//     fetchNextPage,
//     hasNextPage,
//     isFetchingNextPage,
//     refetch,
//     isRefetching,
//   } = useInfiniteQuery({
//     queryKey: ["home-feed"],
//     initialData: cachedFeed.length > 0 ? {
//       pages: [{ quotes: cachedFeed, nextCursor: null, hasMore: true }],
//       pageParams: [null],
//     } : undefined,
//     queryFn: async ({ pageParam = null }) => {
//       const tokens = await authStorage.getTokens();
//       const res = await axios.get(API_URL, {
//         params: { cursor: pageParam, limit: 15 },
//         headers: { Authorization: `Bearer ${tokens.accessToken}` },
//       });
      
//       const payload = res.data.data;
//       // Persist the top page into MMKV for next cold boot
//       if (!pageParam && payload.quotes?.length > 0) {
//         feedStorage.set("last_feed_snapshot", JSON.stringify(payload.quotes));
//       }
//       return payload;
//     },
//     getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
//     initialPageParam: null,
//   });

//   const allQuotes = data?.pages.flatMap((page) => page.quotes) || cachedFeed;

//   return (
//     <View className="flex-1 bg-black px-4">
//       <FlatList
//         data={allQuotes}
//         keyExtractor={(item) => item._id}
//         renderItem={({ item }) => (
//           <View className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 my-2">
//             <Text className="text-white text-lg font-serif italic">"{item.text}"</Text>
//             <Text className="text-neutral-400 text-sm mt-3 font-semibold">— {item.author || item.user?.username}</Text>
//             <View className="flex-row gap-x-4 mt-4">
//               <Text className="text-neutral-400 text-xs">💡 {item.reactions?.Insightful || 0}</Text>
//               <Text className="text-neutral-400 text-xs">🔥 {item.reactions?.Empowering || 0}</Text>
//               <Text className="text-neutral-400 text-xs">❤️ {item.reactions?.Resonant || 0}</Text>
//             </View>
//           </View>
//         )}
//         onEndReached={() => {
//           if (hasNextPage && !isFetchingNextPage) fetchNextPage();
//         }}
//         onEndReachedThreshold={0.5}
//         refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#fff" />}
//         ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color="#ffffff" className="py-4" /> : null}
//       />
//     </View>
//   );
// }


// app/(tabs)/feed.tsx
import React from "react";
import { View, Text } from "react-native";

export default function FeedScreen() {
  return (
    <View className="flex-1 bg-black justify-center items-center">
      <Text className="text-white text-xl font-bold">Live Qotes Feed</Text>
    </View>
  );
}