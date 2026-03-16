import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, UserCheck, AlertCircle, Loader2 } from 'lucide-react';

const API_URL = 'http://localhost:4000/api';

export default function AttendanceClock() {
  const [documento, setDocumento] = useState('');
  const [tipo, setTipo] = useState<'ENTRADA' | 'SALIDA'>('ENTRADA');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Reloj en tiempo real
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documento) return;

    setLoading(true);
    setMessage(null);

    try {
      const response = await axios.post(`${API_URL}/attendance`, {
        documento,
        tipo
      });
      
      setMessage({ type: 'success', text: response.data.mensaje });
      setDocumento(''); // Limpiar el input
      
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setMessage(null), 5000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Error al conectar con el servidor';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card Principal */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden border border-white/40">
          
          {/* Header del Reloj */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white text-center rounded-b-[2.5rem] shadow-lg relative">
            <div className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors cursor-pointer" title="Dashboard">
              <a href="/admin/login">
                <UserCheck size={20} />
              </a>
            </div>
            <Clock size={48} className="mx-auto mb-4 text-indigo-100 opacity-90" />
            <h1 className="text-5xl font-extrabold tracking-tight mb-2">
              {currentTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
            </h1>
            <p className="text-indigo-100 font-medium">
              {currentTime.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Control de Asistencia</h2>
              <p className="text-slate-500 text-sm mt-1">Ingresa tu número de documento para registrarte</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Selector de Tipo (Radio Buttons con diseño bonito) */}
              <div className="flex bg-slate-100 p-1 rounded-2xl relative">
                {['ENTRADA', 'SALIDA'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t as any)}
                    className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 z-10 ${
                      tipo === t 
                        ? 'text-white' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
                
                {/* Background animado para el botón seleccionado */}
                <div 
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-indigo-600 shadow-md transition-transform duration-300 ease-in-out ${
                    tipo === 'SALIDA' ? 'translate-x-[calc(100%+8px)]' : 'translate-x-0'
                  }`} 
                />
              </div>

              {/* Input Documento */}
              <div>
                <div className="relative">
                  <input
                    type="number"
                    value={documento}
                    onChange={(e) => setDocumento(e.target.value)}
                    placeholder="Número de DNI"
                    className="w-full pl-5 pr-12 py-4 bg-slate-50 border-2 border-slate-200 text-slate-800 font-medium rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-lg"
                    required
                    disabled={loading}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <UserCheck size={24} />
                  </div>
                </div>
              </div>

              {/* Mensajes de Alerta */}
              {message && (
                <div className={`p-4 rounded-2xl text-sm font-medium flex items-center gap-3 animate-fade-in ${
                  message.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message.type === 'error' && <AlertCircle size={18} className="shrink-0" />}
                  <p>{message.text}</p>
                </div>
              )}

              {/* Botón Enviar */}
              <button
                type="submit"
                disabled={loading || !documento}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    Registrando...
                  </>
                ) : (
                  `Registrar ${tipo}`
                )}
              </button>
            </form>
          </div>
        </div>
        
        <p className="text-center text-slate-400 text-sm mt-8">
          Sistema de Control de Asistencias &copy; {new Date().getFullYear()}
        </p>
      </div>

    </div>
  );
}
