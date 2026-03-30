export type LayoutEditorAssetKind = "background" | "sprite";

export type LayoutEditorRenderMode = "image" | "pattern";

export type LayoutEditorAsset = {
  id: string;
  label: string;
  kind: LayoutEditorAssetKind;
  category: string;
  group: string;
  src: string;
  sourcePath: string;
  renderMode: LayoutEditorRenderMode;
  repeat: boolean;
  backgroundSize: string;
};

export type LayoutEditorElement = {
  id: string;
  assetId: string;
  label: string;
  src: string;
  sourcePath: string;
  category: string;
  group: string;
  renderMode: LayoutEditorRenderMode;
  repeat: boolean;
  backgroundSize: string;
  left: number;
  top: number;
  width: number;
  height: number;
  zIndex: number;
  opacity: number;
  cropLeft?: number;
  cropTop?: number;
  cropRight?: number;
  cropBottom?: number;
};
