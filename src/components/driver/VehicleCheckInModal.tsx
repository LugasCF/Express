import React, { useState } from 'react';
import { VehicleConfig, DriverProfile, VehicleType } from '../../types';
import { Truck, Car, Bike, ShieldCheck, Fuel, FileCheck, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface VehicleCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: DriverProfile;
  onUpdateDriver: (updated: Partial<DriverProfile>) => void;
}

export const VehicleCheckInModal: React.FC<VehicleCheckInModalProps> = ({
  isOpen,
  onClose,
  driver,
  onUpdateDriver,
}) => {
  const [vehicleType, setVehicleType] = useState<VehicleType>(driver.vehicle.type);
  const [model, setModel] = useState(driver.vehicle.model);
  const [plate, setPlate] = useState(driver.vehicle.plate);
  const [avgConsumption, setAvgConsumption] = useState(driver.vehicle.avgConsumptionKmPerL);
  const [fuelType, setFuelType] = useState(driver.vehicle.fuelType);
  const [fuelPrice, setFuelPrice] = useState(driver.vehicle.fuelPricePerL);

  // Document verification simulation states
  const [cnhStatus, setCnhStatus] = useState(driver.cnhStatus);
  const [crlvStatus, setCrlvStatus] = useState(driver.crlvStatus);
  const [cnhFileName, setCnhFileName] = useState<string | null>('cnh_digital_2026.pdf');
  const [crlvFileName, setCrlvFileName] = useState<string | null>('crlv_documento_veiculo.pdf');

  if (!isOpen) return null;

  const handleVehicleTypeSelect = (type: VehicleType) => {
    setVehicleType(type);
    if (type === 'moto') {
      setModel('Honda CG 160 Cargo');
      setAvgConsumption(38);
      setFuelType('gasolina');
      setFuelPrice(5.89);
    } else if (type === 'car') {
      setModel('Fiat Uno 1.0 Flex');
      setAvgConsumption(13.5);
      setFuelType('gasolina');
      setFuelPrice(5.89);
    } else if (type === 'van') {
      setModel('Fiat Fiorino 1.4 EVO');
      setAvgConsumption(9.5);
      setFuelType('gasolina');
      setFuelPrice(5.89);
    } else if (type === 'truck') {
      setModel('Hyundai HR 2.5 Turbo');
      setAvgConsumption(6.8);
      setFuelType('diesel');
      setFuelPrice(6.10);
    }
  };

  const handleSave = () => {
    const updatedVehicle: VehicleConfig = {
      type: vehicleType,
      label: model,
      model,
      plate: plate.toUpperCase(),
      avgConsumptionKmPerL: Number(avgConsumption) || 15,
      fuelType,
      fuelPricePerL: Number(fuelPrice) || 5.89,
    };

    onUpdateDriver({
      vehicle: updatedVehicle,
      cnhStatus,
      crlvStatus,
    });

    onClose();
  };

  return (
    <div
      id="vehicle-checkin-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Check-in do Veículo & Documentos</h3>
              <p className="text-xs text-slate-500 font-medium">Configure o consumo de combustível e valide seu veículo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Vehicle Type Picker */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
              1. Selecione o Tipo de Veículo
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => handleVehicleTypeSelect('moto')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  vehicleType === 'moto'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Bike className="w-6 h-6 text-emerald-700" />
                <span className="text-xs font-bold">Moto</span>
                <span className="text-[10px] font-medium text-slate-500">~35 km/L</span>
              </button>

              <button
                type="button"
                onClick={() => handleVehicleTypeSelect('car')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  vehicleType === 'car'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Car className="w-6 h-6 text-emerald-700" />
                <span className="text-xs font-bold">Carro</span>
                <span className="text-[10px] font-medium text-slate-500">~13 km/L</span>
              </button>

              <button
                type="button"
                onClick={() => handleVehicleTypeSelect('van')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  vehicleType === 'van'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Truck className="w-6 h-6 text-emerald-700" />
                <span className="text-xs font-bold">Fiorino/Van</span>
                <span className="text-[10px] font-medium text-slate-500">~9.5 km/L</span>
              </button>

              <button
                type="button"
                onClick={() => handleVehicleTypeSelect('truck')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  vehicleType === 'truck'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Truck className="w-6 h-6 rotate-12 text-emerald-700" />
                <span className="text-xs font-bold">Caminhão</span>
                <span className="text-[10px] font-medium text-slate-500">~6.8 km/L</span>
              </button>
            </div>
          </div>

          {/* Model and Plate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Modelo do Veículo</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 shadow-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Placa Mercosul / Brasil</label>
              <input
                type="text"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                placeholder="ABC-1D23"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 uppercase font-mono tracking-wider focus:outline-none focus:border-indigo-600 shadow-xs"
              />
            </div>
          </div>

          {/* Fuel & Real-Cost Engine */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
              <Fuel className="w-4 h-4" />
              <span>Parâmetros de Combustível (Cálculo de Lucro Real)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1 block">Tipo de Combustível</label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 shadow-xs"
                >
                  <option value="gasolina">Gasolina Comum</option>
                  <option value="etanol">Etanol Flex</option>
                  <option value="diesel">Diesel S10</option>
                  <option value="gnv">GNV (Gás Natural)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1 block">Consumo Médio (km/L)</label>
                <input
                  type="number"
                  step="0.5"
                  value={avgConsumption}
                  onChange={(e) => setAvgConsumption(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-mono shadow-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1 block">Preço do Litro (R$)</label>
                <input
                  type="number"
                  step="0.05"
                  value={fuelPrice}
                  onChange={(e) => setFuelPrice(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-mono shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Security & Document Verification */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
                <ShieldCheck className="w-4 h-4" />
                <span>Verificação de Segurança (CNH & CRLV)</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Verificado
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">CNH Digital (EAR)</span>
                    <span className="text-[10px] text-slate-500 truncate block max-w-[120px] font-medium">{cnhFileName}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Aprovada
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Documento CRLV 2026</span>
                    <span className="text-[10px] text-slate-500 truncate block max-w-[120px] font-medium">{crlvFileName}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Regular
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all"
          >
            Salvar e Confirmar Check-in
          </button>
        </div>
      </div>
    </div>
  );
};
