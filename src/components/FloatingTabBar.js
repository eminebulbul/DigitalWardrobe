import React from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ROUTE_META = {
	"Ana Sayfa": { label: "Ana Sayfa", iconActive: "sparkles", iconIdle: "sparkles-outline" },
	"Kıyafet Ekle": { label: "Ekle", iconActive: "add-circle", iconIdle: "add-circle-outline" },
	Koleksiyon: { label: "Koleksiyon", iconActive: "albums", iconIdle: "albums-outline" },
};

export default function FloatingTabBar({ state, descriptors, navigation, variant = "folder" }) {
	const animatedValuesRef = React.useRef({});

	const getAnimValue = React.useCallback((routeKey) => {
		if (!animatedValuesRef.current[routeKey]) {
			animatedValuesRef.current[routeKey] = new Animated.Value(0);
		}
		return animatedValuesRef.current[routeKey];
	}, []);

	React.useEffect(() => {
		state.routes.forEach((route, index) => {
			Animated.spring(getAnimValue(route.key), {
				toValue: index === state.index ? 1 : 0,
				useNativeDriver: true,
				speed: 16,
				bounciness: 7,
			}).start();
		});
	}, [getAnimValue, state.index, state.routes]);

	const variants = {
		default: {
			shell: styles.shellDefault,
			itemActive: styles.itemDefaultActive,
			textActive: styles.textOnActive,
			iconActive: "#ffffff",
		},
		folder: {
			shell: styles.shellFolder,
			itemActive: styles.itemFolderActive,
			textActive: styles.textPrimary,
			iconActive: "#2d6a5a",
		},
	};

	const focusedOptions = descriptors[state.routes[state.index].key]?.options;
	if (focusedOptions?.tabBarStyle?.display === "none") {
		return null;
	}

	const skin = variants[variant] || variants.folder;

	return (
		<View style={styles.outerWrap}>
			<View style={[styles.shell, skin.shell]}>
				{state.routes.map((route, index) => {
					if (route.name === "Kategori Galerisi") {
						return null;
					}

					const options = descriptors[route.key]?.options || {};
					if (options.tabBarButton === null) {
						return null;
					}

					const isFocused = state.index === index;
					const anim = getAnimValue(route.key);
					const animatedItemStyle = {
						transform: [
							{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) },
							{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) },
						],
					};
					const animatedTextStyle = {
						opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }),
					};
					const meta = ROUTE_META[route.name] || {
						label: route.name,
						iconActive: "ellipse",
						iconIdle: "ellipse-outline",
					};

					const onPress = () => {
						const event = navigation.emit({
							type: "tabPress",
							target: route.key,
							canPreventDefault: true,
						});

						if (!isFocused && !event.defaultPrevented) {
							navigation.navigate(route.name);
						}
					};

					return (
						<Animated.View key={route.key} style={[styles.itemAnimatedWrap, animatedItemStyle]}>
							<Pressable
								style={[styles.itemBase, isFocused && skin.itemActive]}
								onPress={onPress}
								accessibilityRole="button"
								accessibilityState={isFocused ? { selected: true } : {}}
							>
								<Ionicons
									name={isFocused ? meta.iconActive : meta.iconIdle}
									size={20}
									color={isFocused ? skin.iconActive : "#8b8378"}
								/>
								<Animated.Text
									style={[styles.textBase, animatedTextStyle, isFocused && skin.textActive]}
								>
									{meta.label}
								</Animated.Text>
							</Pressable>
						</Animated.View>
					);
				})}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	outerWrap: {
		position: "absolute",
		left: 14,
		right: 14,
		bottom: 12,
	},
	shell: {
		height: 70,
		borderWidth: 1,
		borderColor: "#e6ddd0",
		backgroundColor: "#ffffff",
		flexDirection: "row",
		padding: 8,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 8 },
		shadowRadius: 12,
		elevation: 8,
	},
	shellDefault: {
		borderRadius: 22,
	},
	shellFolder: {
		borderRadius: 16,
		paddingTop: 10,
	},
	itemBase: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 14,
		gap: 2,
		minHeight: 44,
	},
	itemAnimatedWrap: {
		flex: 1,
	},
	itemDefaultActive: {
		backgroundColor: "#2d6a5a",
	},
	itemFolderActive: {
		marginTop: -8,
		backgroundColor: "#f4f2ed",
		borderWidth: 1,
		borderColor: "#e6ddd0",
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
		borderBottomLeftRadius: 6,
		borderBottomRightRadius: 6,
		paddingTop: 6,
	},
	textBase: {
		fontSize: 11,
		fontWeight: "700",
		color: "#8b8378",
	},
	textOnActive: {
		color: "#ffffff",
	},
	textPrimary: {
		color: "#2d6a5a",
	},
});
