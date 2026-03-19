import { getExpenses, createExpense } from "./api";
import React, { useState, useEffect } from "react";
import "./App.css";
import { 
  Plus, 
  Search, 
  TrendingDown, 
  LayoutDashboard, 
  ListOrdered, 
  Menu,
  X,
  PlusCircle,
  BarChart3,
  Calendar,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Target
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data for the chart
const mockChartData = [
  { name: 'Lun', value: 400 },
  { name: 'Mar', value: 300 },
  { name: 'Mie', value: 600 },
  { name: 'Jue', value: 200 },
  { name: 'Vie', value: 500 },
  { name: 'Sab', value: 900 },
  { name: 'Dom', value: 400 },
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const categories = ["Comida", "Transporte", "Hogar", "Entretenimiento", "Salud", "Otros"];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const data = await getExpenses();
      setExpenses(data);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const expenseData = {
      amount: parseFloat(formData.get("amount")),
      category: formData.get("category"),
      description: formData.get("description"),
      date: formData.get("date"),
    };

    try {
      const savedExpense = await createExpense(expenseData);
      setExpenses([savedExpense, ...expenses]);
      setShowAddModal(false);
    } catch (error) {
       alert("Error al guardar el gasto");
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar glass overflow-hidden">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon glow-purple">
                <Wallet size={24} color="#8b5cf6" />
            </div>
            <span className="logo-text gradient-text">GastosApp</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
            {activeTab === 'dashboard' && <motion.div layoutId="nav-active" className="nav-active-pill" />}
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('expenses')}
          >
            <ListOrdered size={20} />
            <span>Gastos</span>
            {activeTab === 'expenses' && <motion.div layoutId="nav-active" className="nav-active-pill" />}
          </button>
          
          <button className="nav-item">
            <BarChart3 size={20} />
            <span>Reportes</span>
          </button>

          <button className="nav-item">
            <Target size={20} />
            <span>Objetivos</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile glass">
             <div className="avatar">JU</div>
             <div className="user-info">
                <p className="user-name">Juan Carlos</p>
                <p className="user-plan">Plan Premium</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <div className="welcome-section">
            <h1 className="animate-fade-in">Bienvenido, Juan Carlos</h1>
            <p className="text-secondary">Controla tus finanzas con inteligencia.</p>
          </div>
          
          <div className="action-buttons">
            <button className="btn btn-primary glow-purple" onClick={() => setShowAddModal(true)}>
              <Plus size={20} />
              <span>Nuevo Gasto</span>
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="dashboard-view animate-fade-in">
            {/* Stats Overview */}
            <div className="stats-grid">
               <motion.div 
                 whileHover={{ y: -5 }}
                 className="stat-card glass"
               >
                 <div className="stat-icon-wrapper purple">
                    <TrendingDown size={24} />
                 </div>
                 <div className="stat-info">
                   <p className="text-secondary">Gasto Mensual</p>
                   <h3>$1,250.00</h3>
                   <span className="trend-up">+5.2% vs mes anterior</span>
                 </div>
               </motion.div>

               <motion.div 
                 whileHover={{ y: -5 }}
                 className="stat-card glass"
               >
                 <div className="stat-icon-wrapper cyan">
                    <CreditCard size={24} />
                 </div>
                 <div className="stat-info">
                   <p className="text-secondary">Transacciones</p>
                   <h3>43</h3>
                   <span className="trend-up">+12 este mes</span>
                 </div>
               </motion.div>

               <motion.div 
                 whileHover={{ y: -5 }}
                 className="stat-card glass"
               >
                 <div className="stat-icon-wrapper rose">
                    <TrendingUp size={24} />
                 </div>
                 <div className="stat-info">
                   <p className="text-secondary">Ahorros</p>
                   <h3>$850.00</h3>
                   <span className="trend-down">-2.1%</span>
                 </div>
               </motion.div>
            </div>

            {/* Chart + Recent Activity */}
            <div className="dashboard-grid">
               <div className="chart-section glass">
                 <div className="section-header">
                   <h2>Análisis Visual</h2>
                   <div className="time-filters">
                      <button className="small-filter active">Semanal</button>
                      <button className="small-filter">Mensual</button>
                   </div>
                 </div>
                 <div className="chart-container" style={{ height: 300, width: '100%', minHeight: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockChartData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis 
                          dataKey="name" 
                          stroke="#64748b" 
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                           stroke="#64748b" 
                           fontSize={12}
                           tickLine={false}
                           axisLine={false}
                        />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#8b5cf6" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorValue)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
               </div>

               <div className="recent-activity glass">
                 <div className="section-header">
                   <h2>Últimos Gastos</h2>
                   <button className="view-all" onClick={() => setActiveTab('expenses')}>Ver todos</button>
                 </div>
                 <div className="expense-list-mini">
                    {expenses.slice(0, 4).map(expense => (
                      <div key={expense.id} className="mini-expense-item">
                        <div className="expense-icon">{expense.category[0]}</div>
                        <div className="expense-details">
                          <p className="expense-desc">{expense.description}</p>
                          <p className="expense-meta">{expense.category} • {expense.date}</p>
                        </div>
                        <p className="expense-amount-mini">-${expense.amount.toFixed(2)}</p>
                      </div>
                    ))}
                 </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="expenses-view animate-fade-in">
            <div className="table-controls glass">
               <div className="search-box">
                  <Search size={18} />
                  <input type="text" placeholder="Buscar gastos..." />
               </div>
               <div className="filters">
                  <select className="filter-select">
                    <option>Categoría</option>
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
               </div>
            </div>

            <div className="expenses-table-container glass">
               <table className="expenses-table">
                 <thead>
                   <tr>
                     <th>Gasto</th>
                     <th>Categoría</th>
                     <th>Fecha</th>
                     <th>Monto</th>
                     <th>Acción</th>
                   </tr>
                 </thead>
                 <tbody>
                   {expenses.map(expense => (
                     <tr key={expense.id}>
                       <td>
                         <div className="expense-name-cell">
                            <span className="category-pill">{expense.category[0]}</span>
                            <span>{expense.description}</span>
                         </div>
                       </td>
                       <td>{expense.category}</td>
                       <td>{expense.date}</td>
                       <td className="amount-cell">-${Number(expense.amount || 0).toFixed(2)}</td>
                       <td>
                         <button className="btn-icon">
                            <ArrowUpRight size={16} />
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal - Añadir Gasto */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="modal-content glass glow-purple"
            >
              <div className="modal-header">
                <h2>Añadir Gasto</h2>
                <button className="close-btn" onClick={() => setShowAddModal(false)}>
                  <X />
                </button>
              </div>
              <form onSubmit={handleAddExpense} className="expense-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Monto</label>
                    <div className="input-with-icon">
                      <span className="currency">$</span>
                      <input name="amount" type="number" step="0.01" required placeholder="0.00" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Categoría</label>
                    <select name="category" required>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label>Descripción</label>
                    <input name="description" type="text" required placeholder="Ej: Supermercado" />
                  </div>
                  <div className="form-group full-width">
                    <label>Fecha</label>
                    <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary full-width glow-purple">
                  Guardar Gasto
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
