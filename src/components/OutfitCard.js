import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import RemoteImage from "./RemoteImage";
import theme from "../constants/theme";

export default function OutfitCard({
  outfit,
  creatorName,
  onPress,
  actionButton = null,
}) {
  const pieces = Array.isArray(outfit?.pieces)
    ? outfit.pieces
    : Array.isArray(outfit?.clothes)
      ? outfit.clothes
      : [];

  const createdAt = outfit?.createdAt || outfit?.created_at || null;

  function formatDate(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString("tr-TR");
  }

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.cardContainer}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {outfit?.name?.trim() || "İsimsiz Kombin"}
          </Text>
          <View style={styles.metaRow}>
            {!!creatorName && <Text style={styles.metaText} numberOfLines={1}>{creatorName}</Text>}
            {!!createdAt && <Text style={styles.metaText}>{creatorName ? "•" : ""} {formatDate(createdAt)}</Text>}
          </View>
        </View>

        <View style={styles.piecesGrid}>
          {pieces.length ? (
            pieces.map((piece) => (
              <View key={piece.id || piece.cloth_id} style={styles.pieceCard}>
                <RemoteImage
                  publicUri={piece.imageUri || piece.image_url || piece.cloth?.image_url}
                  clothId={piece.id || piece.cloth_id}
                  style={styles.pieceImage}
                />
                <Text style={styles.pieceCategory} numberOfLines={1}>
                  {piece.category}
                </Text>
                {!!piece.description && (
                  <Text style={styles.pieceDescription} numberOfLines={2}>
                    {piece.description}
                  </Text>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Bu kombin icin parca bulunamadi.</Text>
            </View>
          )}
        </View>

        {actionButton ? <View style={styles.actionButtonWrap}>{actionButton}</View> : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    marginBottom: theme.spacing.md,
    borderRadius: theme.border.radius.lg,
    overflow: "hidden",
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.border.radius.lg,
    overflow: "hidden",
    ...theme.shadows.md,
    padding: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  metaText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
  },
  piecesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: theme.spacing.sm,
  },
  pieceCard: {
    width: "31%",
    borderRadius: theme.border.radius.md,
    backgroundColor: theme.colors.background,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pieceImage: {
    width: "100%",
    aspectRatio: 0.82,
    backgroundColor: theme.colors.background,
  },
  pieceCategory: {
    paddingHorizontal: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
    color: theme.colors.text.primary,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
  },
  pieceDescription: {
    paddingHorizontal: theme.spacing.xs,
    paddingBottom: theme.spacing.xs,
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.xs,
    lineHeight: 16,
  },
  emptyState: {
    width: "100%",
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
  },
  emptyStateText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
  },
  actionButtonWrap: {
    marginTop: theme.spacing.md,
  },
});