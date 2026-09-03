import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Coordinates, DeliveryPackage } from '../../types';
import { MapPin, Navigation, PackageCheck, Layers, ZoomIn, ZoomOut, Compass, ExternalLink } from 'lucide-react';
import { generateGoogleMapsUrl } from '../../utils/geo';

interface InteractiveMapProps {
  origin: { name: string; coordinates: Coordinates };
  stops: DeliveryPackage[];
  activeStopIndex?: number;
  currentDriverLocation?: Coordinates;
  onSelectStop?: (stop: DeliveryPackage) => void;
  className?: string;
  showOptimizeAnimation?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  origin,
  stops,
  activeStopIndex = 0,
  currentDriverLocation,
  onSelectStop,
  className = 'h-[360px] md:h-[480px]',
  showOptimizeAnimation = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedStop, setSelectedStop] = useState<DeliveryPackage | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapOffset, setMapOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mapStyle, setMapStyle] = useState<'dark' | 'streets'>('dark');

  // Compute bounding box for coordinates
  const allCoords = useMemo(() => {
    const coords = [origin.coordinates, ...stops.map((s) => s.coordinates)];
    if (currentDriverLocation) coords.push(currentDriverLocation);
    return coords;
  }, [origin, stops, currentDriverLocation]);

  const bounds = useMemo(() => {
    if (allCoords.length === 0) {
      return { minLat: -23.6, maxLat: -23.5, minLng: -46.7, maxLng: -46.6 };
    }
    const lats = allCoords.map((c) => c.lat);
    const lngs = allCoords.map((c) => c.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // add small padding
    const latPadding = Math.max(0.015, (maxLat - minLat) * 0.15);
    const lngPadding = Math.max(0.015, (maxLng - minLng) * 0.15);

    return {
      minLat: minLat - latPadding,
      maxLat: maxLat + latPadding,
      minLng: minLng - lngPadding,
      maxLng: maxLng + lngPadding,
    };
  }, [allCoords]);

  // Convert lat/lng to percentage X/Y inside map viewport
  const projectCoords = (coord: Coordinates) => {
    const latRange = bounds.maxLat - bounds.minLat || 0.001;
    const lngRange = bounds.maxLng - bounds.minLng || 0.001;

    // Invert lat for Y (top is north/maxLat)
    const xPct = ((coord.lng - bounds.minLng) / lngRange) * 100;
    const yPct = ((bounds.maxLat - coord.lat) / latRange) * 100;

    return {
      x: Math.max(4, Math.min(96, xPct)),
      y: Math.max(6, Math.min(94, yPct)),
    };
  };

  const originProj = projectCoords(origin.coordinates);
  const driverProj = currentDriverLocation ? projectCoords(currentDriverLocation) : null;

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - mapOffset.x, y: e.clientY - mapOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setMapOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoomLevel(1);
    setMapOffset({ x: 0, y: 0 });
    setSelectedStop(null);
  };

  // Generate SVG path for route line
  const routePointsString = useMemo(() => {
    if (stops.length === 0) return '';
    const pts = [originProj, ...stops.map((s) => projectCoords(s.coordinates))];
    return pts.map((p) => `${p.x},${p.y}`).join(' ');
  }, [originProj, stops, bounds]);

  const googleMapsUrl = generateGoogleMapsUrl(origin.coordinates, stops);

  return (
    <div
      id="delivery-interactive-map-container"
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 select-none shadow-sm ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Map Background grid / tile simulation */}
      <div
        className="absolute inset-0 transition-transform duration-150 ease-out cursor-grab active:cursor-grabbing"
        style={{
          transform: `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${zoomLevel})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Dynamic Clean Grid with road line styling */}
        <div
          className="absolute inset-[-100%] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] bg-slate-100"
        >
          {/* Simulated Street Grid Vectors */}
          <svg className="w-full h-full opacity-35 pointer-events-none stroke-slate-300" strokeWidth="1.2">
            <line x1="0" y1="20%" x2="100%" y2="20%" strokeDasharray="6,6" />
            <line x1="0" y1="45%" x2="100%" y2="45%" />
            <line x1="0" y1="70%" x2="100%" y2="70%" strokeDasharray="4,4" />
            <line x1="0" y1="85%" x2="100%" y2="85%" />
            <line x1="25%" y1="0" x2="25%" y2="100%" strokeDasharray="5,5" />
            <line x1="50%" y1="0" x2="50%" y2="100%" />
            <line x1="75%" y1="0" x2="75%" y2="100%" strokeDasharray="6,6" />
          </svg>
        </div>

        {/* Route Polyline SVG Layer */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        >
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="0.8" floodColor="#6366f1" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Polyline Path */}
          {stops.length > 0 && (
            <>
              {/* Outer soft shadow line */}
              <polyline
                points={routePointsString}
                fill="none"
                stroke="#818cf8"
                strokeWidth="1.5"
                strokeOpacity="0.35"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Core animated dashed route line */}
              <polyline
                points={routePointsString}
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="0.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="2.5, 1"
                className={showOptimizeAnimation ? 'animate-pulse' : ''}
              />
            </>
          )}
        </svg>

        {/* Origin / Depot Marker */}
        <div
          style={{ left: `${originProj.x}%`, top: `${originProj.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedStop(null);
          }}
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute w-8 h-8 rounded-full bg-amber-400/30 animate-ping pointer-events-none" />
            <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-amber-500 text-white font-bold shadow-md border-2 border-white text-xs">
              🏠
            </div>
          </div>
          <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur border border-amber-300 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shadow-sm pointer-events-none">
            Hub de Coleta (Origem)
          </div>
        </div>

        {/* Driver Live Marker (if available) */}
        {driverProj && (
          <div
            style={{ left: `${driverProj.x}%`, top: `${driverProj.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
          >
            <div className="relative flex items-center justify-center">
              <span className="absolute w-10 h-10 rounded-full bg-emerald-500/30 animate-ping" />
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white shadow-lg border-2 border-white">
                <Navigation className="w-4 h-4 fill-current rotate-45" />
              </div>
            </div>
          </div>
        )}

        {/* Delivery Stops Pins */}
        {stops.map((stop, index) => {
          const proj = projectCoords(stop.coordinates);
          const isDelivered = stop.deliveryStatus === 'delivered';
          const isCurrent = index === activeStopIndex && stop.deliveryStatus !== 'delivered';
          const isSelected = selectedStop?.id === stop.id;

          let badgeColor = 'bg-slate-700 text-white border-white';
          if (isDelivered) badgeColor = 'bg-emerald-600 text-white border-white shadow-emerald-500/40';
          else if (isCurrent) badgeColor = 'bg-indigo-600 text-white border-white shadow-indigo-500/40 animate-bounce';
          else if (isSelected) badgeColor = 'bg-blue-600 text-white border-white';

          return (
            <div
              key={stop.id}
              style={{ left: `${proj.x}%`, top: `${proj.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer transition-transform hover:scale-125 ${
                isSelected ? 'scale-125 z-30' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedStop(stop);
                if (onSelectStop) onSelectStop(stop);
              }}
            >
              <div className="relative flex flex-col items-center">
                {isCurrent && (
                  <span className="absolute -top-1 w-7 h-7 rounded-full bg-indigo-500/30 animate-ping pointer-events-none" />
                )}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold border-2 shadow-md transition-colors ${badgeColor}`}
                >
                  {isDelivered ? <PackageCheck className="w-3.5 h-3.5" /> : stop.sequenceOrder || index + 1}
                </div>
                {/* Micro Stop Label */}
                <span className="mt-0.5 text-[9px] font-bold text-slate-700 bg-white/90 px-1 py-0.2 rounded border border-slate-200 shadow-2xs max-w-[80px] truncate">
                  {stop.neighborhood}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Stop Details Popover */}
      {selectedStop && (
        <div
          id="map-selected-stop-card"
          className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-xl z-40 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs">
                #{selectedStop.sequenceOrder || '?'}
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">{selectedStop.recipientName}</h4>
                <p className="text-[11px] text-slate-500 font-mono">{selectedStop.trackingCode}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedStop(null)}
              className="text-slate-400 hover:text-slate-700 text-xs px-1.5 py-0.5 rounded hover:bg-slate-100"
            >
              ✕
            </button>
          </div>

          <div className="mt-2.5 space-y-1 text-xs text-slate-600">
            <p className="flex items-start gap-1.5 text-slate-800 font-medium">
              <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                {selectedStop.address}, {selectedStop.neighborhood}
              </span>
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
              <span className="text-slate-500 font-medium">Peso: {selectedStop.weightKg} kg</span>
              <span className="text-emerald-700 font-bold">Frete: R$ {selectedStop.freightFee.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Map Floating UI Controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-30">
        <button
          onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
          title="Aumentar Zoom"
          className="w-8 h-8 rounded-xl bg-white/90 border border-slate-200 text-slate-700 hover:text-indigo-600 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
          title="Diminuir Zoom"
          className="w-8 h-8 rounded-xl bg-white/90 border border-slate-200 text-slate-700 hover:text-indigo-600 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          title="Centralizar Rota"
          className="w-8 h-8 rounded-xl bg-white/90 border border-slate-200 text-slate-700 hover:text-indigo-600 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Top Left Info Badge */}
      <div className="absolute top-3 left-3 flex items-center gap-2 z-30 pointer-events-none">
        <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold text-slate-800">
            {stops.length} {stops.length === 1 ? 'Parada' : 'Paradas Otimizadas'}
          </span>
        </div>
      </div>

      {/* Bottom Action Bar for Google Maps Intent */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 z-30">
        <a
          id="btn-open-google-maps-intent"
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 bg-white/90 hover:bg-white backdrop-blur text-indigo-600 hover:text-indigo-700 border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Google Maps Rota</span>
        </a>
      </div>
    </div>
  );
};
