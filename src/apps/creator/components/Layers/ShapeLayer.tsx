import React from 'react';
import { Layer } from '../../types/editor';

interface ShapeLayerProps {
  layer: Layer;
}

export const ShapeLayer: React.FC<ShapeLayerProps> = ({ layer }) => {
  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: layer.fill || '#cccccc',
    border: layer.stroke ? `${layer.strokeWidth || 1}px solid ${layer.stroke}` : 'none',
    opacity: layer.opacity ?? 1,
    borderRadius: layer.type === 'circle' ? '50%' : layer.borderRadius || 0,
    pointerEvents: 'none',
  };

  return <div style={style} />;
};
