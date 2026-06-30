import { ViewStyle } from 'react-native';

export const COLORS = {
  // Base Colors
  background: '#1B1B1F',      // Main screen background
  surface: '#2D2D35',         // Standard key surface
  surfaceHover: '#3A3A45',    // Highlighted surface/key pressed state
  text: '#CACAD0',            // Primary text color (muted white)
  textDark: '#1B1B1F',        // Dark text for high-contrast buttons (e.g., on Amber Gold)
  textLight: '#FFFFFF',       // Bright white text for buttons or results
  border: '#3A3A45',          // Subtle border/divider line
  
  // Custom Key Surfaces for contrast
  keyNumber: '#24242A',       // Number keys (darker surface)
  keyOperator: '#343440',     // Basic operators (lighter surface)
  keyFunction: '#2A2A35',     // Scientific functions
  keyAction: '#4E3629',       // DEL/AC actions (warm-tinted surface for action distinction)
  
  // Accent Color (Amber Gold - lightened for contrast on dark background)
  accent: '#FFC233',          // Lightened Amber Gold for equals/active toggles
  accentHover: '#FFB300',     // Darker Amber Gold for pressed accent state
  accentText: '#1B1B1F',      // Dark text on Amber Gold button
};

export const FONTS = {
  regular: 'Orbitron_400Regular',
  medium: 'Orbitron_500Medium',
  bold: 'Orbitron_700Bold',
};

export const KEY_SHAPE = {
  borderRadius: 8,
  borderWidth: 0,
  shadowColor: 'transparent',
  elevation: 0, // Minimal Flat is flat, no elevation
  margin: 6,
  aspectRatio: 1.0, // Used for standard keys
};

export const DISPLAY_STYLE: { container: ViewStyle } = {
  // Full-Width Flush: spans edge to edge, no border, no shadow
  container: {
    backgroundColor: '#151518', // Recessed slightly darker area for full-width flush display
    paddingHorizontal: 20,
    paddingVertical: 24,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
};
