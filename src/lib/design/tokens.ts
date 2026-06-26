/**
 * Design Tokens — Tổng hợp (Aggregate)
 *
 * File này gom tất cả token vào một object duy nhất `designTokens`.
 * Dùng cho trường hợp cần truy cập toàn bộ token qua một entry point.
 *
 * Chỉ chứa constants. Không chứa logic.
 */

import { breakpoints, containerMaxWidth } from "./breakpoints";
import { brandColors, colors, neutralColors, semanticColors, surfaceColors } from "./colors";
import { iconNames, iconSize } from "./icons";
import { layout } from "./layout";
import { delay, duration, easing } from "./motion";
import { radius, radiusBase } from "./radius";
import { shadow } from "./shadow";
import { spacing, spacingPx, spacingUnit } from "./spacing";
import { fontFamily, fontWeight, letterSpacing, lineHeight, typography } from "./typography";
import { themeConfig, themeSurfaces } from "./themes";
import { zIndex } from "./z-index";

export const designTokens = {
  colors,
  brandColors,
  semanticColors,
  neutralColors,
  surfaceColors,
  typography,
  fontFamily,
  fontWeight,
  lineHeight,
  letterSpacing,
  spacing,
  spacingPx,
  spacingUnit,
  radius,
  radiusBase,
  shadow,
  motion: {
    duration,
    delay,
    easing,
  },
  breakpoints,
  containerMaxWidth,
  zIndex,
  layout,
  icons: {
    iconNames,
    iconSize,
  },
  themes: {
    config: themeConfig,
    surfaces: themeSurfaces,
  },
} as const;

export type DesignTokens = typeof designTokens;
