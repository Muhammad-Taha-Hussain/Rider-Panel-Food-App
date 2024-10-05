import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Text, Button, Linking, Platform, Alert, TextInput, TouchableOpacity, Animated } from "react-native";
import MapView, { Marker, Circle, MapStyleElement } from "react-native-maps";
import * as Location from "expo-location";
import { FontAwesome } from "@expo/vector-icons";

interface LocationCoords {
  latitude: number;
  longitude: number;
  name: string;
}

const mapDarkStyle: MapStyleElement[] = [
  {
    elementType: "geometry",
    stylers: [
      {
        color: "#242f3e",
      },
    ],
  },
  {
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#746855",
      },
    ],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#242f3e",
      },
    ],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#d59563",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#d59563",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [
      {
        color: "#263c3f",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#6b9a76",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [
      {
        color: "#38414e",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#212a37",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9ca5b3",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [
      {
        color: "#746855",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#1f2835",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#f3d19c",
      },
    ],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [
      {
        color: "#2f3948",
      },
    ],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#d59563",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      {
        color: "#17263c",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#515c6d",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#17263c",
      },
    ],
  },
];

const mapStandardStyle: MapStyleElement[] = [
  {
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
];



const predefinedLocations: LocationCoords[] = [
  { name: "Location 1", latitude: 37.78825, longitude: -122.4324 },
  { name: "Location 2", latitude: 37.78825, longitude: -122.4424 },
  { name: "Location 3", latitude: 37.79825, longitude: -122.4524 },
  { name: "Misbah School", latitude: 31.4339919230326, longitude: 74.30298361927271 },
];

const ExploreScreen = () => {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number | null>(null); // Track zoom level
  const mapRef = useRef<MapView | null>(null);

  const handleMapPress = (event: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    Alert.alert(`Coordinates`, `Latitude: ${latitude}, Longitude: ${longitude}`);
  };

  useEffect(() => {
    const requestLocationPermission = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        name: "Current Location",
      });
    };

    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (location && mapRef.current) {
      const radius = 10000; // Radius in meters (10km)
      const latitudeDelta = radius / 111320;
      const longitudeDelta = radius / (111320 * Math.cos(location.latitude * (Math.PI / 180)));

      // Only set the region on the first load
      if (zoomLevel === null) {
        mapRef.current.animateToRegion(
          {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: latitudeDelta * 2,
            longitudeDelta: longitudeDelta * 2,
          },
          1000
        );
      }
    }
  }, [location]);

  // New useEffect to update the current location periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === "granted") {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          name: "Current Location",
        });
      }
    }, 3000); // Update location every 3 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  const checkPermissionAndRequest = async () => {
    let { status } = await Location.getForegroundPermissionsAsync();
    if (status !== "granted") {
      if (status === "denied") {
        Alert.alert(
          "Location Permission Denied",
          "Location permission is permanently denied. Please go to settings to enable it.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: openAppSettings },
          ],
          { cancelable: false }
        );
      } else {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          let location = await Location.getCurrentPositionAsync({});
          setLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            name: "Current Location",
          });
        }
      }
    }
  };

  const openAppSettings = () => {
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:");
    } else {
      Linking.openSettings();
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      // If the search field is empty, set location to the current location
      if (location) {
        mapRef.current?.animateToRegion(
          {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          },
          1000
        );
        return; // Exit the function to prevent further execution
      } else {
        // If the location is null, request permission to get the current location
        checkPermissionAndRequest();
        return;
      }
    }

    const foundLocation = predefinedLocations.find((loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (foundLocation) {
      setLocation(foundLocation);
      mapRef.current?.animateToRegion(
        {
          latitude: foundLocation.latitude,
          longitude: foundLocation.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        },
        1000
      );
    } else {
      Alert.alert("Location not found", "Please try another location.");
    }
  };

  let displayText = "Waiting..";
  if (errorMsg) {
    displayText = errorMsg;
  } else if (location) {
    displayText = `Latitude: ${location.latitude}, Longitude: ${location.longitude}`;
  }

  // Toggle code
  const animation = useRef(new Animated.Value(0)).current;

  const toggleTheme = () => {
    const toValue = isDarkMode ? 0 : 1; // Determine the target value
    setIsDarkMode(!isDarkMode); // Toggle the theme state

    // Animate the toggle
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Interpolating the animation value to translate the toggle button
  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20], // Move the indicator 50 pixels to the right
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <View style={styles.containerToggleMode}>
          <TouchableOpacity style={styles.toggleButton} onPress={toggleTheme}>
            <Animated.View style={[styles.indicator, { transform: [{ translateX }] }]}>
              {isDarkMode ? (
                <View style={styles.viewMoon}>
                  <FontAwesome name="moon-o" size={15} color="#ffffff" />
                </View>
              ) : (
                <View style={styles.viewSun}>
                  <FontAwesome name="sun-o" size={15} color="#000000" />
                </View>
              )}
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
      {location ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          customMapStyle={isDarkMode ? mapDarkStyle : mapStandardStyle}
          showsUserLocation={true}
          onPress={handleMapPress}
          onRegionChangeComplete={(region) => {
            setZoomLevel(region.latitudeDelta); // Update the zoom level based on user interaction
          }}
        >
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            image={require("../assets/map_marker.png")}
            title="Current Location"
            description="This is where you are currently located."
          />
          <Circle
            center={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            radius={1000} // Radius in meters
            fillColor="rgba(0, 150, 255, 0.2)" // Semi-transparent blue
            strokeColor="rgba(0, 150, 255, 0.5)" // Semi-transparent blue for the border
          />
        </MapView>
      ) : (
        <Text>{displayText}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 3,
    zIndex: 1, // Ensure search bar is above the map
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "white", // Ensure it's visible
  },
  containerToggleMode: {
    marginLeft: 0,
  },
  toggleButton: {
    position: 'relative',
    right: 50,
    width: 40,
    height: 20,
    borderRadius: 10,
    backgroundColor: "gray",
    padding: 2,
  },
  indicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  map: {
    flex: 1,
  },
  viewSun: {
    top: -1,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: "#ffffff",
  },
  viewMoon: {
    top: -1,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    backgroundColor: "#000",
    textAlign: 'center',
  },
});

export default ExploreScreen;
