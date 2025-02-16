import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, commonStyles } from "../../../assets/style/common";
import {
  StatisticsService,
  Statistics,
} from "../../services/statistics.service";

export default function StatisticsScreen() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const statistics = await StatisticsService.getStatistics();
      setStats(statistics);
      setError(null);
    } catch (err) {
      setError("Failed to load statistics");
      console.error("Error loading statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Inventory Summary</Text>

      <View style={styles.statsGrid}>
        <StatItem
          icon="box"
          label="Total Products"
          value={stats.totalProducts}
        />
        <StatItem
          icon="map-pin"
          label="Total Cities"
          value={stats.totalCities}
        />
        <StatItem
          icon="alert-triangle"
          label="Out of Stock"
          value={stats.outOfStockProducts}
        />
        <StatItem
          icon="dollar-sign"
          label="Inventory Value"
          value={`$${stats.totalInventoryValue.toLocaleString()}`}
        />
      </View>

      <View style={styles.recentActivity}>
        <Text style={styles.subtitle}>Top Stocked Products</Text>
        {stats.recentlyAddedProducts.map((product, index) => (
          <Text key={index} style={styles.listItem}>
            <Feather name="plus-circle" size={16} color={colors.secondary} />{" "}
            {product}
          </Text>
        ))}

        <Text style={styles.subtitle}>Most Sold Products</Text>
        {stats.mostRemovedProducts.map((product, index) => (
          <Text key={index} style={styles.listItem}>
            <Feather name="trending-up" size={16} color={colors.danger} />{" "}
            {product}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

function StatItem({ icon, label, value }) {
  return (
    <View style={styles.statItem}>
      <Feather name={icon} size={24} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ...commonStyles,
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statItem: {
    width: "48%",
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    textAlign: "center",
  },
  recentActivity: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 15,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 15,
    marginBottom: 10,
  },
  listItem: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 5,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: colors.danger,
    fontSize: 16,
  },
});
