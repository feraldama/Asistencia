import { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Users, Clock, LogOut, LayoutDashboard, FileText, Shield, Key, Trash2, Edit2, Plus } from 'lucide-react';

// Subrutas del admin
function Overview() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Resumen de Hoy</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 text-emerald-600 mb-2">
            <div className="p-3 bg-emerald-50 rounded-xl"><Users size={24} /></div>
            <h3 className="font-semibold">Presentes</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800">12</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 text-indigo-600 mb-2">
            <div className="p-3 bg-indigo-50 rounded-xl"><Clock size={24} /></div>
            <h3 className="font-semibold">Llegadas Tarde</h3>
          </div>
          <p className="text-3xl font-bold text-slate-800">3</p>
        </div>
      </div>
    </div>
  );
}

function Empleados() {
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, documento: '', nombre_completo: '' });

  const fetchEmpleados = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/employees');
      setEmpleados(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const openForm = (empleado: any = null) => {
    if (empleado) {
      setFormData({ id: empleado.id, documento: empleado.documento, nombre_completo: empleado.nombre_completo });
    } else {
      setFormData({ id: null, documento: '', nombre_completo: '' });
    }
    setShowModal(true);
  };

  const closeForm = () => {
    setShowModal(false);
    setFormData({ id: null, documento: '', nombre_completo: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formData.id) {
        await axios.put(`http://localhost:4000/api/employees/${formData.id}`, formData);
      } else {
        await axios.post('http://localhost:4000/api/employees', formData);
      }
      closeForm();
      fetchEmpleados();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al guardar el empleado');
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este empleado?')) return;
    try {
      await axios.delete(`http://localhost:4000/api/employees/${id}`);
      fetchEmpleados();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al eliminar');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Gestión de Empleados</h2>
        <button 
          onClick={() => openForm()}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-600/30 transition-all hover:-translate-y-0.5 flex items-center gap-2"
        >
          <Plus size={20} /> Nuevo Empleado
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
        <table className="min-w-full w-full text-left bg-white">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-600 text-sm whitespace-nowrap">Documento</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Nombre Completo</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Estado</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {empleados.map(emp => (
              <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-sm">{emp.documento}</td>
                <td className="px-6 py-4 font-medium">{emp.nombre_completo}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Activo</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openForm(emp)} title="Editar Empleado" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                      <Edit2 size={20} />
                    </button>
                    <button onClick={() => handleDelete(emp.id)} title="Eliminar Empleado" className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {empleados.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  No hay empleados registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Formulario */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in">
            <h3 className="text-xl font-bold text-slate-800 mb-6">
              {formData.id ? 'Editar Empleado' : 'Nuevo Empleado'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nombre Completo</label>
                <input 
                  type="text" 
                  value={formData.nombre_completo} 
                  onChange={e => setFormData({...formData, nombre_completo: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Documento de Identidad (DNI)</label>
                <input 
                  type="number" 
                  value={formData.documento} 
                  onChange={e => setFormData({...formData, documento: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
                  required 
                />
              </div>
              <div className="flex gap-3 mt-8">
                <button 
                  type="button" 
                  onClick={closeForm}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-colors"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Administradores() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editPassword, setEditPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAdmins = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/admins');
      setAdmins(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:4000/api/admins', { username: newUsername, password: newPassword });
      setNewUsername('');
      setNewPassword('');
      fetchAdmins();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al crear admin');
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (id: number) => {
    if (!editPassword) return alert('Ingresa nueva contraseña');
    try {
      await axios.put(`http://localhost:4000/api/admins/${id}/password`, { password: editPassword });
      setEditId(null);
      setEditPassword('');
      alert('Contraseña actualizada');
    } catch (error) {
      alert('Error al actualizar');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este admin?')) return;
    try {
      await axios.delete(`http://localhost:4000/api/admins/${id}`);
      fetchAdmins();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Gestión de Administradores</h2>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 border-l-4 border-l-indigo-500">
        <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Shield size={20} className="text-indigo-500"/> Nuevo Administrador
        </h3>
        <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-600 mb-2">Usuario</label>
            <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} required minLength={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all rounded-xl" placeholder="admin2" />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-600 mb-2">Contraseña</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all rounded-xl" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all hover:-translate-y-0.5 whitespace-nowrap">
            {loading ? 'Creando...' : 'Crear Admin'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-600 text-sm">ID</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Usuario</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {admins.map(admin => (
              <tr key={admin.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-slate-500 font-mono text-sm">#{admin.id}</td>
                <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                    {admin.username.charAt(0).toUpperCase()}
                  </div>
                  {admin.username}
                </td>
                <td className="px-6 py-4 text-right">
                  {editId === admin.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <input type="text" placeholder="Nueva clave" value={editPassword} onChange={e => setEditPassword(e.target.value)} className="px-3 py-1.5 border border-slate-300 rounded-lg w-32 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm" autoFocus />
                      <button onClick={() => handleUpdatePassword(admin.id)} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg font-medium hover:bg-emerald-200 transition-colors text-sm">Guardar</button>
                      <button onClick={() => setEditId(null)} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200 transition-colors text-sm">Cancelar</button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setEditId(admin.id)} title="Cambiar Contraseña" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Key size={20} /></button>
                      <button onClick={() => handleDelete(admin.id)} title="Eliminar Administrador" className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20} /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                  No hay administradores registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Resumen' },
    { path: '/admin/empleados', icon: Users, label: 'Empleados' },
    { path: '/admin/reportes', icon: FileText, label: 'Reportes' },
    { path: '/admin/admins', icon: Shield, label: 'Administradores' },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3 text-indigo-600">
          <Clock size={28} />
          <span className="text-xl font-bold text-slate-800 tracking-tight">TimeTrack</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const active = location.pathname === item.path || (item.path === '/admin/dashboard' && location.pathname === '/admin');
          return (
            <Link 
              key={item.path} 
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                active 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <item.icon size={20} className={active ? 'text-indigo-600' : 'text-slate-400'} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 mt-auto">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          Cerrar Sesión
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-3 text-indigo-600">
          <Clock size={24} />
          <span className="text-lg font-bold text-slate-800 tracking-tight">TimeTrack</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/50 z-30 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Content (Desktop & Mobile) */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col z-40 transform transition-transform duration-300 ease-in-out h-full ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto h-full w-full">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/dashboard" element={<Overview />} />
            <Route path="/empleados" element={<Empleados />} />
            <Route path="/admins" element={<Administradores />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
