export interface ColorToken {
  name: string;
  value: string;
}

export interface SpacingToken {
  name: string;
  value: string;
}

export interface TypographyToken {
  name: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string | number;
  lineHeight?: string;
}

export interface RadiusToken {
  name: string;
  value: string;
}

export interface ShadowToken {
  name: string;
  value: string;
}

export interface TokenModel {
  colors: ColorToken[];
  spacing: SpacingToken[];
  typography: TypographyToken[];
  radius: RadiusToken[];
  shadow: ShadowToken[];
}

export function emptyTokenModel(): TokenModel {
  return { colors: [], spacing: [], typography: [], radius: [], shadow: [] };
}
